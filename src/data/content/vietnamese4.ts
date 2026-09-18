import { Draft, Maker, SkillDef, pick, sample } from './core.js';
import { mix } from './englishKit.js';
import { QA, WordClass, oddWord, ordering, qa, whichWord } from './viKit.js';

// Tiếng Việt lớp 4 (GDPT 2018): danh từ - động từ - tính từ, cấu tạo tiếng, trạng ngữ, vốn từ nhân hậu - ý chí,
// văn miêu tả cây cối và con vật.

// ---------- Topic 1: danh từ, động từ, tính từ ----------
const NOUN: WordClass = {
  label: 'chỉ sự vật, hiện tượng (danh từ)',
  words: ['học sinh', 'bàn ghế', 'cơn mưa', 'niềm vui', 'ước mơ', 'tình bạn', 'mùa xuân', 'dòng sông', 'con đường', 'tiếng cười', 'cuộc sống', 'ánh nắng'],
  hint: 'Danh từ chỉ người, vật, hiện tượng, khái niệm. Thử thêm "những" hoặc "các" phía trước.',
};
const VERB: WordClass = {
  label: 'chỉ hoạt động, trạng thái (động từ)',
  words: ['chạy', 'trò chuyện', 'yêu thương', 'nằm', 'ngồi', 'khao khát', 'xây dựng', 'vun trồng', 'ngắm nhìn', 'tranh luận', 'nhảy', 'chăm sóc'],
  hint: 'Động từ cho biết ai đó làm gì hoặc ở trạng thái nào. Thử thêm "đang" hoặc "đã" phía trước.',
};
const ADJ: WordClass = {
  label: 'chỉ đặc điểm, tính chất (tính từ)',
  words: ['xinh xắn', 'dũng cảm', 'mênh mông', 'rực rỡ', 'hiền dịu', 'tĩnh lặng', 'ồn ào', 'trong xanh', 'lấp lánh', 'chăm chỉ', 'giản dị', 'thông minh'],
  hint: 'Tính từ tả đặc điểm, tính chất. Thử thêm "rất" phía trước.',
};
const WORD_TYPES = [NOUN, VERB, ADJ];

// ---------- Topic 2: cấu tạo của tiếng ----------
interface Syl {
  w: string;
  init: string; // âm đầu ("" when the syllable starts with a vowel)
  van: string; // vần, written without the tone mark
  tone: string;
}
const S = (w: string, init: string, van: string, tone: string): Syl => ({ w, init, van, tone });
const SYLS: Syl[] = [
  S('trăng', 'tr', 'ăng', 'ngang'), S('nghiêng', 'ngh', 'iêng', 'ngang'), S('quê', 'qu', 'ê', 'ngang'), S('mưa', 'm', 'ưa', 'ngang'),
  S('khuya', 'kh', 'uya', 'ngang'), S('gió', 'gi', 'o', 'sắc'), S('thương', 'th', 'ương', 'ngang'), S('nhà', 'nh', 'a', 'huyền'),
  S('bầu', 'b', 'âu', 'huyền'), S('ngủ', 'ng', 'u', 'hỏi'), S('chiều', 'ch', 'iêu', 'huyền'), S('lành', 'l', 'anh', 'huyền'),
  S('sáng', 's', 'ang', 'sắc'), S('hạnh', 'h', 'anh', 'nặng'), S('phố', 'ph', 'ô', 'sắc'), S('xanh', 'x', 'anh', 'ngang'),
  S('nghĩ', 'ngh', 'i', 'ngã'), S('mũi', 'm', 'ui', 'ngã'), S('cũ', 'c', 'u', 'ngã'), S('hoa', 'h', 'oa', 'ngang'),
  S('đường', 'đ', 'ương', 'huyền'), S('biển', 'b', 'iên', 'hỏi'), S('kiến', 'k', 'iên', 'sắc'), S('quả', 'qu', 'a', 'hỏi'),
  S('anh', '', 'anh', 'ngang'), S('ăn', '', 'ăn', 'ngang'), S('em', '', 'em', 'ngang'), S('ơi', '', 'ơi', 'ngang'),
];
const NO_INIT = 'không có âm đầu';
const initLabel = (s: Syl): string => s.init || NO_INIT;
// c/k, g/gh, ng/ngh are one sound written two ways, so never offer both as if they differed
const TWINS = [['c', 'k'], ['g', 'gh'], ['ng', 'ngh']];
const sameSound = (a: string, b: string): boolean => a === b || TWINS.some((g) => g.includes(a) && g.includes(b));

