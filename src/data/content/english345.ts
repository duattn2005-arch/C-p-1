import { Maker, SkillDef, pick, randInt, sample, shuffle } from './core.js';
import { Row, Word, enToVi, fromRows, mix, picToWord, skill, w, wordToPic } from './englishKit.js';

// Grades 3-5 English (Global Success style topics). Instructions in Vietnamese, sentences in English.

const FILL = 'Chọn từ đúng điền vào chỗ trống:';
const REPLY = 'Chọn câu trả lời đúng:';
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

const rows = (list: [string, string, string[], string][], sub?: string): Row[] => list.map(([f, a, wr, h]) => ({ f, a, w: wr, h, sub }));
const d = (name: string, desc: string, diff: 1 | 2 | 3 | 4 | 5, make: Maker): SkillDef => skill(name, desc, diff, make);

// ---------- Grade 3, topic 1: Daily routines & time ----------
const ROUTINES: Word[] = [
  w('get up', 'thức dậy', '⏰'), w('brush my teeth', 'đánh răng', '🪥'), w('have breakfast', 'ăn sáng', '🥣'),
  w('go to school', 'đi học', '🏫'), w('do my homework', 'làm bài tập', '📝'), w('watch TV', 'xem ti vi', '📺'),
  w('take a shower', 'đi tắm', '🚿'), w('go to bed', 'đi ngủ', '🛏️'),
];

const timeEn = (h: number, m: number) =>
  m === 0 ? `It's ${h} o'clock.` : m === 30 ? `It's half past ${h}.` : m === 15 ? `It's quarter past ${h}.` : `It's ${h}:${String(m).padStart(2, '0')}.`;

const clockEnglish: Maker = ({ r, i }) => {
  const h = randInt(r, 1, 12);
  const m = pick(r, i < 4 ? [0, 30] : [0, 15, 30]);
  const ans = timeEn(h, m);
  const hn = (x: number) => ((x - 1 + 12) % 12) + 1;
  return {
    prompt: 'What time is it? (Mấy giờ rồi?)',
    visual: { kind: 'clock', hour: h, minute: m },
    answer: ans,
    wrong: [...new Set([timeEn(hn(h + 1), m), timeEn(hn(h - 1), m), timeEn(h, m === 0 ? 30 : 0), timeEn(h, m === 15 ? 30 : 15)])].filter((x) => x !== ans),
    hint: "o'clock: kim dài chỉ số 12. half past: kim dài chỉ số 6. quarter past: kim dài chỉ số 3.",
    explain: `${ans}`,
  };
};

const ROUTINE_TIMES: { act: string; time: string; wrong: string[] }[] = [
  { act: 'I get up', time: "6 o'clock", wrong: ['midnight', '10 p.m.', '2 p.m.'] },
  { act: 'I have breakfast', time: '6:30 a.m.', wrong: ['midnight', '11 p.m.', '9 p.m.'] },
  { act: 'I go to school', time: "7 o'clock", wrong: ['midnight', '10 p.m.', '3 a.m.'] },
  { act: 'I have lunch', time: '11:30 a.m.', wrong: ['midnight', '6 a.m.', '9 p.m.'] },
  { act: 'I do my homework', time: '7 p.m.', wrong: ['midnight', '3 a.m.', '4 a.m.'] },
  { act: 'I go to bed', time: '9 p.m.', wrong: ['7 a.m.', 'noon', '3 p.m.'] },
  { act: 'I have dinner', time: '6 p.m.', wrong: ['6 a.m.', '3 a.m.', 'midnight'] },
  { act: 'I come home from school', time: '4 p.m.', wrong: ['4 a.m.', 'midnight', '7 a.m.'] },
];

const routineTime: Maker = ({ i }) => {
  const row = ROUTINE_TIMES[i % ROUTINE_TIMES.length];
  return {
    prompt: 'Chọn thời gian hợp lý nhất:',
    formula: `${row.act} at ___.`,
    answer: row.time,
    wrong: row.wrong,
    hint: 'Nghĩ xem em thường làm việc này lúc mấy giờ.',
    explain: `${row.act} at ${row.time}.`,
  };
};

const ROUTINE_SENT: Row[] = rows([
  ['I ___ up at six o\'clock.', 'get', ['go', 'take', 'have'], 'get up = thức dậy.'],
  ['I ___ breakfast at seven.', 'have', ['get', 'go', 'do'], 'have breakfast = ăn sáng.'],
  ['I ___ to school by bike.', 'go', ['have', 'get', 'take'], 'go to school = đi học.'],
  ['I ___ my homework in the evening.', 'do', ['go', 'have', 'brush'], 'do my homework = làm bài tập.'],
  ['I ___ my teeth every morning.', 'brush', ['have', 'do', 'take'], 'brush my teeth = đánh răng.'],
  ['I ___ TV after dinner.', 'watch', ['do', 'go', 'get'], 'watch TV = xem ti vi.'],
  ['I ___ a shower before bed.', 'take', ['have', 'do', 'watch'], 'take a shower = đi tắm.'],
  ['I go to ___ at nine p.m.', 'bed', ['school', 'breakfast', 'shower'], 'go to bed = đi ngủ.'],
]);

// ---------- Grade 3, topic 2: Clothes & weather ----------
const CLOTHES: Word[] = [
  w('shirt', 'áo sơ mi', '👕'), w('dress', 'váy liền', '👗'), w('pants', 'quần dài', '👖'), w('shoes', 'đôi giày', '👟'),
  w('hat', 'cái mũ', '👒'), w('socks', 'đôi tất', '🧦'), w('jacket', 'áo khoác', '🧥'), w('scarf', 'khăn quàng', '🧣'),
  w('gloves', 'găng tay', '🧤'),
];
const WEATHER: Word[] = [
  w("It's sunny.", 'Trời nắng.', '☀️'), w("It's rainy.", 'Trời mưa.', '🌧️'), w("It's cloudy.", 'Trời nhiều mây.', '☁️'),
  w("It's windy.", 'Trời có gió.', '💨'), w("It's snowy.", 'Trời có tuyết.', '❄️'), w("It's hot.", 'Trời nóng.', '🥵'),
  w("It's cold.", 'Trời lạnh.', '🥶'), w("It's stormy.", 'Trời có bão.', '⛈️'),
];
const WEATHER_WEAR = rows([
  ["It's rainy. I need an ___.", 'umbrella', ['scarf', 'sunglasses', 'kite'], 'Trời mưa cần cái ô (umbrella).'],
  ["It's cold. I wear a ___.", 'jacket', ['hat', 'T-shirt', 'sandals'], 'Trời lạnh thì mặc áo khoác.'],
  ["It's sunny and hot. I wear a ___.", 'hat', ['scarf', 'gloves', 'jacket'], 'Trời nắng thì đội mũ.'],
  ["It's snowy. I wear ___.", 'gloves', ['sandals', 'shorts', 'sunglasses'], 'Trời tuyết thì đeo găng tay.'],
  ["It's windy. I fly my ___.", 'kite', ['umbrella', 'scarf', 'jacket'], 'Trời có gió thì thả diều (kite).'],
  ['I wear ___ on my feet.', 'shoes', ['gloves', 'hat', 'scarf'], 'Đi giày ở chân.'],
  ['I wear a ___ around my neck when it is cold.', 'scarf', ['shoes', 'socks', 'hat'], 'Quàng khăn quanh cổ.'],
  ['Girls can wear a ___.', 'dress', ['gloves', 'scarf', 'umbrella'], 'Bạn nữ có thể mặc váy (dress).'],
  ["What's the weather like? — It's ___ (☀️).", 'sunny', ['rainy', 'snowy', 'stormy'], 'Hình mặt trời là sunny.'],
]);

