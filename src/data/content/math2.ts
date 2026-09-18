import { COUNTABLES, NAMES, SkillDef, cap, pick, randInt, readVi, sample, shuffle, wrongNums } from './core.js';
import type { Rng } from './core.js';

// Grade 2 (Toán 2, GDPT 2018): numbers to 1000, add/subtract with carrying within 100,
// multiplication and division tables 2 and 5, clock reading, units (dm, m, km, kg, lít), days and months.

const str = (n: number) => String(n);
const strs = (ns: number[]) => ns.map(str);
const SIGNS = ['>', '<', '='];
const signOf = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

// Three different digits (so "the digit 7" points at exactly one place)
function distinctDigits(r: Rng): number {
  const d = shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const h = d[0] === 0 ? d[3] : d[0];
  const rest = d.filter((x) => x !== h);
  return h * 100 + rest[0] * 10 + rest[1];
}

// A random 3-digit number; some have a zero in the tens or units place, which is where children slip
function threeDigit(r: Rng, allowZero = true): number {
  const h = 1 + Math.floor(r() * 9);
  const t = allowZero && r() < 0.25 ? 0 : Math.floor(r() * 10);
  const u = allowZero && r() < 0.2 ? 0 : Math.floor(r() * 10);
  return h * 100 + t * 10 + u;
}

// ---------- Topic 1: Numbers to 1000 ----------
const read3: SkillDef = {
  name: 'Đọc và viết số có ba chữ số',
  desc: 'Đọc số bằng lời, viết số từ lời đọc (có cả số có chữ số 0)',
  diff: 2,
  make: ({ r, i }) => {
    const n = threeDigit(r);
    const swapped = Number(String(n).split('').reverse().join('')) || n + 10;
    if (i % 2 === 0) {
      const wrong = [swapped, n + 10 * (r() < 0.5 ? 1 : -1), n + 100, n - 1].filter((v) => v !== n && v >= 100).map(readVi);
      return {
        prompt: `Số ${n} đọc là:`,
        answer: readVi(n),
        wrong,
        hint: 'Đọc lần lượt từ hàng trăm, hàng chục đến hàng đơn vị. Chữ số 0 ở hàng chục đọc là "linh".',
        explain: `Số ${n} đọc là "${readVi(n)}".`,
      };
    }
    return {
      prompt: `Số "${readVi(n)}" viết là:`,
      answer: str(n),
      wrong: strs([swapped, n + 10, n - 10, n + 1].filter((v) => v !== n && v >= 100 && v <= 999)),
      hint: 'Viết từng hàng: trăm, chục, đơn vị. "Linh" nghĩa là hàng chục là 0.',
      explain: `"${readVi(n)}" viết là ${n}.`,
    };
  },
};

const place3: SkillDef = {
  name: 'Hàng trăm, hàng chục, hàng đơn vị',
  desc: 'Phân tích số có ba chữ số thành trăm, chục, đơn vị',
  diff: 2,
  make: ({ r, i }) => {
    const n = threeDigit(r);
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    const kind = i % 3;
    if (kind === 0) {
      const ans = `${h} trăm, ${t} chục, ${u} đơn vị`;
      return {
        prompt: `Số ${n} gồm mấy trăm, mấy chục, mấy đơn vị?`,
        answer: ans,
        wrong: [`${u} trăm, ${t} chục, ${h} đơn vị`, `${t} trăm, ${h} chục, ${u} đơn vị`, `${h} trăm, ${u} chục, ${t} đơn vị`],
        hint: 'Chữ số đầu tiên là hàng trăm, chữ số ở giữa là hàng chục, chữ số cuối là hàng đơn vị.',
        explain: `Số ${n} có ${h} trăm, ${t} chục và ${u} đơn vị.`,
      };
    }
    if (kind === 1) {
      const m = distinctDigits(r);
      const digits = [Math.floor(m / 100), Math.floor((m % 100) / 10), m % 10];
      const pos = randInt(r, 0, 2);
      const digit = digits[pos];
      const names = ['hàng trăm', 'hàng chục', 'hàng đơn vị'];
      return {
        prompt: `Chữ số ${digit} trong số ${m} thuộc hàng nào?`,
        answer: names[pos],
        wrong: [...names.filter((_, k) => k !== pos), 'hàng nghìn'],
        hint: 'Từ phải sang trái là hàng đơn vị, hàng chục, hàng trăm.',
        explain: `Trong số ${m}, chữ số ${digit} thuộc ${names[pos]}.`,
      };
    }
    return {
      prompt: 'Điền số thích hợp:',
      formula: `${h * 100} + ${t * 10} + ${u} = ?`,
      answer: str(n),
      wrong: strs([h * 100 + u * 10 + t, t * 100 + h * 10 + u, n + 100, n - 10].filter((v) => v !== n && v > 0)),
      hint: 'Ghép các hàng lại: trăm, chục, đơn vị.',
      explain: `${h * 100} + ${t * 10} + ${u} = ${n}.`,
    };
  },
};

