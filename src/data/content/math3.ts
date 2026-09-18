import { COUNTABLES, NAMES, SkillDef, cap, fmt, pick, randInt, readVi, shuffle, wrongNums } from './core.js';
import type { Rng } from './core.js';

// Grade 3 (Toán 3, GDPT 2018): numbers to 100 000 and rounding, multiplication/division tables 6-9,
// division with remainder, adding/subtracting large numbers, perimeter and area, two-step word problems.

const str = (n: number) => String(n);
const SIGNS = ['>', '<', '='];
const signOf = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

const digitsOf = (n: number) => String(n).split('').map(Number);
const fromDigits = (d: number[]) => Number(d.join(''));

// n distinct-ish random digits forming a number with `len` digits (no leading zero)
function bigNumber(r: Rng, len: number): number {
  const d = [randInt(r, 1, 9)];
  for (let k = 1; k < len; k++) d.push(randInt(r, 0, 9));
  return fromDigits(d);
}

const withUnit = (n: number, unit: string) => `${fmt(n)} ${unit}`;

// ---------- Topic 1: Numbers to 100 000 ----------
const read45: SkillDef = {
  name: 'Đọc và viết số có bốn, năm chữ số',
  desc: 'Đọc số bằng lời và viết số từ lời đọc, gồm các số có chữ số 0',
  diff: 3,
  make: ({ r, i, t }) => {
    const len = t < 0.5 ? 4 : 5;
    const n = bigNumber(r, len);
    const d = digitsOf(n);
    const swap = [...d];
    [swap[len - 1], swap[len - 2]] = [swap[len - 2], swap[len - 1]];
    const others = [fromDigits(swap), n + 1000, n - 100, n + 10].filter((v) => v !== n && v >= 1000 && v <= 99999);
    if (i % 2 === 0) {
      return {
        prompt: `Số ${fmt(n)} đọc là:`,
        answer: readVi(n),
        wrong: others.map(readVi),
        hint: 'Đọc từ trái sang phải theo từng lớp: lớp nghìn rồi lớp đơn vị.',
        explain: `Số ${fmt(n)} đọc là "${readVi(n)}".`,
      };
    }
    return {
      prompt: `Số "${readVi(n)}" viết là:`,
      answer: fmt(n),
      wrong: others.map(fmt),
      hint: 'Viết theo từng lớp. Chữ số 0 giữ chỗ cho hàng không có giá trị.',
      explain: `"${readVi(n)}" viết là ${fmt(n)}.`,
    };
  },
};

const PLACES = ['hàng đơn vị', 'hàng chục', 'hàng trăm', 'hàng nghìn', 'hàng chục nghìn'];

const place45: SkillDef = {
  name: 'Hàng, lớp và giá trị của chữ số',
  desc: 'Xác định hàng của một chữ số, phân tích số thành tổng các hàng',
  diff: 3,
  make: ({ r, i, t }) => {
    const len = t < 0.5 ? 4 : 5;
    const digits = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).slice(0, len);
    if (digits[0] === 0) [digits[0], digits[len - 1]] = [digits[len - 1], digits[0]];
    const n = fromDigits(digits);
    const kind = i % 3;
    if (kind === 0) {
      const pos = randInt(r, 0, len - 1); // position from the left
      const place = PLACES[len - 1 - pos];
      return {
        prompt: `Chữ số ${digits[pos]} trong số ${fmt(n)} thuộc hàng nào?`,
        answer: place,
        wrong: PLACES.slice(0, len).filter((x) => x !== place),
        hint: 'Từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn.',
        explain: `Trong số ${fmt(n)}, chữ số ${digits[pos]} thuộc ${place}.`,
      };
    }
    if (kind === 1) {
      const nonZero = digits.map((dg, k) => (dg === 0 ? -1 : k)).filter((k) => k >= 0);
      const pos = pick(r, nonZero);
      const value = digits[pos] * 10 ** (len - 1 - pos);
      const wrongVals = [digits[pos], digits[pos] * 10 ** Math.max(0, len - pos), digits[pos] * 10 ** Math.max(0, len - 2 - pos), value + 1]
        .filter((v) => v !== value && v > 0);
      return {
        prompt: `Giá trị của chữ số ${digits[pos]} trong số ${fmt(n)} là:`,
        answer: fmt(value),
        wrong: [...new Set(wrongVals)].map(fmt),
        hint: 'Giá trị của chữ số = chữ số nhân với giá trị của hàng.',
        explain: `Chữ số ${digits[pos]} ở ${PLACES[len - 1 - pos]} nên có giá trị ${fmt(value)}.`,
      };
    }
    const parts = digits.map((dg, k) => dg * 10 ** (len - 1 - k)).filter((v) => v > 0);
    return {
      prompt: 'Điền số thích hợp:',
      formula: `${parts.map(fmt).join(' + ')} = ?`,
      answer: fmt(n),
      wrong: [n + 1000, n - 100, fromDigits([...digits].reverse())].filter((v) => v !== n && v > 0).map(fmt),
      hint: 'Ghép các hàng lại với nhau.',
      explain: `${parts.map(fmt).join(' + ')} = ${fmt(n)}.`,
    };
  },
};

