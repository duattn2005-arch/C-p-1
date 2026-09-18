import { COUNTABLES, NAMES, SkillDef, fmt, pick, randInt, shuffle, wrongNums } from './core.js';
import type { Rng } from './core.js';

// Grade 4 (Toán 4, GDPT 2018): multi-digit multiplication and division, divisibility signs, averages,
// fractions and their four operations, parallelogram and rhombus, sum-difference and sum-ratio problems.

const str = (n: number) => String(n);
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const frac = (n: number, d: number) => `${n}/${d}`;
const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d);
  return [n / g, d / g];
};
const fracStr = ([n, d]: [number, number]) => (d === 1 ? String(n) : frac(n, d));

// ---------- Topic 1: Multiplication and division of large numbers ----------
const mul2: SkillDef = {
  name: 'Nhân với số có hai chữ số',
  desc: 'Đặt tính rồi tính nhân số có ba, bốn chữ số với số có hai chữ số',
  diff: 3,
  make: ({ r, i, t }) => {
    const a = randInt(r, t < 0.5 ? 100 : 1000, t < 0.5 ? 999 : 4999);
    const b = randInt(r, 11, 49);
    const p = a * b;
    return {
      prompt: 'Đặt tính rồi tính:',
      formula: `${fmt(a)} × ${b} = ?`,
      answer: fmt(p),
      wrong: wrongNums(r, p, { min: 1000, max: 250000, near: [10, -10, 100, -100, 1000, -1000, a, -a] }).map(fmt),
      hint: `Nhân ${fmt(a)} với chữ số hàng đơn vị của ${b}, rồi nhân với chữ số hàng chục (viết lùi sang trái một cột), cuối cùng cộng lại.`,
      steps: [`${fmt(a)} × ${b % 10} = ${fmt(a * (b % 10))}`, `${fmt(a)} × ${Math.floor(b / 10)} chục = ${fmt(a * Math.floor(b / 10) * 10)}`, `Cộng lại: ${fmt(p)}`],
      explain: `${fmt(a)} × ${b} = ${fmt(p)}.`,
    };
  },
};

const div2: SkillDef = {
  name: 'Chia cho số có hai chữ số',
  desc: 'Đặt tính rồi tính chia cho số có hai chữ số (chia hết)',
  diff: 4,
  make: ({ r, t }) => {
    const b = randInt(r, 12, t < 0.5 ? 40 : 95);
    const q = randInt(r, t < 0.5 ? 12 : 100, t < 0.5 ? 99 : 950);
    const a = b * q;
    return {
      prompt: 'Đặt tính rồi tính:',
      formula: `${fmt(a)} : ${b} = ?`,
      answer: fmt(q),
      wrong: wrongNums(r, q, { min: 5, max: 5000, near: [1, -1, 10, -10, 100, -100] }).map(fmt),
      hint: 'Chia từng lần từ trái sang phải: ước lượng thương, nhân ngược lại, trừ, hạ chữ số tiếp theo.',
      explain: `${fmt(q)} × ${b} = ${fmt(a)} nên ${fmt(a)} : ${b} = ${fmt(q)}.`,
    };
  },
};

