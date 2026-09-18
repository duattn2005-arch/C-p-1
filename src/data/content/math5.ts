import { SkillDef, decStr, fmt, pick, randInt, readVi, shuffle, wrongNums } from './core.js';

// Grade 5 (Toán 5, GDPT 2018): decimal fractions and mixed numbers, decimals and their operations,
// percentages, triangle / trapezoid / circle, volume, uniform motion (v = s : t).
// Decimals are computed on integers scaled by 10^places, so 0.1 + 0.2 style rounding errors cannot happen.

const str = (n: number) => String(n);
const frac = (n: number, d: number) => `${n}/${d}`;

// Decimal in Vietnamese notation without needless trailing zeros: 250 (2 places) -> "2,5"
function dec(scaled: number, places: number): string {
  const s = decStr(scaled, places);
  return s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s;
}

// 3,25 -> "ba phẩy hai mươi lăm"; 0,05 -> "không phẩy không năm"
function readDecimal(scaled: number, places: number): string {
  const s = String(scaled).padStart(places + 1, '0');
  const whole = Number(s.slice(0, s.length - places));
  const fracDigits = s.slice(s.length - places);
  const zeros = fracDigits.match(/^0*/)?.[0].length ?? 0;
  const rest = Number(fracDigits);
  const fracWords = rest === 0 ? '' : `${'không '.repeat(zeros)}${readVi(rest)}`;
  return fracWords ? `${readVi(whole)} phẩy ${fracWords}` : readVi(whole);
}

// Reading each digit separately is the classic mistake ("ba phẩy hai năm")
function readDigitByDigit(scaled: number, places: number): string {
  const s = String(scaled).padStart(places + 1, '0');
  const whole = Number(s.slice(0, s.length - places));
  return `${readVi(whole)} phẩy ${s
    .slice(s.length - places)
    .split('')
    .map((d) => readVi(Number(d)))
    .join(' ')}`;
}

// ---------- Topic 1: Decimal fractions and mixed numbers ----------
const decimalFraction: SkillDef = {
  name: 'Nhận biết phân số thập phân',
  desc: 'Phân số thập phân có mẫu số 10, 100, 1000...; đổi phân số thành phân số thập phân',
  diff: 3,
  make: ({ r, i }) => {
    if (i % 2 === 0) {
      const den = pick(r, [10, 100, 1000]);
      const num = randInt(r, 1, den - 1);
      const ans = frac(num, den);
      const bad = shuffle(r, [3, 4, 6, 7, 8, 9, 12, 15]).slice(0, 3).map((d) => frac(randInt(r, 1, d - 1), d));
      return {
        prompt: 'Phân số nào là phân số thập phân?',
        answer: ans,
        wrong: bad,
        hint: 'Phân số thập phân là phân số có mẫu số là 10, 100, 1000, ...',
        explain: `${ans} có mẫu số là ${den} nên là phân số thập phân.`,
      };
    }
    const [d, k] = pick(r, [[2, 5], [5, 2], [4, 25], [20, 5], [25, 4], [50, 2], [5, 20]] as [number, number][]);
    const n = randInt(r, 1, d - 1);
    const den = d * k;
    return {
      prompt: `Viết phân số ${frac(n, d)} thành phân số thập phân có mẫu số ${den}:`,
      answer: frac(n * k, den),
      wrong: [frac(n, den), frac(n * k, d), frac(n + k, den)].filter((x) => x !== frac(n * k, den)),
      hint: `Nhân cả tử số và mẫu số với ${k} để mẫu số thành ${den}.`,
      explain: `${frac(n, d)} = ${frac(n * k, den)}.`,
    };
  },
};

