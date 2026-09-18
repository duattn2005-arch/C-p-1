import { Maker, SkillDef, pick, sample } from './core.js';
import type { Draft } from './core.js';

// Tiếng Việt lớp 1 (GDPT 2018): chữ cái, dấu thanh, chính tả c/k, g/gh, ng/ngh, rồi vần, đọc từ và câu.
// A six-year-old is still learning to read, so every word comes with a picture.

export type Tone = 'ngang' | 'huyền' | 'sắc' | 'hỏi' | 'ngã' | 'nặng';
export interface ViWord {
  w: string;
  e: string; // emoji shown as the picture
  tone: Tone;
  init?: string; // one-letter first sound (left out for ch, th, kh, nh, ng, gh, tr)
}
const W = (w: string, e: string, tone: Tone, init?: string): ViWord => ({ w, e, tone, init });

export const PIC_WORDS: ViWord[] = [
  W('cá', '🐟', 'sắc', 'c'), W('mèo', '🐱', 'huyền', 'm'), W('gà', '🐔', 'huyền', 'g'), W('chó', '🐶', 'sắc'),
  W('bò', '🐄', 'huyền', 'b'), W('voi', '🐘', 'ngang', 'v'), W('cua', '🦀', 'ngang', 'c'), W('hoa', '🌸', 'ngang', 'h'),
  W('xe', '🚗', 'ngang', 'x'), W('sao', '⭐', 'ngang', 's'), W('nho', '🍇', 'ngang', 'n'), W('dê', '🐐', 'ngang', 'd'),
  W('lê', '🍐', 'ngang', 'l'), W('táo', '🍎', 'sắc', 't'), W('dừa', '🥥', 'huyền', 'd'), W('đũa', '🥢', 'ngã', 'đ'),
  W('kẹo', '🍬', 'nặng', 'k'), W('rùa', '🐢', 'huyền', 'r'), W('sữa', '🥛', 'ngã', 's'), W('cam', '🍊', 'ngang', 'c'),
  W('tôm', '🦐', 'ngang', 't'), W('vịt', '🦆', 'nặng', 'v'), W('hổ', '🐯', 'hỏi', 'h'), W('thỏ', '🐰', 'hỏi'),
  W('bút', '✏️', 'sắc', 'b'), W('gấu', '🐻', 'sắc', 'g'), W('nấm', '🍄', 'sắc', 'n'), W('sóc', '🐿️', 'sắc', 's'),
  W('cỏ', '🌿', 'hỏi', 'c'), W('rổ', '🧺', 'hỏi', 'r'), W('khỉ', '🐒', 'hỏi'), W('nhện', '🕷️', 'nặng'),
  W('ngựa', '🐴', 'nặng'), W('mũ', '🧢', 'ngã', 'm'), W('chổi', '🧹', 'hỏi'), W('bánh', '🍰', 'sắc', 'b'),
  W('nón', '👒', 'sắc', 'n'), W('trứng', '🥚', 'sắc'), W('tàu', '🚢', 'huyền', 't'), W('cờ', '🚩', 'huyền', 'c'),
  W('dứa', '🍍', 'sắc', 'd'), W('mây', '☁️', 'ngang', 'm'), W('nhà', '🏠', 'huyền'), W('ghế', '🪑', 'sắc'),
  W('bóng', '⚽', 'sắc', 'b'),
];

// ---------- Topic 1: chữ cái và dấu thanh ----------
const SAME_SOUND = [['c', 'k', 'q'], ['d', 'r'], ['s', 'x']]; // spelled differently, sound alike: never offer both
const LETTERS = ['b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v', 'x'];

const firstLetter: Maker = ({ r }) => {
  const it = pick(r, PIC_WORDS.filter((x) => x.init));
  const init = it.init as string;
  const twins = SAME_SOUND.find((g) => g.includes(init)) ?? [init];
  return {
    prompt: `Tiếng "${it.w}" bắt đầu bằng chữ cái nào?`,
    visual: { kind: 'picture', emoji: it.e },
    answer: init,
    wrong: sample(r, LETTERS.filter((l) => !twins.includes(l)), 3),
    hint: `Đọc chậm tiếng "${it.w}" và nghe âm đầu tiên.`,
    explain: `Tiếng "${it.w}" bắt đầu bằng chữ "${init}".`,
  };
};

// 29 letters of the Vietnamese alphabet, in textbook order
const ALPHA = ['a', 'ă', 'â', 'b', 'c', 'd', 'đ', 'e', 'ê', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'ô', 'ơ', 'p', 'q', 'r', 's', 't', 'u', 'ư', 'v', 'x', 'y'];