// ---------- Grade 3, topic 3: Places in town ----------
const PLACES: Word[] = [
  w('park', 'công viên', '🌳'), w('school', 'trường học', '🏫'), w('hospital', 'bệnh viện', '🏥'),
  w('supermarket', 'siêu thị', '🛒'), w('library', 'thư viện', '📚'), w('cinema', 'rạp chiếu phim', '🎬'),
  w('bakery', 'tiệm bánh', '🥖'), w('post office', 'bưu điện', '📮'), w('bank', 'ngân hàng', '🏦'),
];
const PLACE_USE = rows([
  ['You read books at the ___.', 'library', ['bakery', 'bank', 'cinema'], 'Đọc sách ở thư viện.'],
  ['You see a doctor at the ___.', 'hospital', ['park', 'school', 'bakery'], 'Khám bệnh ở bệnh viện.'],
  ['You watch a film at the ___.', 'cinema', ['hospital', 'library', 'bank'], 'Xem phim ở rạp chiếu phim.'],
  ['You buy bread at the ___.', 'bakery', ['library', 'hospital', 'post office'], 'Mua bánh mì ở tiệm bánh.'],
  ['You buy food and drinks at the ___.', 'supermarket', ['library', 'school', 'hospital'], 'Mua đồ ăn ở siêu thị.'],
  ['You post a letter at the ___.', 'post office', ['bakery', 'park', 'cinema'], 'Gửi thư ở bưu điện.'],
  ['Children study at ___.', 'school', ['the bank', 'the cinema', 'the bakery'], 'Học sinh học ở trường.'],
  ['You keep your money in the ___.', 'bank', ['park', 'library', 'bakery'], 'Gửi tiền ở ngân hàng.'],
  ['You play and run in the ___.', 'park', ['hospital', 'bank', 'library'], 'Chơi và chạy ở công viên.'],
]);

const thereIs: Maker = ({ r, i }) => {
  const things: [string, string][] = [['park', 'parks'], ['school', 'schools'], ['library', 'libraries'], ['bakery', 'bakeries'], ['hospital', 'hospitals'], ['cinema', 'cinemas']];
  const [one, many] = things[i % things.length];
  const n = i % 2 === 0 ? 1 : randInt(r, 2, 5);
  const place = ['in my town', 'near my house', 'in my city'][i % 3];
  return {
    prompt: 'Chọn từ đúng điền vào chỗ trống:',
    formula: n === 1 ? `There ___ a ${one} ${place}.` : `There ___ ${NUM[n]} ${many} ${place}.`,
    answer: n === 1 ? 'is' : 'are',
    wrong: n === 1 ? ['are', 'am', 'be'] : ['is', 'am', 'be'],
    hint: 'There is + 1 vật (số ít). There are + nhiều vật (số nhiều).',
    explain: n === 1 ? `There is a ${one} ${place}.` : `There are ${NUM[n]} ${many} ${place}.`,
  };
};

// ---------- Grade 3, topic 4: Present continuous ----------
const ACTIONS: { base: string; ing: string; e: string; vi: string }[] = [
  { base: 'run', ing: 'running', e: '🏃', vi: 'chạy' }, { base: 'swim', ing: 'swimming', e: '🏊', vi: 'bơi' },
  { base: 'read', ing: 'reading', e: '📖', vi: 'đọc' }, { base: 'dance', ing: 'dancing', e: '💃', vi: 'nhảy múa' },
  { base: 'write', ing: 'writing', e: '✍️', vi: 'viết' }, { base: 'play', ing: 'playing', e: '⚽', vi: 'chơi' },
  { base: 'sing', ing: 'singing', e: '🎤', vi: 'hát' }, { base: 'sleep', ing: 'sleeping', e: '😴', vi: 'ngủ' },
  { base: 'cook', ing: 'cooking', e: '🍳', vi: 'nấu ăn' }, { base: 'draw', ing: 'drawing', e: '🎨', vi: 'vẽ' },
];
const SUBJECTS: [string, string][] = [['I', 'am'], ['He', 'is'], ['She', 'is'], ['We', 'are'], ['They', 'are'], ['You', 'are'], ['The cat', 'is'], ['My friends', 'are']];

const whatDoing: Maker = ({ r, i }) => {
  const a = ACTIONS[i % ACTIONS.length];
  const sub = pick(r, [['He', 'is'], ['She', 'is'], ['They', 'are']]);
  const sent = (x: typeof a) => `${sub[0]} ${sub[1]} ${x.ing}.`;
  const others = sample(r, ACTIONS.filter((x) => x.base !== a.base), 3);
  return {
    prompt: 'Nhìn hình. Chọn câu đúng:',
    visual: { kind: 'picture', emoji: a.e },
    answer: sent(a),
    wrong: others.map(sent),
    hint: 'Hành động đang diễn ra: am / is / are + động từ thêm -ing.',
    explain: `${sent(a)} (${a.vi})`,
  };
};

const addIng: Maker = ({ r, i }) => {
  const a = ACTIONS[i % ACTIONS.length];
  const wrongForms = [a.base + 'ing', a.base + 'ning', a.base.replace(/e$/, '') + 'eing', a.base + 'ed', a.base + 'ping'];
  return {
    prompt: `Viết dạng -ing của động từ "${a.base}" (${a.vi}):`,
    answer: a.ing,
    wrong: wrongForms.filter((x) => x !== a.ing),
    hint: 'Động từ tận cùng bằng e thì bỏ e rồi thêm -ing. Động từ ngắn có 1 nguyên âm + 1 phụ âm thì gấp đôi phụ âm cuối (run → running).',
    explain: `${a.base} → ${a.ing}.`,
  };
};

const beVerb: Maker = ({ r, i }) => {
  const [s, be] = SUBJECTS[i % SUBJECTS.length];
  const a = pick(r, ACTIONS);
  return {
    prompt: 'Chọn am / is / are đúng:',
    formula: `${s} ___ ${a.ing} now.`,
    answer: be,
    wrong: ['am', 'is', 'are'].filter((x) => x !== be),
    hint: 'I → am; he / she / it / số ít → is; you / we / they / số nhiều → are.',
    explain: `${s} ${be} ${a.ing} now.`,
  };
};

// ---------- Grade 3, topic 5: Can / can't ----------
const ABILITY: Record<string, { fly: boolean; swim: boolean; run: boolean; jump: boolean; climb: boolean; read: boolean }> = {
  bird: { fly: true, swim: false, run: false, jump: true, climb: true, read: false },
  fish: { fly: false, swim: true, run: false, jump: false, climb: false, read: false },
  dog: { fly: false, swim: true, run: true, jump: true, climb: false, read: false },
  monkey: { fly: false, swim: false, run: true, jump: true, climb: true, read: false },
  elephant: { fly: false, swim: true, run: true, jump: false, climb: false, read: false },
  rabbit: { fly: false, swim: false, run: true, jump: true, climb: false, read: false },
  baby: { fly: false, swim: false, run: false, jump: false, climb: false, read: false },
  student: { fly: false, swim: true, run: true, jump: true, climb: true, read: true },
};
const ABIL_VI: Record<string, string> = { fly: 'bay', swim: 'bơi', run: 'chạy', jump: 'nhảy', climb: 'leo', read: 'đọc' };

const canCant: Maker = ({ r, i }) => {
  const animals = Object.keys(ABILITY);
  const who = animals[i % animals.length];
  const verbs = Object.keys(ABIL_VI);
  const verb = verbs[(i * 5 + randInt(r, 0, 5)) % verbs.length];
  const can = (ABILITY[who] as Record<string, boolean>)[verb];
  const subj = who === 'student' ? 'A student' : `A ${who}`;
  return {
    prompt: 'Chọn can hoặc can\'t:',
    formula: `${subj} ___ ${verb}.`,
    answer: can ? 'can' : "can't",
    wrong: [can ? "can't" : 'can', 'are', 'is'].slice(0, 3),
    hint: `${verb} = ${ABIL_VI[verb]}. Nghĩ xem ${who === 'student' ? 'học sinh' : `con ${who}`} có làm được không.`,
    explain: `${subj} ${can ? 'can' : "can't"} ${verb}.`,
  };
};

const abilityPic: Maker = ({ r, i }) => {
  const list: [string, string, string, string][] = [
    ['🐦', 'A bird', 'fly', 'bay'], ['🐟', 'A fish', 'swim', 'bơi'], ['🐒', 'A monkey', 'climb', 'leo'],
    ['🐰', 'A rabbit', 'jump', 'nhảy'], ['🐕', 'A dog', 'run', 'chạy'], ['👧', 'A girl', 'sing', 'hát'],
    ['👦', 'A boy', 'dance', 'nhảy múa'], ['🦆', 'A duck', 'swim', 'bơi'],
  ];
  const [e, who, verb, vi] = list[i % list.length];
  const all = ['fly', 'swim', 'climb', 'jump', 'run', 'sing', 'dance'];
  return {
    prompt: 'Nhìn hình. Chọn từ đúng:',
    visual: { kind: 'picture', emoji: e },
    formula: `${who} can ___.`,
    answer: verb,
    wrong: sample(r, all.filter((x) => x !== verb), 3),
    hint: `${who.toLowerCase()} có thể ${vi}.`,
    explain: `${who} can ${verb} (${vi}).`,
  };
};