const mixedNumbers: SkillDef = {
  name: 'Hỗn số',
  desc: 'Đổi hỗn số thành phân số và phân số thành hỗn số',
  diff: 3,
  make: ({ r, i }) => {
    const den = randInt(r, 2, 9);
    const whole = randInt(r, 1, 9);
    const num = randInt(r, 1, den - 1);
    const top = whole * den + num;
    const kind = i % 3;
    if (kind === 0) {
      const ans = frac(top, den);
      return {
        prompt: `Viết hỗn số ${whole} ${frac(num, den)} thành phân số:`,
        answer: ans,
        wrong: [frac(whole + num, den), frac(whole * num + den, den), frac(top, den + 1), frac(top + den, den)].filter((x) => x !== ans),
        hint: 'Lấy phần nguyên nhân với mẫu số rồi cộng với tử số; giữ nguyên mẫu số.',
        steps: [`${whole} × ${den} + ${num} = ${top}`, `Giữ nguyên mẫu số ${den}: ${ans}`],
        explain: `${whole} ${frac(num, den)} = ${ans}.`,
      };
    }
    if (kind === 1) {
      const ans = `${whole} ${frac(num, den)}`;
      return {
        prompt: `Viết phân số ${frac(top, den)} thành hỗn số:`,
        answer: ans,
        wrong: [`${whole + 1} ${frac(num, den)}`, `${whole} ${frac(den - num, den)}`, `${num} ${frac(whole, den)}`].filter((x) => x !== ans),
        hint: 'Chia tử số cho mẫu số: thương là phần nguyên, số dư là tử số của phần phân số.',
        explain: `${top} : ${den} = ${whole} (dư ${num}) nên ${frac(top, den)} = ${ans}.`,
      };
    }
    return {
      prompt: `Trong hỗn số ${whole} ${frac(num, den)}, phần nguyên là:`,
      answer: str(whole),
      wrong: wrongNums(r, whole, { min: 0, max: 12, near: [1, -1, num, den] }).map(str),
      hint: 'Phần nguyên là số đứng bên trái phân số.',
      explain: `Phần nguyên của ${whole} ${frac(num, den)} là ${whole}.`,
    };
  },
};

const fractionToDecimal: SkillDef = {
  name: 'Chuyển phân số thập phân thành số thập phân',
  desc: 'Đọc và viết phân số thập phân dưới dạng số thập phân',
  diff: 3,
  make: ({ r, i }) => {
    const places = pick(r, [1, 2, 3]);
    const den = 10 ** places;
    const num = randInt(r, 1, den * 2 - 1);
    if (i % 3 === 2) {
      const scaled = randInt(r, 1, 99);
      const p = scaled % 10 === 0 ? 1 : 2;
      const sc = p === 1 ? Math.floor(scaled / 10) || 3 : scaled;
      return {
        prompt: `Viết số thập phân ${dec(sc, p)} thành phân số thập phân:`,
        answer: frac(sc, 10 ** p),
        wrong: [frac(sc, 10 ** (p + 1)), frac(sc, 10 ** (p - 1 || 1)), frac(sc * 10, 10 ** p)].filter((x) => x !== frac(sc, 10 ** p)),
        hint: `Chữ số thập phân có ${p} chữ số nên mẫu số là 1${'0'.repeat(p)}.`,
        explain: `${dec(sc, p)} = ${frac(sc, 10 ** p)}.`,
      };
    }
    return {
      prompt: `Viết phân số thập phân ${frac(num, den)} dưới dạng số thập phân:`,
      answer: dec(num, places),
      wrong: [dec(num, places + 1), dec(num, Math.max(1, places - 1)), dec(num * 10, places)].filter((x) => x !== dec(num, places)),
      hint: `Mẫu số ${fmt(den)} có ${places} chữ số 0, nên số thập phân có ${places} chữ số ở phần thập phân.`,
      explain: `${frac(num, den)} = ${dec(num, places)}.`,
    };
  },
};