const divRem2: SkillDef = {
  name: 'Chia có dư, thử lại và bài toán thực tế',
  desc: 'Chia cho số có hai chữ số có dư, kiểm tra lại bằng phép nhân và bài toán chia nhóm',
  diff: 4,
  make: ({ r, i }) => {
    const b = randInt(r, 12, 60);
    const q = randInt(r, 10, 300);
    const rem = randInt(r, 1, b - 1);
    const a = b * q + rem;
    const kind = i % 3;
    if (kind === 0) {
      const ans = `${fmt(q)} (dư ${rem})`;
      return {
        prompt: 'Tìm thương và số dư:',
        formula: `${fmt(a)} : ${b} = ?`,
        answer: ans,
        wrong: [`${fmt(q + 1)} (dư ${rem})`, `${fmt(q)} (dư ${rem + 1 < b ? rem + 1 : rem - 1})`, `${fmt(q - 1)} (dư ${rem})`],
        hint: 'Số dư phải bé hơn số chia.',
        explain: `${fmt(q)} × ${b} + ${rem} = ${fmt(a)}.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: `Thử lại phép chia ${fmt(a)} : ${b} = ${fmt(q)} (dư ${rem}) bằng phép tính nào?`,
        answer: `${fmt(q)} × ${b} + ${rem}`,
        wrong: [`${fmt(q)} × ${b} − ${rem}`, `${fmt(q)} + ${b} + ${rem}`, `${fmt(q)} : ${b} + ${rem}`],
        hint: '(Thương × Số chia) + Số dư = Số bị chia.',
        explain: `${fmt(q)} × ${b} + ${rem} = ${fmt(a)}.`,
      };
    }
    const kids = randInt(r, 120, 480);
    const perCar = pick(r, [40, 45, 50, 35, 30]);
    const cars = Math.ceil(kids / perCar);
    return {
      prompt: `Có ${kids} học sinh đi tham quan, mỗi xe chở nhiều nhất ${perCar} học sinh. Cần ít nhất bao nhiêu xe?`,
      answer: str(cars),
      wrong: [Math.floor(kids / perCar), cars + 1, cars - 1].filter((v) => v !== cars && v > 0).map(str),
      hint: 'Chia số học sinh cho số chỗ mỗi xe. Nếu còn dư thì cần thêm một xe nữa.',
      explain: `${kids} : ${perCar} = ${Math.floor(kids / perCar)} (dư ${kids % perCar}), còn dư nên cần thêm 1 xe: ${cars} xe.`,
    };
  },
};

// ---------- Topic 2: Divisibility and averages ----------
function numberWith(r: Rng, ok: (n: number) => boolean, want: boolean, lo = 100, hi = 9999): number {
  for (let g = 0; g < 500; g++) {
    const n = randInt(r, lo, hi);
    if (ok(n) === want) return n;
  }
  return want ? 120 : 121;
}

const digitSum = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);

function divisibilityMaker(rule: (n: number) => boolean, label: string, hint: string, why: (n: number) => string) {
  return ({ r, i }: { r: Rng; i: number }) => {
    const negative = i % 3 === 2; // "which number does NOT..."
    const correct = numberWith(r, rule, !negative, 100, 9999); // satisfies the rule (or, for a NOT question, breaks it)
    const others: number[] = [];
    while (others.length < 3) {
      const n = numberWith(r, rule, negative, 100, 9999);
      if (!others.includes(n) && n !== correct) others.push(n);
    }
    return {
      prompt: negative ? `Số nào KHÔNG chia hết cho ${label}?` : `Số nào chia hết cho ${label}?`,
      answer: fmt(correct),
      wrong: others.map(fmt),
      hint,
      explain: why(correct),
    };
  };
}

const div25: SkillDef = {
  name: 'Dấu hiệu chia hết cho 2 và 5',
  desc: 'Nhận biết số chia hết cho 2, cho 5 và cho cả 2 và 5',
  diff: 3,
  make: (c) => {
    const which = c.i % 3;
    if (which === 0) return divisibilityMaker((n) => n % 2 === 0, '2', 'Số chia hết cho 2 có chữ số tận cùng là 0, 2, 4, 6, 8.', (n) => `${fmt(n)} có chữ số tận cùng là ${n % 10}.`)(c);
    if (which === 1) return divisibilityMaker((n) => n % 5 === 0, '5', 'Số chia hết cho 5 có chữ số tận cùng là 0 hoặc 5.', (n) => `${fmt(n)} có chữ số tận cùng là ${n % 10}.`)(c);
    return divisibilityMaker((n) => n % 10 === 0, 'cả 2 và 5', 'Số chia hết cho cả 2 và 5 có chữ số tận cùng là 0.', (n) => `${fmt(n)} có chữ số tận cùng là ${n % 10}.`)(c);
  },
};

const div39: SkillDef = {
  name: 'Dấu hiệu chia hết cho 3 và 9',
  desc: 'Nhận biết số chia hết cho 3, cho 9 bằng tổng các chữ số',
  diff: 4,
  make: (c) => {
    const nine = c.i % 2 === 1;
    const d = nine ? 9 : 3;
    return divisibilityMaker(
      (n) => n % d === 0,
      String(d),
      `Số chia hết cho ${d} có tổng các chữ số chia hết cho ${d}.`,
      (n) => `Tổng các chữ số của ${fmt(n)} là ${digitSum(n)}${digitSum(n) % d === 0 ? `, chia hết cho ${d}` : `, không chia hết cho ${d}`}.`
    )(c);
  },
};

const average: SkillDef = {
  name: 'Trung bình cộng',
  desc: 'Tìm trung bình cộng của nhiều số và bài toán về trung bình cộng',
  diff: 3,
  make: ({ r, i }) => {
    const count = i % 2 === 0 ? 3 : 4;
    const avg = randInt(r, 12, 60);
    const nums: number[] = [];
    let left = avg * count;
    for (let k = 0; k < count - 1; k++) {
      const v = randInt(r, Math.max(5, avg - 10), avg + 10);
      nums.push(v);
      left -= v;
    }
    nums.push(left);
    if (nums.some((v) => v < 1)) return { prompt: '', answer: '', wrong: [], hint: '', explain: '' };
    const word = i % 4 >= 2;
    const th = pick(r, COUNTABLES);
    return {
      prompt: word ? `${count} ngày liền, một cửa hàng bán được lần lượt ${nums.join(', ')} ${th.n}. Trung bình mỗi ngày cửa hàng bán được bao nhiêu ${th.n}?` : `Tìm trung bình cộng của các số ${nums.join(', ')}:`,
      answer: str(avg),
      wrong: wrongNums(r, avg, { min: 5, max: 80, near: [1, -1, 2, -2, count] }).map(str),
      hint: `Trung bình cộng = tổng các số : số các số hạng (${count}).`,
      steps: [`Tổng: ${nums.join(' + ')} = ${avg * count}`, `${avg * count} : ${count} = ${avg}`],
      explain: `(${nums.join(' + ')}) : ${count} = ${avg}.`,
    };
  },
};

// ---------- Topic 3: Fractions ----------
const fractionConcept: SkillDef = {
  name: 'Khái niệm phân số và so sánh phân số',
  desc: 'Đọc phân số từ hình, so sánh phân số cùng mẫu số, cùng tử số',
  diff: 3,
  make: ({ r, i }) => {
    const kind = i % 3;
    if (kind === 0) {
      const d = pick(r, [2, 3, 4, 5, 6, 8]);
      const n = randInt(r, 1, d - 1);
      const ans = frac(n, d);
      return {
        prompt: 'Phân số nào biểu thị phần đã tô màu?',
        visual: { kind: 'pie', parts: d, filled: n },
        answer: ans,
        wrong: [frac(d - n, d), frac(n, d + 1), frac(d, n)].filter((x) => x !== ans),
        hint: 'Mẫu số là tổng số phần bằng nhau, tử số là số phần đã tô màu.',
        explain: `Hình chia thành ${d} phần bằng nhau, tô màu ${n} phần: ${ans}.`,
      };
    }
    if (kind === 1) {
      const d = randInt(r, 5, 12);
      const a = randInt(r, 1, d - 1);
      let b = randInt(r, 1, d - 1);
      if (r() < 0.2) b = a;
      const s = a > b ? '>' : a < b ? '<' : '=';
      return {
        prompt: 'So sánh hai phân số (điền dấu >, <, =):',
        formula: `${frac(a, d)} … ${frac(b, d)}`,
        answer: s,
        wrong: ['>', '<', '='].filter((x) => x !== s),
        hint: 'Hai phân số cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn.',
        explain: `${frac(a, d)} ${s} ${frac(b, d)}.`,
      };
    }
    const n = randInt(r, 1, 6);
    const d1 = randInt(r, 2, 9);
    let d2 = randInt(r, 2, 9);
    if (d2 === d1) d2 = d1 === 9 ? 8 : d1 + 1;
    const s = d1 < d2 ? '>' : '<';
    return {
      prompt: 'So sánh hai phân số (điền dấu >, <, =):',
      formula: `${frac(n, d1)} … ${frac(n, d2)}`,
      answer: s,
      wrong: ['>', '<', '='].filter((x) => x !== s),
      hint: 'Hai phân số cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn.',
      explain: `${frac(n, d1)} ${s} ${frac(n, d2)}.`,
    };
  },
};

const simplifyFraction: SkillDef = {
  name: 'Rút gọn phân số và quy đồng mẫu số',
  desc: 'Rút gọn phân số, tìm phân số bằng nhau, quy đồng mẫu số hai phân số',
  diff: 4,
  make: ({ r, i }) => {
    const kind = i % 3;
    if (kind === 0) {
      const [sn, sd] = pick(r, [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [5, 6], [3, 7], [4, 9]] as [number, number][]);
      const k = randInt(r, 2, 6);
      return {
        prompt: 'Rút gọn phân số (về phân số tối giản):',
        formula: `${frac(sn * k, sd * k)} = ?`,
        answer: frac(sn, sd),
        wrong: [frac(sn * k, sd), frac(sn + 1, sd), frac(sn * (k - 1 || 2), sd * (k - 1 || 2))].filter((x) => x !== frac(sn, sd)),
        hint: 'Chia cả tử số và mẫu số cho cùng một số lớn hơn 1 (ước chung lớn nhất).',
        explain: `${frac(sn * k, sd * k)} = ${frac(sn, sd)} (chia cả tử và mẫu cho ${k}).`,
      };
    }
    if (kind === 1) {
      const [n, d] = pick(r, [[1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [3, 5]] as [number, number][]);
      const k = randInt(r, 2, 6);
      return {
        prompt: 'Tìm số thích hợp:',
        formula: `${frac(n, d)} = ?/${d * k}`,
        answer: str(n * k),
        wrong: wrongNums(r, n * k, { min: 1, max: 60, near: [1, -1, k, -k] }).map(str),
        hint: `Mẫu số nhân với ${k} thì tử số cũng phải nhân với ${k}.`,
        explain: `${frac(n, d)} = ${frac(n * k, d * k)}.`,
      };
    }
    const [d1, d2] = pick(r, [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7]] as [number, number][]);
    const n1 = 1;
    const n2 = randInt(r, 1, d2 - 1);
    const cd = d1 * d2;
    const ans = `${frac(n1 * d2, cd)} và ${frac(n2 * d1, cd)}`;
    return {
      prompt: `Quy đồng mẫu số hai phân số ${frac(n1, d1)} và ${frac(n2, d2)} (mẫu số chung ${cd}):`,
      answer: ans,
      wrong: [`${frac(n1, cd)} và ${frac(n2, cd)}`, `${frac(n1 * d1, cd)} và ${frac(n2 * d2, cd)}`, `${frac(n1 * d2, cd)} và ${frac(n2 * d2, cd)}`].filter((x) => x !== ans),
      hint: 'Nhân cả tử và mẫu của phân số thứ nhất với mẫu số của phân số thứ hai, và ngược lại.',
      explain: `${frac(n1, d1)} = ${frac(n1 * d2, cd)}; ${frac(n2, d2)} = ${frac(n2 * d1, cd)}.`,
    };
  },
};

const fractionOps: SkillDef = {
  name: 'Cộng, trừ, nhân, chia phân số',
  desc: 'Bốn phép tính với phân số, kết quả rút gọn',
  diff: 4,
  make: ({ r, i }) => {
    const kind = i % 4;
    if (kind === 0 || kind === 1) {
      const d = randInt(r, 5, 12);
      const a = randInt(r, 1, d - 2);
      const b = randInt(r, 1, d - 1 - a);
      const add = kind === 0;
      const [n1, n2] = add ? [a, b] : [a + b, a];
      const res = add ? n1 + n2 : n1 - n2;
      const ans = fracStr(simplify(res, d));
      return {
        prompt: 'Tính (rút gọn kết quả nếu được):',
        formula: `${frac(n1, d)} ${add ? '+' : '−'} ${frac(n2, d)} = ?`,
        answer: ans,
        wrong: [frac(res, d * 2), frac(n1 + n2, d + d), frac(res + 1, d), frac(Math.abs(n1 - n2) + 2, d)].filter((v) => v !== ans && !v.startsWith('-')),
        hint: 'Hai phân số cùng mẫu số: cộng (hoặc trừ) hai tử số, giữ nguyên mẫu số.',
        explain: `${frac(n1, d)} ${add ? '+' : '−'} ${frac(n2, d)} = ${frac(res, d)}${gcd(res, d) > 1 ? ` = ${ans}` : ''}.`,
        diff: 3,
      };
    }
    if (kind === 2) {
      const [a, b] = pick(r, [[2, 3], [3, 4], [1, 5], [2, 5], [3, 7], [1, 4]] as [number, number][]);
      const [c, d] = pick(r, [[1, 2], [3, 5], [2, 7], [1, 3], [4, 5]] as [number, number][]);
      const [rn, rd] = simplify(a * c, b * d);
      const ans = fracStr([rn, rd]);
      return {
        prompt: 'Tính (rút gọn kết quả nếu được):',
        formula: `${frac(a, b)} × ${frac(c, d)} = ?`,
        answer: ans,
        wrong: [frac(a * c, b + d), frac(a + c, b * d), frac(a * d, b * c), frac(a * c + 1, b * d)].filter((v) => v !== ans),
        hint: 'Nhân phân số: lấy tử số nhân tử số, mẫu số nhân mẫu số.',
        explain: `${frac(a, b)} × ${frac(c, d)} = ${frac(a * c, b * d)}${gcd(a * c, b * d) > 1 ? ` = ${ans}` : ''}.`,
      };
    }
    const [a, b] = pick(r, [[2, 3], [3, 4], [1, 5], [2, 5], [3, 7], [1, 2]] as [number, number][]);
    const [c, d] = pick(r, [[1, 2], [3, 5], [2, 7], [1, 3], [4, 5]] as [number, number][]);
    const [rn, rd] = simplify(a * d, b * c);
    const ans = fracStr([rn, rd]);
    return {
      prompt: 'Tính (rút gọn kết quả nếu được):',
      formula: `${frac(a, b)} : ${frac(c, d)} = ?`,
      answer: ans,
      wrong: [frac(a * c, b * d), frac(b * c, a * d), frac(a * d, b * d), frac(a * d + 1, b * c)].filter((v) => v !== ans),
      hint: 'Chia phân số: giữ nguyên phân số thứ nhất, nhân với phân số thứ hai đảo ngược.',
      explain: `${frac(a, b)} : ${frac(c, d)} = ${frac(a, b)} × ${frac(d, c)} = ${frac(a * d, b * c)}${gcd(a * d, b * c) > 1 ? ` = ${ans}` : ''}.`,
    };
  },
};

// ---------- Topic 4: Parallelogram and rhombus ----------
const shapeFacts: SkillDef = {
  name: 'Nhận biết hình bình hành và hình thoi',
  desc: 'Đặc điểm cạnh và đường chéo của hình bình hành, hình thoi',
  diff: 3,
  make: ({ r }) => {
    const facts: { q: string; a: string; w: string[]; h: string }[] = [
      { q: 'Hình bình hành có mấy cặp cạnh đối song song?', a: '2 cặp', w: ['1 cặp', '3 cặp', '4 cặp'], h: 'Hình bình hành có các cặp cạnh đối song song và bằng nhau.' },
      { q: 'Hình nào có hai cặp cạnh đối song song và bốn cạnh bằng nhau?', a: 'Hình thoi', w: ['Hình chữ nhật', 'Hình thang', 'Hình tam giác'], h: 'Hình thoi có bốn cạnh bằng nhau.' },
      { q: 'Trong hình bình hành, các cạnh đối như thế nào?', a: 'Song song và bằng nhau', w: ['Vuông góc với nhau', 'Luôn bằng bốn cạnh', 'Không bằng nhau'], h: 'Hình bình hành có hai cặp cạnh đối song song và bằng nhau.' },
      { q: 'Hai đường chéo của hình thoi như thế nào với nhau?', a: 'Vuông góc với nhau', w: ['Song song với nhau', 'Luôn bằng nhau', 'Trùng nhau'], h: 'Hai đường chéo của hình thoi vuông góc với nhau.' },
      { q: 'Hình thoi có mấy cạnh bằng nhau?', a: '4 cạnh', w: ['2 cạnh', '3 cạnh', 'Không có cạnh nào'], h: 'Hình thoi có bốn cạnh bằng nhau.' },
      { q: 'Hình bình hành có mấy góc?', a: '4 góc', w: ['3 góc', '5 góc', '2 góc'], h: 'Hình bình hành là hình tứ giác nên có 4 góc.' },
      { q: 'Hình thoi có mấy cặp cạnh đối song song?', a: '2 cặp', w: ['1 cặp', '3 cặp', 'Không có cặp nào'], h: 'Hình thoi cũng là hình bình hành nên có hai cặp cạnh đối song song.' },
      { q: 'Hình bình hành có mấy cạnh?', a: '4 cạnh', w: ['3 cạnh', '5 cạnh', '6 cạnh'], h: 'Hình bình hành là hình tứ giác nên có 4 cạnh.' },
      { q: 'Hình nào có bốn cạnh bằng nhau và hai đường chéo vuông góc với nhau?', a: 'Hình thoi', w: ['Hình bình hành bất kì', 'Hình tam giác', 'Hình thang'], h: 'Hình thoi có bốn cạnh bằng nhau và hai đường chéo vuông góc.' },
      { q: 'Trong hình bình hành, hai góc đối như thế nào?', a: 'Bằng nhau', w: ['Luôn là góc vuông', 'Cộng lại bằng 90 độ', 'Không bằng nhau'], h: 'Hình bình hành có các góc đối bằng nhau.' },
    ];
    const f = pick(r, facts);
    return { prompt: f.q, answer: f.a, wrong: f.w, hint: f.h, explain: `${f.a}. ${f.h}` };
  },
};

const areaParallelogram: SkillDef = {
  name: 'Diện tích hình bình hành',
  desc: 'Diện tích hình bình hành = độ dài đáy × chiều cao',
  diff: 3,
  make: ({ r, i }) => {
    const a = randInt(r, 6, 25);
    const h = randInt(r, 3, 15);
    const s = a * h;
    if (i % 3 === 2) {
      return {
        prompt: `Hình bình hành có diện tích ${s} cm², độ dài đáy ${a} cm. Chiều cao của hình bình hành là:`,
        answer: `${h} cm`,
        wrong: [h + 1, h - 1, a - h].filter((v) => v !== h && v > 0).map((v) => `${v} cm`),
        hint: 'Chiều cao = diện tích : độ dài đáy.',
        explain: `${s} : ${a} = ${h} cm.`,
      };
    }
    return {
      prompt: `Tính diện tích hình bình hành có độ dài đáy ${a} cm và chiều cao ${h} cm:`,
      answer: `${s} cm²`,
      wrong: [`${Math.floor((a * h) / 2)} cm²`, `${(a + h) * 2} cm²`, `${s + a} cm²`].filter((x) => x !== `${s} cm²`),
      hint: 'Diện tích hình bình hành = đáy × chiều cao (đo vuông góc với đáy).',
      explain: `${a} × ${h} = ${s} cm².`,
    };
  },
};

const areaRhombus: SkillDef = {
  name: 'Diện tích hình thoi',
  desc: 'Diện tích hình thoi = (đường chéo thứ nhất × đường chéo thứ hai) : 2',
  diff: 4,
  make: ({ r, i }) => {
    const m = randInt(r, 4, 20);
    const n = randInt(r, 4, 20) * 2;
    const s = (m * n) / 2;
    if (i % 3 === 2) {
      return {
        prompt: `Hình thoi có diện tích ${s} cm², một đường chéo dài ${n} cm. Đường chéo còn lại dài:`,
        answer: `${m} cm`,
        wrong: [m + 2, m * 2, n - m].filter((v) => v !== m && v > 0).map((v) => `${v} cm`),
        hint: 'Đường chéo còn lại = diện tích × 2 : đường chéo đã biết.',
        explain: `${s} × 2 : ${n} = ${m} cm.`,
      };
    }
    return {
      prompt: `Tính diện tích hình thoi có độ dài hai đường chéo là ${m} cm và ${n} cm:`,
      answer: `${s} cm²`,
      wrong: [`${m * n} cm²`, `${m + n} cm²`, `${s + m} cm²`],
      hint: 'Diện tích hình thoi = (tích hai đường chéo) : 2.',
      explain: `(${m} × ${n}) : 2 = ${s} cm².`,
    };
  },
};

// ---------- Topic 5: Sum-difference and sum-ratio problems ----------
const sumDiff: SkillDef = {
  name: 'Tìm hai số khi biết tổng và hiệu',
  desc: 'Số lớn = (tổng + hiệu) : 2, số bé = (tổng − hiệu) : 2',
  diff: 4,
  make: ({ r, i }) => {
    const small = randInt(r, 6, 60);
    const diff = randInt(r, 2, 30);
    const big = small + diff;
    const sum = small + big;
    const askBig = i % 2 === 0;
    const ans = askBig ? big : small;
    return {
      prompt: `Tổng của hai số là ${sum}, hiệu của hai số là ${diff}. Tìm số ${askBig ? 'lớn' : 'bé'}:`,
      answer: str(ans),
      wrong: wrongNums(r, ans, { min: 1, max: 200, near: [diff, -diff, 1, -1, sum] }).map(str),
      hint: askBig ? 'Số lớn = (tổng + hiệu) : 2.' : 'Số bé = (tổng − hiệu) : 2.',
      steps: [`Số lớn: (${sum} + ${diff}) : 2 = ${big}`, `Số bé: (${sum} − ${diff}) : 2 = ${small}`],
      explain: `Số lớn là ${big}, số bé là ${small}.`,
    };
  },
};

const sumRatio: SkillDef = {
  name: 'Tìm hai số khi biết tổng và tỉ số',
  desc: 'Vẽ sơ đồ theo số phần bằng nhau, tìm giá trị một phần',
  diff: 4,
  make: ({ r, i }) => {
    const [p, q] = pick(r, [[1, 2], [1, 3], [2, 3], [2, 5], [3, 4], [1, 4], [3, 5], [1, 5]] as [number, number][]);
    const unit = randInt(r, 3, 15);
    const small = p * unit;
    const big = q * unit;
    const sum = small + big;
    const askBig = i % 2 === 0;
    const ans = askBig ? big : small;
    return {
      prompt: `Tổng của hai số là ${sum}. Tỉ số của hai số đó là ${frac(p, q)}. Tìm số ${askBig ? 'lớn' : 'bé'}:`,
      answer: str(ans),
      wrong: wrongNums(r, ans, { min: 1, max: 200, near: [unit, -unit, 1, -1, p, q] }).map(str),
      hint: `Tổng số phần bằng nhau là ${p} + ${q} = ${p + q} phần.`,
      steps: [`Tổng số phần: ${p} + ${q} = ${p + q}`, `Một phần: ${sum} : ${p + q} = ${unit}`, `Số bé: ${unit} × ${p} = ${small}; số lớn: ${unit} × ${q} = ${big}`],
      explain: `Số bé là ${small}, số lớn là ${big}.`,
    };
  },
};

const diffRatio: SkillDef = {
  name: 'Tìm hai số khi biết hiệu và tỉ số',
  desc: 'Tìm hiệu số phần bằng nhau, tìm giá trị một phần',
  diff: 5,
  make: ({ r, i }) => {
    const [p, q] = pick(r, [[1, 2], [1, 3], [2, 3], [2, 5], [3, 4], [1, 4], [3, 5], [2, 7]] as [number, number][]);
    const unit = randInt(r, 3, 15);
    const small = p * unit;
    const big = q * unit;
    const diff = big - small;
    const askBig = i % 2 === 0;
    const ans = askBig ? big : small;
    const th = pick(r, COUNTABLES);
    const [x, y] = shuffle(r, NAMES).slice(0, 2);
    return {
      prompt: i % 4 >= 2
        ? `${y} có nhiều hơn ${x} ${diff} ${th.n}. Tỉ số ${th.n} của ${x} và ${y} là ${frac(p, q)}. Hỏi ${askBig ? y : x} có bao nhiêu ${th.n}?`
        : `Hiệu của hai số là ${diff}. Tỉ số của hai số đó là ${frac(p, q)}. Tìm số ${askBig ? 'lớn' : 'bé'}:`,
      answer: str(ans),
      wrong: wrongNums(r, ans, { min: 1, max: 200, near: [unit, -unit, 1, -1, diff] }).map(str),
      hint: `Hiệu số phần bằng nhau là ${q} − ${p} = ${q - p} phần.`,
      steps: [`Hiệu số phần: ${q} − ${p} = ${q - p}`, `Một phần: ${diff} : ${q - p} = ${unit}`, `Số bé: ${unit} × ${p} = ${small}; số lớn: ${unit} × ${q} = ${big}`],
      explain: `Số bé là ${small}, số lớn là ${big}.`,
    };
  },
};

export const mathGrade4: Record<string, SkillDef[]> = {
  'g4-m-t1': [mul2, div2, divRem2],
  'g4-m-t2': [div25, div39, average],
  'g4-m-t3': [fractionConcept, simplifyFraction, fractionOps],
  'g4-m-t4': [shapeFacts, areaParallelogram, areaRhombus],
  'g4-m-t5': [sumDiff, sumRatio, diffRatio],
};
