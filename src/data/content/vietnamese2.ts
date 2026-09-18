import { Draft, Maker, SkillDef, pick, sample } from './core.js';
import { mix } from './englishKit.js';
import { QA, RD, WordClass, oddWord, qa, reading, whichWord } from './viKit.js';

// Tiếng Việt lớp 2 (GDPT 2018): từ chỉ sự vật, hoạt động, đặc điểm; mẫu câu Ai là gì? Ai làm gì? Ai thế nào?;
// dấu câu; vốn từ gia đình, trường học, muông thú; đọc hiểu đoạn ngắn.

// ---------- Topic 1: từ chỉ sự vật, hoạt động, đặc điểm ----------
const THING: WordClass = {
  label: 'chỉ sự vật',
  words: ['bàn', 'ghế', 'cô giáo', 'học sinh', 'con mèo', 'cây bàng', 'quyển sách', 'cái bút', 'bà', 'trường học', 'dòng sông', 'ngọn núi', 'bông hoa', 'con voi', 'mẹ', 'xe đạp'],
  hint: 'Từ chỉ sự vật là tên người, đồ vật, cây cối hoặc con vật.',
};
const ACTION: WordClass = {
  label: 'chỉ hoạt động',
  words: ['chạy', 'nhảy', 'đọc', 'viết', 'hát', 'múa', 'bơi', 'bay', 'quét', 'tưới', 'vẽ', 'nấu', 'cười'],
  hint: 'Từ chỉ hoạt động cho biết ai đó (hoặc con vật) đang làm gì.',
};
const TRAIT: WordClass = {
  label: 'chỉ đặc điểm',
  words: ['đẹp', 'cao', 'xanh', 'thơm', 'ngoan', 'chăm chỉ', 'nhanh', 'to', 'ngọt', 'đỏ', 'thấp', 'hiền', 'giỏi', 'tròn'],
  hint: 'Từ chỉ đặc điểm cho biết màu sắc, hình dáng, mùi vị, tính nết của sự vật.',
};
const WORD_CLASSES = [THING, ACTION, TRAIT];

// ---------- Topic 2: Ai là gì? Ai làm gì? Ai thế nào? ----------
const PATTERNS: { label: string; hint: string; list: string[] }[] = [
  {
    label: 'Ai là gì?',
    hint: 'Câu giới thiệu hoặc nhận định về người, vật, thường có từ "là".',
    list: ['Bạn Lan là học sinh lớp 2.', 'Mẹ em là cô giáo.', 'Chú Nam là bác sĩ.', 'Hà Nội là thủ đô của nước ta.', 'Con mèo là bạn của em.', 'Bố em là công nhân.'],
  },
  {
    label: 'Ai làm gì?',
    hint: 'Câu kể về hoạt động của người hoặc con vật: có từ chỉ hoạt động như nấu, quét, đọc, hót...',
    list: ['Mẹ đang nấu cơm.', 'Em quét nhà.', 'Bố đọc báo.', 'Bạn Nam đá bóng.', 'Chim hót trên cành.', 'Cô giáo giảng bài.', 'Chị em tưới cây.'],
  },
  {
    label: 'Ai thế nào?',
    hint: 'Câu tả đặc điểm, tính chất của người hoặc vật: có từ như đẹp, chăm chỉ, to lớn...',
    list: ['Bông hoa rất đẹp.', 'Bạn Lan rất chăm chỉ.', 'Con voi to lớn.', 'Trời hôm nay rất nóng.', 'Cô giáo em rất hiền.', 'Chú mèo lười biếng.', 'Dòng sông xanh biếc.'],
  },
];