const initOf: Maker = ({ r, i }): Draft => {
  if (i % 2 === 0) {
    const it = pick(r, SYLS);
    const others = [...new Set(SYLS.map(initLabel))].filter((x) => !sameSound(x, initLabel(it)));
    return {
      prompt: `Tiếng "${it.w}" có âm đầu là gì?`,
      answer: initLabel(it),
      wrong: sample(r, others, 3),
      hint: 'Âm đầu là phần đứng đầu tiếng, trước vần. Có tiếng không có âm đầu.',
      explain: it.init ? `Tiếng "${it.w}" gồm âm đầu "${it.init}", vần "${it.van}", thanh ${it.tone}.` : `Tiếng "${it.w}" không có âm đầu; vần "${it.van}", thanh ${it.tone}.`,
    };
  }
  const it = pick(r, SYLS.filter((s) => s.init));
  return {
    prompt: `Tiếng nào có âm đầu là "${it.init}"?`,
    answer: it.w,
    wrong: sample(r, SYLS.filter((s) => !sameSound(s.init, it.init)), 3).map((s) => s.w),
    hint: `Đọc từng tiếng và tìm âm đầu "${it.init}".`,
    explain: `Tiếng "${it.w}" có âm đầu "${it.init}".`,
  };
};

const vanOf: Maker = ({ r, i }): Draft => {
  if (i % 2 === 0) {
    const it = pick(r, SYLS);
    return {
      prompt: `Tiếng "${it.w}" có vần là gì?`,
      answer: it.van,
      wrong: sample(r, [...new Set(SYLS.map((s) => s.van))].filter((v) => v !== it.van), 3),
      hint: 'Vần là phần còn lại của tiếng sau khi bỏ âm đầu và dấu thanh.',
      explain: `Tiếng "${it.w}" có vần "${it.van}".`,
    };
  }
  const it = pick(r, SYLS);
  return {
    prompt: `Tiếng nào có vần là "${it.van}"?`,
    answer: it.w,
    wrong: sample(r, SYLS.filter((s) => s.van !== it.van), 3).map((s) => s.w),
    hint: `Bỏ âm đầu và dấu thanh, tìm phần còn lại là "${it.van}".`,
    explain: `Tiếng "${it.w}" có vần "${it.van}".`,
  };
};

const TONES = ['ngang', 'huyền', 'sắc', 'hỏi', 'ngã', 'nặng'];
const toneOf: Maker = ({ r, i }): Draft => {
  if (i % 2 === 0) {
    const it = pick(r, SYLS);
    return {
      prompt: `Tiếng "${it.w}" mang thanh nào?`,
      answer: `thanh ${it.tone}`,
      wrong: sample(r, TONES.filter((t) => t !== it.tone), 3).map((t) => `thanh ${t}`),
      hint: 'Nhìn dấu đặt trên hoặc dưới nguyên âm. Không có dấu là thanh ngang.',
      explain: `Tiếng "${it.w}" mang thanh ${it.tone}.`,
    };
  }
  const tone = pick(r, TONES);
  const target = pick(r, SYLS.filter((s) => s.tone === tone));
  return {
    prompt: `Tiếng nào mang thanh ${tone}?`,
    answer: target.w,
    wrong: sample(r, SYLS.filter((s) => s.tone !== tone), 3).map((s) => s.w),
    hint: tone === 'ngang' ? 'Thanh ngang là tiếng không có dấu.' : `Tìm tiếng có dấu ${tone}.`,
    explain: `Tiếng "${target.w}" mang thanh ${tone}.`,
  };
};

