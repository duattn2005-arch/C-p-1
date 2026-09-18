import { Maker, SkillDef, sample, shuffle } from './core.js';
import type { QuestionVisual } from '../../types/curriculum';

// Building blocks for English questions. Beginners (grades 1-2) learn words from pictures, so almost every
// question here is "picture <-> word". Vietnamese instructions, English words.

export interface Word {
  en: string;
  vi: string;
  e: string; // emoji shown as the picture
}

export const w = (en: string, vi: string, e: string): Word => ({ en, vi, e });

const upper1 = (s: string) => s.charAt(0).toUpperCase();

// Rotate through several question kinds so a small word list still gives 8 different questions
export function mix(makers: Maker[]): Maker {
  return (c) => makers[c.i % makers.length]({ ...c, i: Math.floor(c.i / makers.length) });
}

// Picture -> English word
export function picToWord(bank: Word[], extra: Word[] = []): Maker {
  return ({ r, i }) => {
    const it = bank[i % bank.length];
    const wrong = sample(r, [...bank, ...extra].filter((x) => x.en !== it.en), 3).map((x) => x.en);
    return {
      prompt: 'Đây là gì? (What is this?)',
      visual: { kind: 'picture', emoji: it.e },
      answer: it.en,
      wrong,
      hint: `Chữ cái đầu tiên của từ này là "${upper1(it.en)}".`,
      hint2: `Từ này nghĩa là "${it.vi}" trong tiếng Việt.`,
      explain: `${it.e} là "${it.en}" (${it.vi}).`,
    };
  };
}

// English word -> the right picture (options are pictures only)
export function wordToPic(bank: Word[], extra: Word[] = []): Maker {
  return ({ r, i }) => {
    const it = bank[i % bank.length];
    const others = sample(r, [...bank, ...extra].filter((x) => x.e !== it.e), 3);
    const faces = Object.fromEntries([it, ...others].map((x) => [x.e, { emoji: x.e, only: true }]));
    return {
      prompt: `Hình nào là "${it.en}"? (Which picture is "${it.en}"?)`,
      answer: it.e,
      wrong: others.map((x) => x.e),
      faces,
      hint: `"${it.en}" nghĩa là "${it.vi}". Hãy tìm hình có ${it.vi}.`,
      explain: `"${it.en}" là ${it.vi} ${it.e}.`,
    };
  };
}

// Vietnamese -> English word
export function viToEn(bank: Word[], extra: Word[] = []): Maker {
  return ({ r, i }) => {
    const it = bank[i % bank.length];
    const wrong = sample(r, [...bank, ...extra].filter((x) => x.en !== it.en), 3).map((x) => x.en);
    return {
      prompt: `"${it.vi}" tiếng Anh là gì?`,
      visual: { kind: 'picture', emoji: it.e },
      answer: it.en,
      wrong,
      hint: `Chữ cái đầu tiên là "${upper1(it.en)}".`,
      explain: `${it.vi} tiếng Anh là "${it.en}" ${it.e}.`,
    };
  };
}

// English word -> Vietnamese meaning
export function enToVi(bank: Word[], extra: Word[] = []): Maker {
  return ({ r, i }) => {
    const it = bank[i % bank.length];
    const wrong = sample(r, [...bank, ...extra].filter((x) => x.vi !== it.vi), 3).map((x) => x.vi);
    return {
      prompt: `"${it.en}" nghĩa là gì?`,
      answer: it.vi,
      wrong,
      hint: `Nhìn hình để đoán: ${it.e}`,
      visual: { kind: 'picture', emoji: it.e },
      explain: `"${it.en}" nghĩa là ${it.vi} ${it.e}.`,
    };
  };
}

// A hand-written question: fill a gap, answer a question, pick the right reply
export interface Row {
  p?: string; // instruction (defaults to the skill's)
  f?: string; // the English sentence / question shown big
  sub?: string; // a short passage or extra context
  v?: QuestionVisual;
  a: string;
  w: string[];
  fc?: Record<string, string>; // option text -> emoji shown beside it
  h: string; // hint (Vietnamese)
  x?: string; // explanation (defaults to the full sentence)
}

export function fromRows(rows: Row[], defaultPrompt: string): Maker {
  return ({ i }) => {
    const row = rows[i % rows.length];
    return {
      prompt: row.p ?? defaultPrompt,
      formula: row.f,
      subPrompt: row.sub,
      visual: row.v,
      answer: row.a,
      wrong: row.w,
      faces: row.fc ? Object.fromEntries(Object.entries(row.fc).map(([k, e]) => [k, { emoji: e }])) : undefined,
      hint: row.h,
      explain: row.x ?? (row.f ? row.f.replace('___', `"${row.a}"`) : row.a),
    };
  };
}

export const skill = (name: string, desc: string, diff: 1 | 2 | 3 | 4 | 5, make: Maker): SkillDef => ({ name, desc, diff, make });

export { shuffle };
