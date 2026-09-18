import { Draft, Maker, SkillDef, pick, sample } from './core.js';
import { QA, RD, ordering, qa, reading } from './viKit.js';

// Tiếng Việt lớp 3 (GDPT 2018): so sánh, nhân hóa, vốn từ quê hương, dấu hai chấm - ngoặc kép, văn miêu tả.

// ---------- Topic 1: so sánh ----------
const SIMILES: { s: string; a: string; b: string }[] = [
  { s: 'Mặt trời đỏ như quả cầu lửa.', a: 'mặt trời', b: 'quả cầu lửa' },
  { s: 'Trăng tròn như cái đĩa.', a: 'trăng', b: 'cái đĩa' },
  { s: 'Đôi mắt em bé tròn như hạt nhãn.', a: 'đôi mắt', b: 'hạt nhãn' },
  { s: 'Bàn tay mẹ mềm như bông.', a: 'bàn tay mẹ', b: 'bông' },
  { s: 'Dòng sông uốn lượn như một dải lụa.', a: 'dòng sông', b: 'dải lụa' },
  { s: 'Cây cau thẳng tắp như cây cột.', a: 'cây cau', b: 'cây cột' },
  { s: 'Những ngôi sao lấp lánh như những viên kim cương.', a: 'những ngôi sao', b: 'những viên kim cương' },
  { s: 'Tiếng suối chảy róc rách như tiếng hát.', a: 'tiếng suối', b: 'tiếng hát' },
];

const whichCompared: Maker = ({ r, i }): Draft => {
  const it = SIMILES[i % SIMILES.length];
  const [x, y, z] = sample(r, SIMILES.filter((o) => o !== it), 3);
  return {
    prompt: 'Trong câu sau, hai sự vật nào được so sánh với nhau?',
    formula: it.s,
    answer: `${it.a} và ${it.b}`,
    wrong: [`${it.a} và ${x.b}`, `${y.a} và ${it.b}`, `${z.a} và ${x.b}`],
    hint: 'Sự vật thứ nhất đứng đầu câu, sự vật thứ hai đứng sau từ "như".',
    explain: `${it.a} được so sánh với ${it.b}.`,
  };
};

const COMPARE_WORD: QA[] = [
  ['Cô giáo hiền như mẹ.', 'như', 'rất|và|của', 'Từ so sánh thường là: như, tựa, tựa như.'],
  ['Ánh trăng tựa dòng sữa tràn vào sân.', 'tựa', 'vào|tràn|của', 'Từ so sánh thường là: như, tựa, tựa như.'],
  ['Đàn cá bơi lội như một đám mây bạc.', 'như', 'một|bơi|và', 'Từ nối hai sự vật được so sánh là từ so sánh.'],
  ['Lá cờ bay tựa ngọn lửa hồng.', 'tựa', 'bay|ngọn|lá', 'Từ so sánh thường là: như, tựa, tựa như.'],
  ['Bé cười tươi như hoa.', 'như', 'bé|tươi|cười', 'Tìm từ nối "bé cười tươi" với "hoa".'],
  ['Tiếng đàn ngân nga như suối reo.', 'như', 'đàn|ngân nga|reo', 'Tìm từ nối "tiếng đàn" với "suối reo".'],
  ['Mái tóc bà trắng như bông.', 'như', 'tóc|trắng|bà', 'Tìm từ nối "mái tóc bà" với "bông".'],
  ['Trời xanh tựa mặt nước hồ thu.', 'tựa', 'xanh|mặt|hồ', 'Từ so sánh thường là: như, tựa, tựa như.'],
];

const COMPARE_FILL: QA[] = [
  ['Đôi má bé hồng như ___.', 'quả đào chín', 'tờ giấy trắng|cái bàn|con dao', 'Chọn sự vật có màu hồng đáng yêu.'],
  ['Mặt hồ phẳng lặng như ___.', 'tấm gương', 'hòn đá|cây tre|con thuyền', 'Chọn sự vật phẳng và sáng.'],
  ['Tiếng chim hót trong như ___.', 'tiếng sáo', 'tiếng sấm|tiếng búa|tiếng còi xe', 'Chọn âm thanh trong trẻo, dễ nghe.'],
  ['Mái tóc bà trắng như ___.', 'bông', 'than|mực|đất', 'Chọn sự vật có màu trắng.'],
  ['Chú bé chạy nhanh như ___.', 'sóc', 'rùa|ốc sên|gấu', 'Chọn con vật nhanh nhẹn.'],
  ['Ông mặt trời đỏ như ___.', 'quả cầu lửa', 'khối băng|tờ giấy|bông tuyết', 'Chọn sự vật có màu đỏ rực.'],
  ['Quả bóng bay tròn như ___.', 'mặt trăng rằm', 'cái hộp|cây bút|tờ giấy vuông', 'Chọn sự vật hình tròn.'],
  ['Cánh đồng lúa chín vàng như ___.', 'tấm thảm màu vàng', 'tấm gương|dòng sông|đám mây đen', 'Chọn sự vật có màu vàng.'],
];