// ---------- Topic 2: Decimals ----------
const readCompareDecimal: SkillDef = {
  name: 'Đọc, viết và so sánh số thập phân',
  desc: 'Đọc số thập phân, so sánh hai số thập phân, tìm số lớn nhất',
  diff: 3,
  make: ({ r, i }) => {
    const kind = i % 3;
    if (kind === 0) {
      const places = pick(r, [1, 2]);
      const scaled = randInt(r, 12, 999);
      return {
        prompt: `Số ${dec(scaled, places)} đọc là:`,
        answer: readDecimal(scaled, places),
        wrong: [readDigitByDigit(scaled, places), readVi(scaled), readDecimal(scaled, places === 1 ? 2 : 1)].filter((x) => x !== readDecimal(scaled, places)),
        hint: 'Đọc phần nguyên, đọc "phẩy", rồi đọc phần thập phân như một số tự nhiên (chữ số 0 ngay sau dấu phẩy đọc là "không").',
        explain: `${dec(scaled, places)} đọc là "${readDecimal(scaled, places)}".`,
      };
    }
    if (kind === 1) {
      const whole = randInt(r, 0, 20);
      const a = whole * 100 + randInt(r, 1, 99);
      const options = [a, a + randInt(r, 1, 9) * (r() < 0.5 ? 1 : -1), a === whole * 100 + 50 ? a + 5 : whole * 100 + 50, a + 100];
      const b = pick(r, options.filter((v) => v > 0 && v !== a));
      const s = a > b ? '>' : a < b ? '<' : '=';
      return {
        prompt: 'So sánh hai số thập phân (điền dấu >, <, =):',
        formula: `${dec(a, 2)} … ${dec(b, 2)}`,
        answer: s,
        wrong: ['>', '<', '='].filter((x) => x !== s),
        hint: 'So sánh phần nguyên trước; nếu bằng nhau thì so sánh từng hàng phần mười, phần trăm.',
        explain: `${dec(a, 2)} ${s} ${dec(b, 2)}.`,
      };
    }
    const base = randInt(r, 10, 90);
    const set = [...new Set([base, base + 5, base + 50, base - 4 < 1 ? base + 9 : base - 4])].map((v) => v);
    const asc = [...set].sort((x, y) => x - y);
    const max = asc[asc.length - 1];
    return {
      prompt: `Số lớn nhất trong các số ${set.map((v) => dec(v, 2)).join('; ')} là:`,
      answer: dec(max, 2),
      wrong: set.filter((v) => v !== max).map((v) => dec(v, 2)),
      hint: 'So sánh phần nguyên trước, rồi phần mười, phần trăm.',
      explain: `Sắp xếp từ bé đến lớn: ${asc.map((v) => dec(v, 2)).join('; ')}.`,
    };
  },
};

const addSubDecimal: SkillDef = {
  name: 'Cộng, trừ số thập phân',
  desc: 'Đặt tính thẳng cột dấu phẩy rồi cộng, trừ số thập phân',
  diff: 4,
  make: ({ r, i }) => {
    const places = i % 2 === 0 ? 1 : 2;
    const scale = 10 ** places;
    const a = randInt(r, 2 * scale, 90 * scale) + randInt(r, 1, scale - 1);
    const b = randInt(r, 1 * scale, 60 * scale) + randInt(r, 1, scale - 1);
    const add = i % 4 < 2;
    const [x, y] = add ? [a, b] : [Math.max(a, b), Math.min(a, b)];
    const res = add ? x + y : x - y;
    return {
      prompt: 'Đặt tính rồi tính:',
      formula: `${dec(x, places)} ${add ? '+' : '−'} ${dec(y, places)} = ?`,
      answer: dec(res, places),
      wrong: [res + scale, res - scale, res + 1, res * 10].filter((v) => v !== res && v > 0).map((v) => dec(v, places)),
      hint: 'Viết các số thẳng cột sao cho các dấu phẩy thẳng cột, rồi cộng (trừ) như với số tự nhiên và viết dấu phẩy ở kết quả.',
      explain: `${dec(x, places)} ${add ? '+' : '−'} ${dec(y, places)} = ${dec(res, places)}.`,
    };
  },
};