const cmp3: SkillDef = {
  name: 'So sánh và sắp xếp các số đến 1000',
  desc: 'So sánh số có ba chữ số, tìm số lớn nhất, bé nhất, số liền trước, liền sau',
  diff: 3,
  make: ({ r, i }) => {
    const kind = i % 4;
    if (kind === 0) {
      const a = threeDigit(r, false);
      const b = r() < 0.2 ? a : r() < 0.5 ? a + randInt(r, -9, 9) : threeDigit(r, false);
      const s = signOf(a, b);
      return {
        prompt: 'Chọn dấu (>, <, =) điền vào chỗ trống:',
        formula: `${a} … ${b}`,
        answer: s,
        wrong: SIGNS.filter((x) => x !== s),
        hint: 'So sánh hàng trăm trước. Nếu bằng nhau thì so sánh hàng chục, rồi hàng đơn vị.',
        explain: `${a} ${s} ${b}.`,
      };
    }
    if (kind === 1) {
      const set = sample(r, [threeDigit(r, false), threeDigit(r, false), threeDigit(r, false), threeDigit(r, false)], 4);
      const uniq = [...new Set(set)];
      if (uniq.length < 4) uniq.push(...[101, 202, 303, 404].slice(0, 4 - uniq.length));
      const asc = [...uniq].sort((x, y) => x - y);
      const max = r() < 0.5;
      const ans = max ? asc[3] : asc[0];
      return {
        prompt: `Số ${max ? 'lớn' : 'bé'} nhất trong các số ${uniq.join(', ')} là:`,
        answer: str(ans),
        wrong: strs(uniq.filter((v) => v !== ans)),
        hint: 'So sánh chữ số hàng trăm trước.',
        explain: `Xếp từ bé đến lớn: ${asc.join(', ')}.`,
      };
    }
    if (kind === 2) {
      const n = randInt(r, 100, 998);
      const after = r() < 0.5;
      const ans = after ? n + 1 : n - 1;
      return {
        prompt: `Số liền ${after ? 'sau' : 'trước'} của ${n} là:`,
        answer: str(ans),
        wrong: strs(wrongNums(r, ans, { min: 90, max: 1000, near: [1, -1, 10, -10, 2, -2] })),
        hint: after ? 'Số liền sau lớn hơn số đó 1 đơn vị.' : 'Số liền trước bé hơn số đó 1 đơn vị.',
        explain: `${n} ${after ? '+' : '−'} 1 = ${ans}.`,
      };
    }
    const set = [...new Set([threeDigit(r, false), threeDigit(r, false), threeDigit(r, false)])];
    while (set.length < 3) set.push(150 + set.length * 100);
    const asc = [...set].sort((x, y) => x - y);
    const swapped = [asc[1], asc[0], asc[2]];
    return {
      prompt: 'Dãy số nào xếp theo thứ tự từ bé đến lớn?',
      answer: asc.join(', '),
      wrong: [[...asc].reverse().join(', '), swapped.join(', '), [asc[0], asc[2], asc[1]].join(', ')],
      hint: 'Tìm số bé nhất trước, rồi đến số lớn hơn.',
      explain: `Dãy đúng là ${asc.join(', ')}.`,
    };
  },
};

// ---------- Topic 2: Addition with carrying within 100 ----------
// Pairs of 2-digit numbers whose units add up to 10 or more (carry) and whose sum stays within 100
function carryPair(r: Rng): [number, number] {
  const ua = randInt(r, 1, 9);
  const ub = randInt(r, 10 - ua, 9);
  const ta = randInt(r, 1, 7);
  const tb = randInt(r, 1, 8 - ta);
  return [ta * 10 + ua, tb * 10 + ub];
}

