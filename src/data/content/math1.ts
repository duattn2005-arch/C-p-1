import { Draft, SkillDef, THINGS, NAMES, Thing, cap, pick, randInt, readVi, sample, shuffle, wrongNums } from './core.js';
import type { OptionFace, ShapeName } from '../../types/curriculum';

// Grade 1 (Toán 1, GDPT 2018): numbers within 10 and 20, addition/subtraction within 10 and 20,
// comparing, shapes, length in cm. Young children learn from pictures, so most questions show objects.

// Numeric answer options. When a thing is given, each option also shows that many pictures (up to 10).
function nums(ans: number, wrongs: number[], thing?: Thing): Pick<Draft, 'answer' | 'wrong' | 'faces'> {
  const all = [ans, ...wrongs];
  const faces: Record<string, OptionFace> | undefined =
    thing && all.every((v) => v >= 1 && v <= 10)
      ? Object.fromEntries(all.map((v) => [String(v), { emoji: thing.e.repeat(v) }]))
      : undefined;
  return { answer: String(ans), wrong: wrongs.map(String), faces };
}

const SIGNS = ['>', '<', '='];
const signOf = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

// ---------- Topic 1: Numbers 1-20 ----------
const count10: SkillDef = {
  name: 'Đếm xuôi và đếm ngược trong phạm vi 10',
  desc: 'Đếm số đồ vật trong hình và điền số còn thiếu vào dãy số',
  diff: 1,
  make: ({ r, i, t }) => {
    const kind = i % 3;
    if (kind === 0) {
      const thing = pick(r, THINGS);
      const n = randInt(r, 1, 4 + Math.round(t * 6));
      return {
        prompt: `Có bao nhiêu ${thing.n} trong hình?`,
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: n }] },
        ...nums(n, wrongNums(r, n, { min: 1, max: 10 })),
        hint: `Chỉ tay vào từng ${thing.n} và đếm: một, hai, ba...`,
        explain: `Đếm từng ${thing.n} ta được ${n}.`,
      };
    }
    const up = kind === 1;
    const start = up ? randInt(r, 1, 5) : randInt(r, 6, 10);
    const seq = [0, 1, 2, 3, 4].map((k) => (up ? start + k : start - k));
    const hole = randInt(r, 1, 3);
    const ans = seq[hole];
    return {
      prompt: up ? 'Đếm xuôi. Điền số còn thiếu vào chỗ ?' : 'Đếm ngược. Điền số còn thiếu vào chỗ ?',
      formula: seq.map((v, k) => (k === hole ? '?' : v)).join(', '),
      ...nums(ans, wrongNums(r, ans, { min: 0, max: 11, near: [1, -1, 2, -2] })),
      hint: up ? 'Đếm xuôi: mỗi số lớn hơn số đứng trước 1 đơn vị.' : 'Đếm ngược: mỗi số bé hơn số đứng trước 1 đơn vị.',
      explain: `Dãy số đầy đủ là ${seq.join(', ')}.`,
    };
  },
};