// ---------- Topic 3: trạng ngữ ----------
type TnKind = 'time' | 'place' | 'reason' | 'purpose';
type TN = [string, string, string, TnKind]; // sentence, trạng ngữ, wrong parts, kind
const ASK: Record<TnKind, string> = { time: 'Khi nào? (Bao giờ?)', place: 'Ở đâu?', reason: 'Vì sao? (Nhờ đâu?)', purpose: 'Để làm gì?' };
const ASK_HINT: Record<TnKind, string> = {
  time: 'Trạng ngữ chỉ thời gian trả lời câu hỏi "Khi nào?", "Bao giờ?".',
  place: 'Trạng ngữ chỉ nơi chốn trả lời câu hỏi "Ở đâu?".',
  reason: 'Trạng ngữ chỉ nguyên nhân trả lời câu hỏi "Vì sao?", "Nhờ đâu?".',
  purpose: 'Trạng ngữ chỉ mục đích trả lời câu hỏi "Để làm gì?".',
};

function trangNgu(rows: TN[]): Maker {
  return ({ i }): Draft => {
    const [s, tn, w, kind] = rows[Math.floor(i / 2) % rows.length];
    if (i % 2 === 0) {
      return {
        prompt: 'Trạng ngữ của câu sau là:',
        formula: s,
        answer: tn,
        wrong: w.split('|'),
        hint: 'Trạng ngữ thường đứng đầu câu và ngăn cách với chủ ngữ bằng dấu phẩy.',
        explain: `Trạng ngữ của câu là "${tn}".`,
      };
    }
    return {
      prompt: `Trạng ngữ "${tn}" trả lời cho câu hỏi nào?`,
      formula: s,
      answer: ASK[kind],
      wrong: (Object.keys(ASK) as TnKind[]).filter((k) => k !== kind).map((k) => ASK[k]),
      hint: 'Nghĩ xem trạng ngữ cho biết thời gian, nơi chốn, nguyên nhân hay mục đích.',
      explain: ASK_HINT[kind],
    };
  };
}

