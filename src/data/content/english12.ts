import { Draft, Maker, SkillDef, THINGS, pick, randInt, sample, shuffle } from './core.js';
import type { OptionFace, ShapeName } from '../../types/curriculum';
import { Row, Word, enToVi, fromRows, mix, picToWord, skill, viToEn, w, wordToPic } from './englishKit.js';

// Grades 1-2 English ("làm quen tiếng Anh"): alphabet, numbers, colours, shapes, family, animals, then school,
// body, food, actions and toys. Everything starts from a picture; sentences stay tiny.

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const FILL = 'Chọn từ đúng điền vào chỗ trống:';
const REPLY = 'Chọn câu trả lời đúng:';

// ---------- Grade 1, topic 1: Alphabet & phonics ----------
const LETTER_WORDS: Word[] = [
  w('apple', 'quả táo', '🍎'), w('ball', 'quả bóng', '⚽'), w('cat', 'con mèo', '🐱'), w('dog', 'con chó', '🐶'),
  w('egg', 'quả trứng', '🥚'), w('fish', 'con cá', '🐟'), w('hat', 'cái mũ', '🎩'), w('ice cream', 'kem', '🍦'),
  w('kite', 'con diều', '🪁'), w('lion', 'sư tử', '🦁'), w('monkey', 'con khỉ', '🐒'), w('nose', 'cái mũi', '👃'),
  w('orange', 'quả cam', '🍊'), w('pig', 'con lợn', '🐷'), w('rabbit', 'con thỏ', '🐰'), w('sun', 'mặt trời', '☀️'),
  w('tiger', 'con hổ', '🐯'), w('umbrella', 'cái ô', '☂️'), w('watermelon', 'dưa hấu', '🍉'), w('zebra', 'ngựa vằn', '🦓'),
];
const initial = (word: Word) => word.en.charAt(0).toUpperCase();

const letterOrder: Maker = ({ r, i }) => {
  const k = randInt(r, 1, 23);
  const after = i % 2 === 0;
  const cur = ALPHA[k];
  const ans = ALPHA[after ? k + 1 : k - 1];
  return {
    prompt: `Chữ cái nào đứng ngay ${after ? 'sau' : 'trước'} chữ "${cur}"? (Which letter comes ${after ? 'after' : 'before'} ${cur}?)`,
    answer: ans,
    wrong: [ALPHA[after ? k + 2 : k - 2], cur, ALPHA[after ? k - 1 : k + 1]].filter((x) => x && x !== ans),
    hint: `Đọc bảng chữ cái: ${ALPHA.slice(Math.max(0, k - 2), k + 3).join(', ')}...`,
    explain: `${after ? `${cur}, ${ans}` : `${ans}, ${cur}`}: ${ans} đứng ${after ? 'sau' : 'trước'} ${cur}.`,
  };
};

const CONFUSING: Record<string, string[]> = { b: ['d', 'p', 'q'], d: ['b', 'p', 'q'], p: ['q', 'b', 'd'], q: ['p', 'g', 'd'], m: ['n', 'w', 'h'], n: ['m', 'u', 'h'], u: ['n', 'v', 'w'], w: ['m', 'v', 'u'] };
const letterCase: Maker = ({ r, i }) => {
  const up = ALPHA[randInt(r, 0, 25)];
  const low = up.toLowerCase();
  const toLower = i % 2 === 0;
  const pool = (CONFUSING[low] ?? sample(r, ALPHA.map((x) => x.toLowerCase()).filter((x) => x !== low), 3)).filter((x) => x !== low);
  if (toLower) {
    return {
      prompt: `Chữ hoa "${up}" viết thường là chữ nào?`,
      answer: low,
      wrong: pool,
      hint: `Chữ hoa ${up} và chữ thường ${low} là cùng một chữ cái.`,
      explain: `${up} viết thường là ${low}.`,
    };
  }
  return {
    prompt: `Chữ thường "${low}" viết hoa là chữ nào?`,
    answer: up,
    wrong: pool.map((x) => x.toUpperCase()),
    hint: `Chữ hoa và chữ thường của cùng một chữ cái.`,
    explain: `${low} viết hoa là ${up}.`,
  };
};