const alphabet: Maker = ({ r, i }) => {
  const kind = i % 4;
  const k = Math.floor(r() * (ALPHA.length - 4)) + 2; // never at the very ends
  if (kind === 0) {
    const l = ALPHA[k];
    return {
      prompt: `Chữ hoa của chữ "${l}" là:`,
      answer: l.toUpperCase(),
      wrong: sample(r, ALPHA.filter((x) => x !== l), 3).map((x) => x.toUpperCase()),
      hint: 'Chữ hoa to hơn và viết ở đầu câu hoặc đầu tên riêng.',
      explain: `Chữ "${l}" viết hoa là "${l.toUpperCase()}".`,
    };
  }
  if (kind === 1) {
    const l = ALPHA[k].toUpperCase();
    return {
      prompt: `Chữ thường của chữ "${l}" là:`,
      answer: l.toLowerCase(),
      wrong: sample(r, ALPHA.filter((x) => x !== l.toLowerCase()), 3),
      hint: 'Chữ thường nhỏ hơn chữ hoa.',
      explain: `Chữ "${l}" viết thường là "${l.toLowerCase()}".`,
    };
  }
  if (kind === 2) {
    const after = r() < 0.5;
    const cur = ALPHA[k];
    return {
      prompt: `Trong bảng chữ cái, chữ nào đứng ngay ${after ? 'sau' : 'trước'} chữ "${cur}"?`,
      answer: ALPHA[after ? k + 1 : k - 1],
      wrong: [ALPHA[after ? k + 2 : k - 2], ALPHA[after ? k - 1 : k + 1], ALPHA[after ? k + 3 : k - 3]].filter(Boolean) as string[],
      hint: `Đọc bảng chữ cái: ${ALPHA.slice(Math.max(0, k - 2), k + 3).join(', ')}...`,
      explain: `Dãy chữ cái: ${ALPHA.slice(Math.max(0, k - 1), k + 2).join(', ')}.`,
    };
  }
  return {
    prompt: 'Bảng chữ cái tiếng Việt có bao nhiêu chữ cái?',
    answer: '29',
    wrong: ['24', '26', '30'],
    hint: 'Đếm các chữ: a, ă, â, b, c, d, đ ... đến y.',
    explain: 'Bảng chữ cái tiếng Việt có 29 chữ cái.',
  };
};

const LABEL: Record<Tone, string> = { ngang: 'Không có dấu', huyền: 'Dấu huyền', sắc: 'Dấu sắc', hỏi: 'Dấu hỏi', ngã: 'Dấu ngã', nặng: 'Dấu nặng' };
const TONES = Object.keys(LABEL) as Tone[];

const tones: Maker = ({ r, i }) => {
  if (i % 2 === 0) {
    const it = pick(r, PIC_WORDS);
    return {
      prompt: `Tiếng "${it.w}" có dấu gì?`,
      visual: { kind: 'picture', emoji: it.e },
      answer: LABEL[it.tone],
      wrong: sample(r, TONES.filter((t) => t !== it.tone), 3).map((t) => LABEL[t]),
      hint: `Nhìn kĩ chữ "${it.w}": dấu nằm trên hay dưới chữ cái?`,
      explain: `Tiếng "${it.w}" ${it.tone === 'ngang' ? 'không có dấu thanh' : `có ${LABEL[it.tone].toLowerCase()}`}.`,
    };
  }
  const tone = pick(r, TONES);
  const target = pick(r, PIC_WORDS.filter((x) => x.tone === tone));
  const others = sample(r, PIC_WORDS.filter((x) => x.tone !== tone), 3);
  return {
    prompt: tone === 'ngang' ? 'Chọn tiếng KHÔNG có dấu thanh:' : `Chọn tiếng có ${LABEL[tone].toLowerCase()}:`,
    answer: target.w,
    wrong: others.map((x) => x.w),
    faces: Object.fromEntries([target, ...others].map((x) => [x.w, { emoji: x.e }])),
    hint: tone === 'ngang' ? 'Tìm tiếng chỉ có chữ cái, không có dấu nào.' : `Tìm tiếng có ${LABEL[tone].toLowerCase()} ở trên hoặc dưới chữ cái.`,
    explain: `Tiếng "${target.w}" ${tone === 'ngang' ? 'không có dấu thanh' : `có ${LABEL[tone].toLowerCase()}`}.`,
  };
};

// ---------- Topic 2: chính tả c/k, g/gh, ng/ngh ----------
interface Spell {
  w?: string; // the full word (picture questions)
  e?: string;
  blank?: string; // "___ẹo"
  p?: string; // question text for rule questions
  ans: string;
  wrong: string[];
}
const RULE: Record<string, string> = {
  k: 'Đứng trước e, ê, i thì viết "k".',
  c: 'Đứng trước a, o, ô, ơ, u, ư thì viết "c".',
  gh: 'Đứng trước e, ê, i thì viết "gh".',
  g: 'Đứng trước a, o, ô, ơ, u, ư thì viết "g".',
  ngh: 'Đứng trước e, ê, i thì viết "ngh".',
  ng: 'Đứng trước a, o, ô, ơ, u, ư thì viết "ng".',
};