const compareRound: SkillDef = {
  name: 'So sánh và làm tròn số',
  desc: 'So sánh số có 4, 5 chữ số; làm tròn đến hàng chục, hàng trăm, hàng nghìn',
  diff: 3,
  make: ({ r, i, t }) => {
    const kind = i % 3;
    const len = t < 0.5 ? 4 : 5;
    if (kind === 0) {
      const a = bigNumber(r, len);
      const b = r() < 0.2 ? a : r() < 0.5 ? a + randInt(r, -90, 90) : bigNumber(r, len);
      const s = signOf(a, b);
      return {
        prompt: 'Chọn dấu (>, <, =) điền vào chỗ trống:',
        formula: `${fmt(a)} … ${fmt(b)}`,
        answer: s,
        wrong: SIGNS.filter((x) => x !== s),
        hint: 'So sánh từ hàng cao nhất: số nào có chữ số lớn hơn ở hàng cao nhất thì lớn hơn.',
        explain: `${fmt(a)} ${s} ${fmt(b)}.`,
      };
    }
    const places: [number, string][] = [[10, 'chục'], [100, 'trăm'], [1000, 'nghìn']];
    const [p, pname] = pick(r, len === 4 ? places : places);
    const n = bigNumber(r, len);
    const rounded = Math.round(n / p) * p;
    const down = Math.floor(n / p) * p;
    const up = down + p;
    return {
      prompt: `Làm tròn số ${fmt(n)} đến hàng ${pname}:`,
      answer: fmt(rounded),
      wrong: [down, up, rounded + p * 2, rounded - p].filter((v) => v !== rounded && v > 0).map(fmt),
      hint: `Nhìn chữ số ngay bên phải hàng ${pname}: nếu bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.`,
      explain: `Số ${fmt(n)} nằm giữa ${fmt(down)} và ${fmt(up)}; làm tròn đến hàng ${pname} ta được ${fmt(rounded)}.`,
    };
  },
};