const firstLetter: Maker = ({ r, i }) => {
  const it = LETTER_WORDS[i % LETTER_WORDS.length];
  const ans = initial(it);
  return {
    prompt: 'Từ này bắt đầu bằng chữ cái nào? (Which letter does it start with?)',
    visual: { kind: 'picture', emoji: it.e },
    answer: ans,
    wrong: sample(r, ALPHA.filter((x) => x !== ans), 3),
    hint: `Đọc to tên hình: "${it.en}". Âm đầu là chữ nào?`,
    hint2: `Đây là "${it.en}" (${it.vi}).`,
    explain: `"${it.en}" bắt đầu bằng chữ ${ans}. ${ans} is for ${it.en}.`,
  };
};

const startsWith: Maker = ({ r, i }) => {
  const it = LETTER_WORDS[i % LETTER_WORDS.length];
  const ans = initial(it);
  const others = sample(r, LETTER_WORDS.filter((x) => initial(x) !== ans), 3);
  const faces: Record<string, OptionFace> = Object.fromEntries([it, ...others].map((x) => [x.en, { emoji: x.e }]));
  return {
    prompt: `Từ nào bắt đầu bằng chữ "${ans}"? (Which word starts with ${ans}?)`,
    answer: it.en,
    wrong: others.map((x) => x.en),
    faces,
    hint: `Tìm từ có chữ cái đầu là ${ans}.`,
    explain: `"${it.en}" bắt đầu bằng ${ans}.`,
  };
};

// ---------- Grade 1, topic 2: Numbers 1-10 ----------
const numWordWrong = (r: () => number, n: number) =>
  [n - 1, n + 1, n - 2, n + 2, n + 3].filter((x) => x >= 1 && x <= 10 && x !== n).slice(0, 3).map((x) => NUM[x]);

const countToWord: Maker = ({ r }) => {
  const th = pick(r, THINGS);
  const n = randInt(r, 1, 10);
  return {
    prompt: 'Có bao nhiêu? (How many?)',
    visual: { kind: 'objects', emoji: th.e, groups: [{ count: n }] },
    answer: NUM[n],
    wrong: numWordWrong(r, n),
    hint: 'Đếm từng hình: one, two, three...',
    explain: `Có ${n} hình: "${NUM[n]}".`,
  };
};

const digitWord: Maker = ({ r, i }) => {
  const n = randInt(r, 1, 10);
  if (i % 2 === 0) {
    return {
      prompt: `Số ${n} tiếng Anh viết là gì?`,
      answer: NUM[n],
      wrong: numWordWrong(r, n),
      hint: `Đếm: ${NUM.slice(1, n + 1).join(', ')}.`,
      explain: `${n} = ${NUM[n]}.`,
    };
  }
  return {
    prompt: `"${NUM[n]}" là số mấy?`,
    answer: String(n),
    wrong: [n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 1 && x <= 10 && x !== n).slice(0, 3).map(String),
    hint: `Đếm: ${NUM.slice(1, n + 1).join(', ')}.`,
    explain: `${NUM[n]} = ${n}.`,
  };
};

const numOrder: Maker = ({ r, i }) => {
  const kind = i % 3;
  if (kind === 2) {
    const a = randInt(r, 1, 9);
    let b = randInt(r, 1, 10);
    if (b === a) b = a === 10 ? 9 : a + 1;
    const big = Math.max(a, b);
    return {
      prompt: `Số nào lớn hơn: "${NUM[a]}" hay "${NUM[b]}"? (Which is bigger?)`,
      answer: NUM[big],
      wrong: [NUM[Math.min(a, b)], 'they are the same'].map((x) => x),
      hint: 'Đếm từ one đến ten: số nào đếm sau thì lớn hơn.',
      explain: `${NUM[big]} (${big}) lớn hơn.`,
    };
  }
  const after = kind === 0;
  const n = randInt(r, 2, 9);
  const ans = after ? n + 1 : n - 1;
  return {
    prompt: `Số nào đứng ngay ${after ? 'sau' : 'trước'} "${NUM[n]}"? (What number comes ${after ? 'after' : 'before'} ${NUM[n]}?)`,
    answer: NUM[ans],
    wrong: [NUM[after ? n - 1 : n + 1], NUM[after ? n + 2 : n - 2], NUM[n]].filter((x) => x && x !== NUM[ans]),
    hint: `Đếm: ${NUM.slice(1, 11).join(', ')}.`,
    explain: `${after ? `${NUM[n]}, ${NUM[ans]}` : `${NUM[ans]}, ${NUM[n]}`}.`,
  };
};