const TIME_ROWS: TN[] = [
  ['Sáng nay, em đến trường rất sớm.', 'Sáng nay', 'em|đến trường|rất sớm', 'time'],
  ['Mỗi buổi chiều, bà ra vườn tưới rau.', 'Mỗi buổi chiều', 'bà|ra vườn|tưới rau', 'time'],
  ['Mùa xuân, muôn hoa đua nở.', 'Mùa xuân', 'muôn hoa|đua nở|muôn hoa đua nở', 'time'],
  ['Vào ngày Tết, cả nhà sum họp bên nhau.', 'Vào ngày Tết', 'cả nhà|sum họp|bên nhau', 'time'],
  ['Lúc 6 giờ sáng, chú gà trống gáy vang.', 'Lúc 6 giờ sáng', 'chú gà trống|gáy vang|gà trống gáy', 'time'],
  ['Hôm qua, lớp em đi tham quan bảo tàng.', 'Hôm qua', 'lớp em|đi tham quan|bảo tàng', 'time'],
  ['Đêm khuya, tiếng dế kêu râm ran.', 'Đêm khuya', 'tiếng dế|kêu râm ran|dế kêu', 'time'],
  ['Cuối tuần, gia đình em về quê thăm ông bà.', 'Cuối tuần', 'gia đình em|về quê|thăm ông bà', 'time'],
];
const PLACE_ROWS: TN[] = [
  ['Trong vườn, hoa hồng đang nở rộ.', 'Trong vườn', 'hoa hồng|đang nở rộ|nở rộ', 'place'],
  ['Trên cành cây, đàn chim hót líu lo.', 'Trên cành cây', 'đàn chim|hót líu lo|chim hót', 'place'],
  ['Ngoài sân, lũ trẻ đang nhảy dây.', 'Ngoài sân', 'lũ trẻ|đang nhảy dây|nhảy dây', 'place'],
  ['Ở góc lớp, bạn Nam đang đọc sách.', 'Ở góc lớp', 'bạn Nam|đang đọc sách|đọc sách', 'place'],
  ['Dưới gốc bàng, chúng em ngồi ôn bài.', 'Dưới gốc bàng', 'chúng em|ngồi ôn bài|ôn bài', 'place'],
  ['Trên bầu trời, những đám mây trôi lững lờ.', 'Trên bầu trời', 'những đám mây|trôi lững lờ|mây trôi', 'place'],
  ['Bên bờ sông, cây liễu rủ bóng.', 'Bên bờ sông', 'cây liễu|rủ bóng|liễu rủ', 'place'],
  ['Trước cổng trường, bác bảo vệ đang chào các em.', 'Trước cổng trường', 'bác bảo vệ|đang chào các em|chào các em', 'place'],
];
const REASON_ROWS: TN[] = [
  ['Vì trời mưa, buổi dã ngoại bị hoãn.', 'Vì trời mưa', 'buổi dã ngoại|bị hoãn|dã ngoại', 'reason'],
  ['Nhờ chăm chỉ luyện tập, Nam đã giành huy chương.', 'Nhờ chăm chỉ luyện tập', 'Nam|đã giành huy chương|huy chương', 'reason'],
  ['Do bị ốm, Lan phải nghỉ học.', 'Do bị ốm', 'Lan|phải nghỉ học|nghỉ học', 'reason'],
  ['Vì mải chơi, em quên làm bài tập.', 'Vì mải chơi', 'em|quên làm bài tập|làm bài tập', 'reason'],
  ['Để đạt điểm cao, em chăm chỉ ôn bài.', 'Để đạt điểm cao', 'em|chăm chỉ ôn bài|ôn bài', 'purpose'],
  ['Để giữ gìn sức khỏe, chúng ta cần tập thể dục.', 'Để giữ gìn sức khỏe', 'chúng ta|cần tập thể dục|tập thể dục', 'purpose'],
  ['Nhờ có mưa, cây cối tươi tốt trở lại.', 'Nhờ có mưa', 'cây cối|tươi tốt trở lại|trở lại', 'reason'],
  ['Để bảo vệ môi trường, chúng em thu gom rác.', 'Để bảo vệ môi trường', 'chúng em|thu gom rác|gom rác', 'purpose'],
];

// ---------- Topic 4: nhân hậu, ý chí ----------
const KIND: WordClass = {
  label: 'thể hiện lòng nhân hậu',
  words: ['thương yêu', 'đùm bọc', 'nhường nhịn', 'chia sẻ', 'giúp đỡ', 'vị tha', 'bao dung', 'nhân hậu'],
  hint: 'Nhân hậu là biết thương yêu, quan tâm, giúp đỡ người khác.',
};
const UNKIND: WordClass = {
  label: 'trái với lòng nhân hậu',
  words: ['độc ác', 'ích kỉ', 'tàn nhẫn', 'hẹp hòi', 'keo kiệt', 'lạnh lùng', 'tham lam', 'đố kị'],
  hint: 'Đây là những tính xấu, trái với sự thương yêu, chia sẻ.',
};
const WILL: WordClass = {
  label: 'thể hiện ý chí, nghị lực',
  words: ['kiên trì', 'bền bỉ', 'quyết tâm', 'nghị lực', 'vượt khó', 'can đảm', 'dũng cảm', 'nhẫn nại'],
  hint: 'Người có ý chí không nản lòng trước khó khăn.',
};
const WEAK: WordClass = {
  label: 'trái với ý chí, nghị lực',
  words: ['nản chí', 'bỏ cuộc', 'lười biếng', 'chùn bước', 'ngại khó', 'thoái chí'],
  hint: 'Đây là những biểu hiện của người dễ bỏ cuộc khi gặp khó khăn.',
};
const KIND_SET = [KIND, UNKIND];
const WILL_SET = [WILL, WEAK];