const add100: SkillDef = {
  name: 'Cộng có nhớ dạng 28 + 15',
  desc: 'Cộng hai số có hai chữ số, có nhớ sang hàng chục, tổng không quá 100',
  diff: 3,
  make: ({ r }) => {
    const [a, b] = carryPair(r);
    const s = a + b;
    return {
      prompt: 'Tính:',
      formula: `${a} + ${b} = ?`,
      answer: str(s),
      wrong: strs(wrongNums(r, s, { min: 20, max: 100, near: [10, -10, 1, -1, 2, -2] })),
      hint: `Cộng hàng đơn vị: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, viết ${s % 10} nhớ 1.`,
      hint2: `Cộng hàng chục: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 (nhớ) = ${Math.floor(s / 10)}.`,
      explain: `${a} + ${b} = ${s}.`,
    };
  },
};

const addWritten: SkillDef = {
  name: 'Đặt tính rồi tính phép cộng có nhớ',
  desc: 'Đặt tính thẳng cột, cộng từ phải sang trái và nhớ 1 sang hàng chục',
  diff: 3,
  make: ({ r, i }) => {
    const [a, b] = carryPair(r);
    const s = a + b;
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: 'Đặt tính rồi tính:',
        formula: `${a} + ${b} = ?`,
        answer: str(s),
        wrong: strs(wrongNums(r, s, { min: 20, max: 100, near: [10, -10, 1, -1] })),
        hint: 'Viết các chữ số thẳng cột: đơn vị thẳng đơn vị, chục thẳng chục. Cộng từ phải sang trái.',
        steps: [
          `Hàng đơn vị: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, viết ${s % 10}, nhớ 1.`,
          `Hàng chục: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(s / 10)}, viết ${Math.floor(s / 10)}.`,
          `Vậy ${a} + ${b} = ${s}.`,
        ],
        explain: `${a} + ${b} = ${s}.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: `Trong phép cộng ${a} + ${b}, sau khi cộng hàng đơn vị ta nhớ mấy sang hàng chục?`,
        answer: '1',
        wrong: ['0', '2', '10'],
        hint: `${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, được một chục và ${s % 10} đơn vị.`,
        explain: `Hàng đơn vị được ${(a % 10) + (b % 10)}: viết ${s % 10}, nhớ 1 sang hàng chục.`,
      };
    }
    return {
      prompt: `Chữ số ở hàng đơn vị của tổng ${a} + ${b} là:`,
      answer: str(s % 10),
      wrong: strs(wrongNums(r, s % 10, { min: 0, max: 9, near: [1, -1, 2, -2, 3, -3] })),
      hint: 'Cộng hai chữ số hàng đơn vị, viết chữ số hàng đơn vị của kết quả.',
      explain: `${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, viết ${s % 10}.`,
    };
  },
};

const addWord: SkillDef = {
  name: 'Giải bài toán có lời văn về phép cộng',
  desc: 'Bài toán thêm vào, gộp lại và "nhiều hơn"',
  diff: 3,
  make: ({ r, i }) => {
    const [a, b] = carryPair(r);
    const s = a + b;
    const who = pick(r, NAMES);
    const th = pick(r, COUNTABLES);
    const kind = i % 3;
    const text =
      kind === 0
        ? `${who} có ${a} ${th.n}. Mẹ cho thêm ${b} ${th.n}. Hỏi ${who} có tất cả bao nhiêu ${th.n}?`
        : kind === 1
        ? `Lớp 2A có ${a} học sinh, lớp 2B có ${b} học sinh. Hỏi cả hai lớp có bao nhiêu học sinh?`
        : `Hàng trên có ${a} ${th.n}, hàng dưới nhiều hơn hàng trên ${b} ${th.n}. Hỏi hàng dưới có bao nhiêu ${th.n}?`;
    return {
      prompt: text,
      answer: str(s),
      wrong: strs(wrongNums(r, s, { min: 20, max: 100, near: [10, -10, 1, -1, a > b ? a - b : b - a] })),
      hint: kind === 1 ? 'Gộp lại nghĩa là cộng.' : kind === 2 ? '"Nhiều hơn" nghĩa là ta phải cộng.' : 'Thêm vào nghĩa là cộng.',
      hint2: `Phép tính: ${a} + ${b}.`,
      explain: `Bài giải: ${a} + ${b} = ${s}.`,
    };
  },
};

// ---------- Topic 3: Subtraction with borrowing within 100 ----------
function borrowPair(r: Rng): [number, number] {
  const ua = randInt(r, 0, 8);
  const ub = randInt(r, ua + 1, 9);
  const ta = randInt(r, 3, 9);
  const tb = randInt(r, 1, ta - 2);
  return [ta * 10 + ua, tb * 10 + ub];
}

const sub100: SkillDef = {
  name: 'Phép trừ có nhớ dạng số có 2 chữ số (52 − 27)',
  desc: 'Trừ hai số có hai chữ số, hàng đơn vị của số bị trừ nhỏ hơn số trừ',
  diff: 3,
  make: ({ r }) => {
    const [a, b] = borrowPair(r);
    const d = a - b;
    return {
      prompt: 'Tính:',
      formula: `${a} − ${b} = ?`,
      answer: str(d),
      wrong: strs(wrongNums(r, d, { min: 1, max: 99, near: [10, -10, 1, -1, 2, -2] })),
      hint: `${a % 10} không trừ được ${b % 10}, lấy ${10 + (a % 10)} trừ ${b % 10} bằng ${10 + (a % 10) - (b % 10)}, viết ${d % 10} nhớ 1.`,
      hint2: `Hàng chục: ${Math.floor(b / 10)} thêm 1 bằng ${Math.floor(b / 10) + 1}. ${Math.floor(a / 10)} − ${Math.floor(b / 10) + 1} = ${Math.floor(d / 10)}.`,
      explain: `${a} − ${b} = ${d}.`,
    };
  },
};

const subWritten: SkillDef = {
  name: 'Đặt tính rồi tính phép trừ có nhớ',
  desc: 'Đặt tính thẳng cột, trừ từ phải sang trái và nhớ 1 sang hàng chục',
  diff: 3,
  make: ({ r, i }) => {
    const [a, b] = borrowPair(r);
    const d = a - b;
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: 'Đặt tính rồi tính:',
        formula: `${a} − ${b} = ?`,
        answer: str(d),
        wrong: strs(wrongNums(r, d, { min: 1, max: 99, near: [10, -10, 1, -1] })),
        hint: 'Viết các chữ số thẳng cột. Trừ từ phải sang trái, nếu không trừ được thì lấy thêm 1 chục.',
        steps: [
          `Hàng đơn vị: ${a % 10} không trừ được ${b % 10}, lấy ${10 + (a % 10)} − ${b % 10} = ${d % 10}, viết ${d % 10}, nhớ 1.`,
          `Hàng chục: ${Math.floor(b / 10)} thêm 1 bằng ${Math.floor(b / 10) + 1}; ${Math.floor(a / 10)} − ${Math.floor(b / 10) + 1} = ${Math.floor(d / 10)}, viết ${Math.floor(d / 10)}.`,
          `Vậy ${a} − ${b} = ${d}.`,
        ],
        explain: `${a} − ${b} = ${d}.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: `Trong phép trừ ${a} − ${b}, ở hàng đơn vị ta lấy ${10 + (a % 10)} trừ ${b % 10}. Kết quả là:`,
        answer: str(10 + (a % 10) - (b % 10)),
        wrong: strs(wrongNums(r, 10 + (a % 10) - (b % 10), { min: 1, max: 19, near: [1, -1, 2, -2, 10] })),
        hint: `${a % 10} bé hơn ${b % 10} nên ta lấy thêm 1 chục thành ${10 + (a % 10)}.`,
        explain: `${10 + (a % 10)} − ${b % 10} = ${10 + (a % 10) - (b % 10)}.`,
      };
    }
    return {
      prompt: `Chữ số ở hàng đơn vị của hiệu ${a} − ${b} là:`,
      answer: str(d % 10),
      wrong: strs(wrongNums(r, d % 10, { min: 0, max: 9, near: [1, -1, 2, -2, 3, -3] })),
      hint: `Lấy ${10 + (a % 10)} trừ ${b % 10}.`,
      explain: `${10 + (a % 10)} − ${b % 10} = ${10 + (a % 10) - (b % 10)}, viết ${d % 10}.`,
    };
  },
};