// ---------- Grade 1, topic 3: Colors & shapes ----------
const COLORS = [
  { en: 'red', vi: 'đỏ', hex: '#EF4444' }, { en: 'blue', vi: 'xanh dương', hex: '#3B82F6' },
  { en: 'green', vi: 'xanh lá', hex: '#22C55E' }, { en: 'yellow', vi: 'vàng', hex: '#FACC15' },
  { en: 'orange', vi: 'cam', hex: '#F97316' }, { en: 'purple', vi: 'tím', hex: '#A855F7' },
  { en: 'pink', vi: 'hồng', hex: '#EC4899' }, { en: 'brown', vi: 'nâu', hex: '#92400E' },
  { en: 'black', vi: 'đen', hex: '#111827' }, { en: 'white', vi: 'trắng', hex: '#FFFFFF' },
];

const swatchToWord: Maker = ({ r, i }) => {
  const c = COLORS[i % COLORS.length];
  return {
    prompt: 'Đây là màu gì? (What color is this?)',
    visual: { kind: 'color', hex: c.hex },
    answer: c.en,
    wrong: sample(r, COLORS.filter((x) => x.en !== c.en), 3).map((x) => x.en),
    hint: `Màu này là màu ${c.vi}.`,
    explain: `Màu ${c.vi} tiếng Anh là "${c.en}".`,
  };
};

const wordToSwatch: Maker = ({ r, i }) => {
  const c = COLORS[i % COLORS.length];
  const others = sample(r, COLORS.filter((x) => x.en !== c.en), 3);
  return {
    prompt: `Ô màu nào là "${c.en}"? (Which one is ${c.en}?)`,
    answer: c.hex,
    wrong: others.map((x) => x.hex),
    faces: Object.fromEntries([c, ...others].map((x) => [x.hex, { hex: x.hex, only: true }])),
    hint: `"${c.en}" là màu ${c.vi}.`,
    explain: `"${c.en}" nghĩa là màu ${c.vi}.`,
  };
};

const OBJECT_COLORS: { e: string; name: string; color: string }[] = [
  { e: '🍌', name: 'banana', color: 'yellow' }, { e: '🍎', name: 'apple', color: 'red' },
  { e: '🌳', name: 'tree leaves', color: 'green' }, { e: '🌊', name: 'sea', color: 'blue' },
  { e: '🍊', name: 'orange', color: 'orange' }, { e: '🍇', name: 'grapes', color: 'purple' },
  { e: '🍫', name: 'chocolate', color: 'brown' }, { e: '❄️', name: 'snow', color: 'white' },
  { e: '🍅', name: 'tomato', color: 'red' }, { e: '🍋', name: 'lemon', color: 'yellow' },
  { e: '🐸', name: 'frog', color: 'green' }, { e: '🌸', name: 'flower', color: 'pink' },
];
const objectColor: Maker = ({ r, i }) => {
  const o = OBJECT_COLORS[i % OBJECT_COLORS.length];
  return {
    prompt: 'Vật này có màu gì? (What color is it?)',
    visual: { kind: 'picture', emoji: o.e },
    answer: o.color,
    wrong: sample(r, COLORS.map((c) => c.en).filter((x) => x !== o.color), 3),
    hint: `Nhớ lại màu của ${o.name} ngoài đời.`,
    explain: `${o.name} có màu ${o.color}. ${o.e}`,
  };
};