const teens: SkillDef = {
  name: 'Đọc và viết các số từ 11 đến 20',
  desc: 'Số có 1 chục và một vài đơn vị; đọc số bằng lời',
  diff: 2,
  make: ({ r, i }) => {
    const kind = i % 4;
    const u = randInt(r, 1, 9);
    const n = 10 + u;
    if (kind === 0) {
      return {
        prompt: `1 chục và ${u} đơn vị là số nào?`,
        ...nums(n, wrongNums(r, n, { min: 11, max: 20, near: [1, -1, 2, -2] })),
        hint: `1 chục là 10. 10 thêm ${u} là bao nhiêu?`,
        explain: `10 + ${u} = ${n}.`,
      };
    }
    if (kind === 1) {
      const ans = `1 chục và ${u} đơn vị`;
      return {
        prompt: `Số ${n} gồm mấy chục và mấy đơn vị?`,
        answer: ans,
        wrong: [`${u} chục và 1 đơn vị`, `1 chục và ${u === 9 ? 8 : u + 1} đơn vị`, `2 chục và ${u} đơn vị`],
        hint: 'Số có hai chữ số: chữ số bên trái là chục, chữ số bên phải là đơn vị.',
        explain: `Số ${n} có chữ số 1 ở hàng chục và chữ số ${u} ở hàng đơn vị.`,
      };
    }
    if (kind === 2) {
      const pool = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter((v) => v !== n);
      return {
        prompt: `Số ${n} đọc là gì?`,
        answer: readVi(n),
        wrong: [...sample(r, pool, 3).map(readVi), ...(n === 15 ? ['mười năm'] : [])].slice(0, 3),
        hint: 'Đọc: mười, mười một, mười hai... Số 15 đọc là "mười lăm".',
        explain: `Số ${n} đọc là "${readVi(n)}".`,
      };
    }
    const thing = pick(r, THINGS);
    return {
      prompt: `Có tất cả bao nhiêu ${thing.n}?`,
      visual: { kind: 'objects', emoji: thing.e, groups: [{ count: 10 }, { count: u }], op: '+' },
      answer: String(n),
      wrong: wrongNums(r, n, { min: 11, max: 20, near: [1, -1, 2, -2, 10 - u] }).map(String),
      hint: `Một nhóm có 10 ${thing.n}, thêm ${u} ${thing.n} nữa.`,
      explain: `10 + ${u} = ${n}.`,
    };
  },
};

const neighbors: SkillDef = {
  name: 'Tìm số liền trước và số liền sau',
  desc: 'Xác định số đứng ngay trước và ngay sau một số trong phạm vi 20',
  diff: 2,
  make: ({ r, i, t }) => {
    const max = t < 0.5 ? 10 : 20;
    const kind = i % 3;
    if (kind === 0) {
      const n = randInt(r, 1, max - 1);
      return {
        prompt: `Số liền sau của ${n} là số nào?`,
        ...nums(n + 1, wrongNums(r, n + 1, { min: 0, max: 20, near: [-2, 1, -1, 2] })),
        hint: 'Số liền sau lớn hơn số đó 1 đơn vị.',
        explain: `${n} + 1 = ${n + 1}, nên số liền sau của ${n} là ${n + 1}.`,
      };
    }
    if (kind === 1) {
      const n = randInt(r, 2, max);
      return {
        prompt: `Số liền trước của ${n} là số nào?`,
        ...nums(n - 1, wrongNums(r, n - 1, { min: 0, max: 20, near: [2, 1, -1, -2] })),
        hint: 'Số liền trước bé hơn số đó 1 đơn vị.',
        explain: `${n} − 1 = ${n - 1}, nên số liền trước của ${n} là ${n - 1}.`,
      };
    }
    const a = randInt(r, 1, max - 2);
    return {
      prompt: `Số nào nằm giữa ${a} và ${a + 2}?`,
      ...nums(a + 1, wrongNums(r, a + 1, { min: 0, max: 20, near: [1, -1, 2, -2] })),
      hint: `Đếm: ${a}, ?, ${a + 2}.`,
      explain: `Dãy số là ${a}, ${a + 1}, ${a + 2}. Số ở giữa là ${a + 1}.`,
    };
  },
};

