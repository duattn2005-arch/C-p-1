import type {
  CurriculumQuestion,
  DifficultyLevel,
  GradeLevel,
  OptionFace,
  QuestionVisual,
  SubjectId,
} from '../../types/curriculum';

// ==========================================
// Deterministic randomness: the same skill always yields the same questions (stable ids, stable history)
// ==========================================
export type Rng = () => number;

export function makeRng(seed: string): Rng {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (() => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  })();
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (r: Rng, min: number, max: number): number => min + Math.floor(r() * (max - min + 1));
export const pick = <T>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];

export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const sample = <T>(r: Rng, arr: readonly T[], n: number): T[] => shuffle(r, arr).slice(0, n);

// ==========================================
// Draft questions written by the skill makers, turned into CurriculumQuestion here
// ==========================================
export interface Ctx {
  r: Rng;
  i: number; // index of the question being made
  n: number; // how many questions the skill needs
  t: number; // 0 (first, easiest) .. 1 (last, hardest)
}

export interface Draft {
  prompt: string;
  formula?: string;
  subPrompt?: string;
  visual?: QuestionVisual;
  answer: string;
  wrong: string[]; // at least 2 distinct wrong answers; the first 3 distinct ones are used
  faces?: Record<string, OptionFace>; // keyed by option text
  hint: string;
  hint2?: string;
  steps?: string[];
  explain: string;
  diff?: DifficultyLevel;
}

export type Maker = (c: Ctx) => Draft;

export interface SkillDef {
  name: string;
  desc: string;
  diff: DifficultyLevel;
  make: Maker;
}

const clampDiff = (d: number): DifficultyLevel => Math.max(1, Math.min(5, Math.round(d))) as DifficultyLevel;

export const QUESTIONS_PER_SKILL = 8;

export function buildSkillQuestions(
  skillId: string,
  grade: GradeLevel,
  subject: SubjectId,
  topicName: string,
  def: SkillDef
): CurriculumQuestion[] {
  const r = makeRng(skillId);
  const seen = new Set<string>();
  const out: CurriculumQuestion[] = [];

  let lastProgress = 0;
  for (let attempt = 0; attempt < QUESTIONS_PER_SKILL * 30 && out.length < QUESTIONS_PER_SKILL; attempt++) {
    // A maker that keeps repeating itself (e.g. a fixed concept question) is nudged on to its next variant
    const stuck = Math.floor((attempt - lastProgress) / 6);
    const d = def.make({
      r,
      i: out.length + stuck,
      n: QUESTIONS_PER_SKILL,
      t: out.length / (QUESTIONS_PER_SKILL - 1),
    });

    if (!d.prompt || typeof d.answer !== 'string' || !d.answer.trim()) continue; // a maker gave up on this attempt
    const key = [d.prompt, d.formula ?? '', d.subPrompt ?? '', JSON.stringify(d.visual ?? null), d.answer].join('|');
    if (seen.has(key)) continue;

    const wrong = [...new Set(d.wrong)].filter((w) => typeof w === 'string' && w.trim() && w !== d.answer).slice(0, 3);
    if (wrong.length < 1) continue; // two choices are fine for "which one is longer?"
    seen.add(key);
    lastProgress = attempt + 1;

    const choices = shuffle(r, [d.answer, ...wrong]);
    out.push({
      id: `${skillId}-q${out.length + 1}`,
      grade,
      subject,
      topic: topicName,
      skill: skillId,
      difficulty: clampDiff(d.diff ?? def.diff),
      question_type: 'multiple_choice',
      question_content: d.prompt,
      formula: d.formula,
      subPrompt: d.subPrompt,
      choices,
      correct_answer: d.answer,
      explanation: d.explain,
      hint: d.hint,
      hint_level_2: d.hint2,
      step_by_step: d.steps,
      visual: d.visual,
      choice_faces: d.faces ? choices.map((c) => d.faces?.[c] ?? null) : undefined,
      source_type: 'curriculum',
      ai_generated: false,
      validation_status: 'approved',
    });
  }
  return out;
}

// ==========================================
// Number helpers
// ==========================================

// 10000 -> "10.000" (dot separates thousands in Vietnamese); shorter numbers stay plain like in textbooks
export const fmt = (n: number): string =>
  Math.abs(n) >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : String(n);

// Decimal written the Vietnamese way with a comma. `scaled` is an integer holding `places` decimal places.
export function decStr(scaled: number, places: number): string {
  const sign = scaled < 0 ? '-' : '';
  const s = String(Math.abs(scaled)).padStart(places + 1, '0');
  const whole = s.slice(0, s.length - places);
  const frac = s.slice(s.length - places);
  return `${sign}${whole}${places > 0 ? ',' + frac : ''}`;
}