const SHAPES: { shape: ShapeName; en: string; vi: string }[] = [
  { shape: 'circle', en: 'circle', vi: 'hình tròn' },
  { shape: 'square', en: 'square', vi: 'hình vuông' },
  { shape: 'triangle', en: 'triangle', vi: 'hình tam giác' },
  { shape: 'rectangle', en: 'rectangle', vi: 'hình chữ nhật' },
];
const shapeToWord: Maker = ({ r, i }) => {
  const s = SHAPES[i % SHAPES.length];
  return {
    prompt: 'Đây là hình gì? (What shape is this?)',
    visual: { kind: 'shape', shape: s.shape, hex: pick(r, COLORS.slice(0, 8)).hex },
    answer: s.en,
    wrong: SHAPES.filter((x) => x.en !== s.en).map((x) => x.en),
    hint: `Đây là ${s.vi}.`,
    explain: `${s.vi} tiếng Anh là "${s.en}".`,
  };
};
const wordToShape: Maker = ({ r, i }) => {
  const s = SHAPES[i % SHAPES.length];
  const all = shuffle(r, SHAPES);
  const label = (x: (typeof SHAPES)[number]) => `Hình ${x.en}`;
  return {
    prompt: `Hình nào là "${s.en}"? (Which one is a ${s.en}?)`,
    answer: label(s),
    wrong: all.filter((x) => x !== s).map(label),
    faces: Object.fromEntries(all.map((x) => [label(x), { shape: x.shape, hex: pick(r, COLORS.slice(0, 8)).hex, only: true }])),
    hint: `"${s.en}" là ${s.vi}.`,
    explain: `"${s.en}" nghĩa là ${s.vi}.`,
  };
};

// ---------- Grade 1, topic 4: Family & friends ----------
const FAMILY: Word[] = [
  w('mom', 'mẹ', '👩'), w('dad', 'bố', '👨'), w('brother', 'anh / em trai', '👦'), w('sister', 'chị / em gái', '👧'),
  w('baby', 'em bé', '👶'), w('grandma', 'bà', '👵'), w('grandpa', 'ông', '👴'),
];
const GREETINGS: Row[] = [
  { f: 'Hello!', a: 'Hi!', w: ['Goodbye!', 'Thank you.', 'Sorry.'], h: 'Hello và Hi đều là lời chào khi gặp nhau.' },
  { f: 'How are you?', a: "I'm fine, thank you.", w: ["I'm six.", 'My name is Lan.', 'Goodbye!'], h: 'How are you? là câu hỏi thăm sức khỏe.' },
  { f: "What's your name?", a: 'My name is Nam.', w: ["I'm fine.", "I'm six.", 'Thank you.'], h: "What's your name? là câu hỏi tên." },
  { f: 'Goodbye!', a: 'Bye!', w: ['Hello!', 'Good morning!', 'Sorry.'], h: 'Goodbye và Bye là lời chào tạm biệt.' },
  { f: 'How old are you?', a: "I'm six.", w: ["I'm fine.", 'My name is Lan.', 'Nice to meet you.'], h: 'How old are you? hỏi tuổi.' },
  { f: 'Thank you.', a: "You're welcome.", w: ['Sorry.', 'Hello!', 'Goodbye!'], h: "You're welcome nghĩa là không có gì." },
  { f: 'Nice to meet you.', a: 'Nice to meet you, too.', w: ['Goodbye!', "I'm six.", 'Thank you.'], h: 'Nice to meet you, too nghĩa là mình cũng rất vui được gặp bạn.' },
  { f: 'Good morning!', a: 'Good morning!', w: ['Good night!', 'Goodbye!', 'Sorry.'], h: 'Good morning là chào buổi sáng, ta đáp lại y như vậy.' },
  { f: 'Sorry.', a: "That's OK.", w: ['Hello!', "You're welcome.", 'Goodbye!'], h: "Khi ai đó xin lỗi, ta nói That's OK (không sao đâu)." },
];