// ---------- Topic 2: Comparing, ordering, position ----------
const compare: SkillDef = {
  name: 'So sánh lớn hơn, bé hơn, bằng nhau (>, <, =)',
  desc: 'So sánh số lượng đồ vật và so sánh các số trong phạm vi 20',
  diff: 1,
  make: ({ r, i, t }) => {
    const kind = i % 3;
    if (kind === 1) {
      const thing = pick(r, THINGS);
      const a = randInt(r, 1, 8);
      const b = r() < 0.2 ? a : randInt(r, 1, 8);
      const ans = a > b ? 'Bên trái' : a < b ? 'Bên phải' : 'Hai bên bằng nhau';
      return {
        prompt: 'Bên nào có nhiều hơn?',
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: a }, { count: b }], op: '?' },
        answer: ans,
        wrong: ['Bên trái', 'Bên phải', 'Hai bên bằng nhau'].filter((x) => x !== ans),
        hint: `Đếm số ${thing.n} ở mỗi bên rồi so sánh.`,
        explain: `Bên trái có ${a}, bên phải có ${b}. ${a > b ? `${a} > ${b}` : a < b ? `${a} < ${b}` : `${a} = ${b}`}.`,
      };
    }
    const max = kind === 0 && t < 0.6 ? 10 : 20;
    const a = randInt(r, 0, max);
    const b = r() < 0.2 ? a : randInt(r, 0, max);
    const withSum = kind === 2 && t > 0.6;
    if (withSum) {
      const x = randInt(r, 1, 5);
      const y = randInt(r, 1, 5);
      const c = randInt(r, 2, 10);
      const s = signOf(x + y, c);
      return {
        prompt: 'Chọn dấu (>, <, =) điền vào chỗ trống:',
        formula: `${x} + ${y} … ${c}`,
        answer: s,
        wrong: SIGNS.filter((z) => z !== s),
        hint: `Tính ${x} + ${y} trước rồi so sánh với ${c}.`,
        explain: `${x} + ${y} = ${x + y}. ${x + y} ${s} ${c}.`,
      };
    }
    const s = signOf(a, b);
    return {
      prompt: 'Chọn dấu (>, <, =) điền vào chỗ trống:',
      formula: `${a} … ${b}`,
      answer: s,
      wrong: SIGNS.filter((z) => z !== s),
      hint: 'Số nào đếm sau thì lớn hơn. Miệng con thú ăn về phía số lớn hơn.',
      explain: `${a} ${s} ${b}.`,
    };
  },
};

