import { Draft, Maker, pick, sample } from './core.js';

// Building blocks for Vietnamese questions in grades 2-5. Instructions and examples are in Vietnamese.

// [text shown big (or ""), right answer, wrong answers joined by "|", hint, explanation?, question that overrides the default?]
export type QA = [string, string, string, string, string?, string?];

export function qa(prompt: string, list: QA[]): Maker {
  return ({ i }): Draft => {
    const [shown, a, w, h, x, p] = list[i % list.length];
    return { prompt: p ?? prompt, formula: shown || undefined, answer: a, wrong: w.split('|'), hint: h, explain: x ?? `Đáp án đúng là "${a}".` };
  };
}

// [passage, question, right answer, wrong answers joined by "|", hint, explanation?]
export type RD = [string, string, string, string, string, string?];

export function reading(list: RD[]): Maker {
  return ({ i }): Draft => {
    const [sub, q, a, w, h, x] = list[i % list.length];
    return { prompt: q, subPrompt: sub, answer: a, wrong: w.split('|'), hint: h, explain: x ?? `Trong bài: đáp án đúng là "${a}".` };
  };
}

// Word-class questions: "Từ nào chỉ đồ vật?" with words drawn from a bank per class
export interface WordClass {
  label: string; // "chỉ sự vật"
  words: string[];
  hint: string;
}

export function whichWord(target: WordClass, all: WordClass[]): Maker {
  return ({ r }): Draft => {
    const answer = pick(r, target.words);
    const others = all.filter((c) => c !== target).flatMap((c) => c.words);
    return {
      prompt: `Từ nào là từ ${target.label}?`,
      answer,
      wrong: sample(r, others, 3),
      hint: target.hint,
      explain: `"${answer}" là từ ${target.label}.`,
    };
  };
}

// "Từ nào KHÔNG ..." : three words of the class and one intruder
export function oddWord(target: WordClass, all: WordClass[], groupName: string): Maker {
  return ({ r }): Draft => {
    const odd = pick(r, all.filter((c) => c !== target).flatMap((c) => c.words));
    const same = sample(r, target.words, 3);
    return {
      prompt: `Từ nào KHÔNG ${groupName}?`,
      answer: odd,
      wrong: same,
      hint: `Ba từ ${target.label}. Tìm từ không thuộc nhóm đó.`,
      explain: `"${odd}" không phải từ ${target.label}.`,
    };
  };
}

// Stories of 4 events written in the right order, shown scrambled: the child finds the first or the last one
export function ordering(stories: string[][], firstQ: string, lastQ: string, hintFirst: string, hintLast: string): Maker {
  return ({ i }): Draft => {
    const o = stories[Math.floor(i / 2) % stories.length];
    const shown = [o[2], o[0], o[3], o[1]];
    const asFirst = i % 2 === 0;
    const answer = asFirst ? o[0] : o[3];
    return {
      prompt: asFirst ? firstQ : lastQ,
      subPrompt: shown.map((e, k) => `${String.fromCharCode(97 + k)}) ${e}`).join('\n'),
      answer,
      wrong: shown.filter((e) => e !== answer),
      hint: asFirst ? hintFirst : hintLast,
      explain: `Thứ tự đúng: ${o.join(' → ')}`,
    };
  };
}