const PROVERBS: QA[] = [
  ['Lá lành đùm lá rách', 'Giúp đỡ, đùm bọc người gặp khó khăn', 'Chỉ nên lo cho bản thân|Chỉ chơi với người giàu|Không nên nhận quà', 'Lá lành che chở cho lá rách: người khá giả giúp người khó khăn.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Thương người như thể thương thân', 'Yêu thương người khác như yêu chính mình', 'Chỉ thương người thân|Thương thân trước rồi mới thương người|Đừng thương ai cả', 'Hãy đặt mình vào vị trí người khác.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Có công mài sắt, có ngày nên kim', 'Kiên trì thì sẽ thành công', 'Sắt rất dễ mài|Nên bỏ cuộc sớm|Mài sắt là nghề hay nhất', 'Mài mãi thanh sắt mới thành cây kim nhỏ.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Nước chảy đá mòn', 'Kiên trì, bền bỉ sẽ đạt được kết quả', 'Nước mạnh hơn đá luôn luôn|Đá rất dễ vỡ|Nên tránh xa nước', 'Nước chảy lâu ngày làm mòn cả đá.', undefined, 'Câu tục ngữ sau nói lên điều gì?'],
  ['Uống nước nhớ nguồn', 'Biết ơn người đã giúp mình', 'Uống nước phải nhớ nấu chín|Chỉ nên uống nước sạch|Nước rất quan trọng', 'Nguồn là nơi nước bắt đầu chảy ra.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Ăn quả nhớ kẻ trồng cây', 'Biết ơn người đã tạo ra thành quả cho mình', 'Nên trồng nhiều cây ăn quả|Quả nào cũng ngon|Chỉ nên ăn quả chín', 'Người trồng cây là người làm ra quả ngọt.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Thất bại là mẹ thành công', 'Không nản lòng khi thất bại, rút kinh nghiệm để thành công', 'Thất bại là điều tốt nhất|Nên dừng lại khi thất bại|Mẹ luôn giúp ta thành công', 'Từ thất bại ta học được bài học để làm tốt hơn.', undefined, 'Câu tục ngữ sau khuyên ta điều gì?'],
  ['Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao', 'Đoàn kết tạo nên sức mạnh', 'Nên trồng cây trên núi|Một cây là đủ|Núi cao thì khó trèo', 'Nhiều cây chụm lại mới thành núi.', undefined, 'Câu tục ngữ sau nói lên điều gì?'],
];

