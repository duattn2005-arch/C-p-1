import { Draft, Maker, SkillDef, pick, sample } from './core.js';
import { PIC_WORDS, Tone, vietnameseGrade1Part1 } from './vietnamese1.js';

// Tiếng Việt lớp 1, phần 2: ghép vần, đọc từ, đọc câu và lời chào.

// ---------- Topic 3: vần an, at, am, ap, ong, oc, ươn, ươt ----------
const VANS = ['an', 'at', 'am', 'ap', 'ong', 'oc', 'ươn', 'ươt'];

// the vần written with the tone it carries in a word ("at" + sắc = "át"); stop endings (t, p, c) only take sắc or nặng
const TONED: Record<string, Partial<Record<Tone, string>>> = {
  an: { ngang: 'an', huyền: 'àn', sắc: 'án', nặng: 'ạn' },
  am: { ngang: 'am', huyền: 'àm', sắc: 'ám', nặng: 'ạm' },
  ong: { ngang: 'ong', huyền: 'òng', sắc: 'óng', nặng: 'ọng' },
  ươn: { ngang: 'ươn', huyền: 'ườn', sắc: 'ướn', nặng: 'ượn' },
  at: { sắc: 'át', nặng: 'ạt' },
  ap: { sắc: 'áp', nặng: 'ạp' },
  oc: { sắc: 'óc', nặng: 'ọc' },
  ươt: { sắc: 'ướt', nặng: 'ượt' },
};

interface VanWord {
  w: string;
  e: string;
  init: string;
  van: string;
  tone: Tone;
}
const VW = (w: string, e: string, init: string, van: string, tone: Tone): VanWord => ({ w, e, init, van, tone });
export const VAN_WORDS: VanWord[] = [
  VW('cam', '🍊', 'c', 'am', 'ngang'), VW('tám', '8️⃣', 't', 'am', 'sắc'), VW('làm', '🛠️', 'l', 'am', 'huyền'),
  VW('đàn', '🎸', 'đ', 'an', 'huyền'), VW('hát', '🎤', 'h', 'at', 'sắc'), VW('cát', '🏖️', 'c', 'at', 'sắc'),
  VW('bát', '🥣', 'b', 'at', 'sắc'), VW('tháp', '🗼', 'th', 'ap', 'sắc'), VW('rạp', '🎬', 'r', 'ap', 'nặng'),
  VW('sóng', '🌊', 's', 'ong', 'sắc'), VW('bóng', '⚽', 'b', 'ong', 'sắc'), VW('sóc', '🐿️', 's', 'oc', 'sắc'),
  VW('tóc', '💇', 't', 'oc', 'sắc'), VW('khóc', '😢', 'kh', 'oc', 'sắc'), VW('vườn', '🏡', 'v', 'ươn', 'huyền'),
  VW('lướt', '🏄', 'l', 'ươt', 'sắc'),
];
const rest = (v: VanWord): string => TONED[v.van][v.tone] as string;
// other vần that can carry the same tone, written with that tone
const otherRests = (v: VanWord): string[] => VANS.filter((x) => x !== v.van && TONED[x][v.tone]).map((x) => TONED[x][v.tone] as string);

const vanOf: Maker = ({ r }) => {
  const it = pick(r, VAN_WORDS);
  return {
    prompt: `Tiếng "${it.w}" có vần gì?`,
    visual: { kind: 'picture', emoji: it.e },
    answer: it.van,
    wrong: sample(r, VANS.filter((v) => v !== it.van), 3),
    hint: `Bỏ âm đầu "${it.init}" đi, phần còn lại (không tính dấu thanh) là vần.`,
    explain: `Tiếng "${it.w}" có âm đầu "${it.init}" và vần "${it.van}".`,
  };
};

const fillVan: Maker = ({ r }) => {
  const it = pick(r, VAN_WORDS);
  return {
    prompt: `Điền vần thích hợp để được tiếng "${it.w}":`,
    formula: `${it.init}___`,
    visual: { kind: 'picture', emoji: it.e },
    answer: rest(it),
    wrong: sample(r, otherRests(it), 3),
    hint: `Đọc to tiếng "${it.w}" và nghe phần vần sau âm "${it.init}".`,
    explain: `"${it.init}" ghép với "${rest(it)}" được "${it.w}".`,
  };
};