// ---------- Topic 2: Tables 6-9, division with remainder ----------
const mul69: SkillDef = {
  name: 'Bảng nhân 6, 7, 8, 9',
  desc: 'Tính nhẩm các phép nhân trong bảng nhân 6, 7, 8, 9',
  diff: 2,
  make: ({ r, i }) => {
    const m = pick(r, [6, 7, 8, 9]);
    const k = randInt(r, 2, 10);
    const p = m * k;
    const kind = i % 3;
    if (kind === 1) {
      return {
        prompt: 'Tìm số thích hợp:',
        formula: `${m} × ? = ${p}`,
        answer: str(k),
        wrong: [k + 1, k - 1, k + 2, m].filter((v) => v !== k && v > 0).map(str),
        hint: `Nghĩ xem ${m} nhân với số nào bằng ${p}.`,
        explain: `${m} × ${k} = ${p}.`,
      };
    }
    if (kind === 2) {
      const th = pick(r, COUNTABLES);
      return {
        prompt: `Mỗi hộp có ${m} ${th.n}. ${k} hộp như vậy có bao nhiêu ${th.n}?`,
        formula: `${m} × ${k} = ?`,
        answer: str(p),
        wrong: wrongNums(r, p, { min: 6, max: 100, near: [m, -m, 1, -1, 10, -10] }).map(str),
        hint: 'Mỗi hộp có số lượng như nhau nên ta dùng phép nhân.',
        explain: `${m} × ${k} = ${p}.`,
      };
    }
    return {
      prompt: 'Tính nhẩm:',
      formula: `${m} × ${k} = ?`,
      answer: str(p),
      wrong: wrongNums(r, p, { min: 6, max: 100, near: [m, -m, 1, -1, 10, -10] }).map(str),
      hint: `Đếm cách ${m}: ${Array.from({ length: Math.min(k, 6) }, (_, x) => m * (x + 1)).join(', ')}...`,
      explain: `${m} × ${k} = ${p}.`,
    };
  },
};

const div69: SkillDef = {
  name: 'Bảng chia 6, 7, 8, 9',
  desc: 'Tính nhẩm phép chia trong bảng chia và tìm một phần mấy của một số',
  diff: 2,
  make: ({ r, i }) => {
    const m = pick(r, [6, 7, 8, 9]);
    const q = randInt(r, 2, 10);
    const total = m * q;
    const kind = i % 3;
    if (kind === 1) {
      const frac = ['', '', 'một phần hai', 'một phần ba', 'một phần tư', 'một phần năm', 'một phần sáu', 'một phần bảy', 'một phần tám', 'một phần chín'][m];
      return {
        prompt: `Tìm ${frac} của ${total}:`,
        answer: str(q),
        wrong: wrongNums(r, q, { min: 1, max: 20, near: [1, -1, 2, -2, m] }).map(str),
        hint: `Tìm ${frac} của một số là chia số đó cho ${m}.`,
        explain: `${total} : ${m} = ${q}.`,
      };
    }
    if (kind === 2) {
      const th = pick(r, COUNTABLES);
      return {
        prompt: `Có ${total} ${th.n} chia đều vào ${m} túi. Mỗi túi có bao nhiêu ${th.n}?`,
        formula: `${total} : ${m} = ?`,
        answer: str(q),
        wrong: wrongNums(r, q, { min: 1, max: 20, near: [1, -1, 2, -2, m] }).map(str),
        hint: 'Chia đều nên ta dùng phép chia.',
        explain: `${total} : ${m} = ${q}.`,
      };
    }
    return {
      prompt: 'Tính nhẩm:',
      formula: `${total} : ${m} = ?`,
      answer: str(q),
      wrong: wrongNums(r, q, { min: 1, max: 20, near: [1, -1, 2, -2, m] }).map(str),
      hint: `Nghĩ xem ${m} nhân với số nào bằng ${total}.`,
      explain: `${m} × ${q} = ${total} nên ${total} : ${m} = ${q}.`,
    };
  },
};