const subWord: SkillDef = {
  name: 'Giải bài toán có lời văn về phép trừ có nhớ',
  desc: 'Bài toán bớt đi, còn lại và "ít hơn"',
  diff: 3,
  make: ({ r, i }) => {
    const [a, b] = borrowPair(r);
    const d = a - b;
    const who = pick(r, NAMES);
    const th = pick(r, COUNTABLES);
    const kind = i % 3;
    const text =
      kind === 0
        ? `${who} có ${a} ${th.n}, đã cho bạn ${b} ${th.n}. Hỏi ${who} còn lại bao nhiêu ${th.n}?`
        : kind === 1
        ? `Trong kho có ${a} ${th.n}, đã bán đi ${b} ${th.n}. Hỏi trong kho còn bao nhiêu ${th.n}?`
        : `Thùng thứ nhất có ${a} ${th.n}, thùng thứ hai ít hơn thùng thứ nhất ${b} ${th.n}. Hỏi thùng thứ hai có bao nhiêu ${th.n}?`;
    return {
      prompt: text,
      answer: str(d),
      wrong: strs(wrongNums(r, d, { min: 1, max: 99, near: [10, -10, 1, -1, a + b <= 100 ? a + b - d : 3] })),
      hint: kind === 2 ? '"Ít hơn" nghĩa là ta phải trừ.' : 'Cho đi, bán đi, còn lại nghĩa là trừ.',
      hint2: `Phép tính: ${a} − ${b}.`,
      explain: `Bài giải: ${a} − ${b} = ${d}.`,
    };
  },
};