const ordering: SkillDef = {
  name: 'Sắp xếp dãy số theo thứ tự tăng/giảm dần',
  desc: 'Tìm số bé nhất, lớn nhất và xếp các số từ bé đến lớn',
  diff: 2,
  make: ({ r, i, t }) => {
    const max = t < 0.5 ? 10 : 20;
    const set = sample(r, Array.from({ length: max + 1 }, (_, k) => k), 4);
    const asc = [...set].sort((x, y) => x - y);
    const kind = i % 4;
    if (kind === 0 || kind === 1) {
      const small = kind === 0;
      const ans = small ? asc[0] : asc[3];
      return {
        prompt: small ? `Số bé nhất trong các số ${set.join(', ')} là:` : `Số lớn nhất trong các số ${set.join(', ')} là:`,
        ...nums(ans, set.filter((v) => v !== ans)),
        hint: small ? 'Số bé nhất là số đếm đến sớm nhất.' : 'Số lớn nhất là số đếm đến muộn nhất.',
        explain: `Xếp từ bé đến lớn: ${asc.join(', ')}. Số ${small ? 'bé' : 'lớn'} nhất là ${ans}.`,
      };
    }
    const up = kind === 2;
    const good = (up ? asc : [...asc].reverse()).join(', ');
    const swapped = [...asc];
    [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
    return {
      prompt: up ? 'Dãy số nào xếp từ bé đến lớn?' : 'Dãy số nào xếp từ lớn đến bé?',
      answer: good,
      wrong: [
        (up ? [...asc].reverse() : asc).join(', '),
        (up ? swapped : [...swapped].reverse()).join(', '),
        shuffle(r, set).join(', '),
      ],
      hint: up ? 'Bắt đầu từ số bé nhất, rồi đến các số lớn dần.' : 'Bắt đầu từ số lớn nhất, rồi đến các số bé dần.',
      explain: `Dãy đúng: ${good}.`,
    };
  },
};

const ANIMALS: Thing[] = [
  { e: '🐶', n: 'con chó' },
  { e: '🐱', n: 'con mèo' },
  { e: '🐰', n: 'con thỏ' },
  { e: '🐔', n: 'con gà' },
  { e: '🐷', n: 'con lợn' },
  { e: '🐮', n: 'con bò' },
];

const position: SkillDef = {
  name: 'Xác định vị trí: trên/dưới, trước/sau, trái/phải',
  desc: 'Nhìn hình và nói con vật ở bên trái, bên phải, ở giữa, ở trên, ở dưới',
  diff: 1,
  make: ({ r, i }) => {
    const kind = i % 5;
    const three = sample(r, ANIMALS, 3);
    const faces = (things: Thing[]): Record<string, OptionFace> =>
      Object.fromEntries(things.map((x) => [x.n, { emoji: x.e }]));
    if (kind <= 2) {
      const idx = [0, 2, 1][kind];
      const where = ['bên trái cùng', 'ở giữa', 'bên phải cùng'][[0, 1, 2].indexOf(idx)];
      const ans = three[idx];
      return {
        prompt: `Con vật nào ${where}?`,
        visual: { kind: 'row', items: three.map((x) => x.e) },
        answer: ans.n,
        wrong: three.filter((x) => x !== ans).map((x) => x.n),
        faces: faces(three),
        hint: 'Nhìn từ trái sang phải: con thứ nhất, con thứ hai, con thứ ba.',
        explain: `Từ trái sang phải là: ${three.map((x) => x.n).join(', ')}. ${ans.n} ${where}.`,
      };
    }
    if (kind === 3) {
      const [a, b] = three;
      const askBelow = r() < 0.5;
      const ans = askBelow ? b : a;
      return {
        prompt: `${cap(a.n)} ${a.e} ở trên, ${b.n} ${b.e} ở dưới. Con nào ở ${askBelow ? 'dưới' : 'trên'}?`,
        answer: ans.n,
        wrong: [(askBelow ? a : b).n, three[2].n],
        faces: faces(three),
        hint: 'Trên là phía cao hơn, dưới là phía thấp hơn.',
        explain: `${ans.n} ở ${askBelow ? 'dưới' : 'trên'}.`,
      };
    }
    const [a, b, c] = three;
    return {
      prompt: `Các con vật xếp hàng từ trái sang phải. ${b.n} đứng ngay sau con nào?`,
      visual: { kind: 'row', items: [a.e, b.e, c.e] },
      answer: a.n,
      wrong: [c.n, `Không có con nào`],
      faces: faces(three),
      hint: 'Đứng ngay sau nghĩa là đứng liền phía sau, sát bên.',
      explain: `${a.n} đứng trước ${b.n}, nên ${b.n} đứng ngay sau ${a.n}.`,
    };
  },
};

// ---------- Topic 3: Addition ----------
const add10: SkillDef = {
  name: 'Phép cộng trong phạm vi 10',
  desc: 'Cộng gộp đồ vật và tính nhẩm 3 + 4, 6 + 2',
  diff: 1,
  make: ({ r, i, t }) => {
    const thing = pick(r, THINGS);
    const a = randInt(r, 1, 6);
    const b = randInt(r, 1, Math.min(6, 10 - a));
    const s = a + b;
    if (i < 3) {
      return {
        prompt: 'Nhìn hình rồi tính:',
        formula: `${a} + ${b} = ?`,
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: a }, { count: b }], op: '+' },
        ...nums(s, wrongNums(r, s, { min: 1, max: 10, near: [1, -1, 2, -2] }), thing),
        hint: `Gộp hai nhóm lại rồi đếm tất cả ${thing.n}.`,
        hint2: `Đếm tiếp từ ${a}: ${Array.from({ length: b }, (_, k) => a + k + 1).join(', ')}.`,
        explain: `${a} + ${b} = ${s}.`,
      };
    }
    if (i < 5) {
      const who = pick(r, NAMES);
      return {
        prompt: `${who} có ${a} ${thing.n}. Mẹ cho thêm ${b} ${thing.n}. ${who} có tất cả mấy ${thing.n}?`,
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: a }, { count: b }], op: '+' },
        ...nums(s, wrongNums(r, s, { min: 1, max: 10, near: [1, -1, 2, -2] }), thing),
        hint: 'Thêm vào nghĩa là cộng.',
        explain: `${a} + ${b} = ${s}. ${who} có tất cả ${s} ${thing.n}.`,
      };
    }
    if (t > 0.85) {
      return {
        prompt: 'Điền số thích hợp vào chỗ ?',
        formula: `${a} + ? = ${s}`,
        ...nums(b, wrongNums(r, b, { min: 0, max: 10, near: [1, -1, 2, -2] })),
        hint: `Đếm tiếp từ ${a} cho đến ${s}.`,
        explain: `${s} − ${a} = ${b}, nên ${a} + ${b} = ${s}.`,
      };
    }
    return {
      prompt: 'Tính nhẩm:',
      formula: `${a} + ${b} = ?`,
      ...nums(s, wrongNums(r, s, { min: 0, max: 10, near: [1, -1, 2, -2] })),
      hint: `Đếm tiếp ${b} số kể từ ${a}.`,
      explain: `${a} + ${b} = ${s}.`,
    };
  },
};