// ---------- Topic 5: văn miêu tả cây cối và con vật ----------
const PARTS: QA[] = [
  ['Nhà em có một chú chó tên là Vàng.', 'Mở bài', 'Thân bài|Kết bài', 'Câu này giới thiệu con vật sắp được tả.'],
  ['Bộ lông Vàng màu nâu vàng, mượt như nhung.', 'Thân bài', 'Mở bài|Kết bài', 'Câu này tả đặc điểm của con vật.'],
  ['Em rất yêu quý chú chó Vàng.', 'Kết bài', 'Mở bài|Thân bài', 'Câu này nêu tình cảm của em.'],
  ['Trước sân nhà em có một cây bưởi lớn.', 'Mở bài', 'Thân bài|Kết bài', 'Câu này giới thiệu cây sắp được tả.'],
  ['Thân cây sần sùi, tán lá xanh thẫm xòe rộng như chiếc ô.', 'Thân bài', 'Mở bài|Kết bài', 'Câu này tả hình dáng của cây.'],
  ['Em mong cây bưởi luôn xanh tốt để cho nhiều quả ngọt.', 'Kết bài', 'Mở bài|Thân bài', 'Câu này nêu mong muốn, cảm nghĩ của em.'],
  ['Sáng nào chú gà trống cũng đứng trên hàng rào gáy vang.', 'Thân bài', 'Mở bài|Kết bài', 'Câu này tả hoạt động của con vật.'],
  ['Ở góc vườn nhà em có một cây ổi.', 'Mở bài', 'Thân bài|Kết bài', 'Câu này giới thiệu cây sắp được tả.'],
];
const VIVID: QA[] = [
  ['', 'Chú mèo có bộ lông mượt như nhung, đôi mắt xanh biếc long lanh.', 'Chú mèo có lông và có mắt.|Chú mèo là con vật nuôi trong nhà.|Nhà em có nuôi một con mèo.', 'Câu miêu tả hay có hình ảnh so sánh và từ gợi tả màu sắc, dáng vẻ.'],
  ['', 'Cây bàng xòe tán lá xanh rợp cả góc sân trường.', 'Cây bàng có lá.|Cây bàng ở trong trường.|Em thấy cây bàng ở sân trường.', 'Câu miêu tả hay cho ta hình dung rõ dáng vẻ của cây.'],
  ['', 'Chú chó Vàng vẫy đuôi rối rít, chạy ra đón em ở cổng.', 'Chú chó Vàng là chó nhà em.|Con chó có bốn chân.|Em có nuôi một con chó.', 'Câu miêu tả hay tả hoạt động cụ thể của con vật.'],
  ['', 'Những chùm hoa phượng đỏ rực như từng đốm lửa giữa tán lá xanh.', 'Cây phượng có hoa màu đỏ.|Cây phượng ở sân trường.|Em thích hoa phượng.', 'Câu miêu tả hay có hình ảnh so sánh sinh động.'],
  ['', 'Đàn gà con lông vàng óng, chạy lon ton theo mẹ trong sân.', 'Nhà em có đàn gà con.|Gà con có hai chân.|Gà con ăn thóc.', 'Câu miêu tả hay dùng từ gợi hình như "vàng óng", "lon ton".'],
  ['', 'Quả xoài chín vàng ươm, tỏa hương thơm ngọt ngào.', 'Quả xoài chín rồi.|Em thích ăn xoài.|Xoài là một loại quả.', 'Câu miêu tả hay tả màu sắc và mùi hương.'],
  ['', 'Chú voi to lớn bước đi chậm rãi, chiếc vòi dài vung vẩy.', 'Voi là con vật lớn.|Ở sở thú có con voi.|Em đã nhìn thấy con voi.', 'Câu miêu tả hay tả dáng đi và bộ phận nổi bật.'],
  ['', 'Cây đa đầu làng có thân to, rễ buông xuống như những chòm râu.', 'Đầu làng có cây đa.|Cây đa là cây lớn.|Em biết cây đa.', 'Câu miêu tả hay có hình ảnh so sánh gần gũi.'],
];
const PLANT_ORDER: string[][] = [
  ['Trước sân nhà em có một cây bưởi lớn.', 'Thân cây sần sùi, tán lá xanh thẫm xòe rộng.', 'Mùa thu, những quả bưởi vàng óng lủng lẳng trên cành.', 'Em rất yêu cây bưởi của nhà mình.'],
  ['Nhà em nuôi một chú gà trống rất đẹp.', 'Bộ lông chú óng ánh nhiều màu, chiếc mào đỏ chót.', 'Sáng nào chú cũng đứng trên hàng rào gáy vang ò ó o.', 'Em rất thích tiếng gáy của chú gà trống.'],
  ['Nhà em có một chú chó tên là Vàng.', 'Bộ lông Vàng màu nâu vàng, mượt như nhung.', 'Mỗi chiều, Vàng chạy ra cổng đón em đi học về.', 'Em rất yêu quý chú chó Vàng.'],
  ['Ở giữa sân trường có một cây phượng vĩ.', 'Thân cây to, tán lá xanh mướt như chiếc ô khổng lồ.', 'Đến hè, hoa phượng nở đỏ rực cả góc trời.', 'Em luôn nhớ mãi cây phượng của tuổi học trò.'],
];