// ---------- Topic 2: nhân hóa ----------
const PERSONIFIED = ['Cây bàng đứng gác ở cổng trường.', 'Mặt trời thức dậy, mỉm cười với muôn loài.', 'Chị gió đi rong khắp phố.', 'Bác mèo mướp ngồi sưởi nắng ngoài hiên.', 'Những cánh hoa nhảy múa trong gió.', 'Cây cau đưa tay đón nắng.', 'Dòng sông mải miết chạy ra biển.', 'Những chú ve sầu hát vang trên cành cây.'];
const PLAIN = ['Cây bàng trồng ở cổng trường.', 'Mặt trời mọc ở đằng đông.', 'Gió thổi mạnh khắp phố.', 'Con mèo mướp nằm ngoài hiên.', 'Những cánh hoa rung rinh trong gió.', 'Cây cau cao vút.', 'Dòng sông chảy ra biển.', 'Những con ve sầu kêu trên cành cây.'];

const isPersonified: Maker = ({ r }): Draft => {
  const answer = pick(r, PERSONIFIED);
  return {
    prompt: 'Câu nào có hình ảnh nhân hóa?',
    answer,
    wrong: sample(r, PLAIN, 3),
    hint: 'Nhân hóa là gọi hoặc tả vật, cây cối, con vật bằng từ ngữ dành cho người.',
    explain: `Câu "${answer}" tả sự vật như con người.`,
  };
};

const WHO: QA[] = [
  ['Chị gió đi rong khắp phố.', 'gió', 'phố|mưa|đường', 'Sự vật được tả như người: đi rong, gọi là "chị".'],
  ['Bác mèo mướp ngồi sưởi nắng ngoài hiên.', 'mèo mướp', 'hiên|nắng|sân', 'Sự vật được gọi là "bác" và biết ngồi sưởi nắng.'],
  ['Mặt trời thức dậy, mỉm cười với muôn loài.', 'mặt trời', 'muôn loài|bầu trời|ánh nắng', 'Ai "thức dậy" và "mỉm cười" như người?'],
  ['Những cánh hoa nhảy múa trong gió.', 'cánh hoa', 'gió|vườn|bướm', 'Ai "nhảy múa" như người?'],
  ['Cây cau đưa tay đón nắng.', 'cây cau', 'nắng|gió|mặt trời', 'Ai "đưa tay" như người?'],
  ['Cây bàng đứng gác ở cổng trường.', 'cây bàng', 'cổng trường|bác bảo vệ|sân trường', 'Ai "đứng gác" như người?'],
  ['Dòng sông mải miết chạy ra biển.', 'dòng sông', 'biển|thuyền|bờ', 'Ai "mải miết chạy" như người?'],
  ['Những chú ve sầu hát vang trên cành cây.', 've sầu', 'cành cây|mùa hè|lá', 'Ai được gọi là "chú" và biết hát?'],
];