const add20a: SkillDef = {
  name: 'Phép cộng dạng 14 + 3 và 10 + 5',
  desc: 'Cộng số có hai chữ số với số có một chữ số, không nhớ, trong phạm vi 20',
  diff: 2,
  make: ({ r, i }) => {
    const u = randInt(r, 0, 8);
    const a = 10 + u;
    const b = randInt(r, 1, 9 - u);
    const s = a + b;
    const swap = i % 3 === 2;
    return {
      prompt: 'Tính nhẩm:',
      formula: swap ? `${b} + ${a} = ?` : `${a} + ${b} = ?`,
      answer: String(s),
      wrong: wrongNums(r, s, { min: 10, max: 19, near: [1, -1, 2, -2, 10] }).map(String),
      hint: `Số ${a} gồm 1 chục và ${u} đơn vị. Cộng ${u} với ${b}, giữ nguyên 1 chục.`,
      hint2: `${u} + ${b} = ${u + b}. Vậy kết quả là 1 chục và ${u + b} đơn vị.`,
      explain: `${a} + ${b} = ${s}.`,
    };
  },
};

const add20b: SkillDef = {
  name: 'Tính nhẩm phép cộng qua 10',
  desc: 'Tách số để cộng qua 10: 8 + 5, 9 + 4',
  diff: 3,
  make: ({ r }) => {
    const a = randInt(r, 6, 9);
    const b = randInt(r, 11 - a, 9);
    const s = a + b;
    const need = 10 - a;
    return {
      prompt: 'Tính nhẩm (tách số để cộng qua 10):',
      formula: `${a} + ${b} = ?`,
      answer: String(s),
      wrong: wrongNums(r, s, { min: 10, max: 18, near: [1, -1, 2, -2, 10] }).map(String),
      hint: `Lấy ${need} từ số ${b} để cùng với ${a} thành 10.`,
      hint2: `${a} + ${need} = 10, còn lại ${b - need}. 10 + ${b - need} = ${s}.`,
      steps: [`Tách ${b} = ${need} + ${b - need}.`, `${a} + ${need} = 10.`, `10 + ${b - need} = ${s}.`],
      explain: `${a} + ${b} = ${s}.`,
    };
  },
};