// ---------- Topic 4: Multiplication and division tables 2 and 5 ----------
const mul25: SkillDef = {
  name: 'Bảng nhân 2 và bảng nhân 5',
  desc: 'Nhân 2, nhân 5 qua hình ảnh các nhóm bằng nhau',
  diff: 2,
  make: ({ r, i, t }) => {
    const m = i % 2 === 0 ? 2 : 5;
    const k = randInt(r, 2, t < 0.5 ? 5 : 10);
    const th = pick(r, COUNTABLES);
    const p = m * k;
    if (k <= 5 && i < 5) {
      return {
        prompt: `Mỗi đĩa có ${m} ${th.n}. ${k} đĩa như vậy có tất cả bao nhiêu ${th.n}?`,
        formula: `${m} × ${k} = ?`,
        visual: { kind: 'objects', emoji: th.e, groups: Array.from({ length: k }, () => ({ count: m })), op: '+' },
        answer: str(p),
        wrong: strs(wrongNums(r, p, { min: 2, max: 50, near: [m, -m, 1, -1, 2 * m] })),
        hint: `${m} được lấy ${k} lần: ${Array.from({ length: k }, () => m).join(' + ')}.`,
        explain: `${m} × ${k} = ${p}.`,
      };
    }
    return {
      prompt: 'Tính nhẩm (dùng bảng nhân):',
      formula: `${m} × ${k} = ?`,
      answer: str(p),
      wrong: strs(wrongNums(r, p, { min: 2, max: 60, near: [m, -m, 1, -1, 2 * m] })),
      hint: `Đếm cách ${m}: ${Array.from({ length: k }, (_, x) => m * (x + 1)).join(', ')}.`,
      explain: `${m} × ${k} = ${p}.`,
    };
  },
};

const div25: SkillDef = {
  name: 'Bảng chia 2 và bảng chia 5',
  desc: 'Chia đều thành các phần bằng nhau, dùng bảng nhân để chia',
  diff: 3,
  make: ({ r, i }) => {
    const m = i % 2 === 0 ? 2 : 5;
    const q = randInt(r, 1, 10);
    const total = m * q;
    return {
      prompt: 'Tính nhẩm (dùng bảng chia):',
      formula: `${total} : ${m} = ?`,
      answer: str(q),
      wrong: strs(wrongNums(r, q, { min: 1, max: 12, near: [1, -1, 2, -2, m] })),
      hint: `Nghĩ xem ${m} nhân với số nào bằng ${total}: ${m} × ? = ${total}.`,
      explain: `${m} × ${q} = ${total} nên ${total} : ${m} = ${q}.`,
    };
  },
};