// ---------- Grade 1, topic 5: Animals ----------
const ANIMALS: Word[] = [
  w('dog', 'con chó', '🐶'), w('cat', 'con mèo', '🐱'), w('bird', 'con chim', '🐦'), w('fish', 'con cá', '🐟'),
  w('rabbit', 'con thỏ', '🐰'), w('duck', 'con vịt', '🦆'), w('cow', 'con bò', '🐮'), w('pig', 'con lợn', '🐷'),
  w('horse', 'con ngựa', '🐴'), w('chicken', 'con gà', '🐔'), w('monkey', 'con khỉ', '🐒'), w('elephant', 'con voi', '🐘'),
];
const animalRow = (f: string, a: string, others: string[], h: string): Row => ({
  f,
  a,
  w: others,
  fc: Object.fromEntries([a, ...others].map((n) => [n, ANIMALS.find((x) => x.en === n)?.e ?? ''])),
  h,
});
const ANIMAL_FACTS: Row[] = [
  animalRow('Which animal says "meow"?', 'cat', ['dog', 'cow', 'duck'], 'Con mèo kêu "meo meo".'),
  animalRow('Which animal says "woof"?', 'dog', ['cat', 'pig', 'bird'], 'Con chó sủa "gâu gâu".'),
  animalRow('Which animal says "moo"?', 'cow', ['pig', 'duck', 'horse'], 'Con bò kêu "ùm bò".'),
  animalRow('Which animal says "quack"?', 'duck', ['cow', 'chicken', 'cat'], 'Con vịt kêu "quạc quạc".'),
  animalRow('Which animal can fly?', 'bird', ['dog', 'fish', 'pig'], 'Con chim biết bay.'),
  animalRow('Which animal lives in water?', 'fish', ['cat', 'rabbit', 'horse'], 'Con cá sống dưới nước.'),
  animalRow('Which animal has long ears and hops?', 'rabbit', ['elephant', 'duck', 'pig'], 'Con thỏ có đôi tai dài và nhảy cóc.'),
  animalRow('Which animal has a long nose?', 'elephant', ['monkey', 'rabbit', 'cow'], 'Con voi có chiếc vòi dài.'),
  animalRow('Which animal likes bananas?', 'monkey', ['fish', 'duck', 'pig'], 'Con khỉ thích ăn chuối.'),
  animalRow('Which animal says "oink"?', 'pig', ['cow', 'cat', 'dog'], 'Con lợn kêu "ủn ỉn".'),
];

// ---------- Grade 2 banks ----------
const SCHOOL: Word[] = [
  w('pencil', 'bút chì', '✏️'), w('pen', 'bút mực', '🖊️'), w('book', 'quyển sách', '📖'), w('bag', 'cái cặp', '🎒'),
  w('ruler', 'thước kẻ', '📏'), w('scissors', 'cái kéo', '✂️'), w('crayon', 'bút sáp màu', '🖍️'), w('notebook', 'quyển vở', '📓'),
  w('chair', 'cái ghế', '🪑'),
];
const BODY: Word[] = [
  w('eye', 'mắt', '👁️'), w('ear', 'tai', '👂'), w('nose', 'mũi', '👃'), w('mouth', 'miệng', '👄'),
  w('hand', 'bàn tay', '✋'), w('foot', 'bàn chân', '🦶'), w('leg', 'cái chân', '🦵'), w('arm', 'cánh tay', '💪'),
];
const FEELINGS: Word[] = [
  w('happy', 'vui', '😊'), w('sad', 'buồn', '😢'), w('angry', 'giận', '😠'), w('tired', 'mệt', '😴'),
  w('scared', 'sợ', '😨'), w('sick', 'ốm', '🤒'), w('hot', 'nóng', '🥵'), w('cold', 'lạnh', '🥶'),
];
const FOOD: Word[] = [
  w('apple', 'quả táo', '🍎'), w('banana', 'quả chuối', '🍌'), w('bread', 'bánh mì', '🍞'), w('rice', 'cơm', '🍚'),
  w('egg', 'quả trứng', '🥚'), w('cake', 'bánh ngọt', '🍰'), w('cheese', 'phô mai', '🧀'), w('ice cream', 'kem', '🍦'),
  w('milk', 'sữa', '🥛'), w('juice', 'nước ép', '🧃'), w('water', 'nước', '💧'), w('orange', 'quả cam', '🍊'),
];
const VERBS: Word[] = [
  w('run', 'chạy', '🏃'), w('walk', 'đi bộ', '🚶'), w('swim', 'bơi', '🏊'), w('dance', 'nhảy múa', '💃'),
  w('sing', 'hát', '🎤'), w('read', 'đọc', '📖'), w('write', 'viết', '✍️'), w('sleep', 'ngủ', '😴'),
  w('jump', 'nhảy', '🤸'), w('draw', 'vẽ', '🎨'),
];
const TOYS: (Word & { pl: string })[] = [
  { ...w('ball', 'quả bóng', '⚽'), pl: 'balls' }, { ...w('doll', 'búp bê', '🪆'), pl: 'dolls' },
  { ...w('robot', 'rô-bốt', '🤖'), pl: 'robots' }, { ...w('car', 'xe ô tô', '🚗'), pl: 'cars' },
  { ...w('kite', 'con diều', '🪁'), pl: 'kites' }, { ...w('teddy bear', 'gấu bông', '🧸'), pl: 'teddy bears' },
  { ...w('train', 'tàu hỏa', '🚂'), pl: 'trains' }, { ...w('bike', 'xe đạp', '🚲'), pl: 'bikes' },
  { ...w('drum', 'cái trống', '🥁'), pl: 'drums' },
];