const canQA: Row[] = rows([
  ['Can you swim? — Yes, I ___.', 'can', ["can't", 'am', 'do'], 'Trả lời ngắn: Yes, I can.'],
  ['Can she sing? — No, she ___.', "can't", ['can', 'is', 'does'], 'Trả lời ngắn: No, she can\'t.'],
  ['Can a fish fly? — No, it ___.', "can't", ['can', 'is', 'does'], 'Cá không biết bay.'],
  ['Can birds fly? — Yes, they ___.', 'can', ["can't", 'are', 'do'], 'Chim biết bay.'],
  ['___ he play football? — Yes, he can.', 'Can', ['Is', 'Does', 'Are'], 'Hỏi khả năng: Can + chủ ngữ + động từ?'],
  ['___ you speak English? — Yes, I can.', 'Can', ['Are', 'Do', 'Is'], 'Can you ...? hỏi bạn có biết ... không.'],
  ['I can ___ a bike.', 'ride', ['riding', 'rides', 'to ride'], 'Sau can là động từ nguyên mẫu (không thêm -s, -ing).'],
  ['She can ___ very well.', 'dance', ['dances', 'dancing', 'to dance'], 'Sau can là động từ nguyên mẫu.'],
]);

// ---------- Grade 4, topic 1: Countries & nationalities ----------
const COUNTRIES: { c: string; n: string; e: string; vi: string }[] = [
  { c: 'Vietnam', n: 'Vietnamese', e: '🇻🇳', vi: 'Việt Nam' }, { c: 'America', n: 'American', e: '🇺🇸', vi: 'Mỹ' },
  { c: 'England', n: 'English', e: '🇬🇧', vi: 'Anh' }, { c: 'Japan', n: 'Japanese', e: '🇯🇵', vi: 'Nhật Bản' },
  { c: 'Australia', n: 'Australian', e: '🇦🇺', vi: 'Úc' }, { c: 'China', n: 'Chinese', e: '🇨🇳', vi: 'Trung Quốc' },
  { c: 'Thailand', n: 'Thai', e: '🇹🇭', vi: 'Thái Lan' }, { c: 'Singapore', n: 'Singaporean', e: '🇸🇬', vi: 'Xin-ga-po' },
  { c: 'Malaysia', n: 'Malaysian', e: '🇲🇾', vi: 'Ma-lai-xi-a' }, { c: 'Korea', n: 'Korean', e: '🇰🇷', vi: 'Hàn Quốc' },
  { c: 'Canada', n: 'Canadian', e: '🇨🇦', vi: 'Ca-na-đa' }, { c: 'France', n: 'French', e: '🇫🇷', vi: 'Pháp' },
];

const flagCountry: Maker = ({ r, i }) => {
  const k = COUNTRIES[i % COUNTRIES.length];
  return {
    prompt: 'Đây là quốc kỳ của nước nào? (Which country is this?)',
    visual: { kind: 'picture', emoji: k.e },
    answer: k.c,
    wrong: sample(r, COUNTRIES.filter((x) => x.c !== k.c), 3).map((x) => x.c),
    hint: `Đây là cờ của ${k.vi}.`,
    explain: `${k.e} là cờ của ${k.c} (${k.vi}).`,
  };
};

const nationality: Maker = ({ r, i }) => {
  const k = COUNTRIES[i % COUNTRIES.length];
  const kind = i % 2;
  if (kind === 0) {
    return {
      prompt: 'Chọn quốc tịch đúng:',
      formula: `She is from ${k.c}. She is ___.`,
      answer: k.n,
      wrong: sample(r, COUNTRIES.filter((x) => x.n !== k.n), 3).map((x) => x.n),
      hint: `Quốc tịch của người ${k.vi} viết hoa chữ cái đầu.`,
      explain: `${k.c} → ${k.n}.`,
    };
  }
  return {
    prompt: 'Chọn tên nước đúng:',
    formula: `He is ${k.n}. He is from ___.`,
    answer: k.c,
    wrong: sample(r, COUNTRIES.filter((x) => x.c !== k.c), 3).map((x) => x.c),
    hint: `${k.n} = người ${k.vi}.`,
    explain: `${k.n} → ${k.c}.`,
  };
};

const COUNTRY_QA: Row[] = rows([
  ['Where are you from? — I am ___ Vietnam.', 'from', ['in', 'at', 'to'], 'be from + tên nước = đến từ nước nào.'],
  ['What nationality are you? — I am ___.', 'Vietnamese', ['Vietnam', 'in Vietnam', 'from'], 'Hỏi quốc tịch, trả lời bằng tính từ quốc tịch.'],
  ['Where is he from? — He ___ from Japan.', 'is', ['am', 'are', 'be'], 'He → is.'],
  ['Where are they from? — They ___ from Australia.', 'are', ['is', 'am', 'be'], 'They → are.'],
  ['She is from America. She is ___.', 'American', ['America', 'Americas', 'Americans'], 'America → American.'],
  ['My friend is from Thailand. He is ___.', 'Thai', ['Thailand', 'Thais', 'Thailander'], 'Thailand → Thai.'],
  ['I am from Vietnam. I am ___.', 'Vietnamese', ['Vietnam', 'Vietnames', 'Vietnams'], 'Vietnam → Vietnamese.'],
  ['Are you Japanese? — No, I am ___.', 'Korean', ['Korea', 'from', 'Koreas'], 'Trả lời bằng tính từ quốc tịch.'],
]);

// ---------- Grade 4, topic 2: Days, months & birthdays ----------
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const ORD_SHORT = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

const dayMonthOrder: Maker = ({ r, i }) => {
  const kind = i % 3;
  if (kind === 0) {
    const k = randInt(r, 0, 6);
    const after = r() < 0.5;
    const ans = DAYS[(k + (after ? 1 : 6)) % 7];
    return {
      prompt: `What day comes ${after ? 'after' : 'before'} ${DAYS[k]}?`,
      answer: ans,
      wrong: sample(r, DAYS.filter((x) => x !== ans && x !== DAYS[k]), 3),
      hint: `Thứ tự: ${DAYS.join(', ')}.`,
      explain: `${after ? `${DAYS[k]}, ${ans}` : `${ans}, ${DAYS[k]}`}.`,
    };
  }
  const k = randInt(r, 0, 11);
  const after = r() < 0.5;
  const ans = MONTHS[(k + (after ? 1 : 11)) % 12];
  return {
    prompt: `What month comes ${after ? 'after' : 'before'} ${MONTHS[k]}?`,
    answer: ans,
    wrong: sample(r, MONTHS.filter((x) => x !== ans && x !== MONTHS[k]), 3),
    hint: `Thứ tự các tháng: ${MONTHS.slice(0, 6).join(', ')}...`,
    explain: `${after ? `${MONTHS[k]}, ${ans}` : `${ans}, ${MONTHS[k]}`}.`,
  };
};

const ordinals: Maker = ({ r, i }) => {
  const n = randInt(r, 1, 12);
  if (i % 2 === 0) {
    return {
      prompt: `Số thứ tự ${ORD_SHORT(n)} viết bằng chữ là:`,
      answer: ORD[n],
      wrong: sample(r, ORD.slice(1).filter((x) => x !== ORD[n]), 3),
      hint: 'first, second, third, fourth, fifth...',
      explain: `${ORD_SHORT(n)} = ${ORD[n]}.`,
    };
  }
  return {
    prompt: `"${ORD[n]}" viết bằng số là:`,
    answer: ORD_SHORT(n),
    wrong: sample(r, Array.from({ length: 12 }, (_, k) => ORD_SHORT(k + 1)).filter((x) => x !== ORD_SHORT(n)), 3),
    hint: '1st, 2nd, 3rd, 4th, 5th...',
    explain: `${ORD[n]} = ${ORD_SHORT(n)}.`,
  };
};