const mulDivWord: SkillDef = {
  name: 'Giải bài toán nhân, chia có lời văn',
  desc: 'Bài toán mỗi nhóm có mấy, chia đều và xếp thành nhóm',
  diff: 3,
  make: ({ r, i }) => {
    const m = i % 2 === 0 ? 2 : 5;
    const q = randInt(r, 2, 9);
    const th = pick(r, COUNTABLES);
    const who = pick(r, NAMES);
    const total = m * q;
    const kind = i % 4;
    if (kind === 0 || kind === 1) {
      return {
        prompt: `Mỗi hộp có ${m} ${th.n}. ${q} hộp như vậy có bao nhiêu ${th.n}?`,
        formula: `${m} × ${q} = ?`,
        answer: str(total),
        wrong: strs(wrongNums(r, total, { min: 2, max: 60, near: [m, -m, 1, -1, q] })),
        hint: 'Mỗi hộp có một số ' + th.n + ' như nhau, nên ta dùng phép nhân.',
        explain: `${m} × ${q} = ${total}.`,
      };
    }
    if (kind === 2) {
      return {
        prompt: `Có ${total} ${th.n} chia đều cho ${m} bạn. Hỏi mỗi bạn được bao nhiêu ${th.n}?`,
        formula: `${total} : ${m} = ?`,
        answer: str(q),
        wrong: strs(wrongNums(r, q, { min: 1, max: 12, near: [1, -1, 2, -2, m] })),
        hint: 'Chia đều nghĩa là ta dùng phép chia.',
        explain: `${total} : ${m} = ${q}. Mỗi bạn được ${q} ${th.n}.`,
      };
    }
    return {
      prompt: `${who} xếp ${total} ${th.n} vào các túi, mỗi túi ${m} ${th.n}. Hỏi xếp được bao nhiêu túi?`,
      formula: `${total} : ${m} = ?`,
      answer: str(q),
      wrong: strs(wrongNums(r, q, { min: 1, max: 12, near: [1, -1, 2, -2, m] })),
      hint: `Cứ ${m} ${th.n} thì được một túi, nên ta lấy ${total} chia cho ${m}.`,
      explain: `${total} : ${m} = ${q}. Xếp được ${q} túi.`,
    };
  },
};