const remainderDiv: SkillDef = {
  name: 'Phép chia có dư',
  desc: 'Tìm thương và số dư; số dư luôn bé hơn số chia',
  diff: 3,
  make: ({ r, i }) => {
    const m = randInt(r, 2, 9);
    const q = randInt(r, 2, 12);
    const rem = randInt(r, 1, m - 1);
    const a = m * q + rem;
    const kind = i % 3;
    if (kind === 2) {
      return {
        prompt: `Trong phép chia cho ${m}, số dư lớn nhất có thể là bao nhiêu?`,
        answer: str(m - 1),
        wrong: [m, m + 1, 1].map(str),
        hint: 'Số dư luôn bé hơn số chia.',
        explain: `Số dư bé hơn ${m} nên số dư lớn nhất là ${m - 1}.`,
      };
    }
    const ans = `${q} (dư ${rem})`;
    if (kind === 1) {
      return {
        prompt: `Có ${a} quả cam xếp vào các hộp, mỗi hộp ${m} quả. Xếp được nhiều nhất bao nhiêu hộp và thừa mấy quả?`,
        answer: ans,
        wrong: [`${q + 1} (dư ${rem})`, `${q} (dư ${Math.min(m, rem + 1)})`, `${rem} (dư ${q % m})`].filter((x) => x !== ans),
        hint: `Chia ${a} cho ${m}: thương là số hộp, số dư là số quả thừa.`,
        explain: `${a} : ${m} = ${q} (dư ${rem}) vì ${m} × ${q} + ${rem} = ${a}.`,
      };
    }
    return {
      prompt: 'Tìm thương và số dư:',
      formula: `${a} : ${m} = ?`,
      answer: ans,
      wrong: [`${q + 1} (dư ${rem})`, `${q} (dư ${Math.min(m, rem + 1)})`, `${rem} (dư ${q % m})`].filter((x) => x !== ans),
      hint: `Tìm số lớn nhất trong bảng nhân ${m} mà không vượt quá ${a}.`,
      explain: `${m} × ${q} = ${m * q}; ${a} − ${m * q} = ${rem}. Vậy ${a} : ${m} = ${q} (dư ${rem}).`,
    };
  },
};

// ---------- Topic 3: Adding and subtracting large numbers ----------
const arith3: SkillDef = {
  name: 'Cộng, trừ các số có ba chữ số (có nhớ)',
  desc: 'Cộng, trừ có nhớ các số có ba chữ số, kết quả trong phạm vi 1000',
  diff: 3,
  make: ({ r, i }) => {
    const add = i % 2 === 0;
    if (add) {
      const a = randInt(r, 120, 690);
      const b = randInt(r, 100, 999 - a);
      const s = a + b;
      return {
        prompt: 'Đặt tính rồi tính:',
        formula: `${a} + ${b} = ?`,
        answer: str(s),
        wrong: wrongNums(r, s, { min: 200, max: 999, near: [10, -10, 100, -100, 1, -1] }).map(str),
        hint: 'Cộng từ phải sang trái: đơn vị, chục, trăm. Được từ 10 trở lên thì nhớ 1 sang hàng bên trái.',
        explain: `${a} + ${b} = ${s}.`,
      };
    }
    const a = randInt(r, 300, 999);
    const b = randInt(r, 100, a - 50);
    const d = a - b;
    return {
      prompt: 'Đặt tính rồi tính:',
      formula: `${a} − ${b} = ?`,
      answer: str(d),
      wrong: wrongNums(r, d, { min: 10, max: 999, near: [10, -10, 100, -100, 1, -1] }).map(str),
      hint: 'Trừ từ phải sang trái. Nếu chữ số trên nhỏ hơn chữ số dưới thì lấy thêm 1 ở hàng bên trái.',
      explain: `${a} − ${b} = ${d}.`,
    };
  },
};

const arith5: SkillDef = {
  name: 'Cộng, trừ các số có bốn, năm chữ số',
  desc: 'Cộng, trừ có nhớ các số trong phạm vi 10 000 và 100 000',
  diff: 4,
  make: ({ r, i, t }) => {
    const big = t > 0.5;
    const hi = big ? 99999 : 9999;
    if (i % 2 === 0) {
      const a = randInt(r, big ? 10000 : 1000, Math.floor(hi * 0.6));
      const b = randInt(r, big ? 10000 : 1000, hi - a);
      const s = a + b;
      return {
        prompt: 'Đặt tính rồi tính:',
        formula: `${fmt(a)} + ${fmt(b)} = ?`,
        answer: fmt(s),
        wrong: wrongNums(r, s, { min: 2000, max: 99999, near: [10, -10, 100, -100, 1000, -1000] }).map(fmt),
        hint: 'Đặt tính thẳng cột rồi cộng từ phải sang trái, nhớ 1 sang hàng bên trái khi cần.',
        explain: `${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`,
      };
    }
    const a = randInt(r, big ? 30000 : 3000, hi);
    const b = randInt(r, big ? 10000 : 1000, a - (big ? 5000 : 500));
    const d = a - b;
    return {
      prompt: 'Đặt tính rồi tính:',
      formula: `${fmt(a)} − ${fmt(b)} = ?`,
      answer: fmt(d),
      wrong: wrongNums(r, d, { min: 100, max: 99999, near: [10, -10, 100, -100, 1000, -1000] }).map(fmt),
      hint: 'Đặt tính thẳng cột rồi trừ từ phải sang trái. Không trừ được thì lấy thêm 1 ở hàng bên trái.',
      explain: `${fmt(a)} − ${fmt(b)} = ${fmt(d)}.`,
    };
  },
};