const rows = (list: [string, string, string[], string][]): Row[] => list.map(([f, a, wr, h]) => ({ f, a, w: wr, h }));

const SCHOOL_USE = rows([
  ['I write with a ___.', 'pencil', ['book', 'ruler', 'bag'], 'Con dùng cái gì để viết?'],
  ['I carry my books in my ___.', 'bag', ['pen', 'ruler', 'crayon'], 'Sách được đựng trong cái cặp.'],
  ['I cut paper with ___.', 'scissors', ['ruler', 'book', 'pencil'], 'Cắt giấy bằng cái kéo.'],
  ['I draw with a ___.', 'crayon', ['chair', 'bag', 'notebook'], 'Vẽ tranh bằng bút sáp màu.'],
  ['I sit on a ___.', 'chair', ['bag', 'pencil', 'book'], 'Ngồi trên cái ghế.'],
  ['I read a ___.', 'book', ['chair', 'scissors', 'ruler'], 'Đọc một quyển sách.'],
  ['I measure with a ___.', 'ruler', ['pencil', 'book', 'bag'], 'Đo độ dài bằng thước kẻ.'],
  ['I write my homework in a ___.', 'notebook', ['chair', 'scissors', 'crayon'], 'Viết bài tập về nhà vào quyển vở.'],
  ['Please open your ___.', 'book', ['chair', 'pencil', 'ruler'], 'Mở quyển sách ra.'],
]);
const BODY_USE = rows([
  ['I see with my ___.', 'eyes', ['ears', 'nose', 'hands'], 'Con nhìn bằng mắt.'],
  ['I hear with my ___.', 'ears', ['eyes', 'mouth', 'feet'], 'Con nghe bằng tai.'],
  ['I smell with my ___.', 'nose', ['eyes', 'ears', 'hands'], 'Con ngửi bằng mũi.'],
  ['I eat with my ___.', 'mouth', ['ears', 'feet', 'nose'], 'Con ăn bằng miệng.'],
  ['I clap my ___.', 'hands', ['eyes', 'feet', 'nose'], 'Con vỗ tay.'],
  ['I walk with my ___.', 'legs', ['ears', 'eyes', 'hands'], 'Con đi bằng đôi chân.'],
  ['I kick a ball with my ___.', 'foot', ['ear', 'eye', 'nose'], 'Con đá bóng bằng chân.'],
  ['I wave with my ___.', 'hand', ['nose', 'foot', 'ear'], 'Con vẫy chào bằng tay.'],
]);
const FOOD_USE = rows([
  ['We drink ___.', 'milk', ['bread', 'rice', 'egg'], 'Ta uống sữa, không uống bánh mì hay cơm.'],
  ['We eat ___.', 'bread', ['milk', 'juice', 'water'], 'Bánh mì để ăn, sữa và nước để uống.'],
  ['I drink ___ when I am thirsty.', 'water', ['cake', 'bread', 'rice'], 'Khát nước thì uống nước.'],
  ['A ___ is a fruit.', 'banana', ['bread', 'rice', 'cheese'], 'Chuối là một loại trái cây.'],
  ['We eat ___ with fish and vegetables.', 'rice', ['juice', 'milk', 'cake'], 'Ăn cơm với cá và rau.'],
  ['___ is sweet and cold.', 'Ice cream', ['Bread', 'Rice', 'Egg'], 'Kem thì ngọt và lạnh.'],
  ['A chicken lays an ___.', 'egg', ['apple', 'milk', 'cake'], 'Con gà đẻ ra quả trứng.'],
  ['I drink orange ___.', 'juice', ['bread', 'rice', 'cake'], 'Nước cam ép là "orange juice".'],
  ['At a birthday party, I eat a ___.', 'cake', ['water', 'milk', 'juice'], 'Bữa tiệc sinh nhật có bánh ngọt.'],
]);
const VERB_USE = rows([
  ['Fish can ___.', 'swim', ['fly', 'read', 'dance'], 'Cá biết bơi.'],
  ['Birds can ___.', 'fly', ['swim', 'read', 'write'], 'Chim biết bay.'],
  ['I ___ a book.', 'read', ['swim', 'jump', 'sleep'], 'Con đọc một quyển sách.'],
  ['I ___ at night.', 'sleep', ['swim', 'run', 'dance'], 'Buổi tối con đi ngủ.'],
  ['I can ___ a song.', 'sing', ['swim', 'jump', 'walk'], 'Con biết hát một bài hát.'],
  ['I ___ with my pencil.', 'write', ['swim', 'run', 'sleep'], 'Con viết bằng bút chì.'],
  ['I ___ to school.', 'walk', ['sleep', 'swim', 'read'], 'Con đi bộ đến trường.'],
  ["Let's ___! The music is nice.", 'dance', ['sleep', 'read', 'swim'], 'Nhạc hay thì nhảy múa.'],
  ['The rabbit can ___.', 'jump', ['read', 'write', 'sing'], 'Con thỏ biết nhảy.'],
]);