const mulDivDecimal: SkillDef = {
  name: 'Nhân, chia số thập phân',
  desc: 'Nhân, chia nhẩm với 10, 100, 1000; nhân, chia số thập phân với số tự nhiên',
  diff: 4,
  make: ({ r, i }) => {
    const kind = i % 4;
    if (kind === 0) {
      const places = pick(r, [1, 2]);
      const scaled = randInt(r, 11, 999);
      const k = pick(r, [10, 100, 1000]);
      const res = scaled * k; // still `places` decimals
      return {
        prompt: 'Nhân nhẩm:',
        formula: `${dec(scaled, places)} × ${fmt(k)} = ?`,
        answer: dec(res, places),
        wrong: [dec(scaled * (k / 10 || 1), places), dec(scaled * k * 10, places), dec(scaled, places + String(k).length - 1)].filter((x) => x !== dec(res, places)),
        hint: `Nhân với ${fmt(k)}: chuyển dấu phẩy sang bên phải ${String(k).length - 1} chữ số.`,
        explain: `${dec(scaled, places)} × ${fmt(k)} = ${dec(res, places)}.`,
      };
    }
    if (kind === 1) {
      const scaled = randInt(r, 100, 9999);
      const k = pick(r, [10, 100]);
      const places = 2 + String(k).length - 1;
      return {
        prompt: 'Chia nhẩm:',
        formula: `${dec(scaled, 2)} : ${k} = ?`,
        answer: dec(scaled, places),
        wrong: [dec(scaled, places - 1), dec(scaled, places + 1), dec(scaled * k, 2)].filter((x) => x !== dec(scaled, places)),
        hint: `Chia cho ${k}: chuyển dấu phẩy sang bên trái ${String(k).length - 1} chữ số.`,
        explain: `${dec(scaled, 2)} : ${k} = ${dec(scaled, places)}.`,
      };
    }
    if (kind === 2) {
      const a = randInt(r, 12, 99);
      const m = randInt(r, 2, 9);
      const res = a * m;
      return {
        prompt: 'Tính:',
        formula: `${dec(a, 1)} × ${m} = ?`,
        answer: dec(res, 1),
        wrong: [dec(res, 2), dec(res * 10, 1), dec(res + m, 1), dec(res - 1, 1)].filter((x) => x !== dec(res, 1)),
        hint: 'Nhân như với số tự nhiên, rồi viết dấu phẩy ở kết quả sao cho có 1 chữ số ở phần thập phân.',
        explain: `${dec(a, 1)} × ${m} = ${dec(res, 1)}.`,
      };
    }
    const q = randInt(r, 12, 99);
    const d = randInt(r, 2, 9);
    return {
      prompt: 'Tính:',
      formula: `${dec(q * d, 1)} : ${d} = ?`,
      answer: dec(q, 1),
      wrong: [dec(q, 2), dec(q * 10, 1), dec(q + d, 1), dec(q - 1, 1)].filter((x) => x !== dec(q, 1)),
      hint: 'Chia như với số tự nhiên, khi chia hết phần nguyên thì viết dấu phẩy ở thương rồi chia tiếp.',
      explain: `${dec(q * d, 1)} : ${d} = ${dec(q, 1)}.`,
    };
  },
};

// ---------- Topic 3: Percentages ----------
const percentConcept: SkillDef = {
  name: 'Khái niệm tỉ số phần trăm',
  desc: 'Viết phân số và số thập phân dưới dạng phần trăm',
  diff: 3,
  make: ({ r, i }) => {
    const kind = i % 3;
    if (kind === 0) {
      const [n, d] = pick(r, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 10], [7, 20], [9, 25], [3, 5], [7, 10]] as [number, number][]);
      const pct = (n * 100) / d;
      return {
        prompt: `Viết phân số ${frac(n, d)} dưới dạng tỉ số phần trăm:`,
        answer: `${pct}%`,
        wrong: [`${pct + 5}%`, `${pct - 5 > 0 ? pct - 5 : pct + 10}%`, `${n * d}%`, `${n}%`].filter((x) => x !== `${pct}%`),
        hint: `Đổi về phân số có mẫu số 100: ${frac(n, d)} = ${frac(pct, 100)}.`,
        explain: `${frac(n, d)} = ${frac(pct, 100)} = ${pct}%.`,
      };
    }
    if (kind === 1) {
      const pct = randInt(r, 1, 99);
      return {
        prompt: `Viết số thập phân ${dec(pct, 2)} dưới dạng tỉ số phần trăm:`,
        answer: `${pct}%`,
        wrong: [`${pct * 10}%`, `${Math.max(1, Math.floor(pct / 10))}%`, `${pct + 10}%`].filter((x) => x !== `${pct}%`),
        hint: 'Nhân số thập phân với 100 rồi viết thêm ký hiệu %.',
        explain: `${dec(pct, 2)} = ${pct}%.`,
      };
    }
    const pct = pick(r, [5, 10, 20, 25, 30, 40, 50, 60, 75, 80]);
    return {
      prompt: `${pct}% nghĩa là:`,
      answer: `${pct} phần trong 100 phần bằng nhau`,
      wrong: [`${pct} phần trong 10 phần bằng nhau`, `${100 - pct} phần trong 100 phần bằng nhau`, `${pct} nhân với 100`],
      hint: 'Tỉ số phần trăm cho biết có bao nhiêu phần trong 100 phần bằng nhau.',
      explain: `${pct}% = ${frac(pct, 100)}.`,
    };
  },
};