// ---------- Topic 4: Subtraction ----------
const sub10: SkillDef = {
  name: 'Phép trừ trong phạm vi 10',
  desc: 'Bớt đồ vật và tính nhẩm 7 − 3, 9 − 5',
  diff: 1,
  make: ({ r, i, t }) => {
    const thing = pick(r, THINGS);
    const a = randInt(r, 3, 10);
    const b = randInt(r, 1, a - 1);
    const d = a - b;
    if (i < 3) {
      return {
        prompt: 'Nhìn hình rồi tính (các hình bị gạch là bớt đi):',
        formula: `${a} − ${b} = ?`,
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: a, crossed: b }], op: '−' },
        ...nums(d, wrongNums(r, d, { min: 1, max: 10, near: [1, -1, 2, -2] }), thing),
        hint: `Đếm số ${thing.n} không bị gạch.`,
        hint2: `Có ${a}, bớt đi ${b}, còn lại bao nhiêu?`,
        explain: `${a} − ${b} = ${d}.`,
      };
    }
    if (i < 5) {
      const who = pick(r, NAMES);
      return {
        prompt: `${who} có ${a} ${thing.n}. ${who} cho bạn ${b} ${thing.n}. ${who} còn lại mấy ${thing.n}?`,
        visual: { kind: 'objects', emoji: thing.e, groups: [{ count: a, crossed: b }], op: '−' },
        ...nums(d, wrongNums(r, d, { min: 1, max: 10, near: [1, -1, 2, -2] }), thing),
        hint: 'Cho đi, bớt đi nghĩa là trừ.',
        explain: `${a} − ${b} = ${d}. ${who} còn lại ${d} ${thing.n}.`,
      };
    }
    return {
      prompt: t > 0.85 ? 'Điền số thích hợp vào chỗ ?' : 'Tính nhẩm:',
      formula: t > 0.85 ? `${a} − ? = ${d}` : `${a} − ${b} = ?`,
      ...nums(t > 0.85 ? b : d, wrongNums(r, t > 0.85 ? b : d, { min: 0, max: 10, near: [1, -1, 2, -2] })),
      hint: `Đếm lùi ${b} số kể từ ${a}.`,
      explain: `${a} − ${b} = ${d}.`,
    };
  },
};

const sub20a: SkillDef = {
  name: 'Phép trừ dạng 17 − 4 và 15 − 5',
  desc: 'Trừ số có hai chữ số cho số có một chữ số, không nhớ, trong phạm vi 20',
  diff: 2,
  make: ({ r, i }) => {
    const u = randInt(r, 1, 9);
    const a = 10 + u;
    const b = i % 4 === 3 ? 10 : randInt(r, 1, u);
    const d = a - b;
    return {
      prompt: 'Tính nhẩm:',
      formula: `${a} − ${b} = ?`,
      answer: String(d),
      wrong: wrongNums(r, d, { min: 0, max: 19, near: [1, -1, 2, -2, 10] }).map(String),
      hint: b === 10 ? `Trừ đi 1 chục: ${a} bớt 10 còn ${u}.` : `Lấy số đơn vị trừ đi: ${u} − ${b}, giữ nguyên 1 chục.`,
      explain: `${a} − ${b} = ${d}.`,
    };
  },
};

const sub20b: SkillDef = {
  name: 'Tính nhẩm phép trừ qua 10',
  desc: '12 − 5, 14 − 6 bằng cách tách để trừ qua 10',
  diff: 3,
  make: ({ r }) => {
    const u = randInt(r, 1, 8);
    const a = 10 + u;
    const b = randInt(r, u + 1, 9);
    const d = a - b;
    return {
      prompt: 'Tính nhẩm (tách số để trừ qua 10):',
      formula: `${a} − ${b} = ?`,
      answer: String(d),
      wrong: wrongNums(r, d, { min: 1, max: 12, near: [1, -1, 2, -2, 10] }).map(String),
      hint: `Trừ ${u} trước để về 10, rồi trừ tiếp phần còn lại.`,
      hint2: `${a} − ${u} = 10. Còn phải trừ ${b - u} nữa: 10 − ${b - u} = ${d}.`,
      steps: [`Tách ${b} = ${u} + ${b - u}.`, `${a} − ${u} = 10.`, `10 − ${b - u} = ${d}.`],
      explain: `${a} − ${b} = ${d}.`,
    };
  },
};