const birthday: Maker = ({ r, i }) => {
  const m = MONTHS[randInt(r, 0, 11)];
  const day = randInt(r, 1, 28);
  const kind = i % 4;
  if (kind === 0 || kind === 1) {
    return {
      prompt: 'Chọn giới từ đúng (in / on):',
      formula: kind === 0 ? `My birthday is ___ ${m}.` : `My birthday is ___ ${m} ${ORD_SHORT(day)}.`,
      answer: kind === 0 ? 'in' : 'on',
      wrong: kind === 0 ? ['on', 'at', 'to'] : ['in', 'at', 'to'],
      hint: 'in + tháng. on + ngày cụ thể (có số ngày).',
      explain: kind === 0 ? `My birthday is in ${m}.` : `My birthday is on ${m} ${ORD_SHORT(day)}.`,
    };
  }
  if (kind === 2) {
    return {
      prompt: 'Chọn câu trả lời đúng:',
      formula: 'When is your birthday?',
      answer: `It's in ${m}.`,
      wrong: [`It's on ${m}.`, `It's at ${m}.`, `I'm ${day} years old.`],
      hint: 'When ...? hỏi thời gian. Nói tháng thì dùng "in".',
      explain: `It's in ${m}.`,
    };
  }
  return {
    prompt: 'Chọn câu trả lời đúng:',
    formula: 'What is the date today?',
    answer: `It's the ${ORD_SHORT(day)} of ${m}.`,
    wrong: [`It's ${NUM[Math.min(day, 12)]} ${m}.`, `It's in ${m}.`, `It's ${m} ${day} years.`],
    hint: 'Ngày trong tháng dùng số thứ tự: 1st, 2nd, 3rd, 4th...',
    explain: `It's the ${ORD_SHORT(day)} of ${m}.`,
  };
};

// ---------- Grade 4, topic 3: School subjects & timetable ----------
const SUBJECTS_EN: Word[] = [
  w('Maths', 'môn Toán', '🔢'), w('English', 'môn Tiếng Anh', '🔤'), w('Science', 'môn Khoa học', '🔬'),
  w('Music', 'môn Âm nhạc', '🎵'), w('Art', 'môn Mĩ thuật', '🎨'), w('PE', 'môn Thể dục', '⚽'),
  w('IT', 'môn Tin học', '💻'), w('Vietnamese', 'môn Tiếng Việt', '📖'),
];
const SUBJECT_USE = rows([
  ['We draw pictures in ___ class.', 'Art', ['Maths', 'Music', 'PE'], 'Vẽ tranh ở giờ Mĩ thuật (Art).'],
  ['We sing songs in ___ class.', 'Music', ['Art', 'Science', 'Maths'], 'Hát ở giờ Âm nhạc (Music).'],
  ['We play sports in ___ class.', 'PE', ['Maths', 'English', 'Art'], 'Chơi thể thao ở giờ Thể dục (PE).'],
  ['We do experiments in ___ class.', 'Science', ['Music', 'Art', 'PE'], 'Làm thí nghiệm ở giờ Khoa học.'],
  ['We learn numbers and calculation in ___ class.', 'Maths', ['Music', 'Art', 'PE'], 'Học số và tính toán ở giờ Toán.'],
  ['We use computers in ___ class.', 'IT', ['Art', 'PE', 'Music'], 'Dùng máy tính ở giờ Tin học (IT).'],
  ['We learn words and grammar in ___ class.', 'English', ['PE', 'Art', 'Science'], 'Học từ vựng và ngữ pháp ở giờ Tiếng Anh.'],
  ['We read stories in ___ class.', 'Vietnamese', ['PE', 'Maths', 'IT'], 'Đọc truyện ở giờ Tiếng Việt.'],
]);