const findPercent: SkillDef = {
  name: 'Tìm tỉ số phần trăm của hai số',
  desc: 'Tìm tỉ số phần trăm của hai số và bài toán về tỉ số phần trăm',
  diff: 4,
  make: ({ r, i }) => {
    const pct = pick(r, [5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 80]);
    const base = pick(r, [40, 80, 200, 400, 50, 20, 60, 120, 160, 250].filter((b) => Number.isInteger((pct * b) / 100)));
    const part = (pct * base) / 100;
    const pctText = String(pct).replace('.', ',');
    if (i % 2 === 0) {
      return {
        prompt: `Tìm tỉ số phần trăm của ${part} và ${base}:`,
        answer: `${pctText}%`,
        wrong: [`${pct + 10}%`, `${Math.max(1, pct - 10)}%`, `${Math.round((base / part) * 100)}%`].map((x) => x.replace('.', ',')).filter((x) => x !== `${pctText}%`),
        hint: `Chia ${part} cho ${base} rồi nhân với 100.`,
        steps: [`${part} : ${base} = ${dec(Math.round((part / base) * 1000), 3)}`, `${dec(Math.round((part / base) * 1000), 3)} × 100 = ${pctText}%`],
        explain: `${part} : ${base} = ${pctText}%.`,
      };
    }
    const total = base;
    return {
      prompt: `Một lớp có ${total} học sinh, trong đó có ${part} học sinh nữ. Tỉ số phần trăm của học sinh nữ so với cả lớp là bao nhiêu?`,
      answer: `${pctText}%`,
      wrong: [`${pct + 10}%`, `${Math.max(1, pct - 10)}%`, `${Math.round(((total - part) / total) * 100)}%`].map((x) => x.replace('.', ',')).filter((x) => x !== `${pctText}%`),
      hint: 'Lấy số học sinh nữ chia cho số học sinh cả lớp rồi nhân với 100.',
      explain: `${part} : ${total} = ${pctText}%.`,
    };
  },
};

const percentOf: SkillDef = {
  name: 'Tìm giá trị phần trăm của một số',
  desc: 'Tìm a% của một số; bài toán giảm giá, tiền lãi',
  diff: 4,
  make: ({ r, i }) => {
    const pct = pick(r, [10, 20, 25, 30, 40, 50, 15, 5, 12]);
    const base = pick(r, [50, 100, 150, 200, 250, 400, 500, 800, 1000, 2000].filter((b) => Number.isInteger((pct * b) / 100)));
    const val = (pct * base) / 100;
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: `Tìm ${pct}% của ${fmt(base)}:`,
        answer: fmt(val),
        wrong: wrongNums(r, val, { min: 1, max: base * 2, near: [val, -val / 2, 10, -10, base - val].filter((v) => Number.isInteger(v) && v !== 0) }).map(fmt),
        hint: `${pct}% của ${fmt(base)} là ${fmt(base)} × ${pct} : 100.`,
        explain: `${fmt(base)} × ${pct} : 100 = ${fmt(val)}.`,
      };
    }
    const price = base * 1000;
    if (kind === 1) {
      const newPrice = price - val * 1000;
      return {
        prompt: `Một chiếc áo giá ${fmt(price)} đồng, được giảm giá ${pct}%. Hỏi sau khi giảm giá, chiếc áo có giá bao nhiêu đồng?`,
        answer: `${fmt(newPrice)} đồng`,
        wrong: [`${fmt(val * 1000)} đồng`, `${fmt(price + val * 1000)} đồng`, `${fmt(newPrice + 10000)} đồng`].filter((x) => x !== `${fmt(newPrice)} đồng`),
        hint: `Số tiền được giảm là ${pct}% của ${fmt(price)}. Giá mới = giá cũ − số tiền được giảm.`,
        steps: [`Tiền giảm: ${fmt(price)} × ${pct} : 100 = ${fmt(val * 1000)}`, `Giá mới: ${fmt(price)} − ${fmt(val * 1000)} = ${fmt(newPrice)}`],
        explain: `Giá mới là ${fmt(newPrice)} đồng.`,
      };
    }
    return {
      prompt: `Một cửa hàng nhập hàng với giá vốn ${fmt(price)} đồng và bán lãi ${pct}% so với giá vốn. Tiền lãi là bao nhiêu đồng?`,
      answer: `${fmt(val * 1000)} đồng`,
      wrong: [`${fmt(price + val * 1000)} đồng`, `${fmt(val * 100)} đồng`, `${fmt(price - val * 1000)} đồng`].filter((x) => x !== `${fmt(val * 1000)} đồng`),
      hint: `Tiền lãi = ${pct}% của giá vốn.`,
      explain: `${fmt(price)} × ${pct} : 100 = ${fmt(val * 1000)} đồng.`,
    };
  },
};