// Wrong answers close to the right one (off by one, off by ten...) plus random fillers, all valid numbers
export function wrongNums(
  r: Rng,
  ans: number,
  { min = 0, max = ans + 20, near = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5], count = 3 } = {}
): number[] {
  const out: number[] = [];
  const ok = (v: number) => v !== ans && v >= min && v <= max && !out.includes(v);
  for (const d of shuffle(r, near)) {
    if (out.length >= count) break;
    if (ok(ans + d)) out.push(ans + d);
  }
  for (let guard = 0; out.length < count && guard < 200; guard++) {
    const v = randInt(r, min, Math.max(min + count + 1, max));
    if (ok(v)) out.push(v);
  }
  return out;
}

// ==========================================
// Vietnamese number reading: 105 "một trăm linh năm", 21 "hai mươi mốt", 15 "mười lăm"
// ==========================================
const DIGIT = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readBelow1000(n: number, padded: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const parts: string[] = [];
  if (h > 0 || padded) parts.push(`${DIGIT[h]} trăm`);
  if (t === 0 && u === 0) return parts.join(' ');
  if (t === 0) {
    if (h > 0 || padded) parts.push('linh');
    parts.push(DIGIT[u]);
  } else if (t === 1) {
    parts.push('mười');
    if (u > 0) parts.push(u === 5 ? 'lăm' : DIGIT[u]);
  } else {
    parts.push(`${DIGIT[t]} mươi`);
    if (u > 0) parts.push(u === 1 ? 'mốt' : u === 5 ? 'lăm' : DIGIT[u]);
  }
  return parts.join(' ');
}

export function readVi(n: number): string {
  if (n === 0) return 'không';
  const groups: [number, string][] = [
    [1e9, 'tỉ'],
    [1e6, 'triệu'],
    [1e3, 'nghìn'],
  ];
  let rest = n;
  let started = false;
  const parts: string[] = [];
  for (const [size, name] of groups) {
    const g = Math.floor(rest / size);
    rest %= size;
    if (g > 0) {
      parts.push(`${readBelow1000(g, started)} ${name}`);
      started = true;
    }
  }
  if (rest > 0) parts.push(readBelow1000(rest, started));
  return parts.join(' ');
}

// ==========================================
// Things a child can picture (emoji + how Vietnamese names them)
// ==========================================
export interface Thing {
  e: string; // emoji
  n: string; // noun with classifier: "quả cam"
}

export const THINGS: Thing[] = [
  { e: '🍊', n: 'quả cam' },
  { e: '🍎', n: 'quả táo' },
  { e: '🍌', n: 'quả chuối' },
  { e: '🍓', n: 'quả dâu' },
  { e: '🍰', n: 'cái bánh' },
  { e: '🍪', n: 'cái bánh quy' },
  { e: '🐟', n: 'con cá' },
  { e: '🐔', n: 'con gà' },
  { e: '🐶', n: 'con chó' },
  { e: '🐱', n: 'con mèo' },
  { e: '🐰', n: 'con thỏ' },
  { e: '🐦', n: 'con chim' },
  { e: '🦋', n: 'con bướm' },
  { e: '⭐', n: 'ngôi sao' },
  { e: '🌸', n: 'bông hoa' },
  { e: '🎈', n: 'quả bóng bay' },
  { e: '🚗', n: 'chiếc xe hơi' },
  { e: '🚲', n: 'chiếc xe đạp' },
  { e: '🧸', n: 'con gấu bông' },
  { e: '🍩', n: 'cái bánh vòng' },
];

// Things that read naturally in word problems for older children ("28 quả cam")
export const COUNTABLES: Thing[] = [
  { e: '🍊', n: 'quả cam' },
  { e: '🍎', n: 'quả táo' },
  { e: '🍌', n: 'quả chuối' },
  { e: '📚', n: 'quyển sách' },
  { e: '✏️', n: 'cái bút chì' },
  { e: '🍪', n: 'cái bánh' },
  { e: '🌸', n: 'bông hoa' },
  { e: '🎈', n: 'quả bóng' },
  { e: '🐟', n: 'con cá' },
  { e: '🐔', n: 'con gà' },
];

export const NAMES = ['Lan', 'Nam', 'Mai', 'Hùng', 'Hoa', 'Bình', 'An', 'Linh', 'Minh', 'Trang', 'Dũng', 'Thảo'];

// "quả cam" -> "cam" (drop the classifier) for sentences like "3 con cá"
export const bare = (thing: Thing): string => thing.n.split(' ').slice(1).join(' ');

// "con mèo" -> "Con mèo" for the start of a sentence
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