function pattern(k: number): Maker {
  return ({ r, i }) => {
    const me = PATTERNS[k];
    const others = PATTERNS.filter((_, j) => j !== k);
    if (i % 2 === 0) {
      const s = pick(r, me.list);
      return {
        prompt: 'Câu sau thuộc mẫu câu nào?',
        formula: s,
        answer: me.label,
        wrong: others.map((p) => p.label),
        hint: me.hint,
        explain: `Câu "${s}" thuộc mẫu câu "${me.label}".`,
      };
    }
    const s = pick(r, me.list);
    return {
      prompt: `Câu nào thuộc mẫu câu "${me.label}"?`,
      answer: s,
      wrong: sample(r, others.flatMap((p) => p.list), 3),
      hint: me.hint,
      explain: `Câu "${s}" thuộc mẫu câu "${me.label}".`,
    };
  };
}

// ---------- Topic 3: dấu câu ----------
const STOP: QA[] = [
  ['Bạn tên là gì ___', '?', '.|!|,', 'Câu hỏi kết thúc bằng dấu chấm hỏi.'],
  ['Hôm nay em đi học ___', '.', '?|!|,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['Bạn có thích đọc truyện không ___', '?', '.|!|,', 'Câu có từ "không" để hỏi thì dùng dấu chấm hỏi.'],
  ['Mẹ em là giáo viên ___', '.', '?|!|,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['Ai đã vẽ bức tranh này ___', '?', '.|!|,', 'Câu bắt đầu bằng "Ai" để hỏi thì dùng dấu chấm hỏi.'],
  ['Cây bàng trước sân trường rất to ___', '.', '?|!|,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['Vì sao bầu trời có màu xanh ___', '?', '.|!|,', 'Câu hỏi "vì sao" kết thúc bằng dấu chấm hỏi.'],
  ['Con mèo đang ngủ trên ghế ___', '.', '?|!|,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['Bao giờ bạn đến nhà tớ chơi ___', '?', '.|!|,', 'Câu hỏi kết thúc bằng dấu chấm hỏi.'],
  ['Em học lớp 2A ___', '.', '?|!|,', 'Câu kể kết thúc bằng dấu chấm.'],
];
const MARKS: QA[] = [
  ['Cẩn thận ___', '!', '.|?|,', 'Câu ra lệnh, nhắc nhở thường kết thúc bằng dấu chấm than.'],
  ['Em có bút chì ___ tẩy và thước kẻ.', ',', '.|?|!', 'Dấu phẩy ngăn cách các từ cùng loại trong câu.'],
  ['Ôi, con búp bê đẹp quá ___', '!', '.|?|,', 'Câu bộc lộ cảm xúc (ôi, chao, trời ơi) kết thúc bằng dấu chấm than.'],
  ['Trong vườn có hoa hồng ___ hoa cúc và hoa sen.', ',', '.|?|!', 'Dấu phẩy đứng giữa các từ cùng loại: hoa hồng, hoa cúc, hoa sen.'],
  ['Hoan hô, đội mình thắng rồi ___', '!', '.|?|,', 'Câu bộc lộ niềm vui kết thúc bằng dấu chấm than.'],
  ['Mẹ mua cam ___ táo và nho.', ',', '.|?|!', 'Dấu phẩy ngăn cách các từ cùng loại: cam, táo, nho.'],
  ['Mau lên ___', '!', '.|?|,', 'Câu yêu cầu, giục giã thường kết thúc bằng dấu chấm than.'],
  ['Sáng nay, bố ___ mẹ và em đi công viên.', ',', '.|?|!', 'Dấu phẩy ngăn cách các từ chỉ người: bố, mẹ, em.'],
  ['Trời ơi, đau quá ___', '!', '.|?|,', 'Câu kêu lên vì đau, vì ngạc nhiên kết thúc bằng dấu chấm than.'],
];
const FIX: QA[] = [
  ['', 'Bạn có khỏe không?', 'Bạn có khỏe không.|Bạn có khỏe không!|Bạn có khỏe không,', 'Câu hỏi phải kết thúc bằng dấu chấm hỏi.'],
  ['', 'Mẹ đang nấu cơm.', 'Mẹ đang nấu cơm?|Mẹ đang nấu cơm,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['', 'Ai đang gõ cửa vậy?', 'Ai đang gõ cửa vậy.|Ai đang gõ cửa vậy,', 'Câu có từ "Ai" để hỏi kết thúc bằng dấu chấm hỏi.'],
  ['', 'Em thích ăn táo, cam và nho.', 'Em thích ăn táo. cam và nho.|Em thích ăn táo? cam và nho.', 'Giữa các từ cùng loại (táo, cam, nho) dùng dấu phẩy.'],
  ['', 'Hôm nay trời mưa.', 'Hôm nay trời mưa?|Hôm nay trời mưa,', 'Câu kể kết thúc bằng dấu chấm.'],
  ['', 'Vì sao lá cây có màu xanh?', 'Vì sao lá cây có màu xanh.|Vì sao lá cây có màu xanh,', 'Câu hỏi "vì sao" kết thúc bằng dấu chấm hỏi.'],
  ['', 'Trong lớp có bàn, ghế, bảng và tủ sách.', 'Trong lớp có bàn. ghế. bảng và tủ sách.|Trong lớp có bàn? ghế? bảng và tủ sách.', 'Các từ bàn, ghế, bảng cùng loại nên ngăn cách bằng dấu phẩy.'],
  ['', 'Cẩn thận, đường trơn!', 'Cẩn thận, đường trơn?|Cẩn thận, đường trơn,', 'Lời nhắc nhở, cảnh báo kết thúc bằng dấu chấm than.'],
  ['', 'Bạn tên là gì?', 'Bạn tên là gì.|Bạn tên là gì,', 'Câu hỏi kết thúc bằng dấu chấm hỏi.'],
];

// ---------- Topic 4: vốn từ ----------
const FAMILY: WordClass = {
  label: 'chỉ người trong gia đình',
  words: ['ông', 'bà', 'bố', 'mẹ', 'anh', 'chị', 'em', 'dì', 'chú', 'bác', 'cậu'],
  hint: 'Người trong gia đình là những người thân trong nhà hoặc họ hàng của em.',
};
const OUTSIDER: WordClass = {
  label: 'chỉ người ngoài gia đình',
  words: ['thầy giáo', 'bạn học', 'hàng xóm', 'y tá', 'cô giáo', 'bảo vệ', 'học sinh'],
  hint: 'Những người này không thuộc gia đình của em.',
};
const TOOLS: WordClass = {
  label: 'chỉ đồ dùng học tập',
  words: ['bút chì', 'thước kẻ', 'tẩy', 'cặp sách', 'vở', 'sách giáo khoa'],
  hint: 'Đồ dùng học tập là những thứ em dùng khi học ở lớp.',
};
const FEELING: WordClass = {
  label: 'chỉ tình cảm hoặc việc làm tốt đẹp',
  words: ['kính trọng', 'yêu quý', 'biết ơn', 'đoàn kết', 'thân thiết', 'giúp đỡ'],
  hint: 'Đó là những tình cảm, việc làm đẹp giữa thầy trò và bạn bè.',
};
const SCHOOL_PEOPLE: WordClass = {
  label: 'chỉ người trong trường học',
  words: ['thầy giáo', 'cô giáo', 'bạn học', 'học sinh', 'cô hiệu trưởng', 'bác bảo vệ'],
  hint: 'Đó là những người em gặp hằng ngày ở trường.',
};
const BEAST: WordClass = {
  label: 'gọi tên một loài thú',
  words: ['sư tử', 'hổ', 'voi', 'gấu', 'khỉ', 'hươu', 'sói', 'báo', 'tê giác', 'hà mã'],
  hint: 'Muông thú là các loài thú sống trong rừng.',
};
const BEAST_TRAIT: WordClass = {
  label: 'chỉ đặc điểm của thú rừng',
  words: ['hung dữ', 'nhanh nhẹn', 'hiền lành', 'khỏe mạnh', 'tinh khôn', 'chậm chạp'],
  hint: 'Từ chỉ đặc điểm nói lên tính nết, sức mạnh của con vật.',
};
const BEAST_ACT: WordClass = {
  label: 'chỉ hoạt động của thú rừng',
  words: ['gầm', 'rình mồi', 'săn mồi', 'leo trèo', 'vồ mồi', 'lao nhanh'],
  hint: 'Từ chỉ hoạt động cho biết con vật làm gì.',
};
const FAMILY_SET = [FAMILY, OUTSIDER];
const SCHOOL_SET = [TOOLS, FEELING, SCHOOL_PEOPLE];
const BEAST_SET = [BEAST, BEAST_TRAIT, BEAST_ACT];

// ---------- Topic 5: đọc hiểu ----------
const POEMS: RD[] = [
  ['Em yêu cây bàng\nLá xanh che nắng\nTrưa hè ve kêu\nTrên cành rộn ràng.', 'Bài thơ tả cây gì?', 'cây bàng', 'cây phượng|cây dừa|cây mít', 'Đọc dòng thơ đầu tiên.'],
  ['Em yêu cây bàng\nLá xanh che nắng\nTrưa hè ve kêu\nTrên cành rộn ràng.', 'Lá bàng giúp gì cho bạn nhỏ?', 'che nắng', 'che mưa|đuổi ve|hái quả', 'Đọc dòng thơ thứ hai.'],
  ['Mẹ em dậy sớm\nNấu bữa cơm nhà\nHương thơm bay xa\nCả nhà thức dậy.', 'Ai dậy sớm nấu cơm?', 'mẹ', 'bố|bà|chị', 'Đọc dòng thơ đầu tiên.'],
  ['Mẹ em dậy sớm\nNấu bữa cơm nhà\nHương thơm bay xa\nCả nhà thức dậy.', 'Vì sao cả nhà thức dậy?', 'Vì hương cơm thơm bay xa', 'Vì trời đã sáng|Vì gà gáy|Vì có tiếng chuông', 'Đọc hai dòng thơ cuối.'],
  ['Trời mưa rào rào\nCóc con nhảy múa\nẾch kêu ộp ộp\nMừng mùa nước về.', 'Những con vật nào vui mừng khi trời mưa?', 'cóc và ếch', 'chim và gà|mèo và chó|voi và hổ', 'Tìm tên con vật trong bài thơ.'],
  ['Chim sâu chăm chỉ\nBắt sâu cho cây\nCây xanh tốt tươi\nTrĩu quả ngọt thơm.', 'Chim sâu giúp cây bằng cách nào?', 'bắt sâu', 'tưới nước|bón phân|hái quả', 'Đọc dòng thơ thứ hai.'],
  ['Chim sâu chăm chỉ\nBắt sâu cho cây\nCây xanh tốt tươi\nTrĩu quả ngọt thơm.', 'Nhờ đâu cây xanh tốt, trĩu quả?', 'nhờ chim sâu bắt sâu', 'nhờ trời mưa|nhờ ông trồng|nhờ gió thổi', 'Đọc lại hai dòng đầu và hai dòng cuối.'],
  ['Bé chào cô giáo\nCặp sách trên vai\nSân trường nắng mới\nTiếng cười vang hoài.', 'Bạn nhỏ chào ai?', 'cô giáo', 'bà|mẹ|bác bảo vệ', 'Đọc dòng thơ đầu tiên.'],
  ['Bé chào cô giáo\nCặp sách trên vai\nSân trường nắng mới\nTiếng cười vang hoài.', 'Bạn nhỏ đang đi đâu?', 'đến trường', 'ra chợ|về quê|đi công viên', 'Có cặp sách trên vai và sân trường.'],
];
const PASSAGES: RD[] = [
  ['Sáng chủ nhật, Nam cùng bố đi câu cá ở hồ. Bố dạy Nam cách móc mồi vào lưỡi câu. Một lúc sau, Nam câu được một con cá rô to.', 'Nam đi câu cá cùng ai?', 'bố', 'mẹ|ông|anh', 'Đọc câu đầu tiên.'],
  ['Sáng chủ nhật, Nam cùng bố đi câu cá ở hồ. Bố dạy Nam cách móc mồi vào lưỡi câu. Một lúc sau, Nam câu được một con cá rô to.', 'Nam câu được con gì?', 'cá rô', 'cá chép|con tôm|con cua', 'Đọc câu cuối.'],
  ['Lan có một chú mèo tên là Mun. Mun có bộ lông đen mượt và đôi mắt xanh. Ngày nào Lan cũng cho Mun ăn cá.', 'Chú mèo của Lan tên là gì?', 'Mun', 'Miu|Tôm|Vàng', 'Đọc câu đầu tiên.'],
  ['Lan có một chú mèo tên là Mun. Mun có bộ lông đen mượt và đôi mắt xanh. Ngày nào Lan cũng cho Mun ăn cá.', 'Bộ lông của Mun có màu gì?', 'màu đen', 'màu trắng|màu vàng|màu xám', 'Đọc câu thứ hai.'],
  ['Lan có một chú mèo tên là Mun. Mun có bộ lông đen mượt và đôi mắt xanh. Ngày nào Lan cũng cho Mun ăn cá.', 'Ngày nào Lan cũng cho Mun ăn gì?', 'cá', 'thịt|cơm|bánh', 'Đọc câu cuối.'],
  ['Vườn nhà bà có nhiều cây ăn quả. Mùa hè, cây xoài chín vàng. Bà hái xoài cho các cháu ăn.', 'Mùa hè, cây nào chín vàng?', 'cây xoài', 'cây cam|cây ổi|cây bưởi', 'Đọc câu thứ hai.'],
  ['Vườn nhà bà có nhiều cây ăn quả. Mùa hè, cây xoài chín vàng. Bà hái xoài cho các cháu ăn.', 'Bà làm gì với những quả xoài chín?', 'hái cho các cháu ăn', 'đem ra chợ bán|để cho chim ăn|phơi khô', 'Đọc câu cuối.'],
  ['Hôm nay lớp em đi tham quan sở thú. Em được thấy voi, hổ và khỉ. Em thích nhất chú khỉ vì nó rất nghịch ngợm.', 'Em thích nhất con vật nào?', 'khỉ', 'voi|hổ|gấu', 'Đọc câu cuối.'],
  ['Hôm nay lớp em đi tham quan sở thú. Em được thấy voi, hổ và khỉ. Em thích nhất chú khỉ vì nó rất nghịch ngợm.', 'Vì sao em thích chú khỉ?', 'Vì khỉ rất nghịch ngợm', 'Vì khỉ rất to|Vì khỉ hung dữ|Vì khỉ ngủ suốt ngày', 'Tìm từ "vì" trong câu cuối.'],
];

// each story is written in the right order here, but shown scrambled: the child works out first and last
const STORY_ORDER: string[][] = [
  ['Bạn Hoa thức dậy.', 'Bạn Hoa đánh răng, rửa mặt.', 'Bạn Hoa ăn sáng.', 'Bạn Hoa đến trường.'],
  ['Em đào một cái hố.', 'Em đặt cây con xuống hố.', 'Em lấp đất lại.', 'Em tưới nước cho cây.'],
  ['Mẹ nhào bột.', 'Mẹ nặn bánh.', 'Mẹ hấp bánh.', 'Cả nhà cùng ăn bánh.'],
  ['Mây đen kéo đến.', 'Trời đổ mưa.', 'Mưa tạnh.', 'Cầu vồng xuất hiện.'],
];

const orderMaker: Maker = ({ i }): Draft => {
  const o = STORY_ORDER[Math.floor(i / 2) % STORY_ORDER.length];
  const shown = [o[2], o[0], o[3], o[1]];
  const asFirst = i % 2 === 0;
  const answer = asFirst ? o[0] : o[3];
  return {
    prompt: asFirst ? 'Việc nào xảy ra ĐẦU TIÊN?' : 'Việc nào xảy ra CUỐI CÙNG?',
    subPrompt: shown.map((e, k) => `${String.fromCharCode(97 + k)}) ${e}`).join('\n'),
    answer,
    wrong: shown.filter((e) => e !== answer),
    hint: asFirst ? 'Nghĩ xem việc nào phải làm trước tiên.' : 'Nghĩ xem việc nào là kết thúc của câu chuyện.',
    explain: `Thứ tự đúng: ${o.join(' → ')}`,
  };
};

export const vietnameseGrade2: Record<string, SkillDef[]> = {
  'g2-v-t1': [
    { name: 'Từ chỉ sự vật', desc: 'Tên người, đồ vật, cây cối, con vật', diff: 2, make: whichWord(THING, WORD_CLASSES) },
    { name: 'Từ chỉ hoạt động', desc: 'Từ cho biết ai đó đang làm gì', diff: 2, make: whichWord(ACTION, WORD_CLASSES) },
    { name: 'Từ chỉ đặc điểm', desc: 'Màu sắc, hình dáng, mùi vị, tính nết', diff: 2, make: whichWord(TRAIT, WORD_CLASSES) },
  ],
  'g2-v-t2': [
    { name: 'Mẫu câu Ai là gì?', desc: 'Nhận biết câu giới thiệu, nhận định', diff: 2, make: pattern(0) },
    { name: 'Mẫu câu Ai làm gì?', desc: 'Nhận biết câu kể về hoạt động', diff: 2, make: pattern(1) },
    { name: 'Mẫu câu Ai thế nào?', desc: 'Nhận biết câu tả đặc điểm, tính chất', diff: 3, make: pattern(2) },
  ],
  'g2-v-t3': [
    { name: 'Dấu chấm và dấu chấm hỏi', desc: 'Câu kể kết thúc bằng dấu chấm, câu hỏi bằng dấu chấm hỏi', diff: 2, make: qa('Điền dấu câu thích hợp vào chỗ trống:', STOP) },
    { name: 'Dấu chấm than và dấu phẩy', desc: 'Câu cảm, câu khiến và dấu phẩy giữa các từ cùng loại', diff: 3, make: qa('Điền dấu câu thích hợp vào chỗ trống:', MARKS) },
    { name: 'Chọn câu dùng đúng dấu câu', desc: 'Nhận ra câu đã đặt đúng dấu', diff: 3, make: qa('Chọn câu dùng dấu câu đúng:', FIX) },
  ],
  'g2-v-t4': [
    { name: 'Từ ngữ về gia đình', desc: 'Từ chỉ người thân trong gia đình', diff: 1, make: mix([whichWord(FAMILY, FAMILY_SET), oddWord(FAMILY, FAMILY_SET, 'chỉ người trong gia đình')]) },
    { name: 'Từ ngữ về thầy cô và bạn bè', desc: 'Đồ dùng học tập, người trong trường, tình cảm đẹp', diff: 2, make: mix([whichWord(TOOLS, SCHOOL_SET), whichWord(FEELING, SCHOOL_SET), whichWord(SCHOOL_PEOPLE, SCHOOL_SET)]) },
    { name: 'Từ ngữ về muông thú', desc: 'Tên thú rừng, đặc điểm và hoạt động của chúng', diff: 2, make: mix([whichWord(BEAST, BEAST_SET), whichWord(BEAST_TRAIT, BEAST_SET), whichWord(BEAST_ACT, BEAST_SET)]) },
  ],
  'g2-v-t5': [
    { name: 'Đọc hiểu bài thơ ngắn', desc: 'Đọc thơ 4 dòng và trả lời câu hỏi', diff: 2, make: reading(POEMS) },
    { name: 'Đọc hiểu đoạn văn ngắn', desc: 'Đọc 3 câu và tìm thông tin trong bài', diff: 3, make: reading(PASSAGES) },
    { name: 'Sắp xếp các việc theo thứ tự', desc: 'Việc nào xảy ra trước, việc nào xảy ra sau', diff: 3, make: orderMaker },
  ],
};