const joinVan: Maker = ({ r }) => {
  const it = pick(r, VAN_WORDS);
  return {
    prompt: `Ghép "${it.init}" với "${rest(it)}" được tiếng nào?`,
    answer: it.w,
    wrong: sample(r, otherRests(it), 3).map((x) => it.init + x),
    hint: `Đọc âm "${it.init}" rồi đọc liền vần "${rest(it)}".`,
    explain: `${it.init} + ${rest(it)} = ${it.w}.`,
  };
};

// ---------- Topic 4: đọc từ ----------
const byWord = new Map(PIC_WORDS.map((x) => [x.w, x]));
const emojiOf = (w: string): string => (byWord.get(w) as { e: string }).e;

const picToWord: Maker = ({ r }) => {
  const it = pick(r, PIC_WORDS);
  return {
    prompt: 'Hình này là gì?',
    visual: { kind: 'picture', emoji: it.e },
    answer: it.w,
    wrong: sample(r, PIC_WORDS.filter((x) => x.w !== it.w && x.e !== it.e), 3).map((x) => x.w),
    hint: `Nhìn hình rồi đọc thầm từng từ. Từ nào có nghĩa giống hình?`,
    explain: `${it.e} là "${it.w}".`,
  };
};

const wordToPic: Maker = ({ r }) => {
  const it = pick(r, PIC_WORDS);
  const others = sample(r, PIC_WORDS.filter((x) => x.e !== it.e && x.w !== it.w), 3);
  return {
    prompt: `Hình nào là "${it.w}"?`,
    answer: it.e,
    wrong: others.map((x) => x.e),
    faces: Object.fromEntries([it, ...others].map((x) => [x.e, { emoji: x.e, only: true }])),
    hint: `Đọc kĩ từ "${it.w}" rồi tìm hình đúng.`,
    explain: `"${it.w}" là ${it.e}.`,
  };
};

const GROUPS: { name: string; words: string[] }[] = [
  { name: 'con vật', words: ['mèo', 'chó', 'voi', 'rùa', 'hổ', 'thỏ', 'gấu', 'sóc', 'khỉ', 'ngựa'] },
  { name: 'quả', words: ['cam', 'táo', 'nho', 'dứa', 'lê', 'dừa'] },
  { name: 'đồ vật', words: ['bút', 'mũ', 'đũa', 'rổ', 'chổi', 'bóng', 'nón', 'ghế', 'xe', 'cờ', 'tàu'] },
];

const oddOne: Maker = ({ r }) => {
  const [a, b] = sample(r, GROUPS, 2);
  const same = sample(r, a.words, 3);
  const odd = pick(r, b.words);
  return {
    prompt: 'Từ nào KHÔNG cùng nhóm với các từ còn lại?',
    answer: odd,
    wrong: same,
    faces: Object.fromEntries([odd, ...same].map((x) => [x, { emoji: emojiOf(x) }])),
    hint: `Ba từ nói về ${a.name}. Tìm từ nói về thứ khác.`,
    explain: `"${odd}" là ${b.name}, còn ba từ kia là ${a.name}.`,
  };
};

// ---------- Topic 5: đọc câu, lời chào ----------
const FILLS: { s: string; a: string; w: string[] }[] = [
  { s: 'Bé ăn ___.', a: 'cam', w: ['ghế', 'xe', 'mũ'] },
  { s: 'Con ___ kêu meo meo.', a: 'mèo', w: ['chó', 'gà', 'vịt'] },
  { s: 'Bé viết bài bằng ___.', a: 'bút', w: ['rổ', 'đũa', 'xe'] },
  { s: 'Con ___ gáy ò ó o.', a: 'gà', w: ['mèo', 'chó', 'bò'] },
  { s: 'Bé ăn cơm bằng ___.', a: 'đũa', w: ['bút', 'mũ', 'ghế'] },
  { s: 'Con ___ sủa gâu gâu.', a: 'chó', w: ['mèo', 'gà', 'vịt'] },
  { s: 'Bé ngồi trên ___.', a: 'ghế', w: ['cá', 'nho', 'bút'] },
  { s: 'Con ___ kêu cạp cạp.', a: 'vịt', w: ['mèo', 'chó', 'gà'] },
  { s: 'Trên trời có ngôi ___ sáng.', a: 'sao', w: ['rổ', 'ghế', 'xe'] },
  { s: 'Bé đội ___ khi đi nắng.', a: 'mũ', w: ['cá', 'nho', 'xe'] },
];