// ---------- Topic 4: Geometry and volume ----------
const areaTriTrap: SkillDef = {
  name: 'Diện tích hình tam giác và hình thang',
  desc: 'Tam giác: đáy × chiều cao : 2. Hình thang: (đáy lớn + đáy bé) × chiều cao : 2',
  diff: 3,
  make: ({ r, i }) => {
    if (i % 2 === 0) {
      const a = randInt(r, 4, 20);
      const h = randInt(r, 3, 16);
      const ah = a * h;
      const [x, y] = ah % 2 === 0 ? [a, h] : [a + 1, h];
      const s = (x * y) / 2;
      return {
        prompt: `Tính diện tích hình tam giác có độ dài đáy ${x} cm và chiều cao ${y} cm:`,
        answer: `${s} cm²`,
        wrong: [`${x * y} cm²`, `${x + y} cm²`, `${s + x} cm²`].filter((z) => z !== `${s} cm²`),
        hint: 'Diện tích hình tam giác = đáy × chiều cao : 2.',
        explain: `${x} × ${y} : 2 = ${s} cm².`,
      };
    }
    const a = randInt(r, 6, 20);
    const b = randInt(r, 3, a - 1);
    const h = (a + b) % 2 === 0 ? randInt(r, 3, 12) : 2 * randInt(r, 2, 6);
    const s = ((a + b) * h) / 2;
    return {
      prompt: `Tính diện tích hình thang có đáy lớn ${a} cm, đáy bé ${b} cm và chiều cao ${h} cm:`,
      answer: `${s} cm²`,
      wrong: [`${(a + b) * h} cm²`, `${a * h} cm²`, `${s + h} cm²`].filter((z) => z !== `${s} cm²`),
      hint: 'Diện tích hình thang = (đáy lớn + đáy bé) × chiều cao : 2.',
      steps: [`${a} + ${b} = ${a + b}`, `${a + b} × ${h} = ${(a + b) * h}`, `${(a + b) * h} : 2 = ${s}`],
      explain: `(${a} + ${b}) × ${h} : 2 = ${s} cm².`,
    };
  },
};

const circle: SkillDef = {
  name: 'Chu vi và diện tích hình tròn',
  desc: 'Chu vi = đường kính × 3,14 (hay bán kính × 2 × 3,14); diện tích = bán kính × bán kính × 3,14',
  diff: 4,
  make: ({ r, i }) => {
    const rad = randInt(r, 2, 12);
    const kind = i % 3;
    if (kind === 0) {
      const c = 628 * rad;
      return {
        prompt: `Tính chu vi hình tròn có bán kính ${rad} cm (lấy π = 3,14):`,
        answer: `${dec(c, 2)} cm`,
        wrong: [`${dec(314 * rad * rad, 2)} cm`, `${dec(314 * rad, 2)} cm`, `${dec(c + 100, 2)} cm`].filter((x) => x !== `${dec(c, 2)} cm`),
        hint: 'Chu vi = bán kính × 2 × 3,14.',
        explain: `${rad} × 2 × 3,14 = ${dec(c, 2)} cm.`,
      };
    }
    if (kind === 1) {
      const s = 314 * rad * rad;
      return {
        prompt: `Tính diện tích hình tròn có bán kính ${rad} cm (lấy π = 3,14):`,
        answer: `${dec(s, 2)} cm²`,
        wrong: [`${dec(628 * rad, 2)} cm²`, `${dec(314 * rad * 2, 2)} cm²`, `${dec(s + 314, 2)} cm²`].filter((x) => x !== `${dec(s, 2)} cm²`),
        hint: 'Diện tích = bán kính × bán kính × 3,14.',
        explain: `${rad} × ${rad} × 3,14 = ${dec(s, 2)} cm².`,
      };
    }
    const d = rad * 2;
    const c = 314 * d;
    return {
      prompt: `Một bánh xe hình tròn có đường kính ${d} cm. Chu vi bánh xe là bao nhiêu (lấy π = 3,14)?`,
      answer: `${dec(c, 2)} cm`,
      wrong: [`${dec(c * rad, 2)} cm`, `${dec(314 * rad, 2)} cm`, `${dec(c + 314, 2)} cm`].filter((x) => x !== `${dec(c, 2)} cm`),
      hint: 'Chu vi = đường kính × 3,14.',
      explain: `${d} × 3,14 = ${dec(c, 2)} cm.`,
    };
  },
};