const timetable: Maker = ({ r, i }) => {
  const subs = ['Maths', 'English', 'Science', 'Music', 'Art', 'PE', 'IT'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const table = days.map(() => sample(r, subs, 2));
  const k = randInt(r, 0, 4);
  const ask = i % 2 === 0;
  const text = days.map((dy, x) => `${dy}: ${table[x].join(', ')}`).join(' | ');
  if (ask) {
    const ans = table[k][0];
    return {
      prompt: `Đọc thời khóa biểu. What is the FIRST subject on ${days[k]}?`,
      subPrompt: text,
      answer: ans,
      wrong: subs.filter((x) => !table[k].includes(x)).slice(0, 3),
      hint: `Tìm dòng của ${days[k]} và đọc môn đầu tiên.`,
      explain: `${days[k]}: ${table[k].join(', ')}. Môn đầu tiên là ${ans}.`,
    };
  }
  const target = table[k][1];
  const dayHas = days.filter((_, x) => table[x].includes(target));
  return {
    prompt: `Đọc thời khóa biểu. When do you have ${target}?`,
    subPrompt: text,
    answer: `On ${dayHas[0]}.`,
    wrong: days.filter((x) => !dayHas.includes(x)).slice(0, 3).map((x) => `On ${x}.`),
    hint: `Tìm môn ${target} trong thời khóa biểu.`,
    explain: `${target} có vào ${dayHas.join(', ')}.`,
  };
};

// ---------- Grade 4, topic 4: was / were ----------
const WAS_SUBJ: [string, string][] = [['I', 'was'], ['He', 'was'], ['She', 'was'], ['It', 'was'], ['We', 'were'], ['You', 'were'], ['They', 'were'], ['My parents', 'were'], ['The cat', 'was']];
const PAST_PLACES = ['at home', 'at school', 'at the zoo', 'in the park', 'at the cinema', 'in the garden', 'at the supermarket', 'at the library'];
const PAST_TIME = ['yesterday', 'last Sunday', 'last night', 'two days ago', 'last week'];

const wasWere: Maker = ({ r, i }) => {
  const [s, be] = WAS_SUBJ[i % WAS_SUBJ.length];
  const place = pick(r, PAST_PLACES);
  const time = pick(r, PAST_TIME);
  return {
    prompt: 'Chọn was hoặc were:',
    formula: `${s} ___ ${place} ${time}.`,
    answer: be,
    wrong: ['was', 'were', 'is', 'are'].filter((x) => x !== be).slice(0, 3),
    hint: 'I / he / she / it / số ít → was. you / we / they / số nhiều → were.',
    explain: `${s} ${be} ${place} ${time}.`,
  };
};

const wasNeg: Maker = ({ r, i }) => {
  const [s, be] = WAS_SUBJ[i % WAS_SUBJ.length];
  const place = pick(r, PAST_PLACES);
  const kind = i % 3;
  if (kind === 0) {
    return {
      prompt: 'Chọn dạng phủ định đúng:',
      formula: `${s} ___ ${place} yesterday.`,
      answer: be === 'was' ? "wasn't" : "weren't",
      wrong: [be === 'was' ? "weren't" : "wasn't", "isn't", "aren't"],
      hint: "was not = wasn't; were not = weren't.",
      explain: `${s} ${be === 'was' ? "wasn't" : "weren't"} ${place} yesterday.`,
    };
  }
  if (kind === 1) {
    const q = s === 'I' ? 'you' : s.toLowerCase();
    const qBe = s === 'I' ? 'Were' : be === 'was' ? 'Was' : 'Were';
    return {
      prompt: 'Chọn từ đúng để hỏi:',
      formula: `___ ${q} ${place} yesterday?`,
      answer: qBe,
      wrong: ['Was', 'Were', 'Is', 'Are'].filter((x) => x !== qBe).slice(0, 3),
      hint: 'Câu hỏi quá khứ với be: Was / Were + chủ ngữ ...?',
      explain: `${qBe} ${q} ${place} yesterday?`,
    };
  }
  return {
    prompt: 'Chọn câu trả lời ngắn đúng:',
    formula: `Were you at school yesterday? — Yes, I ___.`,
    answer: 'was',
    wrong: ['were', 'am', 'did'],
    hint: 'Hỏi với "you" nhưng người trả lời nói về chính mình (I) nên dùng was.',
    explain: 'Were you ...? — Yes, I was.',
  };
};

const pastTime: Maker = ({ r, i }) => {
  const rows2: [string, string, string[]][] = [
    ['I was at the zoo ___.', 'yesterday', ['tomorrow', 'now', 'next week']],
    ['We were at home ___ night.', 'last', ['next', 'every', 'tomorrow']],
    ['She was at school two days ___.', 'ago', ['later', 'next', 'now']],
    ['They were in the park ___ Sunday.', 'last', ['next', 'this', 'every']],
    ['Where were you ___? — I was at home.', 'yesterday', ['tomorrow', 'next week', 'now']],
    ['He was sick ___ week.', 'last', ['next', 'every', 'tomorrow']],
    ['My grandma was at our house ___ Tuesday.', 'last', ['next', 'every', 'tomorrow']],
    ['We were on holiday ___ summer.', 'last', ['next', 'every', 'tomorrow']],
  ];
  const [f, a, wr] = rows2[i % rows2.length];
  return { prompt: FILL, formula: f, answer: a, wrong: wr, hint: 'Chuyện đã xảy ra rồi: yesterday, last ..., ... ago.', explain: f.replace('___', a) };
};

// ---------- Grade 4, topic 5: Animals & comparatives ----------
const HABITAT: Row[] = rows([
  ['A fish lives in the ___.', 'water', ['desert', 'nest', 'farm'], 'Cá sống dưới nước.'],
  ['A camel lives in the ___.', 'desert', ['sea', 'nest', 'river'], 'Lạc đà sống ở sa mạc (desert).'],
  ['A monkey lives in the ___.', 'forest', ['sea', 'desert', 'river'], 'Khỉ sống trong rừng (forest).'],
  ['A cow lives on a ___.', 'farm', ['sea', 'desert', 'tree'], 'Bò sống ở trang trại (farm).'],
  ['A bird lives in a ___.', 'nest', ['sea', 'desert', 'river'], 'Chim sống trong tổ (nest).'],
  ['A polar bear lives in the ___ places.', 'cold', ['hot', 'dry', 'sunny'], 'Gấu bắc cực sống ở nơi lạnh.'],
  ['A crocodile lives in the ___.', 'river', ['desert', 'nest', 'sky'], 'Cá sấu sống ở sông.'],
  ['An owl sleeps in the ___ and hunts at night.', 'day', ['night', 'water', 'sea'], 'Cú ngủ ban ngày.'],
]);

const ADJ: { base: string; comp: string; sup: string; vi: string }[] = [
  { base: 'big', comp: 'bigger', sup: 'the biggest', vi: 'to' }, { base: 'small', comp: 'smaller', sup: 'the smallest', vi: 'nhỏ' },
  { base: 'tall', comp: 'taller', sup: 'the tallest', vi: 'cao' }, { base: 'short', comp: 'shorter', sup: 'the shortest', vi: 'thấp' },
  { base: 'long', comp: 'longer', sup: 'the longest', vi: 'dài' }, { base: 'fast', comp: 'faster', sup: 'the fastest', vi: 'nhanh' },
  { base: 'slow', comp: 'slower', sup: 'the slowest', vi: 'chậm' }, { base: 'heavy', comp: 'heavier', sup: 'the heaviest', vi: 'nặng' },
  { base: 'hot', comp: 'hotter', sup: 'the hottest', vi: 'nóng' }, { base: 'cold', comp: 'colder', sup: 'the coldest', vi: 'lạnh' },
  { base: 'high', comp: 'higher', sup: 'the highest', vi: 'cao (núi)' }, { base: 'old', comp: 'older', sup: 'the oldest', vi: 'già' },
];

const COMPARE_FACTS: { a: string; ea: string; b: string; eb: string; adj: string }[] = [
  { a: 'An elephant', ea: '🐘', b: 'a mouse', eb: '🐭', adj: 'big' },
  { a: 'A giraffe', ea: '🦒', b: 'a dog', eb: '🐶', adj: 'tall' },
  { a: 'A cheetah', ea: '🐆', b: 'a turtle', eb: '🐢', adj: 'fast' },
  { a: 'A turtle', ea: '🐢', b: 'a rabbit', eb: '🐰', adj: 'slow' },
  { a: 'A mouse', ea: '🐭', b: 'an elephant', eb: '🐘', adj: 'small' },
  { a: 'A whale', ea: '🐋', b: 'a fish', eb: '🐟', adj: 'big' },
  { a: 'A snake', ea: '🐍', b: 'a frog', eb: '🐸', adj: 'long' },
  { a: 'An elephant', ea: '🐘', b: 'a cat', eb: '🐱', adj: 'heavy' },
];

const compFormation: Maker = ({ r, i }) => {
  const a = ADJ[i % ADJ.length];
  const wrong = [a.base + 'er', a.base + 'ier', 'more ' + a.base, a.base + 'est', a.base.slice(0, -1) + 'ier'].filter((x) => x !== a.comp);
  return {
    prompt: `Dạng so sánh hơn của "${a.base}" (${a.vi}) là:`,
    answer: a.comp,
    wrong,
    hint: 'Tính từ ngắn: thêm -er. Tận cùng phụ âm đơn sau 1 nguyên âm thì gấp đôi phụ âm (big → bigger). Tận cùng -y thì đổi thành -ier.',
    explain: `${a.base} → ${a.comp}.`,
  };
};

const compSentence: Maker = ({ r, i }) => {
  const f = COMPARE_FACTS[i % COMPARE_FACTS.length];
  const adj = ADJ.find((x) => x.base === f.adj)!;
  return {
    prompt: 'Nhìn hình. Chọn từ đúng điền vào chỗ trống:',
    visual: { kind: 'row', items: [f.ea, f.eb] },
    formula: `${f.a} is ___ than ${f.b}.`,
    answer: adj.comp,
    wrong: sample(r, ADJ.filter((x) => x.base !== f.adj).map((x) => x.comp), 3),
    hint: `So sánh hơn: tính từ + -er + than.`,
    explain: `${f.a} is ${adj.comp} than ${f.b}.`,
  };
};

// ---------- Grade 5, topic 1: Adverbs of frequency ----------
const FREQ = [
  { en: 'always', vi: 'luôn luôn', pct: '100%' }, { en: 'usually', vi: 'thường xuyên', pct: '80%' },
  { en: 'often', vi: 'hay', pct: '60%' }, { en: 'sometimes', vi: 'thỉnh thoảng', pct: '40%' },
  { en: 'never', vi: 'không bao giờ', pct: '0%' },
];
const freqMeaning: Maker = ({ r, i }) => {
  const f = FREQ[i % FREQ.length];
  if (i % 2 === 0) {
    return {
      prompt: `Trạng từ nào chỉ mức độ ${f.pct} (${f.vi})?`,
      answer: f.en,
      wrong: FREQ.filter((x) => x.en !== f.en).map((x) => x.en).slice(0, 3),
      hint: 'always (luôn luôn) > usually > often > sometimes > never (không bao giờ).',
      explain: `${f.en} = ${f.vi} (${f.pct}).`,
    };
  }
  return {
    prompt: `"${f.en}" nghĩa là gì?`,
    answer: f.vi,
    wrong: FREQ.filter((x) => x.en !== f.en).map((x) => x.vi).slice(0, 3),
    hint: 'always > usually > often > sometimes > never.',
    explain: `${f.en} = ${f.vi}.`,
  };
};

// Only the adverbs whose position is fixed before the main verb (and after "be") are used, so every wrong
// option is really wrong ("sometimes" can also open or close a sentence, so it is left out here).
const freqPosition: Maker = ({ r, i }) => {
  const f = ['always', 'usually', 'often', 'never'][i % 4];
  if (i % 2 === 1) {
    const who = pick(r, [['She', 'is'], ['He', 'is'], ['They', 'are'], ['I', 'am']]);
    const adj = pick(r, ['late for school', 'happy at school', 'tired in the evening', 'busy on Monday']);
    const good = `${who[0]} ${who[1]} ${f} ${adj}.`;
    return {
      prompt: 'Chọn câu có trật tự từ đúng:',
      answer: good,
      wrong: [`${who[0]} ${f} ${who[1]} ${adj}.`, `${f} ${who[0]} ${who[1]} ${adj}.`, `${who[0]} ${who[1]} ${adj} ${f}.`],
      hint: 'Với động từ be (am / is / are), trạng từ tần suất đứng SAU be: She is always late.',
      explain: good,
    };
  }
  const who = pick(r, [['She', 'goes', 'go'], ['He', 'plays', 'play'], ['My father', 'drinks', 'drink'], ['Lan', 'walks', 'walk']]);
  const tail = ({ goes: 'to school by bike', plays: 'football on Sunday', drinks: 'coffee', walks: 'to the park' } as Record<string, string>)[who[1]];
  const good = `${who[0]} ${f} ${who[1]} ${tail}.`;
  return {
    prompt: 'Chọn câu có trật tự từ đúng:',
    answer: good,
    wrong: [`${who[0]} ${who[1]} ${f} ${tail}.`, `${f} ${who[0]} ${who[1]} ${tail}.`, `${who[0]} does ${f} ${who[2]} ${tail}.`],
    hint: 'Với động từ thường, trạng từ tần suất đứng TRƯỚC động từ: She usually goes to school.',
    explain: good,
  };
};

const freqHabit: Maker = ({ r, i }) => {
  const list: [string, string, string[]][] = [
    ['I brush my teeth every day. I ___ brush my teeth.', 'always', ['never', 'sometimes', 'rarely']],
    ['He does not eat meat at all. He ___ eats meat.', 'never', ['always', 'usually', 'often']],
    ['We go to the cinema once or twice a year. We ___ go to the cinema.', 'sometimes', ['always', 'usually', 'never']],
    ['She gets up at 6 a.m. on most days. She ___ gets up at 6 a.m.', 'usually', ['never', 'sometimes', 'rarely']],
    ['They play football on Sundays and some other days. They ___ play football.', 'often', ['never', 'always', 'rarely']],
    ['My mother cooks dinner every single day. She ___ cooks dinner.', 'always', ['never', 'sometimes', 'seldom']],
    ['I am afraid of snakes, so I ___ go near them.', 'never', ['always', 'often', 'usually']],
    ['It rains a lot in July here. It ___ rains in July.', 'often', ['never', 'always', 'seldom']],
  ];
  const [f, a, wr] = list[i % list.length];
  return { prompt: FILL, formula: f, answer: a, wrong: wr, hint: 'Nghĩ xem việc đó xảy ra bao nhiêu lần.', explain: f.replace('___', a) };
};

// ---------- Grade 5, topic 2: be going to ----------
const GOING_SUBJ: [string, string][] = [['I', 'am'], ['He', 'is'], ['She', 'is'], ['We', 'are'], ['They', 'are'], ['You', 'are'], ['My father', 'is'], ['The children', 'are']];
const PLANS = ['visit my grandparents', 'play football', 'go to the beach', 'watch a film', 'learn to swim', 'have a picnic', 'visit Ha Long Bay', 'read a new book'];
const WHEN = ['tomorrow', 'next week', 'this summer', 'tonight', 'next Sunday', 'on the weekend'];

const goingForm: Maker = ({ r, i }) => {
  const [s, be] = GOING_SUBJ[i % GOING_SUBJ.length];
  const plan = pick(r, PLANS);
  return {
    prompt: 'Chọn am / is / are đúng:',
    formula: `${s} ___ going to ${plan} ${pick(r, WHEN)}.`,
    answer: be,
    wrong: ['am', 'is', 'are'].filter((x) => x !== be),
    hint: 'be going to: I am, he / she / it is, we / you / they are + going to + động từ.',
    explain: `${s} ${be} going to ${plan}.`,
  };
};

const goingQuestion: Maker = ({ r, i }) => {
  const kind = i % 4;
  const plan = pick(r, PLANS);
  if (kind === 0) {
    return {
      prompt: 'Chọn câu hỏi đúng:',
      answer: 'What are you going to do this summer?',
      wrong: ['What you are going to do this summer?', 'What are you going do this summer?', 'What do you going to do this summer?'],
      hint: 'What + be + chủ ngữ + going to + động từ?',
      explain: 'What are you going to do this summer?',
    };
  }
  if (kind === 1) {
    return {
      prompt: 'Chọn câu trả lời đúng:',
      formula: 'Is he going to visit his grandparents? — Yes, he ___.',
      answer: 'is',
      wrong: ['does', 'will', 'goes'],
      hint: 'Câu hỏi với is thì trả lời ngắn cũng dùng is.',
      explain: 'Is he going to ...? — Yes, he is.',
    };
  }
  if (kind === 2) {
    return {
      prompt: 'Chọn dạng phủ định đúng:',
      formula: `We ___ going to ${plan}.`,
      answer: "aren't",
      wrong: ["isn't", "don't", "doesn't"],
      hint: 'Phủ định của be going to: be + not + going to.',
      explain: `We aren't going to ${plan}.`,
    };
  }
  return {
    prompt: 'Chọn từ đúng điền vào chỗ trống:',
    formula: `She is going ___ ${plan}.`,
    answer: 'to',
    wrong: ['for', 'at', 'in'],
    hint: 'going to + động từ nguyên mẫu.',
    explain: `She is going to ${plan}.`,
  };
};

const futureTime: Maker = ({ r, i }) => {
  const list: [string, string, string[]][] = [
    ["I'm going to play football ___.", 'tomorrow', ['yesterday', 'last week', 'ago']],
    ["We're going to visit Hue ___ summer.", 'this', ['last', 'ago', 'yesterday']],
    ["She's going to have a party ___ Sunday.", 'next', ['last', 'ago', 'yesterday']],
    ["They're going to watch a film ___ night.", 'tonight', ['yesterday', 'ago', 'last']],
    ["He is going to visit his grandparents ___ week.", 'next', ['last', 'ago', 'yesterday']],
    ["What ___ you going to do this weekend?", 'are', ['is', 'do', 'does']],
    ["I ___ going to be a doctor when I grow up.", 'am', ['is', 'are', 'do']],
    ["My friends ___ going to travel to Da Nang.", 'are', ['is', 'am', 'does']],
  ];
  const [f, a, wr] = list[i % list.length];
  return { prompt: FILL, formula: f, answer: a, wrong: wr, hint: 'Kế hoạch trong tương lai: tomorrow, next ..., this summer, tonight.', explain: f.replace('___', a) };
};

// ---------- Grade 5, topic 3: Health & advice ----------
const ILLNESS: Word[] = [
  w('headache', 'đau đầu', '🤕'), w('toothache', 'đau răng', '🦷'), w('stomachache', 'đau bụng', '🤢'),
  w('cold', 'cảm lạnh', '🤧'), w('fever', 'sốt', '🤒'), w('cough', 'ho', '😷'),
];
const ADVICE = rows([
  ['I have a toothache. — You should go to the ___.', 'dentist', ['teacher', 'cinema', 'bank'], 'Đau răng thì đi khám nha sĩ (dentist).'],
  ['I have a headache. — You should ___.', 'take a rest', ['play football', 'eat a lot of candy', 'run fast'], 'Đau đầu thì nên nghỉ ngơi.'],
  ['I have a cold. — You should keep ___.', 'warm', ['cold', 'wet', 'hungry'], 'Bị cảm thì nên giữ ấm (warm).'],
  ['I have a stomachache. — You ___ eat too much.', "shouldn't", ['should', 'can', 'must'], 'Đau bụng thì không nên ăn nhiều.'],
  ["I have a fever. — You ___ see a doctor.", 'should', ["shouldn't", "can't", "don't"], 'Bị sốt thì nên đi khám bác sĩ.'],
  ['You have bad teeth. You ___ eat too many sweets.', "shouldn't", ['should', 'must', 'can'], 'Răng xấu thì không nên ăn nhiều kẹo.'],
  ['You want to be healthy. You ___ eat fruit and vegetables.', 'should', ["shouldn't", "can't", "don't"], 'Muốn khỏe mạnh thì nên ăn hoa quả và rau.'],
  ['I cough a lot. — You should drink ___ water.', 'warm', ['dirty', 'cold ice', 'no'], 'Ho thì nên uống nước ấm.'],
]);
const matter: Maker = ({ r, i }) => {
  const it = ILLNESS[Math.floor(i / 2) % ILLNESS.length];
  if (i % 2 === 0) {
    return {
      prompt: 'Nhìn hình. Chọn câu đúng:',
      visual: { kind: 'picture', emoji: it.e },
      formula: "What's the matter?",
      answer: `I have a ${it.en}.`,
      wrong: sample(r, ILLNESS.filter((x) => x.en !== it.en), 3).map((x) => `I have a ${x.en}.`),
      hint: `${it.en} = ${it.vi}.`,
      explain: `I have a ${it.en} (${it.vi}).`,
    };
  }
  return {
    prompt: `"${it.en}" nghĩa là gì?`,
    answer: it.vi,
    wrong: sample(r, ILLNESS.filter((x) => x.en !== it.en), 3).map((x) => x.vi),
    hint: `Nhìn hình: ${it.e}`,
    visual: { kind: 'picture', emoji: it.e },
    explain: `${it.en} = ${it.vi}.`,
  };
};

// ---------- Grade 5, topic 4: Superlatives ----------
const supForm: Maker = ({ r, i }) => {
  const list = [...ADJ, { base: 'beautiful', comp: 'more beautiful', sup: 'the most beautiful', vi: 'đẹp' }, { base: 'good', comp: 'better', sup: 'the best', vi: 'tốt' }, { base: 'interesting', comp: 'more interesting', sup: 'the most interesting', vi: 'thú vị' }, { base: 'bad', comp: 'worse', sup: 'the worst', vi: 'tệ' }];
  const a = list[i % list.length];
  const wrong = [a.sup.replace('the ', 'the more '), a.comp, `the ${a.base}`, a.base + 'est'].filter((x) => x !== a.sup);
  return {
    prompt: `Dạng so sánh nhất của "${a.base}" (${a.vi}) là:`,
    answer: a.sup,
    wrong,
    hint: 'Tính từ ngắn: the + tính từ + -est. Tính từ dài: the most + tính từ. Bất quy tắc: good → the best, bad → the worst.',
    explain: `${a.base} → ${a.sup}.`,
  };
};

const SUP_FACTS = rows([
  ['Mount Everest is ___ mountain in the world.', 'the highest', ['higher', 'the high', 'the most high'], 'Cao nhất thế giới: the highest.'],
  ['The blue whale is ___ animal in the world.', 'the biggest', ['bigger', 'the big', 'the bigest'], 'Lớn nhất: the biggest (gấp đôi chữ g).'],
  ['The cheetah is ___ animal on land.', 'the fastest', ['faster', 'the fast', 'the most fast'], 'Nhanh nhất: the fastest.'],
  ['The Mekong is one of ___ rivers in Vietnam.', 'the longest', ['longer', 'the long', 'the longer'], 'Dài nhất: the longest.'],
  ['Summer is ___ season of the year.', 'the hottest', ['hotter', 'the hot', 'the hoter'], 'Nóng nhất: the hottest (gấp đôi chữ t).'],
  ['This is ___ film I have ever seen.', 'the best', ['the goodest', 'better', 'the most good'], 'good → the best (bất quy tắc).'],
  ['She is ___ girl in our class.', 'the most beautiful', ['the beautifulest', 'more beautiful', 'the beautiful'], 'Tính từ dài: the most + tính từ.'],
  ['This is ___ day of my life.', 'the happiest', ['the most happy', 'happier', 'the happyest'], 'happy → the happiest (đổi y thành i).'],
]);

const supHeight: Maker = ({ r, i }) => {
  const names = sample(r, ['Tom', 'Nam', 'Lan', 'Mai', 'Ben', 'Anna'], 3);
  const base = randInt(r, 110, 140);
  const hs = shuffle(r, [base, base + randInt(r, 3, 9), base + randInt(r, 10, 20)]);
  const kind = i % 3;
  const idx = (fn: (a: number, b: number) => number) => hs.indexOf(hs.reduce((a, b) => fn(a, b)));
  const info = names.map((n, k) => `${n} is ${hs[k]} cm tall`).join('. ') + '.';
  if (kind === 0) {
    return { prompt: 'Đọc và trả lời. Who is the tallest?', subPrompt: info, answer: names[idx(Math.max)], wrong: names.filter((_, k) => k !== idx(Math.max)), hint: 'Người cao nhất có số đo lớn nhất.', explain: `${names[idx(Math.max)]} is the tallest.` };
  }
  if (kind === 1) {
    return { prompt: 'Đọc và trả lời. Who is the shortest?', subPrompt: info, answer: names[idx(Math.min)], wrong: names.filter((_, k) => k !== idx(Math.min)), hint: 'Người thấp nhất có số đo nhỏ nhất.', explain: `${names[idx(Math.min)]} is the shortest.` };
  }
  const [a, b] = [0, 1];
  const taller = hs[a] > hs[b] ? names[a] : names[b];
  return { prompt: `Đọc và trả lời. Who is taller, ${names[a]} or ${names[b]}?`, subPrompt: info, answer: taller, wrong: [hs[a] > hs[b] ? names[b] : names[a], names[2]], hint: 'So sánh hai số đo.', explain: `${taller} is taller.` };
};

// ---------- Grade 5, topic 5: Reading comprehension ----------
interface Passage { text: string; main: [string, string[]]; detail: [string, string, string[]]; extra: [string, string, string[]] }
const PASSAGES: Passage[] = [
  {
    text: 'Mai has a small cat called Kitty. Kitty is white and she likes milk. Every morning Kitty sits by the window and watches the birds.',
    main: ['Mai has a pet cat.', ['Mai has a dog.', 'Mai likes birds.', 'Kitty is black.']],
    detail: ['What does Kitty like to drink?', 'Milk', ['Juice', 'Water', 'Tea']],
    extra: ['Where does Kitty sit every morning?', 'By the window', ['In the garden', 'On the bed', 'Under the table']],
  },
  {
    text: 'Tom gets up at six o\'clock. He brushes his teeth and has breakfast with his family. Then he goes to school by bike. He arrives at school at seven.',
    main: ['Tom\'s morning routine.', ['Tom\'s favourite food.', 'Tom\'s holiday.', 'Tom\'s school subjects.']],
    detail: ['How does Tom go to school?', 'By bike', ['By bus', 'On foot', 'By car']],
    extra: ['What does Tom do after he gets up?', 'He brushes his teeth', ['He watches TV', 'He plays football', 'He goes to bed']],
  },
  {
    text: 'Last Sunday, Lan and her family went to the zoo. They saw elephants, monkeys and tigers. Lan liked the monkeys best because they were funny.',
    main: ['Lan\'s trip to the zoo.', ['Lan\'s birthday party.', 'Lan\'s new school.', 'Lan\'s pet monkey.']],
    detail: ['Which animals did Lan like best?', 'The monkeys', ['The tigers', 'The elephants', 'The birds']],
    extra: ['Why did Lan like the monkeys?', 'They were funny', ['They were big', 'They were fast', 'They were quiet']],
  },
  {
    text: 'It is winter in Sa Pa. It is very cold and sometimes it is foggy. People wear warm jackets, hats and gloves. Many tourists come to see the beautiful mountains.',
    main: ['The weather in Sa Pa in winter.', ['A summer holiday.', 'A rainy day in Hanoi.', 'A trip to the sea.']],
    detail: ['What do people wear in Sa Pa in winter?', 'Warm jackets, hats and gloves', ['T-shirts and shorts', 'Swimming clothes', 'Sandals']],
    extra: ['What is the weather like in Sa Pa in winter?', 'It is cold', ['It is hot', 'It is dry', 'It is stormy']],
  },
  {
    text: 'Nam wants to be healthy. He eats fruit and vegetables every day and drinks a lot of water. He does not eat too many sweets. He plays football with his friends twice a week.',
    main: ['How Nam keeps healthy.', ['Nam\'s favourite sweets.', 'Nam\'s football team.', 'Nam\'s school day.']],
    detail: ['How often does Nam play football?', 'Twice a week', ['Every day', 'Once a month', 'Never']],
    extra: ['What does Nam not eat too much?', 'Sweets', ['Fruit', 'Vegetables', 'Rice']],
  },
  {
    text: 'Ben is going to visit his grandparents next week. He is going to take the train to the countryside. He is going to help his grandfather on the farm and play with the dog.',
    main: ['Ben\'s plan for next week.', ['Ben\'s trip last week.', 'Ben\'s pet dog.', 'Ben\'s school project.']],
    detail: ['How is Ben going to travel?', 'By train', ['By bus', 'By plane', 'By bike']],
    extra: ['What is Ben going to do on the farm?', 'Help his grandfather', ['Go swimming', 'Watch TV', 'Read books']],
  },
  {
    text: 'Yesterday was Linh\'s birthday. Her friends came to her house and gave her presents. They ate a big chocolate cake and sang "Happy Birthday". Linh was very happy.',
    main: ['Linh\'s birthday party.', ['Linh\'s school day.', 'Linh\'s new bike.', 'Linh\'s favourite song.']],
    detail: ['What did they eat?', 'A chocolate cake', ['Ice cream', 'Fruit salad', 'Rice']],
    extra: ['How did Linh feel?', 'Happy', ['Sad', 'Tired', 'Angry']],
  },
  {
    text: 'The giraffe is the tallest animal in the world. It has a very long neck, so it can eat leaves from tall trees. Giraffes live in Africa and they can run fast.',
    main: ['The giraffe.', ['The elephant.', 'The tiger.', 'Trees in Africa.']],
    detail: ['Where do giraffes live?', 'In Africa', ['In Asia', 'In the sea', 'In the desert']],
    extra: ['Why can a giraffe eat leaves from tall trees?', 'It has a long neck', ['It is fast', 'It is small', 'It is heavy']],
  },
];

const readMain: Maker = ({ i }) => {
  const p = PASSAGES[i % PASSAGES.length];
  return { prompt: 'Đọc đoạn văn. What is the passage about?', subPrompt: p.text, answer: p.main[0], wrong: p.main[1], hint: 'Ý chính là điều mà cả đoạn văn nói tới.', explain: p.main[0] };
};
const readDetail: Maker = ({ i }) => {
  const p = PASSAGES[i % PASSAGES.length];
  return { prompt: `Đọc đoạn văn. ${p.detail[0]}`, subPrompt: p.text, answer: p.detail[1], wrong: p.detail[2], hint: 'Tìm chi tiết trong đoạn văn rồi chọn đáp án.', explain: `${p.detail[0]} — ${p.detail[1]}.` };
};
const readExtra: Maker = ({ i }) => {
  const p = PASSAGES[i % PASSAGES.length];
  return { prompt: `Đọc đoạn văn. ${p.extra[0]}`, subPrompt: p.text, answer: p.extra[1], wrong: p.extra[2], hint: 'Đọc lại đoạn văn để tìm câu trả lời.', explain: `${p.extra[0]} — ${p.extra[1]}.` };
};

export const englishGrade3: Record<string, SkillDef[]> = {
  'g3-e-t1': [
    d('Các hoạt động hằng ngày', 'get up, brush my teeth, have breakfast, go to school...', 2, mix([picToWord(ROUTINES), enToVi(ROUTINES)])),
    d('Xem đồng hồ bằng tiếng Anh', "What time is it? It's seven o'clock.", 2, clockEnglish),
    d('Câu về thói quen hằng ngày', 'I get up at six. I go to bed at nine.', 3, mix([fromRows(ROUTINE_SENT, FILL), routineTime])),
  ],
  'g3-e-t2': [
    d('Quần áo (clothes)', 'shirt, dress, pants, shoes, hat, socks, jacket...', 2, mix([picToWord(CLOTHES), wordToPic(CLOTHES)])),
    d('Thời tiết (weather)', "It's sunny. It's rainy. It's windy.", 2, mix([picToWord(WEATHER), wordToPic(WEATHER)])),
    d('Thời tiết nào, mặc gì?', "It's cold. I wear a jacket.", 3, fromRows(WEATHER_WEAR, FILL)),
  ],
  'g3-e-t3': [
    d('Địa điểm trong thị trấn', 'park, school, hospital, supermarket, library...', 2, mix([picToWord(PLACES), wordToPic(PLACES)])),
    d('Đi đâu để làm gì?', 'You read books at the library.', 3, fromRows(PLACE_USE, FILL)),
    d('There is / There are', 'There is a park. There are two schools.', 3, thereIs),
  ],
  'g3-e-t4': [
    d('Nhìn hình nói hành động đang diễn ra', 'He is running. She is swimming.', 2, whatDoing),
    d('Thêm -ing vào động từ', 'run → running, dance → dancing, write → writing', 3, addIng),
    d('am / is / are + V-ing', 'I am reading. They are playing.', 3, beVerb),
  ],
  'g3-e-t5': [
    d('Nhìn hình: con gì làm được gì?', 'A bird can fly. A fish can swim.', 2, abilityPic),
    d('can hoặc can\'t', 'A fish can\'t fly.', 3, canCant),
    d('Hỏi và đáp về khả năng', 'Can you swim? — Yes, I can.', 3, fromRows(canQA, FILL)),
  ],
};

export const englishGrade4: Record<string, SkillDef[]> = {
  'g4-e-t1': [
    d('Quốc kỳ và tên nước', 'Vietnam, America, England, Japan, Australia...', 3, flagCountry),
    d('Quốc tịch (nationality)', 'Vietnam → Vietnamese; Japan → Japanese', 3, nationality),
    d('Where are you from?', 'I am from Vietnam. I am Vietnamese.', 3, fromRows(COUNTRY_QA, FILL)),
  ],
  'g4-e-t2': [
    d('Các ngày và các tháng', 'Monday, Tuesday...; January, February...', 3, dayMonthOrder),
    d('Số thứ tự (ordinal numbers)', 'first, second, third...; 1st, 2nd, 3rd...', 3, ordinals),
    d('Sinh nhật và ngày tháng', 'My birthday is in May. It is on May 5th.', 4, birthday),
  ],
  'g4-e-t3': [
    d('Các môn học', 'Maths, English, Science, Music, Art, PE, IT', 3, mix([picToWord(SUBJECTS_EN), enToVi(SUBJECTS_EN)])),
    d('Học môn gì trong giờ nào?', 'We draw pictures in Art class.', 3, fromRows(SUBJECT_USE, FILL)),
    d('Đọc thời khóa biểu', 'When do you have Maths? — On Monday.', 4, timetable),
  ],
  'g4-e-t4': [
    d('was hoặc were', 'I was at home. They were at school.', 3, wasWere),
    d('Phủ định và câu hỏi với was / were', "wasn't, weren't, Was he...? Were you...?", 4, wasNeg),
    d('Từ chỉ thời gian trong quá khứ', 'yesterday, last week, two days ago', 3, pastTime),
  ],
  'g4-e-t5': [
    d('Nơi ở của con vật', 'A fish lives in the water. A camel lives in the desert.', 3, fromRows(HABITAT, FILL)),
    d('Cách tạo dạng so sánh hơn', 'big → bigger, tall → taller, fast → faster', 4, compFormation),
    d('So sánh hai con vật', 'An elephant is bigger than a mouse.', 4, compSentence),
  ],
};

export const englishGrade5: Record<string, SkillDef[]> = {
  'g5-e-t1': [
    d('Nghĩa của các trạng từ tần suất', 'always, usually, often, sometimes, never', 3, freqMeaning),
    d('Vị trí của trạng từ tần suất', 'She usually goes to school by bike.', 4, freqPosition),
    d('Chọn trạng từ hợp với thói quen', 'I always brush my teeth every day.', 4, freqHabit),
  ],
  'g5-e-t2': [
    d('Dạng của be going to', 'I am going to..., He is going to..., They are going to...', 4, goingForm),
    d('Hỏi, đáp và phủ định với be going to', 'What are you going to do? We aren\'t going to...', 4, goingQuestion),
    d('Kế hoạch và thời gian trong tương lai', 'tomorrow, next week, this summer, tonight', 4, futureTime),
  ],
  'g5-e-t3': [
    d('Các bệnh thường gặp', 'headache, toothache, stomachache, cold, fever, cough', 3, matter),
    d('should và shouldn\'t', 'You should see a doctor. You shouldn\'t eat too many sweets.', 4, fromRows(ADVICE, FILL)),
    d('Hỏi thăm và khuyên nhủ', "What's the matter? — I have a headache.", 4, mix([matter, fromRows(ADVICE, FILL)])),
  ],
  'g5-e-t4': [
    d('Cách tạo dạng so sánh nhất', 'tall → the tallest, beautiful → the most beautiful', 4, supForm),
    d('So sánh nhất trong đời sống', 'Mount Everest is the highest mountain in the world.', 4, fromRows(SUP_FACTS, FILL)),
    d('Ai cao nhất? Ai thấp nhất?', 'Đọc số liệu rồi so sánh ba người', 4, supHeight),
  ],
  'g5-e-t5': [
    d('Đọc hiểu: ý chính của đoạn văn', 'What is the passage about?', 4, readMain),
    d('Đọc hiểu: tìm chi tiết', 'Who? What? Where? How often?', 4, readDetail),
    d('Đọc hiểu: giải thích và suy luận', 'Why ...? What happens ...?', 5, readExtra),
  ],
};