// ---------- Topic 5: Shapes and length ----------
const SHAPES: { shape: ShapeName; name: string; sides: number | null }[] = [
  { shape: 'circle', name: 'Hình tròn', sides: null },
  { shape: 'square', name: 'Hình vuông', sides: 4 },
  { shape: 'triangle', name: 'Hình tam giác', sides: 3 },
  { shape: 'rectangle', name: 'Hình chữ nhật', sides: 4 },
];
const SHAPE_COLORS = ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6'];

const shapes: SkillDef = {
  name: 'Nhận diện hình vuông, tròn, tam giác, chữ nhật',
  desc: 'Nhìn hình và gọi tên; chọn hình đúng theo tên; đếm cạnh',
  diff: 1,
  make: ({ r, i }) => {
    const kind = i % 4;
    const target = pick(r, SHAPES);
    const hex = pick(r, SHAPE_COLORS);
    if (kind === 0 || kind === 3) {
      return {
        prompt: 'Đây là hình gì?',
        visual: { kind: 'shape', shape: target.shape, hex },
        answer: target.name,
        wrong: SHAPES.filter((s) => s !== target).map((s) => s.name),
        hint: 'Nhìn kỹ số cạnh và các góc của hình.',
        explain: `Đây là ${target.name.toLowerCase()}.`,
      };
    }
    if (kind === 1) {
      const others = shuffle(r, SHAPES.filter((s) => s !== target)).slice(0, 3);
      const all = [target, ...others];
      const label = (k: number) => `Hình ${k + 1}`;
      const order = shuffle(r, all);
      const faces: Record<string, OptionFace> = {};
      order.forEach((s, k) => (faces[label(k)] = { shape: s.shape, hex: pick(r, SHAPE_COLORS), only: true }));
      const ansIdx = order.indexOf(target);
      return {
        prompt: `Hình nào là ${target.name.toLowerCase()}?`,
        answer: label(ansIdx),
        wrong: order.map((_, k) => label(k)).filter((_, k) => k !== ansIdx),
        faces,
        hint: `${target.name} ${target.sides ? `có ${target.sides} cạnh` : 'không có cạnh, tròn đều'}.`,
        explain: `${label(ansIdx)} là ${target.name.toLowerCase()}.`,
      };
    }
    const withSides = SHAPES.filter((s) => s.sides);
    const s = pick(r, withSides);
    return {
      prompt: `${s.name} có mấy cạnh?`,
      visual: { kind: 'shape', shape: s.shape, hex },
      ...nums(s.sides as number, wrongNums(r, s.sides as number, { min: 1, max: 6, near: [1, -1, 2, -2] })),
      hint: 'Đếm từng cạnh của hình, đừng bỏ sót cạnh nào.',
      explain: `${s.name} có ${s.sides} cạnh.`,
    };
  },
};

const BAR_ITEMS: { label: string; hex: string }[] = [
  { label: 'Cái bút chì', hex: '#F59E0B' },
  { label: 'Sợi dây', hex: '#3B82F6' },
  { label: 'Cái thước', hex: '#10B981' },
  { label: 'Cái bàn chải', hex: '#EF4444' },
  { label: 'Cái lược', hex: '#8B5CF6' },
];