const volume: SkillDef = {
  name: 'Thể tích hình hộp chữ nhật và hình lập phương',
  desc: 'Thể tích hình hộp chữ nhật = dài × rộng × cao; hình lập phương = cạnh × cạnh × cạnh',
  diff: 4,
  make: ({ r, i }) => {
    const kind = i % 3;
    if (kind === 1) {
      const a = randInt(r, 2, 9);
      return {
        prompt: `Tính thể tích hình lập phương có cạnh ${a} cm:`,
        answer: `${a ** 3} cm³`,
        wrong: [`${a * a} cm³`, `${a * 3} cm³`, `${a ** 3 + a} cm³`],
        hint: 'Thể tích hình lập phương = cạnh × cạnh × cạnh.',
        explain: `${a} × ${a} × ${a} = ${a ** 3} cm³.`,
      };
    }
    const a = randInt(r, 3, 12);
    const b = randInt(r, 2, 9);
    const c = randInt(r, 2, 8);
    const v = a * b * c;
    if (kind === 2) {
      return {
        prompt: `Hình hộp chữ nhật có thể tích ${v} cm³, chiều dài ${a} cm, chiều rộng ${b} cm. Chiều cao là:`,
        answer: `${c} cm`,
        wrong: [c + 1, c - 1 > 0 ? c - 1 : c + 2, a - b].filter((x) => x !== c && x > 0).map((x) => `${x} cm`),
        hint: 'Chiều cao = thể tích : (chiều dài × chiều rộng).',
        explain: `${v} : (${a} × ${b}) = ${c} cm.`,
      };
    }
    return {
      prompt: `Tính thể tích hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm:`,
      answer: `${v} cm³`,
      wrong: [`${a + b + c} cm³`, `${2 * (a * b + b * c + a * c)} cm³`, `${v + a} cm³`],
      hint: 'Thể tích = chiều dài × chiều rộng × chiều cao.',
      explain: `${a} × ${b} × ${c} = ${v} cm³.`,
    };
  },
};

// ---------- Topic 5: Uniform motion ----------
const motionFormula: SkillDef = {
  name: 'Công thức tính vận tốc, quãng đường, thời gian',
  desc: 'v = s : t, s = v × t, t = s : v với đơn vị km/giờ, km, giờ',
  diff: 3,
  make: ({ r, i }) => {
    const v = randInt(r, 4, 16) * 5;
    const t = randInt(r, 2, 6);
    const s = v * t;
    const veh = pick(r, ['ô tô', 'xe máy', 'tàu hỏa']);
    const kind = i % 3;
    if (kind === 0) {
      return {
        prompt: `Một ${veh} đi quãng đường ${s} km trong ${t} giờ. Vận tốc của ${veh} là bao nhiêu?`,
        answer: `${v} km/giờ`,
        wrong: [`${s + t} km/giờ`, `${t} km/giờ`, `${v + 5} km/giờ`, `${s * t} km/giờ`].filter((x) => x !== `${v} km/giờ`),
        hint: 'Vận tốc = quãng đường : thời gian.',
        explain: `${s} : ${t} = ${v} km/giờ.`,
      };
    }
    if (kind === 1) {
      return {
        prompt: `Một ${veh} đi với vận tốc ${v} km/giờ trong ${t} giờ. Quãng đường ${veh} đi được là bao nhiêu?`,
        answer: `${s} km`,
        wrong: [`${v + t} km`, `${Math.round(v / t)} km`, `${s + v} km`].filter((x) => x !== `${s} km`),
        hint: 'Quãng đường = vận tốc × thời gian.',
        explain: `${v} × ${t} = ${s} km.`,
      };
    }
    return {
      prompt: `Một ${veh} đi quãng đường ${s} km với vận tốc ${v} km/giờ. Thời gian đi là bao nhiêu?`,
      answer: `${t} giờ`,
      wrong: [`${t + 1} giờ`, `${s * v} giờ`, `${Math.max(1, t - 1)} giờ`].filter((x) => x !== `${t} giờ`),
      hint: 'Thời gian = quãng đường : vận tốc.',
      explain: `${s} : ${v} = ${t} giờ.`,
    };
  },
};