const countToys: Maker = ({ r, i }) => {
  const t = TOYS[i % TOYS.length];
  const n = randInt(r, 1, 6);
  const phrase = (k: number) => `${NUM[k]} ${k === 1 ? t.en : t.pl}`;
  return {
    prompt: 'Có bao nhiêu? (How many?)',
    visual: { kind: 'objects', emoji: t.e, groups: [{ count: n }] },
    answer: phrase(n),
    wrong: [n - 1, n + 1, n + 2, n - 2].filter((k) => k >= 1 && k <= 8 && k !== n).slice(0, 3).map(phrase),
    hint: `Đếm số đồ chơi rồi nói: ${NUM[n]}. Từ nhiều hơn 1 thì thêm "s".`,
    explain: `Có ${n} ${t.vi}: "${phrase(n)}".`,
  };
};

const d = (name: string, desc: string, diff: 1 | 2 | 3 | 4 | 5, make: Maker): SkillDef => skill(name, desc, diff, make);

export const englishGrade1: Record<string, SkillDef[]> = {
  'g1-e-t1': [
    d('Chữ cái A–Z và thứ tự bảng chữ cái', 'Chữ đứng trước, đứng sau; chữ hoa và chữ thường', 1, mix([letterOrder, letterCase])),
    d('Âm đầu của từ (Phonics)', 'Nhìn hình đoán chữ cái đầu tiên của từ', 2, firstLetter),
    d('Ghép chữ cái với từ', 'Tìm từ bắt đầu bằng một chữ cái cho trước', 2, startsWith),
  ],
  'g1-e-t2': [
    d('Đếm và gọi tên số 1–10', 'Đếm đồ vật và nói số bằng tiếng Anh', 1, countToWord),
    d('Số và chữ: one, two, three...', 'Đổi giữa chữ số và từ chỉ số', 1, digitWord),
    d('Số đứng trước, số đứng sau, số lớn hơn', 'What number comes after six?', 2, numOrder),
  ],
  'g1-e-t3': [
    d('Nhận biết màu sắc (colors)', 'Nhìn ô màu và gọi tên màu bằng tiếng Anh', 1, swatchToWord),
    d('Chọn đúng màu và màu của đồ vật', 'Which one is red? What color is a banana?', 1, mix([wordToSwatch, objectColor])),
    d('Hình khối (shapes)', 'circle, square, triangle, rectangle', 1, mix([shapeToWord, wordToShape])),
  ],
  'g1-e-t4': [
    d('Các thành viên trong gia đình', 'mom, dad, brother, sister, baby, grandma, grandpa', 1, mix([picToWord(FAMILY), enToVi(FAMILY)])),
    d('Chọn hình và dịch từ về gia đình', 'Nối từ tiếng Anh với hình và nghĩa tiếng Việt', 1, mix([wordToPic(FAMILY), viToEn(FAMILY)])),
    d('Lời chào và giới thiệu', 'Hello! How are you? What is your name?', 2, fromRows(GREETINGS, REPLY)),
  ],
  'g1-e-t5': [
    d('Các con vật quen thuộc', 'dog, cat, bird, fish, rabbit, duck...', 1, picToWord(ANIMALS)),
    d('Chọn hình con vật', 'Nghe tên con vật và chọn đúng hình', 1, wordToPic(ANIMALS)),
    d('Con vật kêu thế nào, sống ở đâu?', 'meow, woof, moo, quack; fly, swim', 2, fromRows(ANIMAL_FACTS, 'Chọn con vật đúng:')),
  ],
};