const findX: SkillDef = {
  name: 'Tìm x (x + b = c, x − b = c, a − x = c)',
  desc: 'Tìm số hạng, số bị trừ, số trừ chưa biết',
  diff: 3,
  make: ({ r, i }) => {
    const x = randInt(r, 120, 700);
    const b = randInt(r, 100, 250);
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: 'Tìm x:',
        formula: `x + ${b} = ${x + b}`,
        answer: str(x),
        wrong: [x + b + b, x + 10, x - 10, b].filter((v) => v !== x).map(str),
        hint: 'Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng đã biết.',
        explain: `x = ${x + b} − ${b} = ${x}.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: 'Tìm x:',
        formula: `x − ${b} = ${x}`,
        answer: str(x + b),
        wrong: [x - b > 0 ? x - b : x + 10, x + 10, x + 2 * b, b].filter((v) => v !== x + b).map(str),
        hint: 'Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ.',
        explain: `x = ${x} + ${b} = ${x + b}.`,
      };
    }
    const a = x + b;
    return {
      prompt: 'Tìm x:',
      formula: `${a} − x = ${b}`,
      answer: str(x),
      wrong: [a + b, x + 10, x - 10, b].filter((v) => v !== x && v > 0).map(str),
      hint: 'Muốn tìm số trừ, ta lấy số bị trừ trừ đi hiệu.',
      explain: `x = ${a} − ${b} = ${x}.`,
    };
  },
};

// ---------- Topic 4: Perimeter and area ----------
const perimeter: SkillDef = {
  name: 'Chu vi hình chữ nhật, hình vuông',
  desc: 'Tính chu vi hình chữ nhật (dài + rộng) × 2 và hình vuông cạnh × 4',
  diff: 3,
  make: ({ r, i }) => {
    const w = randInt(r, 3, 12);
    const h = randInt(r, 2, Math.min(9, w - 1));
    const kind = i % 4;
    if (kind === 3) {
      const p = 2 * (w + h);
      return {
        prompt: `Hình chữ nhật có chu vi ${p} cm, chiều dài ${w} cm. Chiều rộng là:`,
        answer: `${h} cm`,
        wrong: [p - w, w + h, h + 1].filter((v) => v !== h).map((v) => `${v} cm`),
        hint: 'Nửa chu vi bằng chiều dài cộng chiều rộng.',
        explain: `Nửa chu vi: ${p} : 2 = ${w + h} cm. Chiều rộng: ${w + h} − ${w} = ${h} cm.`,
      };
    }
    if (kind === 2) {
      const a = randInt(r, 3, 15);
      return {
        prompt: `Tính chu vi hình vuông có cạnh ${a} cm:`,
        visual: { kind: 'rect', w: a, h: a, unit: 'cm' },
        answer: `${4 * a} cm`,
        wrong: [a * a, 2 * a, a + 4].map((v) => `${v} cm`),
        hint: 'Hình vuông có 4 cạnh bằng nhau. Chu vi = cạnh × 4.',
        explain: `${a} × 4 = ${4 * a} cm.`,
      };
    }
    const p = 2 * (w + h);
    return {
      prompt: `Tính chu vi hình chữ nhật có chiều dài ${w} cm, chiều rộng ${h} cm:`,
      visual: { kind: 'rect', w, h, unit: 'cm' },
      answer: `${p} cm`,
      wrong: [w * h, w + h, p + 2, p - 2].filter((v) => v !== p).map((v) => `${v} cm`),
      hint: 'Chu vi = (chiều dài + chiều rộng) × 2.',
      steps: [`${w} + ${h} = ${w + h}`, `${w + h} × 2 = ${p}`],
      explain: `(${w} + ${h}) × 2 = ${p} cm.`,
    };
  },
};

const area: SkillDef = {
  name: 'Diện tích hình chữ nhật, hình vuông (cm²)',
  desc: 'Tính diện tích: dài × rộng và cạnh × cạnh, đơn vị xăng-ti-mét vuông',
  diff: 3,
  make: ({ r, i }) => {
    const square = i % 3 === 2;
    const w = randInt(r, 3, 12);
    const h = square ? w : randInt(r, 2, Math.min(9, w - 1));
    const s = w * h;
    const p = 2 * (w + h);
    return {
      prompt: square ? `Tính diện tích hình vuông có cạnh ${w} cm:` : `Tính diện tích hình chữ nhật có chiều dài ${w} cm, chiều rộng ${h} cm:`,
      visual: { kind: 'rect', w, h, unit: 'cm' },
      answer: `${s} cm²`,
      wrong: [`${p} cm`, `${s + w} cm²`, `${s - h} cm²`, `${w + h} cm²`].filter((x) => x !== `${s} cm²`),
      hint: square ? 'Diện tích hình vuông = cạnh × cạnh.' : 'Diện tích hình chữ nhật = chiều dài × chiều rộng.',
      explain: `${w} × ${h} = ${s} cm².`,
    };
  },
};

const geoWord: SkillDef = {
  name: 'Giải bài toán về chu vi và diện tích',
  desc: 'Bài toán thực tế: mảnh vườn, tấm bìa, hàng rào',
  diff: 4,
  make: ({ r, i }) => {
    const w = randInt(r, 6, 20);
    const h = randInt(r, 3, w - 1);
    const what = pick(r, ['mảnh vườn', 'sân trường', 'tấm bìa', 'khu đất']);
    const kind = i % 2;
    if (kind === 0) {
      const p = 2 * (w + h);
      return {
        prompt: `Một ${what} hình chữ nhật có chiều dài ${w} m, chiều rộng ${h} m. Người ta muốn rào xung quanh. Cần rào bao nhiêu mét?`,
        answer: `${p} m`,
        wrong: [w * h, w + h, p + w].filter((v) => v !== p).map((v) => `${v} m`),
        hint: 'Rào xung quanh nghĩa là tính chu vi.',
        explain: `Chu vi: (${w} + ${h}) × 2 = ${p} m.`,
      };
    }
    const s = w * h;
    return {
      prompt: `Một ${what} hình chữ nhật có chiều dài ${w} m, chiều rộng ${h} m. Diện tích ${what} là bao nhiêu mét vuông?`,
      answer: `${s} m²`,
      wrong: [`${2 * (w + h)} m`, `${s + w} m²`, `${w + h} m²`],
      hint: 'Diện tích = chiều dài × chiều rộng.',
      explain: `${w} × ${h} = ${s} m².`,
    };
  },
};

// ---------- Topic 5: Word problems ----------
const timesMore: SkillDef = {
  name: 'Gấp lên một số lần',
  desc: 'Bài toán gấp một số lên nhiều lần, dùng phép nhân',
  diff: 3,
  make: ({ r, i }) => {
    const a = randInt(r, 3, 12);
    const k = randInt(r, 2, 9);
    const th = pick(r, COUNTABLES);
    const [x, y] = shuffle(r, NAMES).slice(0, 2);
    if (i % 2 === 0) {
      return {
        prompt: `${x} có ${a} ${th.n}. ${y} có gấp ${k} lần số ${th.n} của ${x}. Hỏi ${y} có bao nhiêu ${th.n}?`,
        answer: str(a * k),
        wrong: wrongNums(r, a * k, { min: 4, max: 120, near: [a, -a, k, 1, -1, 10] }).map(str),
        hint: `Gấp ${k} lần nghĩa là lấy ${a} nhân với ${k}.`,
        explain: `${a} × ${k} = ${a * k}.`,
      };
    }
    return {
      prompt: `Gấp ${a} lên ${k} lần được bao nhiêu?`,
      formula: `${a} × ${k} = ?`,
      answer: str(a * k),
      wrong: wrongNums(r, a * k, { min: 4, max: 120, near: [a, -a, k, 1, -1, 10] }).map(str),
      hint: 'Gấp lên một số lần thì nhân.',
      explain: `${a} × ${k} = ${a * k}.`,
    };
  },
};

const timesLess: SkillDef = {
  name: 'Giảm đi một số lần, so sánh gấp mấy lần',
  desc: 'Giảm một số đi nhiều lần, tìm số lớn gấp mấy lần số bé',
  diff: 3,
  make: ({ r, i }) => {
    const k = randInt(r, 2, 9);
    const q = randInt(r, 2, 9);
    const big = k * q;
    const th = pick(r, COUNTABLES);
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: `Giảm ${big} đi ${k} lần được bao nhiêu?`,
        formula: `${big} : ${k} = ?`,
        answer: str(q),
        wrong: wrongNums(r, q, { min: 1, max: 30, near: [1, -1, 2, k] }).map(str),
        hint: 'Giảm đi một số lần thì chia.',
        explain: `${big} : ${k} = ${q}.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: `Hàng trên có ${big} ${th.n}. Số ${th.n} hàng dưới bằng số ${th.n} hàng trên giảm đi ${k} lần. Hỏi hàng dưới có bao nhiêu ${th.n}?`,
        answer: str(q),
        wrong: wrongNums(r, q, { min: 1, max: 30, near: [1, -1, 2, k] }).map(str),
        hint: 'Giảm đi ' + k + ' lần nghĩa là chia cho ' + k + '.',
        explain: `${big} : ${k} = ${q}.`,
      };
    }
    return {
      prompt: `Số ${big} gấp mấy lần số ${q}?`,
      answer: str(k),
      wrong: wrongNums(r, k, { min: 1, max: 15, near: [1, -1, 2, q] }).map(str),
      hint: `Muốn biết số lớn gấp mấy lần số bé ta lấy số lớn chia cho số bé: ${big} : ${q}.`,
      explain: `${big} : ${q} = ${k}, nên ${big} gấp ${q} ${k} lần.`,
    };
  },
};