const fillSentence: Maker = ({ i }): Draft => {
  const row = FILLS[i % FILLS.length];
  return {
    prompt: 'Chọn từ điền vào chỗ trống:',
    formula: row.s,
    answer: row.a,
    wrong: row.w,
    faces: Object.fromEntries([row.a, ...row.w].map((x) => [x, { emoji: emojiOf(x) }])),
    hint: 'Đọc cả câu, xem từ nào hợp nghĩa nhất.',
    explain: row.s.replace('___', row.a),
  };
};

const GREETINGS: { e: string; s: string; a: string; w: string[] }[] = [
  { e: '👩‍🏫', s: 'Sáng đến lớp, bé gặp cô giáo ở cổng trường. Bé nói:', a: 'Con chào cô ạ!', w: ['Cho tớ mượn bút!', 'Tạm biệt cô nhé!', 'Mẹ ơi, đói quá!'] },
  { e: '🎁', s: 'Bà tặng bé một món quà. Bé nói:', a: 'Con cảm ơn bà ạ!', w: ['Con xin lỗi bà ạ!', 'Tạm biệt bà!', 'Bà đưa đây!'] },
  { e: '😟', s: 'Bé lỡ làm rơi bút của bạn. Bé nói:', a: 'Tớ xin lỗi bạn!', w: ['Tớ cảm ơn bạn!', 'Chào bạn nhé!', 'Không có gì!'] },
  { e: '🖊️', s: 'Bạn cảm ơn bé vì đã cho mượn bút. Bé đáp:', a: 'Không có gì đâu bạn!', w: ['Tớ xin lỗi!', 'Chào buổi sáng!', 'Tạm biệt!'] },
  { e: '🏫', s: 'Tan học, bé chào cô giáo ra về. Bé nói:', a: 'Con chào cô, con về ạ!', w: ['Chúc mừng sinh nhật cô!', 'Con cảm ơn cô đã cho quà!', 'Cô cho con mượn bút!'] },
  { e: '🏡', s: 'Bé đến nhà, gặp ông bà. Bé nói:', a: 'Con chào ông bà ạ!', w: ['Cháu tạm biệt ông bà!', 'Con xin lỗi ông bà!', 'Con không ăn đâu!'] },
  { e: '🍚', s: 'Trước khi ăn cơm, bé mời cả nhà:', a: 'Con mời cả nhà ăn cơm ạ!', w: ['Con đi ngủ đây!', 'Con xin lỗi cả nhà!', 'Chúc mừng năm mới!'] },
  { e: '📖', s: 'Bé muốn mượn quyển sách của bạn. Bé nói:', a: 'Bạn cho tớ mượn quyển sách nhé!', w: ['Đưa quyển sách đây!', 'Tớ lấy quyển sách nhé!', 'Quyển sách này là của tớ!'] },
  { e: '🎂', s: 'Hôm nay là sinh nhật bạn. Bé nói:', a: 'Chúc mừng sinh nhật bạn!', w: ['Tạm biệt bạn nhé!', 'Tớ xin lỗi bạn!', 'Cảm ơn bạn nhiều!'] },
];

const greeting: Maker = ({ i }): Draft => {
  const row = GREETINGS[i % GREETINGS.length];
  return {
    prompt: 'Bé nên nói gì?',
    subPrompt: row.s,
    visual: { kind: 'picture', emoji: row.e },
    answer: row.a,
    wrong: row.w,
    hint: 'Nghĩ xem bé đang ở tình huống nào: gặp gỡ, cảm ơn, xin lỗi hay tạm biệt?',
    explain: `Trong tình huống này, bé nên nói: "${row.a}"`,
  };
};