export const englishGrade2: Record<string, SkillDef[]> = {
  'g2-e-t1': [
    d('Đồ dùng học tập', 'pencil, pen, book, bag, ruler, scissors...', 1, picToWord(SCHOOL)),
    d('Chọn hình đồ dùng học tập', 'Nối từ với hình và nghĩa', 1, mix([wordToPic(SCHOOL), viToEn(SCHOOL)])),
    d('Dùng đồ dùng để làm gì?', 'I write with a pencil.', 2, fromRows(SCHOOL_USE, FILL)),
  ],
  'g2-e-t2': [
    d('Các bộ phận cơ thể', 'eye, ear, nose, mouth, hand, foot...', 1, picToWord(BODY)),
    d('Cảm xúc (feelings)', 'happy, sad, angry, tired, scared...', 1, mix([picToWord(FEELINGS), wordToPic(FEELINGS)])),
    d('Con dùng bộ phận nào để làm gì?', 'I see with my eyes.', 2, fromRows(BODY_USE, FILL)),
  ],
  'g2-e-t3': [
    d('Đồ ăn (food)', 'apple, banana, bread, rice, egg, cake...', 1, picToWord(FOOD)),
    d('Chọn hình đồ ăn, đồ uống', 'Nối từ với hình và nghĩa', 1, mix([wordToPic(FOOD), viToEn(FOOD)])),
    d('Ăn gì, uống gì?', 'We drink milk. We eat bread.', 2, fromRows(FOOD_USE, FILL)),
  ],
  'g2-e-t4': [
    d('Các động từ hành động', 'run, walk, swim, dance, sing, read...', 1, picToWord(VERBS)),
    d('Chọn hình hành động', 'Nối động từ với hình và nghĩa', 1, mix([wordToPic(VERBS), viToEn(VERBS)])),
    d('Câu đơn giản với động từ', 'Fish can swim. I read a book.', 2, fromRows(VERB_USE, FILL)),
  ],
  'g2-e-t5': [
    d('Đồ chơi (toys)', 'ball, doll, robot, car, kite, teddy bear...', 1, picToWord(TOYS)),
    d('Chọn hình đồ chơi', 'Nối từ với hình và nghĩa', 1, mix([wordToPic(TOYS), viToEn(TOYS)])),
    d('Đếm đồ chơi: one ball, two balls', 'Số lượng và số nhiều thêm "s"', 2, countToys),
  ],
};

export type { Draft };