// ---------- Topic 5: Clock, units, calendar ----------
const timeText = (h: number, m: number) => (m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`);

const clock: SkillDef = {
  name: 'Xem đồng hồ: giờ đúng, 15 phút và 30 phút',
  desc: 'Đọc giờ trên mặt đồng hồ có kim ngắn (giờ) và kim dài (phút)',
  diff: 2,
  make: ({ r, i, t }) => {
    const h = randInt(r, 1, 12);
    const m = pick(r, t < 0.4 ? [0] : [0, 15, 30]);
    const ans = timeText(h, m);
    const hn = (x: number) => ((x - 1 + 12) % 12) + 1;
    const swappedHands = m === 0 && h !== 12 ? timeText(12, h * 5) : null; // long hand read as the hour
    const wrong = [
      timeText(hn(h + 1), m),
      timeText(hn(h - 1), m),
      timeText(h, m === 0 ? 30 : 0),
      timeText(h, m === 15 ? 30 : 15),
      ...(swappedHands ? [swappedHands] : []),
    ];
    return {
      prompt: 'Đồng hồ chỉ mấy giờ?',
      visual: { kind: 'clock', hour: h, minute: m },
      answer: ans,
      wrong: [...new Set(wrong)].filter((x) => x !== ans),
      hint: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 12 là giờ đúng, chỉ số 3 là 15 phút, chỉ số 6 là 30 phút (rưỡi).',
      explain: `Kim ngắn chỉ số ${h}, kim dài chỉ số ${m / 5 || 12}. Vậy đồng hồ chỉ ${ans}.`,
    };
  },
};

const units2: SkillDef = {
  name: 'Đơn vị đo: dm, m, km, kg, lít',
  desc: 'Đổi đơn vị đo độ dài và chọn đơn vị đo phù hợp',
  diff: 3,
  make: ({ r, i }) => {
    if (i % 2 === 0) {
      const facts: [string, string, string][] = [
        ['1 dm = ? cm', '10', 'Một đề-xi-mét bằng 10 xăng-ti-mét.'],
        ['1 m = ? dm', '10', 'Một mét bằng 10 đề-xi-mét.'],
        ['1 m = ? cm', '100', 'Một mét bằng 100 xăng-ti-mét.'],
        ['1 km = ? m', '1000', 'Một ki-lô-mét bằng 1000 mét.'],
      ];
      const [f, a, ex] = pick(r, facts);
      return {
        prompt: 'Điền số thích hợp:',
        formula: f,
        answer: a,
        wrong: ['10', '100', '1000', '1'].filter((x) => x !== a),
        hint: 'Nhớ các đơn vị: 1 dm = 10 cm, 1 m = 10 dm = 100 cm, 1 km = 1000 m.',
        explain: ex,
      };
    }
    const items: [string, string][] = [
      ['Một quả dưa hấu cân nặng 3 …', 'kg'],
      ['Một can nước mắm chứa 5 …', 'lít'],
      ['Quãng đường từ nhà đến trường dài 2 …', 'km'],
      ['Cái bàn học cao 7 …', 'dm'],
      ['Con cá cân nặng 2 …', 'kg'],
      ['Chiều dài lớp học khoảng 8 …', 'm'],
    ];
    const [q, a] = pick(r, items);
    return {
      prompt: 'Chọn đơn vị đo thích hợp điền vào chỗ trống:',
      formula: q,
      answer: a,
      wrong: ['kg', 'lít', 'km', 'dm', 'm'].filter((x) => x !== a).slice(0, 4),
      hint: 'kg đo cân nặng, lít đo lượng nước, m/dm/km đo độ dài.',
      explain: `Đơn vị thích hợp là ${a}.`,
    };
  },
};

const DAYS = ['thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy', 'Chủ nhật'];
const MONTH_DAYS: [number, number][] = [
  [1, 31], [3, 31], [4, 30], [5, 31], [6, 30], [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31],
];

const calendar: SkillDef = {
  name: 'Ngày, tuần lễ, tháng trong năm',
  desc: 'Các ngày trong tuần, số ngày trong tháng và xem lịch',
  diff: 2,
  make: ({ r, i }) => {
    const kind = i % 4;
    if (kind === 0) {
      const k = randInt(r, 0, 6);
      const after = r() < 0.5;
      const ans = DAYS[(k + (after ? 1 : 6)) % 7];
      return {
        prompt: `Ngày ${after ? 'sau' : 'trước'} ${DAYS[k]} là ngày nào?`,
        answer: cap(ans),
        wrong: shuffle(r, DAYS.filter((d) => d !== ans && d !== DAYS[k])).slice(0, 3).map(cap),
        hint: `Thứ tự các ngày trong tuần: ${DAYS.join(', ')}.`,
        explain: `Ngày ${after ? 'sau' : 'trước'} ${DAYS[k]} là ${ans}.`,
      };
    }
    if (kind === 1) {
      const [mo, days] = pick(r, MONTH_DAYS);
      return {
        prompt: `Tháng ${mo} có bao nhiêu ngày?`,
        answer: str(days),
        wrong: strs([28, 29, 30, 31].filter((x) => x !== days)),
        hint: 'Các tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày. Các tháng 4, 6, 9, 11 có 30 ngày.',
        explain: `Tháng ${mo} có ${days} ngày.`,
      };
    }
    if (kind === 2) {
      const d = randInt(r, 1, 20);
      const k = randInt(r, 0, 6);
      return {
        prompt: `Hôm nay là ${DAYS[k]}, ngày ${d}. ${cap(DAYS[k])} tuần sau là ngày bao nhiêu?`,
        answer: str(d + 7),
        wrong: strs([d + 1, d + 6, d + 14]),
        hint: 'Một tuần lễ có 7 ngày.',
        explain: `${d} + 7 = ${d + 7}.`,
      };
    }
    return r() < 0.5
      ? {
          prompt: 'Một tuần lễ có mấy ngày?',
          answer: '7',
          wrong: ['5', '6', '10'],
          hint: `Đếm: ${DAYS.join(', ')}.`,
          explain: 'Một tuần lễ có 7 ngày.',
        }
      : {
          prompt: 'Một năm có mấy tháng?',
          answer: '12',
          wrong: ['10', '11', '13'],
          hint: 'Đếm các tháng trên tờ lịch từ tháng Một đến tháng Mười hai.',
          explain: 'Một năm có 12 tháng.',
        };
  },
};

export const mathGrade2: Record<string, SkillDef[]> = {
  'g2-m-t1': [read3, place3, cmp3],
  'g2-m-t2': [add100, addWritten, addWord],
  'g2-m-t3': [sub100, subWritten, subWord],
  'g2-m-t4': [mul25, div25, mulDivWord],
  'g2-m-t5': [clock, units2, calendar],
};