export const vietnameseGrade4: Record<string, SkillDef[]> = {
  'g4-v-t1': [
    { name: 'Danh từ', desc: 'Từ chỉ người, vật, hiện tượng, khái niệm', diff: 3, make: mix([whichWord(NOUN, WORD_TYPES), oddWord(NOUN, WORD_TYPES, NOUN.label)]) },
    { name: 'Động từ', desc: 'Từ chỉ hoạt động, trạng thái', diff: 3, make: mix([whichWord(VERB, WORD_TYPES), oddWord(VERB, WORD_TYPES, VERB.label)]) },
    { name: 'Tính từ', desc: 'Từ chỉ đặc điểm, tính chất', diff: 3, make: mix([whichWord(ADJ, WORD_TYPES), oddWord(ADJ, WORD_TYPES, ADJ.label)]) },
  ],
  'g4-v-t2': [
    { name: 'Âm đầu của tiếng', desc: 'Tìm âm đầu, tiếng không có âm đầu', diff: 3, make: initOf },
    { name: 'Vần của tiếng', desc: 'Tìm vần trong tiếng', diff: 3, make: vanOf },
    { name: 'Thanh của tiếng', desc: 'Sáu thanh: ngang, huyền, sắc, hỏi, ngã, nặng', diff: 3, make: toneOf },
  ],
  'g4-v-t3': [
    { name: 'Trạng ngữ chỉ thời gian', desc: 'Trả lời câu hỏi Khi nào? Bao giờ?', diff: 3, make: trangNgu(TIME_ROWS) },
    { name: 'Trạng ngữ chỉ nơi chốn', desc: 'Trả lời câu hỏi Ở đâu?', diff: 3, make: trangNgu(PLACE_ROWS) },
    { name: 'Trạng ngữ chỉ nguyên nhân, mục đích', desc: 'Trả lời câu hỏi Vì sao? Để làm gì?', diff: 4, make: trangNgu(REASON_ROWS) },
  ],
  'g4-v-t4': [
    { name: 'Từ ngữ về lòng nhân hậu', desc: 'Từ thể hiện và từ trái với nhân hậu', diff: 3, make: mix([whichWord(KIND, KIND_SET), oddWord(KIND, KIND_SET, KIND.label)]) },
    { name: 'Từ ngữ về ý chí, nghị lực', desc: 'Từ thể hiện và từ trái với ý chí', diff: 3, make: mix([whichWord(WILL, WILL_SET), oddWord(WILL, WILL_SET, WILL.label)]) },
    { name: 'Tục ngữ về nhân hậu và ý chí', desc: 'Hiểu ý nghĩa các câu tục ngữ', diff: 4, make: qa('Chọn đáp án đúng:', PROVERBS) },
  ],
  'g4-v-t5': [
    { name: 'Các phần của bài văn miêu tả', desc: 'Mở bài, thân bài, kết bài', diff: 3, make: qa('Câu sau thuộc phần nào của bài văn miêu tả?', PARTS) },
    { name: 'Chi tiết miêu tả sinh động', desc: 'Chọn câu văn có hình ảnh, từ gợi tả', diff: 4, make: qa('Chọn câu văn miêu tả sinh động nhất:', VIVID) },
    { name: 'Sắp xếp câu trong bài văn tả', desc: 'Câu mở đầu và câu kết bài', diff: 4, make: ordering(PLANT_ORDER, 'Câu nào nên làm MỞ BÀI?', 'Câu nào nên làm KẾT BÀI?', 'Mở bài giới thiệu cây hoặc con vật em định tả.', 'Kết bài nêu tình cảm, mong muốn của em.') },
  ],
};