const HOW: QA[] = [
  ['Bác mèo mướp nằm ngoài hiên.', 'Gọi vật bằng từ ngữ chỉ người', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người|Trò chuyện với vật như với người|So sánh vật với vật', 'Từ "bác" vốn dùng để gọi người.'],
  ['Cây cau đưa tay đón nắng.', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người', 'Gọi vật bằng từ ngữ chỉ người|Trò chuyện với vật như với người|So sánh vật với vật', 'Cây không có tay, "đưa tay đón nắng" là hoạt động của người.'],
  ['Chim sơn ca ơi, bạn hót gì đấy?', 'Trò chuyện với vật như với người', 'Gọi vật bằng từ ngữ chỉ người|Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người|So sánh vật với vật', 'Bạn nhỏ nói chuyện trực tiếp với chim như với một người bạn.'],
  ['Ông mặt trời mọc ở đằng đông.', 'Gọi vật bằng từ ngữ chỉ người', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người|Trò chuyện với vật như với người|So sánh vật với vật', 'Từ "ông" vốn dùng để gọi người.'],
  ['Những cánh hoa mỉm cười với ong bướm.', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người', 'Gọi vật bằng từ ngữ chỉ người|Trò chuyện với vật như với người|So sánh vật với vật', 'Hoa không biết cười, "mỉm cười" là hoạt động của người.'],
  ['Chị ong nâu bay đi hút mật.', 'Gọi vật bằng từ ngữ chỉ người', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người|Trò chuyện với vật như với người|So sánh vật với vật', 'Từ "chị" vốn dùng để gọi người.'],
  ['Dòng sông mải miết chạy ra biển.', 'Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người', 'Gọi vật bằng từ ngữ chỉ người|Trò chuyện với vật như với người|So sánh vật với vật', 'Sông "mải miết chạy" như một người đang vội.'],
  ['Bạn gà con ơi, sao bạn chưa ngủ?', 'Trò chuyện với vật như với người', 'Gọi vật bằng từ ngữ chỉ người|Tả vật bằng từ ngữ chỉ hoạt động, đặc điểm của người|So sánh vật với vật', 'Câu này hỏi trực tiếp gà con như hỏi một người bạn.'],
];

// ---------- Topic 3: vốn từ quê hương ----------
const COUNTRY: QA[] = [
  ['', 'Hà Nội', 'Huế|Đà Nẵng|Cần Thơ', 'Thủ đô là nơi đặt các cơ quan lãnh đạo cả nước.', 'Thủ đô của nước Việt Nam là Hà Nội.', 'Thủ đô của nước ta là:'],
  ['', 'Quốc kỳ', 'Quốc ca|Quốc huy|Quốc tịch', 'Đây là lá cờ tượng trưng cho đất nước.', 'Lá cờ đỏ sao vàng là Quốc kỳ của Việt Nam.', 'Lá cờ đỏ sao vàng là:'],
  ['', 'Vịnh Hạ Long', 'Phố cổ Hội An|Đỉnh Fansipan|Hồ Gươm', 'Nơi này ở tỉnh Quảng Ninh, có hàng nghìn đảo đá.', 'Vịnh Hạ Long ở Quảng Ninh nổi tiếng với hàng nghìn đảo đá.', 'Cảnh đẹp nào ở Quảng Ninh nổi tiếng với hàng nghìn đảo đá?'],
  ['', 'Hồ Gươm', 'Hồ Ba Bể|Hồ Núi Cốc|Hồ Dầu Tiếng', 'Hồ này ở giữa thủ đô, gắn với truyền thuyết trả gươm thần.', 'Hồ Gươm (Hoàn Kiếm) nằm giữa Hà Nội.', 'Hồ nào nằm giữa thủ đô Hà Nội, gắn với truyền thuyết trả gươm thần?'],
  ['', 'sông Mê Công', 'sông Hồng|sông Đà|sông Hương', 'Con sông này còn gọi là sông Cửu Long.', 'Sông Mê Công (Cửu Long) chảy qua Đồng bằng sông Cửu Long.', 'Con sông lớn chảy qua Đồng bằng sông Cửu Long là:'],
  ['', 'Fansipan', 'Yên Tử|Bà Nà|Lang Biang', 'Đỉnh núi này được gọi là "nóc nhà Đông Dương".', 'Fansipan cao 3143 m, là đỉnh núi cao nhất Việt Nam.', 'Đỉnh núi cao nhất Việt Nam là:'],
  ['', 'Huế', 'Đà Lạt|Hải Phòng|Vũng Tàu', 'Nơi có Đại Nội, từng là kinh đô triều Nguyễn.', 'Huế là kinh đô của triều Nguyễn.', 'Nơi có Đại Nội, từng là kinh đô của triều Nguyễn, là:'],
  ['', 'Thành phố Hồ Chí Minh', 'Hà Nội|Hải Phòng|Cần Thơ', 'Đây là thành phố có đông dân nhất nước ta.', 'Thành phố Hồ Chí Minh là thành phố đông dân nhất Việt Nam.', 'Thành phố đông dân nhất nước ta là:'],
];
const FESTIVAL: QA[] = [
  ['', 'Tết Trung thu', 'Tết Nguyên đán|Tết Đoan ngọ|Ngày Quốc khánh', 'Ngày này rước đèn, phá cỗ vào rằm tháng Tám.', 'Tết Trung thu vào rằm tháng Tám, có rước đèn, phá cỗ.', 'Tết của thiếu nhi vào rằm tháng Tám là:'],
  ['', 'Tết Nguyên đán', 'Tết Trung thu|Tết Đoan ngọ|Ngày Nhà giáo', 'Đó là Tết đầu năm âm lịch, gia đình sum họp.', 'Tết Nguyên đán là Tết cổ truyền lớn nhất của người Việt.', 'Tết cổ truyền lớn nhất của người Việt là:'],
  ['', 'các vua Hùng', 'vua Quang Trung|Bác Hồ|Thánh Gióng', 'Đền Hùng thờ các vị vua dựng nước đầu tiên.', 'Lễ hội Đền Hùng tưởng nhớ các vua Hùng có công dựng nước.', 'Lễ hội Đền Hùng nhắc nhớ đến ai?'],
  ['', '2 tháng 9', '30 tháng 4|1 tháng 5|20 tháng 11', 'Ngày Bác Hồ đọc Tuyên ngôn Độc lập năm 1945.', 'Quốc khánh nước ta là ngày 2 tháng 9.', 'Ngày Quốc khánh của nước ta là ngày:'],
  ['', 'rước đèn, phá cỗ', 'đua thuyền|té nước|gói bánh chưng', 'Nhớ lại những gì em thường làm dịp rằm tháng Tám.', 'Trung thu có rước đèn, phá cỗ.', 'Hoạt động thường có trong Tết Trung thu là:'],
  ['', 'gói bánh chưng', 'rước đèn|phá cỗ trăng rằm|thả diều mùa hè', 'Món bánh này thường có trong Tết cổ truyền.', 'Gói bánh chưng là nét đẹp ngày Tết Nguyên đán.', 'Hoạt động nào thường có vào dịp Tết Nguyên đán?'],
  ['', '20 tháng 11', '8 tháng 3|1 tháng 6|22 tháng 12', 'Ngày tri ân thầy cô giáo.', 'Ngày Nhà giáo Việt Nam là 20 tháng 11.', 'Ngày Nhà giáo Việt Nam là ngày:'],
  ['', 'Thánh Gióng', 'Sơn Tinh|Chử Đồng Tử|An Dương Vương', 'Vị anh hùng nhổ tre đánh giặc Ân.', 'Hội Gióng kỉ niệm Thánh Gióng đánh giặc Ân.', 'Hội Gióng kỉ niệm vị anh hùng nào?'],
];
const CITY: QA[] = [
  ['', 'nhà cao tầng', 'cánh đồng|ao cá|đồi chè', 'Cảnh này thường thấy ở thành phố.', 'Nhà cao tầng là cảnh vật ở thành phố.', 'Cảnh vật nào thường thấy ở thành phố?'],
  ['', 'cánh đồng lúa', 'nhà cao tầng|đèn giao thông|siêu thị', 'Cảnh này thường thấy ở nông thôn.', 'Cánh đồng lúa là cảnh vật ở nông thôn.', 'Cảnh vật nào thường thấy ở nông thôn?'],
  ['', 'xe buýt', 'con trâu|xe cày|thuyền nan', 'Phương tiện chở nhiều người đi trong thành phố.', 'Xe buýt là phương tiện công cộng ở thành phố.', 'Phương tiện nào phổ biến ở thành phố?'],
  ['', 'nông dân', 'công nhân|bác sĩ|giáo viên', 'Người này làm việc trên đồng ruộng.', 'Người làm việc trên đồng ruộng gọi là nông dân.', 'Người làm việc trên đồng ruộng gọi là:'],
  ['', 'công nhân', 'nông dân|ngư dân|họa sĩ', 'Người này làm việc ở nhà máy, xí nghiệp.', 'Người làm việc trong nhà máy gọi là công nhân.', 'Người làm việc trong nhà máy gọi là:'],
  ['', 'thành phố', 'làng quê|bản làng|đồng ruộng', 'Nơi này có nhiều nhà máy, cửa hàng, đường phố đông đúc.', 'Nơi có nhiều nhà máy, cửa hàng, phố xá đông đúc là thành phố.', 'Nơi có nhiều nhà máy, cửa hàng, phố xá đông đúc là:'],
  ['', 'làng quê', 'thành phố|khu chung cư|trung tâm thương mại', 'Nơi này có tre làng, ao làng, cánh đồng.', 'Nơi có tre làng, ao làng, cánh đồng là làng quê.', 'Nơi có luỹ tre, ao làng, cánh đồng là:'],
  ['', 'đèn tín hiệu', 'gốc rạ|cái cày|đống rơm', 'Vật này điều khiển xe đi ở ngã tư.', 'Đèn tín hiệu giao thông có ở đường phố thành phố.', 'Vật nào giúp xe cộ đi đúng luật ở ngã tư phố?'],
];

// ---------- Topic 4: dấu hai chấm, dấu ngoặc kép ----------
const COLON: QA[] = [
  ['Cô giáo hỏi ___ "Ai làm bài xong rồi?"', ':', ',|;|.', 'Dấu hai chấm báo hiệu phần sau là lời nói của người khác.'],
  ['Em mua ba thứ ___ vở, bút và thước.', ':', ',|.|!', 'Dấu hai chấm báo hiệu phần liệt kê phía sau.'],
  ['Bố nói ___ "Con đi ngủ sớm nhé!"', ':', ',|;|.', 'Dấu hai chấm báo hiệu lời nói của bố.'],
  ['Trong vườn có nhiều loại hoa ___ hồng, cúc, lan.', ':', ',|.|?', 'Dấu hai chấm báo hiệu các loại hoa được kể ra.'],
  ['Bạn Lan reo lên ___ "Tuyết rơi rồi!"', ':', ',|;|.', 'Dấu hai chấm báo hiệu lời nói của bạn Lan.'],
  ['Mẹ dặn em ___ "Con nhớ đóng cửa nhé!"', ':', ',|;|.', 'Dấu hai chấm báo hiệu lời dặn của mẹ.'],
  ['Lớp em có ba tổ ___ Tổ 1, Tổ 2 và Tổ 3.', ':', ',|.|?', 'Dấu hai chấm báo hiệu phần kể ra các tổ.'],
  ['Ông hỏi ___ "Hôm nay cháu học gì?"', ':', ',|;|.', 'Dấu hai chấm báo hiệu lời hỏi của ông.'],
];
const QUOTE: QA[] = [
  ['', 'Đánh dấu lời nói trực tiếp của người hoặc nhân vật', 'Kết thúc câu kể|Ngăn cách các từ cùng loại|Kết thúc câu hỏi', 'Dấu ngoặc kép thường đi sau dấu hai chấm để ghi lời nói.', 'Dấu ngoặc kép đánh dấu lời nói trực tiếp.', 'Dấu ngoặc kép dùng để làm gì?'],
  ['Cô giáo nói: "Các em hãy giữ trật tự."', 'cô giáo', 'các em|học sinh|cả lớp', 'Lời nằm trong dấu ngoặc kép là lời của người đứng trước dấu hai chấm.', 'Cô giáo là người nói lời trong ngoặc kép.', 'Lời nói trong dấu ngoặc kép là của ai?'],
  ['Bà nói: "Cháu ăn cơm đi."', 'bà', 'cháu|mẹ|cô', 'Người đứng trước dấu hai chấm là người nói.', 'Bà nói câu "Cháu ăn cơm đi."', 'Lời nói trong dấu ngoặc kép là của ai?'],
  ['Bố dặn: "Con nhớ khóa cửa nhé!"', 'bố', 'con|mẹ|anh', 'Người đứng trước dấu hai chấm là người nói.', 'Bố dặn câu "Con nhớ khóa cửa nhé!"', 'Lời nói trong dấu ngoặc kép là của ai?'],
  ['', 'Nam nói: "Tớ sẽ giúp cậu."', 'Nam nói: Tớ sẽ giúp cậu."|Nam nói "Tớ sẽ giúp cậu.|Nam nói: "Tớ sẽ giúp cậu.', 'Lời nói cần có cả dấu ngoặc kép mở và đóng.', 'Câu đúng có dấu hai chấm và cặp ngoặc kép đầy đủ.', 'Câu nào ghi đúng lời nói trực tiếp?'],
  ['', 'Mẹ hỏi: "Con đã làm bài chưa?"', 'Mẹ hỏi "Con đã làm bài chưa?|Mẹ hỏi: Con đã làm bài chưa?"|Mẹ hỏi: "Con đã làm bài chưa?', 'Cần dấu hai chấm trước lời nói và đủ cặp ngoặc kép.', 'Câu đúng có dấu hai chấm và cặp ngoặc kép đầy đủ.', 'Câu nào ghi đúng lời nói trực tiếp?'],
  ['', 'Khi ghi lại nguyên văn lời nói của người khác', 'Khi kết thúc câu kể|Khi liệt kê sự vật|Khi báo hiệu lời giải thích', 'Nghĩ xem em ghi lại điều gì trong ngoặc kép.', 'Dấu ngoặc kép dùng khi ghi nguyên văn lời người khác.', 'Khi nào em dùng dấu ngoặc kép?'],
  ['Ông nói: "Cháu học giỏi lắm!"', 'Cháu học giỏi lắm!', 'Ông nói|Ông|Cháu', 'Lời nói nằm trong hai dấu ngoặc kép.', 'Lời ông nói là "Cháu học giỏi lắm!"', 'Phần nào là lời ông nói?'],
  ['Bạn Hà hỏi: "Cậu thích môn gì nhất?"', 'Cậu thích môn gì nhất?', 'Bạn Hà hỏi|Bạn Hà|Môn gì', 'Lời nói nằm trong hai dấu ngoặc kép.', 'Lời bạn Hà hỏi là "Cậu thích môn gì nhất?"', 'Phần nào là lời bạn Hà nói?'],
];
const BOTH: QA[] = [
  ['', 'Cô giáo dặn: "Ngày mai các em nhớ mang sách."', 'Cô giáo dặn "Ngày mai các em nhớ mang sách.|Cô giáo dặn: Ngày mai các em nhớ mang sách."|Cô giáo dặn, "Ngày mai các em nhớ mang sách.', 'Lời dặn cần dấu hai chấm ở trước và ngoặc kép ở hai đầu.'],
  ['', 'Em mang theo: bút, vở, thước kẻ.', 'Em mang theo bút: vở, thước kẻ.|Em mang: theo bút, vở, thước kẻ.|Em mang theo bút, vở: thước kẻ.', 'Dấu hai chấm đứng ngay trước phần liệt kê.'],
  ['', 'Bạn Nam nói: "Mình xin lỗi cậu."', 'Bạn Nam nói "Mình xin lỗi cậu.|Bạn Nam nói: Mình xin lỗi cậu."|Bạn Nam nói: "Mình xin lỗi cậu.', 'Lời nói cần dấu hai chấm và đủ cặp ngoặc kép.'],
  ['', 'Chợ quê có nhiều thứ: rau, cá, gà, trứng.', 'Chợ quê có nhiều: thứ rau, cá, gà, trứng.|Chợ quê có nhiều thứ rau: cá, gà, trứng.|Chợ quê: có nhiều thứ rau, cá, gà, trứng.', 'Dấu hai chấm đứng sau "nhiều thứ", trước phần kể ra.'],
  ['', 'Thầy hỏi: "Ai biết bài này?"', 'Thầy hỏi "Ai biết bài này?|Thầy hỏi: Ai biết bài này?"|Thầy hỏi: "Ai biết bài này?', 'Lời hỏi của thầy cần đủ cặp ngoặc kép.'],
  ['', 'Trong giỏ có ba loại quả: cam, xoài, ổi.', 'Trong giỏ có ba loại: quả cam, xoài, ổi.|Trong giỏ có: ba loại quả cam, xoài, ổi.|Trong giỏ có ba loại quả cam: xoài, ổi.', 'Dấu hai chấm đứng sau "ba loại quả", trước các loại quả.'],
  ['', 'Bà kể: "Ngày xưa có một chàng trai."', 'Bà kể "Ngày xưa có một chàng trai.|Bà kể: Ngày xưa có một chàng trai."|Bà kể: "Ngày xưa có một chàng trai.', 'Lời bà kể cần dấu hai chấm và đủ cặp ngoặc kép.'],
  ['', 'Mẹ dặn: "Con nhớ mặc áo ấm."', 'Mẹ dặn "Con nhớ mặc áo ấm.|Mẹ dặn: Con nhớ mặc áo ấm."|Mẹ dặn: "Con nhớ mặc áo ấm.', 'Lời dặn của mẹ cần dấu hai chấm và đủ cặp ngoặc kép.'],
];

// ---------- Topic 5: văn miêu tả ----------
const DESC: RD[] = [
  ['Cây phượng đầu sân trường cao lớn. Thân cây sần sùi, tán lá xòe rộng như chiếc ô. Mùa hè, hoa phượng nở đỏ rực cả góc sân.', 'Đoạn văn tả cái gì?', 'cây phượng', 'ngôi trường|chiếc ô|sân bóng', 'Tìm từ được nhắc nhiều nhất trong đoạn.'],
  ['Chiếc cặp của em màu xanh, có hai ngăn rộng và hai quai đeo chắc chắn. Ngày nào em cũng mang cặp đến trường.', 'Đoạn văn tả cái gì?', 'chiếc cặp sách', 'quyển vở|ngôi trường|cái bàn', 'Tìm vật có "hai ngăn" và "hai quai đeo".'],
  ['Chú mèo Mun có bộ lông đen mượt. Đôi mắt Mun xanh biếc, sáng long lanh. Mun thích nằm sưởi nắng bên cửa sổ.', 'Đoạn văn tả con vật nào?', 'con mèo', 'con chó|con thỏ|con gà', 'Đọc tên của con vật trong đoạn.'],
  ['Chiếc đồng hồ treo trên tường có mặt tròn, kim giờ ngắn, kim phút dài. Tiếng tích tắc vang đều đều suốt ngày.', 'Đoạn văn tả đồ vật nào?', 'chiếc đồng hồ', 'chiếc quạt|cái bàn|cái ti vi', 'Vật nào có kim giờ, kim phút?'],
  ['Cây bàng trước cổng trường xòe tán lá xanh mát. Mùa thu, lá bàng chuyển sang màu đỏ, rụng đầy sân.', 'Đoạn văn tả cây gì?', 'cây bàng', 'cây phượng|cây xoài|cây cau', 'Đọc câu đầu tiên.'],
  ['Em có một quyển vở mới. Bìa vở màu vàng, in hình chú gấu con. Các trang giấy trắng tinh, thơm mùi giấy mới.', 'Quyển vở có bìa màu gì?', 'màu vàng', 'màu xanh|màu đỏ|màu trắng', 'Đọc câu thứ hai.'],
  ['Chiếc cặp của em màu xanh, có hai ngăn rộng và hai quai đeo chắc chắn. Ngày nào em cũng mang cặp đến trường.', 'Chiếc cặp có mấy quai đeo?', 'hai quai', 'một quai|ba quai|bốn quai', 'Đọc câu đầu tiên.'],
  ['Chú mèo Mun có bộ lông đen mượt. Đôi mắt Mun xanh biếc, sáng long lanh. Mun thích nằm sưởi nắng bên cửa sổ.', 'Đôi mắt của Mun như thế nào?', 'xanh biếc, sáng long lanh', 'nâu, nhỏ xíu|đen láy, lờ đờ|vàng, nhắm nghiền', 'Đọc câu thứ hai.'],
];
const COLOR_WORDS: QA[] = [
  ['', 'vàng óng', 'xanh mướt|đỏ thắm|trắng xóa', 'Lúa chín có màu vàng.', 'Lúa chín vàng óng.', 'Từ ngữ nào tả màu sắc của lúa chín?'],
  ['', 'xanh mơn mởn', 'vàng ươm|đỏ rực|trắng ngần', 'Lá non có màu xanh tươi.', 'Lá non xanh mơn mởn.', 'Từ ngữ nào tả màu của lá non?'],
  ['', 'đỏ rực', 'xanh biếc|trắng tinh|tím ngắt', 'Hoa phượng nở có màu đỏ, rất rực rỡ.', 'Hoa phượng đỏ rực.', 'Từ ngữ nào tả màu của hoa phượng?'],
  ['', 'tròn xoe', 'dài ngoẵng|vuông vức|nhọn hoắt', 'Đôi mắt em bé thường có hình gì?', 'Mắt em bé tròn xoe.', 'Từ ngữ nào tả hình dáng đôi mắt em bé?'],
  ['', 'trắng muốt', 'đen kịt|xám xịt|nâu sẫm', 'Bông có màu trắng.', 'Bông trắng muốt.', 'Từ ngữ nào tả màu của bông?'],
  ['', 'xanh thẳm', 'đỏ au|vàng nhạt|nâu đất', 'Nghĩ đến màu của bầu trời hoặc biển sâu.', 'Bầu trời xanh thẳm.', 'Từ ngữ nào tả màu của bầu trời mùa thu?'],
  ['', 'thẳng tắp', 'cong queo|tròn xoe|lùn tịt', 'Cây cau, cây tre thường cao và không cong.', 'Cây cau thẳng tắp.', 'Từ ngữ nào tả dáng thân cây cau?'],
  ['', 'đỏ au', 'trắng phau|xanh lè|đen thui', 'Quả gấc, quả cà chua chín có màu đỏ.', 'Quả gấc chín đỏ au.', 'Từ ngữ nào tả màu của quả gấc chín?'],
];
const DESC_ORDER: string[][] = [
  ['Em có một chiếc cặp sách màu xanh.', 'Cặp có hai ngăn rộng, hai quai đeo chắc chắn.', 'Ngày nào em cũng mang cặp đến trường.', 'Em rất yêu quý chiếc cặp của mình.'],
  ['Trước cổng trường có một cây bàng lớn.', 'Thân cây to, tán lá xòe rộng như chiếc ô.', 'Giờ ra chơi, chúng em ngồi chơi dưới bóng cây.', 'Em rất yêu cây bàng của trường.'],
  ['Nhà em có một chú mèo tên là Mun.', 'Bộ lông của Mun đen mượt, đôi mắt xanh biếc.', 'Mun thích nằm sưởi nắng bên cửa sổ.', 'Em rất quý chú mèo Mun.'],
  ['Trên bàn học của em có một chiếc đồng hồ.', 'Mặt đồng hồ tròn, kim giờ ngắn, kim phút dài.', 'Nhờ đồng hồ, em biết giờ để đi học đúng giờ.', 'Em luôn giữ gìn chiếc đồng hồ cẩn thận.'],
];

export const vietnameseGrade3: Record<string, SkillDef[]> = {
  'g3-v-t1': [
    { name: 'Tìm sự vật được so sánh', desc: 'Hai sự vật nào được so sánh với nhau trong câu', diff: 3, make: whichCompared },
    { name: 'Từ ngữ chỉ sự so sánh', desc: 'Các từ như, tựa, tựa như', diff: 3, make: qa('Từ nào chỉ sự so sánh trong câu?', COMPARE_WORD) },
    { name: 'Chọn hình ảnh so sánh hợp lí', desc: 'Điền sự vật thích hợp vào câu so sánh', diff: 3, make: qa('Chọn hình ảnh so sánh thích hợp:', COMPARE_FILL) },
  ],
  'g3-v-t2': [
    { name: 'Nhận biết câu có nhân hóa', desc: 'Câu tả vật như tả người', diff: 3, make: isPersonified },
    { name: 'Sự vật được nhân hóa', desc: 'Tìm vật, cây cối, con vật được tả như người', diff: 3, make: qa('Sự vật nào được nhân hóa trong câu?', WHO) },
    { name: 'Các cách nhân hóa', desc: 'Gọi bằng từ chỉ người, tả bằng hoạt động của người, trò chuyện với vật', diff: 4, make: qa('Sự vật trong câu được nhân hóa bằng cách nào?', HOW) },
  ],
  'g3-v-t3': [
    { name: 'Đất nước Việt Nam', desc: 'Thủ đô, cảnh đẹp, sông núi của nước ta', diff: 3, make: qa('Chọn đáp án đúng:', COUNTRY) },
    { name: 'Lễ hội và ngày lễ', desc: 'Tết, lễ hội và ngày kỉ niệm', diff: 3, make: qa('Chọn đáp án đúng:', FESTIVAL) },
    { name: 'Thành thị và nông thôn', desc: 'Cảnh vật, nghề nghiệp ở thành phố và làng quê', diff: 3, make: qa('Chọn đáp án đúng:', CITY) },
  ],
  'g3-v-t4': [
    { name: 'Tác dụng của dấu hai chấm', desc: 'Báo hiệu lời nói và phần liệt kê', diff: 3, make: qa('Điền dấu câu thích hợp vào chỗ trống:', COLON) },
    { name: 'Tác dụng của dấu ngoặc kép', desc: 'Đánh dấu lời nói trực tiếp', diff: 4, make: qa('Chọn đáp án đúng:', QUOTE) },
    { name: 'Dùng đúng dấu hai chấm và ngoặc kép', desc: 'Chọn câu đặt dấu đúng', diff: 4, make: qa('Chọn câu dùng dấu đúng:', BOTH) },
  ],
  'g3-v-t5': [
    { name: 'Đọc đoạn văn miêu tả', desc: 'Nhận ra đối tượng và chi tiết được tả', diff: 3, make: reading(DESC) },
    { name: 'Từ ngữ tả màu sắc, hình dáng', desc: 'Chọn từ gợi tả hình ảnh', diff: 3, make: qa('Chọn từ ngữ thích hợp:', COLOR_WORDS) },
    { name: 'Sắp xếp câu thành đoạn văn tả', desc: 'Câu mở đầu giới thiệu, câu kết nêu cảm nghĩ', diff: 4, make: ordering(DESC_ORDER, 'Câu nào nên đặt ĐẦU TIÊN để giới thiệu?', 'Câu nào nên đặt CUỐI CÙNG để nêu cảm nghĩ?', 'Câu mở đầu thường giới thiệu đối tượng em tả.', 'Câu cuối thường nói lên tình cảm của em.') },
  ],
};