const twoStep: SkillDef = {
  name: 'Giải bài toán bằng hai phép tính',
  desc: 'Bài toán cần làm hai bước: nhân rồi trừ, cộng rồi chia...',
  diff: 4,
  make: ({ r, i }) => {
    const who = pick(r, NAMES);
    const th = pick(r, COUNTABLES);
    const kind = i % 4;
    if (kind === 0) {
      const per = randInt(r, 3, 9);
      const boxes = randInt(r, 3, 8);
      const used = randInt(r, 2, per * boxes - 5);
      const ans = per * boxes - used;
      return {
        prompt: `${who} mua ${boxes} hộp ${th.n}, mỗi hộp ${per} ${th.n}. ${cap(who)} đã cho bạn ${used} ${th.n}. Hỏi ${who} còn lại bao nhiêu ${th.n}?`,
        answer: str(ans),
        wrong: wrongNums(r, ans, { min: 1, max: 100, near: [used, -1, 1, per] }).map(str),
        hint: 'Bước 1: tính tổng số ' + th.n + ' đã mua (nhân). Bước 2: trừ đi số đã cho.',
        steps: [`${per} × ${boxes} = ${per * boxes}`, `${per * boxes} − ${used} = ${ans}`],
        explain: `${per} × ${boxes} − ${used} = ${ans}.`,
      };
    }
    if (kind === 1) {
      const a = randInt(r, 10, 40);
      const b = randInt(r, 10, 40);
      const parts = pick(r, [2, 3, 4, 5].filter((p) => (a + b) % p === 0).concat([1]));
      const total = a + b;
      if (parts === 1) {
        return {
          prompt: `Buổi sáng cửa hàng bán ${a} ${th.n}, buổi chiều bán ${b} ${th.n}. Hỏi cả ngày bán được bao nhiêu ${th.n}?`,
          answer: str(total),
          wrong: wrongNums(r, total, { min: 10, max: 100, near: [10, -10, 1, -1] }).map(str),
          hint: 'Gộp hai buổi lại nghĩa là cộng.',
          explain: `${a} + ${b} = ${total}.`,
        };
      }
      return {
        prompt: `Buổi sáng bán ${a} ${th.n}, buổi chiều bán ${b} ${th.n}. Số ${th.n} đó chia đều vào ${parts} thùng. Mỗi thùng có bao nhiêu ${th.n}?`,
        answer: str(total / parts),
        wrong: wrongNums(r, total / parts, { min: 1, max: 60, near: [1, -1, 2, parts] }).map(str),
        hint: 'Bước 1: tính tổng (cộng). Bước 2: chia đều (chia).',
        steps: [`${a} + ${b} = ${total}`, `${total} : ${parts} = ${total / parts}`],
        explain: `(${a} + ${b}) : ${parts} = ${total / parts}.`,
      };
    }
    if (kind === 2) {
      const k = randInt(r, 2, 5);
      const a = randInt(r, 4, 12);
      const [y] = shuffle(r, NAMES.filter((n) => n !== who));
      const ans = a + a * k;
      return {
        prompt: `${who} có ${a} ${th.n}. ${y} có gấp ${k} lần số ${th.n} của ${who}. Hỏi cả hai bạn có bao nhiêu ${th.n}?`,
        answer: str(ans),
        wrong: wrongNums(r, ans, { min: 4, max: 100, near: [a, -a, k, 1, -1] }).map(str),
        hint: `Bước 1: tìm số ${th.n} của ${y} (nhân). Bước 2: cộng hai số lại.`,
        steps: [`${a} × ${k} = ${a * k}`, `${a} + ${a * k} = ${ans}`],
        explain: `${a} + ${a} × ${k} = ${ans}.`,
      };
    }
    const price = randInt(r, 3, 9) * 1000;
    const n = randInt(r, 2, 5);
    const pay = Math.ceil((price * n) / 10000) * 10000 + 10000 * (r() < 0.5 ? 0 : 1);
    const change = pay - price * n;
    return {
      prompt: `Mẹ mua ${n} quyển vở, mỗi quyển ${fmt(price)} đồng. Mẹ đưa cô bán hàng ${fmt(pay)} đồng. Hỏi cô bán hàng phải trả lại mẹ bao nhiêu đồng?`,
      answer: `${fmt(change)} đồng`,
      wrong: [change + 1000, change + price, price * n].filter((v) => v !== change && v > 0).map((v) => `${fmt(v)} đồng`),
      hint: 'Bước 1: tính số tiền mua vở (nhân). Bước 2: lấy số tiền đưa trừ đi số tiền phải trả.',
      steps: [`${fmt(price)} × ${n} = ${fmt(price * n)}`, `${fmt(pay)} − ${fmt(price * n)} = ${fmt(change)}`],
      explain: `${fmt(pay)} − ${fmt(price)} × ${n} = ${fmt(change)} đồng.`,
    };
  },
};

export const mathGrade3: Record<string, SkillDef[]> = {
  'g3-m-t1': [read45, place45, compareRound],
  'g3-m-t2': [mul69, div69, remainderDiv],
  'g3-m-t3': [arith3, arith5, findX],
  'g3-m-t4': [perimeter, area, geoWord],
  'g3-m-t5': [timesMore, timesLess, twoStep],
};