const measureUnits: SkillDef = {
  name: 'Đo độ dài bằng que tính và gang tay',
  desc: 'So sánh độ dài hai vật và đo bằng ô vuông, que tính',
  diff: 1,
  make: ({ r, i }) => {
    const [x, y] = sample(r, BAR_ITEMS, 2);
    const a = randInt(r, 2, 10);
    let b = randInt(r, 2, 10);
    if (b === a) b = a === 10 ? 9 : a + 1;
    const items = [
      { label: x.label, value: a, hex: x.hex },
      { label: y.label, value: b, hex: y.hex },
    ];
    const kind = i % 4;
    if (kind === 0 || kind === 1) {
      const longer = kind === 0;
      const ans = (a > b) === longer ? x : y;
      const other = ans === x ? y : x;
      return {
        prompt: longer ? 'Vật nào dài hơn?' : 'Vật nào ngắn hơn?',
        visual: { kind: 'bars', items, unit: 'que tính' },
        answer: ans.label,
        wrong: [other.label],
        hint: 'Nhìn hai vạch: vạch nào kéo dài hơn thì vật đó dài hơn.',
        explain: `${x.label} dài ${a} que tính, ${y.label} dài ${b} que tính.`,
      };
    }
    if (kind === 2) {
      return {
        prompt: `${x.label} dài mấy que tính?`,
        visual: { kind: 'bars', items: [items[0]], unit: 'que tính' },
        ...nums(a, wrongNums(r, a, { min: 1, max: 10, near: [1, -1, 2, -2] })),
        hint: 'Đếm số que tính xếp dọc theo vật.',
        explain: `${x.label} dài ${a} que tính.`,
      };
    }
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    return {
      prompt: 'Độ dài của hai vật khác nhau mấy que tính?',
      visual: { kind: 'bars', items, unit: 'que tính' },
      ...nums(big - small, wrongNums(r, big - small, { min: 1, max: 9, near: [1, -1, 2, -2] })),
      hint: 'Lấy số que của vật dài trừ đi số que của vật ngắn.',
      explain: `${big} − ${small} = ${big - small}.`,
    };
  },
};

const cm: SkillDef = {
  name: 'Làm quen đơn vị xăng-ti-mét (cm)',
  desc: 'Đọc vạch thước kẻ và đo độ dài từ 1 cm đến 10 cm',
  diff: 2,
  make: ({ r, i }) => {
    const kind = i % 4;
    if (kind === 3) {
      const things = ['quyển vở', 'cái bút chì', 'cái bàn', 'cái thước kẻ'];
      const thing = pick(r, things);
      return {
        prompt: r() < 0.5 ? 'Đơn vị nào dùng để đo độ dài?' : `Ta dùng đơn vị nào để đo chiều dài của ${thing}?`,
        answer: 'cm (xăng-ti-mét)',
        wrong: ['kg (ki-lô-gam)', 'lít', 'giờ'],
        hint: 'Thước kẻ dùng để đo độ dài. Trên thước có các vạch cm.',
        explain: 'Độ dài được đo bằng xăng-ti-mét (cm).',
      };
    }
    const start = kind === 2 ? randInt(r, 1, 4) : 0;
    const len = randInt(r, 2, 10 - start);
    return {
      prompt: start === 0 ? 'Đoạn thẳng dài mấy xăng-ti-mét?' : `Đoạn thẳng đi từ vạch ${start} đến vạch ${start + len}. Đoạn thẳng dài mấy xăng-ti-mét?`,
      visual: { kind: 'ruler', length: len, start },
      ...nums(len, wrongNums(r, len, { min: 1, max: 10, near: [1, -1, 2, -2] })),
      hint: start === 0 ? 'Đặt vạch 0 ở đầu đoạn thẳng, đọc số ở cuối đoạn thẳng.' : `Lấy số ở cuối trừ số ở đầu: ${start + len} − ${start}.`,
      explain: `Đoạn thẳng dài ${len} cm.`,
    };
  },
};

export const mathGrade1: Record<string, SkillDef[]> = {
  'g1-m-t1': [count10, teens, neighbors],
  'g1-m-t2': [compare, ordering, position],
  'g1-m-t3': [add10, add20a, add20b],
  'g1-m-t4': [sub10, sub20a, sub20b],
  'g1-m-t5': [shapes, measureUnits, cm],
};