function spelling(rows: Spell[]): Maker {
  return ({ i }): Draft => {
    const row = rows[i % rows.length];
    return {
      prompt: row.p ?? 'Điền chữ còn thiếu vào chỗ trống:',
      formula: row.blank,
      visual: row.e ? { kind: 'picture', emoji: row.e } : undefined,
      answer: row.ans,
      wrong: row.wrong,
      hint: RULE[row.ans],
      explain: row.w ? `Ta viết "${row.w}". ${RULE[row.ans]}` : RULE[row.ans],
    };
  };
}

const ck = (w: string, e: string, ans: 'c' | 'k'): Spell => ({ w, e, blank: '___' + w.slice(1), ans, wrong: [ans === 'c' ? 'k' : 'c', 'q'] });
const ckRows: Spell[] = [
  ck('kẹo', '🍬', 'k'), ck('cá', '🐟', 'c'), ck('kem', '🍦', 'k'), ck('cam', '🍊', 'c'),
  { p: 'Trước các chữ e, ê, i, âm "cờ" viết là:', ans: 'k', wrong: ['c', 'q'] },
  ck('kéo', '✂️', 'k'), ck('cua', '🦀', 'c'), ck('kiến', '🐜', 'k'), ck('cờ', '🚩', 'c'),
  { p: 'Trước các chữ a, o, ô, ơ, u, ư, âm "cờ" viết là:', ans: 'c', wrong: ['k', 'q'] },
  ck('kính', '👓', 'k'), ck('cây', '🌳', 'c'),
];

const gg = (w: string, e: string, ans: 'g' | 'gh', cut: number): Spell => ({ w, e, blank: '___' + w.slice(cut), ans, wrong: [ans === 'g' ? 'gh' : 'g', 'ng'] });
const ghRows: Spell[] = [
  gg('gà', '🐔', 'g', 1), gg('ghế', '🪑', 'gh', 2), gg('gấu', '🐻', 'g', 1), gg('ghi', '📝', 'gh', 2),
  { p: 'Trước các chữ e, ê, i, âm "gờ" viết là:', ans: 'gh', wrong: ['g', 'ng'] },
  gg('gỗ', '🪵', 'g', 1), gg('ghét', '😠', 'gh', 2), gg('gạch', '🧱', 'g', 1),
  { p: 'Trước các chữ a, o, ô, ơ, u, ư, âm "gờ" viết là:', ans: 'g', wrong: ['gh', 'ngh'] },
];

const nn = (w: string, e: string, ans: 'ng' | 'ngh', cut: number): Spell => ({ w, e, blank: '___' + w.slice(cut), ans, wrong: [ans === 'ng' ? 'ngh' : 'ng', 'gh'] });
const nghRows: Spell[] = [
  nn('ngựa', '🐴', 'ng', 2), nn('nghe', '👂', 'ngh', 3), nn('ngô', '🌽', 'ng', 2), nn('nghỉ', '🛌', 'ngh', 3),
  { p: 'Trước các chữ e, ê, i, âm "ngờ" viết là:', ans: 'ngh', wrong: ['ng', 'gh'] },
  nn('ngủ', '😴', 'ng', 2), nn('nghé', '🐃', 'ngh', 3), nn('ngón', '☝️', 'ng', 2), nn('nghĩ', '🤔', 'ngh', 3),
  { p: 'Trước các chữ a, o, ô, ơ, u, ư, âm "ngờ" viết là:', ans: 'ng', wrong: ['ngh', 'gh'] },
];

export const vietnameseGrade1Part1: Record<string, SkillDef[]> = {
  'g1-v-t1': [
    { name: 'Chữ cái đầu của tiếng', desc: 'Nhìn hình, đọc tên và tìm chữ cái đứng đầu tiếng', diff: 1, make: firstLetter },
    { name: 'Bảng chữ cái, chữ hoa và chữ thường', desc: 'Thứ tự 29 chữ cái, chữ hoa - chữ thường', diff: 1, make: alphabet },
    { name: 'Nhận biết các dấu thanh', desc: 'Sắc, huyền, hỏi, ngã, nặng và tiếng không dấu', diff: 2, make: tones },
  ],
  'g1-v-t2': [
    { name: 'Phân biệt c và k', desc: 'k đứng trước e, ê, i; c đứng trước các chữ còn lại', diff: 2, make: spelling(ckRows) },
    { name: 'Phân biệt g và gh', desc: 'gh đứng trước e, ê, i; g đứng trước các chữ còn lại', diff: 2, make: spelling(ghRows) },
    { name: 'Phân biệt ng và ngh', desc: 'ngh đứng trước e, ê, i; ng đứng trước các chữ còn lại', diff: 2, make: spelling(nghRows) },
  ],
};