const STORIES: { s: string; q: string; a: string; w: string[] }[] = [
  { s: 'Mẹ mua cho bé một quả cam. Quả cam rất ngọt.', q: 'Mẹ mua cho bé quả gì?', a: 'quả cam', w: ['quả táo', 'quả chuối', 'quả nho'] },
  { s: 'Nhà bà có một vườn hoa. Trong vườn có hoa hồng và hoa cúc.', q: 'Nhà bà có gì?', a: 'một vườn hoa', w: ['một ao cá', 'một con chó', 'một chiếc xe'] },
  { s: 'Bố đưa bé đi học bằng xe đạp.', q: 'Bố đưa bé đi học bằng gì?', a: 'xe đạp', w: ['xe hơi', 'tàu hỏa', 'máy bay'] },
  { s: 'Chú gà trống gáy ò ó o vào buổi sáng.', q: 'Chú gà trống gáy vào lúc nào?', a: 'buổi sáng', w: ['buổi tối', 'buổi trưa', 'buổi chiều'] },
  { s: 'Bé Nam có một chiếc mũ đỏ.', q: 'Chiếc mũ của bé Nam màu gì?', a: 'màu đỏ', w: ['màu xanh', 'màu vàng', 'màu trắng'] },
  { s: 'Trên cành cây có hai chú chim đang hót.', q: 'Trên cành cây có mấy chú chim?', a: 'hai chú chim', w: ['ba chú chim', 'một chú chim', 'bốn chú chim'] },
  { s: 'Hôm nay trời mưa. Bé mặc áo mưa đi học.', q: 'Vì sao bé mặc áo mưa?', a: 'Vì trời mưa', w: ['Vì trời nắng', 'Vì trời lạnh', 'Vì bé thích'] },
  { s: 'Bé Hoa tưới nước cho cây. Cây lớn lên xanh tốt.', q: 'Bé Hoa làm gì cho cây?', a: 'tưới nước', w: ['hái quả', 'cắt lá', 'nhổ cỏ'] },
  { s: 'Bà nội của bé rất hiền. Bà hay kể chuyện cho bé nghe.', q: 'Bà nội hay làm gì cho bé nghe?', a: 'kể chuyện', w: ['hát ru', 'đọc báo', 'nấu cơm'] },
];

const reading: Maker = ({ i }): Draft => {
  const row = STORIES[i % STORIES.length];
  return {
    prompt: row.q,
    subPrompt: row.s,
    answer: row.a,
    wrong: row.w,
    hint: 'Đọc lại câu chuyện và tìm câu trả lời trong bài.',
    explain: `Trong bài có viết: "${row.s}"`,
  };
};

export const vietnameseGrade1: Record<string, SkillDef[]> = {
  ...vietnameseGrade1Part1,
  'g1-v-t3': [
    { name: 'Tìm vần trong tiếng', desc: 'Nhận ra vần an, at, am, ap, ong, oc, ươn, ươt', diff: 2, make: vanOf },
    { name: 'Điền vần vào chỗ trống', desc: 'Chọn vần thích hợp để tạo thành tiếng có nghĩa', diff: 2, make: fillVan },
    { name: 'Ghép âm đầu với vần', desc: 'Ghép âm đầu, vần và dấu thanh thành tiếng', diff: 3, make: joinVan },
  ],
  'g1-v-t4': [
    { name: 'Nhìn hình chọn từ', desc: 'Đọc từ và tìm từ đúng với hình', diff: 1, make: picToWord },
    { name: 'Đọc từ chọn hình', desc: 'Đọc từ rồi chọn hình đúng', diff: 2, make: wordToPic },
    { name: 'Tìm từ khác nhóm', desc: 'Phân biệt con vật, quả và đồ vật', diff: 2, make: oddOne },
  ],
  'g1-v-t5': [
    { name: 'Điền từ vào câu ngắn', desc: 'Đọc câu 4-6 tiếng và chọn từ hợp nghĩa', diff: 2, make: fillSentence },
    { name: 'Lời chào và lời cảm ơn', desc: 'Nói lời chào, cảm ơn, xin lỗi đúng lúc', diff: 2, make: greeting },
    { name: 'Đọc đoạn ngắn trả lời câu hỏi', desc: 'Đọc 2 câu và trả lời câu hỏi đơn giản', diff: 3, make: reading },
  ],
};
