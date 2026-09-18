// Builds every skill's questions and checks them. Run with: npm run validate:content  (optionally: ... -- math)
import { topicsDatabase } from '../src/data/curriculumData';
import { topicSkillDefs } from '../src/data/content/index';
import { QUESTIONS_PER_SKILL, buildSkillQuestions } from '../src/data/content/core';
import type { CurriculumQuestion } from '../src/types/curriculum';

// Largest number a child of that grade meets in a maths question (counting objects, tables, etc. stay far below)
const MAX_NUMBER: Record<number, number> = { 1: 20, 2: 1000, 3: 100000, 4: 1000000000, 5: Infinity };

const problems: string[] = [];
const report = (q: CurriculumQuestion | null, msg: string) => problems.push(`${q ? q.id : '-'}: ${msg}`);

const plain = (s: string) => Number(s.replace(/\./g, '').replace(/[^\d-]/g, ''));

function checkArithmetic(q: CurriculumQuestion) {
  const m = q.formula?.match(/^(\d[\d.]*) ([+−×:]) (\d[\d.]*) = \?$/);
  if (!m) return;
  const a = plain(m[1]);
  const b = plain(m[3]);
  const op = m[2];
  const ans = q.correct_answer;
  if (op === ':' && /dư/.test(ans)) {
    const mm = ans.match(/^([\d.]+) \(dư (\d+)\)$/);
    if (!mm || plain(mm[1]) !== Math.floor(a / b) || Number(mm[2]) !== a % b) report(q, `division with remainder is wrong: ${q.formula} -> ${ans}`);
    return;
  }
  const expected = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;
  if (plain(ans) !== expected) report(q, `arithmetic is wrong: ${q.formula} -> ${ans} (expected ${expected})`);
}

// Vietnamese notation: dot = thousands, comma = decimals
const vnum = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'));
const fracVal = (s: string) => {
  const m = s.match(/^(\d+)\/(\d+)$/);
  return m ? Number(m[1]) / Number(m[2]) : vnum(s);
};

// Checks that read the question the way a child would and verify the marked answer
function checkSemantics(q: CurriculumQuestion) {
  const ans = q.correct_answer;
  const wrongs = q.choices.filter((c) => c !== ans);

  // "a … b" -> sign
  const cmp = q.formula?.match(/^(.+?) … (.+)$/);
  if (cmp && ['>', '<', '='].includes(ans)) {
    const a = fracVal(cmp[1]);
    const b = fracVal(cmp[2]);
    const sign = a > b ? '>' : a < b ? '<' : '=';
    if (Number.isFinite(a) && Number.isFinite(b) && sign !== ans) report(q, `comparison is wrong: ${q.formula} -> ${ans}`);
  }

  // smallest / largest in a list
  const ext = q.question_content.match(/^Số (bé|lớn) nhất trong các số (.+?) là:$/);
  if (ext) {
    const list = ext[2].split(/[;,] /).map(vnum);
    const best = ext[1] === 'bé' ? Math.min(...list) : Math.max(...list);
    if (vnum(ans) !== best) report(q, `${ext[1]} nhất is wrong: ${q.question_content} -> ${ans}`);
  }

  // neighbours
  const nb = q.question_content.match(/^Số liền (sau|trước) của (\d+)/);
  if (nb) {
    const n = Number(nb[2]);
    if (Number(ans) !== (nb[1] === 'sau' ? n + 1 : n - 1)) report(q, `neighbour is wrong: ${q.question_content} -> ${ans}`);
  }

  // divisibility
  const dv = q.question_content.match(/^Số nào (KHÔNG )?chia hết cho (.+)\?$/);
  if (dv) {
    const rules: Record<string, (n: number) => boolean> = {
      '2': (n) => n % 2 === 0,
      '3': (n) => n % 3 === 0,
      '5': (n) => n % 5 === 0,
      '9': (n) => n % 9 === 0,
      'cả 2 và 5': (n) => n % 10 === 0,
    };
    const rule = rules[dv[2]];
    const wantAnswer = !dv[1];
    if (!rule) report(q, `unknown divisibility rule ${dv[2]}`);
    else {
      if (rule(vnum(ans)) !== wantAnswer) report(q, `divisibility answer is wrong: ${q.question_content} -> ${ans}`);
      if (wrongs.some((w) => rule(vnum(w)) === wantAnswer)) report(q, `a wrong option also satisfies: ${q.question_content} | ${q.choices.join(' | ')}`);
    }
  }

  // rounding
  const rd = q.question_content.match(/^Làm tròn số ([\d.]+) đến hàng (chục|trăm|nghìn):$/);
  if (rd) {
    const p = { chục: 10, trăm: 100, nghìn: 1000 }[rd[2] as 'chục' | 'trăm' | 'nghìn'];
    if (vnum(ans) !== Math.round(vnum(rd[1]) / p) * p) report(q, `rounding is wrong: ${q.question_content} -> ${ans}`);
  }

  // find x
  const fx = q.formula?.match(/^(?:x ([+−]) (\d+) = (\d+)|(\d+) − x = (\d+))$/);
  if (fx) {
    const x = fx[1] ? (fx[1] === '+' ? Number(fx[3]) - Number(fx[2]) : Number(fx[3]) + Number(fx[2])) : Number(fx[4]) - Number(fx[5]);
    if (Number(ans) !== x) report(q, `x is wrong: ${q.formula} -> ${ans}`);
  }
}