const oppositeMotion: SkillDef = {
  name: 'Hai chuyển động ngược chiều (gặp nhau)',
  desc: 'Thời gian gặp nhau = khoảng cách : (v1 + v2)',
  diff: 4,
  make: ({ r, i }) => {
    const v1 = randInt(r, 6, 14) * 5;
    const v2 = randInt(r, 6, 14) * 5;
    const t = randInt(r, 2, 5);
    const d = (v1 + v2) * t;
    if (i % 2 === 0) {
      return {
        prompt: `Hai ô tô xuất phát cùng lúc từ hai tỉnh cách nhau ${d} km và đi ngược chiều để gặp nhau. Vận tốc ô tô thứ nhất là ${v1} km/giờ, ô tô thứ hai là ${v2} km/giờ. Sau mấy giờ hai ô tô gặp nhau?`,
        answer: `${t} giờ`,
        wrong: [`${t + 1} giờ`, `${Math.round(d / v1)} giờ`, `${Math.max(1, t - 1)} giờ`].filter((x) => x !== `${t} giờ`),
        hint: 'Mỗi giờ hai ô tô cùng lại gần nhau một quãng đường bằng tổng hai vận tốc.',
        steps: [`Tổng vận tốc: ${v1} + ${v2} = ${v1 + v2} km/giờ`, `Thời gian gặp nhau: ${d} : ${v1 + v2} = ${t} giờ`],
        explain: `${d} : (${v1} + ${v2}) = ${t} giờ.`,
      };
    }
    return {
      prompt: `Hai xe máy xuất phát cùng lúc từ hai địa điểm và đi ngược chiều nhau, vận tốc ${v1} km/giờ và ${v2} km/giờ. Sau ${t} giờ hai xe gặp nhau. Khoảng cách ban đầu giữa hai xe là bao nhiêu?`,
      answer: `${d} km`,
      wrong: [`${Math.abs(v1 - v2) * t} km`, `${v1 * t} km`, `${d + v1} km`].filter((x) => x !== `${d} km`),
      hint: 'Khoảng cách = (v1 + v2) × thời gian gặp nhau.',
      explain: `(${v1} + ${v2}) × ${t} = ${d} km.`,
    };
  },
};

const sameDirection: SkillDef = {
  name: 'Hai chuyển động cùng chiều (đuổi kịp)',
  desc: 'Thời gian đuổi kịp = khoảng cách : (v1 − v2)',
  diff: 5,
  make: ({ r, i }) => {
    const slow = randInt(r, 4, 10) * 5;
    const gap = randInt(r, 2, 8) * 5;
    const fast = slow + gap;
    const t = randInt(r, 2, 6);
    const d = gap * t;
    if (i % 2 === 0) {
      return {
        prompt: `Một xe máy đi với vận tốc ${slow} km/giờ. Một ô tô đi cùng chiều, ở phía sau xe máy ${d} km, với vận tốc ${fast} km/giờ. Sau mấy giờ ô tô đuổi kịp xe máy?`,
        answer: `${t} giờ`,
        wrong: [`${t + 1} giờ`, `${Math.round(d / (fast + slow) || 1)} giờ`, `${Math.max(1, t - 1)} giờ`].filter((x) => x !== `${t} giờ`),
        hint: 'Mỗi giờ ô tô đến gần xe máy thêm một quãng đường bằng hiệu hai vận tốc.',
        steps: [`Hiệu vận tốc: ${fast} − ${slow} = ${gap} km/giờ`, `Thời gian đuổi kịp: ${d} : ${gap} = ${t} giờ`],
        explain: `${d} : (${fast} − ${slow}) = ${t} giờ.`,
      };
    }
    return {
      prompt: `Một xe máy đi với vận tốc ${slow} km/giờ. Một ô tô xuất phát sau, đi cùng chiều, với vận tốc ${fast} km/giờ và đuổi kịp xe máy sau ${t} giờ. Lúc ô tô xuất phát, hai xe cách nhau bao nhiêu km?`,
      answer: `${d} km`,
      wrong: [`${(fast + slow) * t} km`, `${fast * t} km`, `${d + gap} km`].filter((x) => x !== `${d} km`),
      hint: 'Khoảng cách ban đầu = (v1 − v2) × thời gian đuổi kịp.',
      explain: `(${fast} − ${slow}) × ${t} = ${d} km.`,
    };
  },
};

export const mathGrade5: Record<string, SkillDef[]> = {
  'g5-m-t1': [decimalFraction, mixedNumbers, fractionToDecimal],
  'g5-m-t2': [readCompareDecimal, addSubDecimal, mulDivDecimal],
  'g5-m-t3': [percentConcept, findPercent, percentOf],
  'g5-m-t4': [areaTriTrap, circle, volume],
  'g5-m-t5': [motionFormula, oppositeMotion, sameDirection],
};