function numbersIn(q: CurriculumQuestion): number[] {
  const text = [q.question_content, q.formula ?? '', q.subPrompt ?? '', ...q.choices].join(' ');
  return (text.match(/\d[\d.]*/g) ?? []).map((t) => plain(t)).filter((n) => Number.isFinite(n));
}

const only = process.argv[2]; // optional subject filter: math | vietnamese | english
let total = 0;
const perGrade: Record<string, number> = {};

for (const topic of topicsDatabase) {
  if (only && topic.subject_id !== only) continue;
  const defs = topicSkillDefs[topic.id];
  if (!defs) {
    problems.push(`${topic.id}: no skills defined for topic "${topic.name}"`);
    continue;
  }
  if (defs.length !== 3) problems.push(`${topic.id}: expected 3 skills, found ${defs.length}`);

  defs.forEach((def, k) => {
    const skillId = `${topic.id}-s${k + 1}`;
    const qs = buildSkillQuestions(skillId, topic.grade, topic.subject_id, topic.name, def);
    total += qs.length;
    perGrade[`g${topic.grade} ${topic.subject_id}`] = (perGrade[`g${topic.grade} ${topic.subject_id}`] ?? 0) + qs.length;
    if (qs.length < QUESTIONS_PER_SKILL) problems.push(`${skillId} "${def.name}": only ${qs.length}/${QUESTIONS_PER_SKILL} questions`);

    const seenPrompts = new Set<string>();
    for (const q of qs) {
      if (!q.question_content.trim()) report(q, 'empty prompt');
      if (!q.hint.trim() || !q.explanation.trim()) report(q, 'missing hint or explanation');
      if (q.choices.length < 2 || q.choices.length > 4) report(q, `${q.choices.length} choices`);
      if (new Set(q.choices).size !== q.choices.length) report(q, `duplicate choices: ${q.choices.join(' | ')}`);
      if (q.choices.some((c) => !c.trim())) report(q, 'empty choice');
      if (!q.choices.includes(q.correct_answer)) report(q, 'correct answer is not among the choices');
      if (q.choice_faces && q.choice_faces.length !== q.choices.length) report(q, 'choice_faces misaligned');
      if (q.choice_faces?.some((f) => f?.emoji && [...f.emoji].length > 10)) report(q, 'more than 10 pictures in an option');
      if (/undefined|NaN|\[object/.test(JSON.stringify(q))) report(q, 'contains undefined/NaN');
      if (q.choices.some((c) => /^-/.test(c))) report(q, `negative choice: ${q.choices.join(' | ')}`);

      const key = [q.question_content, q.formula ?? '', q.subPrompt ?? '', q.correct_answer, JSON.stringify(q.visual ?? null)].join('|');
      if (seenPrompts.has(key)) report(q, 'duplicate question inside skill');
      seenPrompts.add(key);

      if (topic.subject_id === 'math') {
        checkArithmetic(q);
        checkSemantics(q);
        const limit = MAX_NUMBER[topic.grade];
        const big = numbersIn(q).find((n) => n > limit);
        if (big !== undefined) report(q, `number ${big} is beyond grade ${topic.grade} (limit ${limit}): ${q.question_content} ${q.formula ?? ''}`);
      }
    }
  });
}

console.log(`Checked ${total} questions across ${topicsDatabase.length} topics.`);
for (const [k, v] of Object.entries(perGrade).sort()) console.log(`  ${k.padEnd(14)} ${v}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 80)) console.log(' - ' + p);
  if (problems.length > 80) console.log(` ... and ${problems.length - 80} more`);
  process.exit(1);
}
console.log('\nAll checks passed.');
