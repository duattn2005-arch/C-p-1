import { Draft, Maker, SkillDef, pick, sample } from './core.js';
import { mix } from './englishKit.js';
import { QA, RD, WordClass, oddWord, ordering, qa, reading, whichWord } from './viKit.js';

// Tiếng Việt lớp 5 (GDPT 2018): từ đồng nghĩa - trái nghĩa - đồng âm - nhiều nghĩa, nghĩa gốc và nghĩa chuyển,
// câu ghép và quan hệ từ, vốn từ môi trường - hòa bình, văn tả người và kể chuyện.

// ---------- Topic 1: đồng nghĩa, trái nghĩa, đồng âm, nhiều nghĩa ----------
const SYNONYMS: [string, string][] = [
  ['chăm chỉ', 'cần cù'], ['dũng cảm', 'can đảm'], ['to lớn', 'khổng lồ'], ['thông minh', 'sáng dạ'], ['mênh mông', 'bao la'],
  ['Tổ quốc', 'đất nước'], ['nhanh chóng', 'mau lẹ'], ['hòa bình', 'thái bình'], ['yên tĩnh', 'tĩnh lặng'], ['giúp đỡ', 'hỗ trợ'], ['vui mừng', 'hân hoan'],
];
const NOT_SYNONYMS = ['lười biếng', 'hèn nhát', 'nhỏ bé', 'chậm chạp', 'ồn ào', 'buồn bã', 'chiến tranh', 'ngu ngốc', 'xa lạ', 'cản trở', 'giá lạnh', 'bẩn thỉu'];

const ANTONYMS: [string, string][] = [
  ['cao', 'thấp'], ['dài', 'ngắn'], ['sáng', 'tối'], ['nóng', 'lạnh'], ['rộng', 'hẹp'], ['nhanh', 'chậm'], ['mạnh', 'yếu'],
  ['vui', 'buồn'], ['siêng năng', 'lười biếng'], ['hiền lành', 'độc ác'], ['sạch', 'bẩn'], ['giàu', 'nghèo'], ['dũng cảm', 'hèn nhát'], ['trung thực', 'dối trá'],
];

// asks for the synonym / antonym of one word of a pair, in both directions
function pairs(list: [string, string][], pool: (a: string, b: string) => string[], relation: string): Maker {
  return ({ r, i }): Draft => {
    const [a, b] = list[Math.floor(i / 2) % list.length];
    const [q, ans] = i % 2 === 0 ? [a, b] : [b, a];
    return {
      prompt: `Từ nào ${relation} với từ "${q}"?`,
      answer: ans,
      wrong: sample(r, pool(a, b), 3),
      hint: relation === 'đồng nghĩa' ? 'Từ đồng nghĩa có nghĩa giống hoặc gần giống nhau.' : 'Từ trái nghĩa có nghĩa đối lập nhau.',
      explain: `"${q}" và "${ans}" là hai từ ${relation}.`,
    };
  };
}
const synonym = pairs(SYNONYMS, () => NOT_SYNONYMS, 'đồng nghĩa');
const antonym = pairs(ANTONYMS, (a, b) => ANTONYMS.flat().filter((x) => x !== a && x !== b), 'trái nghĩa');

const HOMONYM_KINDS = ['từ đồng âm', 'từ nhiều nghĩa', 'từ đồng nghĩa', 'từ trái nghĩa'];
const HOMONYM: QA[] = [
  ['"bàn" trong "cái bàn" và "bàn bạc kế hoạch"', 'từ đồng âm', HOMONYM_KINDS.slice(1).join('|'), 'Đồng âm: đọc giống nhau nhưng nghĩa không liên quan gì đến nhau.'],
  ['"chân" trong "chân người", "chân bàn", "chân núi"', 'từ nhiều nghĩa', ['từ đồng âm', 'từ đồng nghĩa', 'từ trái nghĩa'].join('|'), 'Nhiều nghĩa: các nghĩa có mối liên hệ với nhau (đều là phần dưới cùng, để đỡ).'],
  ['"đá" trong "hòn đá" và "đá bóng"', 'từ đồng âm', HOMONYM_KINDS.slice(1).join('|'), 'Hòn đá và hành động đá bóng không liên quan về nghĩa.'],
  ['"mắt" trong "mắt người", "mắt na", "mắt lưới"', 'từ nhiều nghĩa', ['từ đồng âm', 'từ đồng nghĩa', 'từ trái nghĩa'].join('|'), 'Các nghĩa đều bắt nguồn từ hình dáng, vị trí của con mắt.'],
  ['"đậu" trong "hạt đậu" và "đậu xe"', 'từ đồng âm', HOMONYM_KINDS.slice(1).join('|'), 'Hạt đậu và việc dừng xe là hai nghĩa không liên quan.'],
  ['"tay" trong "tay người", "tay ghế", "tay lái"', 'từ nhiều nghĩa', ['từ đồng âm', 'từ đồng nghĩa', 'từ trái nghĩa'].join('|'), 'Các nghĩa có liên hệ với bộ phận để cầm nắm, tì đỡ.'],
  ['"cờ" trong "lá cờ" và "ván cờ"', 'từ đồng âm', HOMONYM_KINDS.slice(1).join('|'), 'Lá cờ và ván cờ là hai nghĩa không liên quan.'],
  ['"lưỡi" trong "lưỡi người", "lưỡi dao", "lưỡi cày"', 'từ nhiều nghĩa', ['từ đồng âm', 'từ đồng nghĩa', 'từ trái nghĩa'].join('|'), 'Các nghĩa đều chỉ phần dẹt, mỏng, có hình dáng giống cái lưỡi.'],
].map(([f, a, w, h]) => [f, a, w, h, `Đây là ${a}.`, 'Những từ được đặt trong ngoặc kép là:'] as QA);

// ---------- Topic 2: nghĩa gốc và nghĩa chuyển ----------
const ORIGINAL: QA[] = [
  ['', 'Bé đau chân nên không đi được.', 'Chân bàn bị gãy.|Ngôi nhà nằm dưới chân núi.|Anh ấy có chân trong đội bóng.', 'Nghĩa gốc là nghĩa đầu tiên: chân của người.', undefined, 'Câu nào dùng từ "chân" theo nghĩa gốc?'],
  ['', 'Bé nhắm mắt lại để ngủ.', 'Quả na đã mở mắt.|Mắt lưới bị rách.|Mắt tre nảy chồi.', 'Nghĩa gốc là con mắt của người.', undefined, 'Câu nào dùng từ "mắt" theo nghĩa gốc?'],
  ['', 'Bạn Nam bị đau đầu.', 'Đầu làng có cây đa cổ thụ.|Đầu bảng xếp hạng là đội nhà.|Đầu năm học mới rất vui.', 'Nghĩa gốc là cái đầu của người.', undefined, 'Câu nào dùng từ "đầu" theo nghĩa gốc?'],
  ['', 'Mẹ nắm tay em qua đường.', 'Tay ghế bị hỏng.|Anh ấy có tay nghề cao.|Tay lái xe rất vững.', 'Nghĩa gốc là bàn tay của người.', undefined, 'Câu nào dùng từ "tay" theo nghĩa gốc?'],
  ['', 'Bé đánh răng mỗi buổi sáng.', 'Răng cưa bị mòn.|Răng lược bị gãy.|Răng bánh xe khớp nhau.', 'Nghĩa gốc là răng trong miệng người.', undefined, 'Câu nào dùng từ "răng" theo nghĩa gốc?'],
  ['', 'Con mèo liếm lưỡi.', 'Lưỡi dao rất sắc.|Lưỡi cày đã cùn.|Lưỡi kéo bị gỉ.', 'Nghĩa gốc là cái lưỡi trong miệng.', undefined, 'Câu nào dùng từ "lưỡi" theo nghĩa gốc?'],
  ['', 'Bé há miệng ăn cơm.', 'Miệng giếng đầy rêu.|Miệng túi bị rách.|Miệng hố rất sâu.', 'Nghĩa gốc là miệng của người.', undefined, 'Câu nào dùng từ "miệng" theo nghĩa gốc?'],
  ['', 'Bạn nhỏ quàng khăn ở cổ.', 'Cổ chai rất hẹp.|Cổ áo bị sờn.|Cổ lọ hoa rất mảnh.', 'Nghĩa gốc là cái cổ của người.', undefined, 'Câu nào dùng từ "cổ" theo nghĩa gốc?'],
];
const SENSES: [string, string, string][] = [
  ['Bé đau chân.', 'chân', 'nghĩa gốc'], ['Chân bàn bị lung lay.', 'chân', 'nghĩa chuyển'], ['Mắt bé tròn xoe.', 'mắt', 'nghĩa gốc'],
  ['Quả na đã mở mắt.', 'mắt', 'nghĩa chuyển'], ['Bạn Nam bị đau đầu.', 'đầu', 'nghĩa gốc'], ['Đầu làng có cây đa cổ thụ.', 'đầu', 'nghĩa chuyển'],
  ['Mẹ nắm tay em.', 'tay', 'nghĩa gốc'], ['Tay ghế bị gãy.', 'tay', 'nghĩa chuyển'], ['Lưỡi dao rất sắc.', 'lưỡi', 'nghĩa chuyển'],
  ['Con mèo liếm lưỡi.', 'lưỡi', 'nghĩa gốc'], ['Miệng giếng đầy rêu.', 'miệng', 'nghĩa chuyển'], ['Bé há miệng ăn cơm.', 'miệng', 'nghĩa gốc'],
];
const sense: Maker = ({ i }): Draft => {
  const [s, w, kind] = SENSES[i % SENSES.length];
  return {
    prompt: `Từ "${w}" trong câu sau được dùng với nghĩa nào?`,
    formula: s,
    answer: kind,
    wrong: [kind === 'nghĩa gốc' ? 'nghĩa chuyển' : 'nghĩa gốc'],
    hint: `Nghĩa gốc của "${w}" chỉ bộ phận của người hoặc con vật. Nghĩa chuyển là nghĩa mở rộng sang vật khác.`,
    explain: kind === 'nghĩa gốc' ? `Ở đây "${w}" chỉ bộ phận của cơ thể, là nghĩa gốc.` : `Ở đây "${w}" chỉ một bộ phận của vật khác, là nghĩa chuyển.`,
  };
};
const MEANING: QA[] = [
  ['Tay ghế này bị gãy.', 'bộ phận để tì tay của ghế', 'bàn tay của người|người giỏi nghề|cánh tay của robot', 'Nghĩ xem tay ghế dùng để làm gì.', undefined, 'Từ "tay" trong câu có nghĩa là:'],
  ['Chúng em nghỉ chân ở chân núi.', 'phần dưới cùng của núi', 'bàn chân của người|người thân trong nhà|cái chân của chiếc ghế', 'Chân núi là phần thấp nhất của ngọn núi.', undefined, 'Từ "chân" trong câu có nghĩa là:'],
  ['Quả na này đã mở mắt.', 'phần lồi trên vỏ quả, giống con mắt', 'con mắt của người|lỗ trên tấm lưới|người canh gác', 'Nghĩ xem vỏ quả na có gì giống con mắt.', undefined, 'Từ "mắt" trong câu có nghĩa là:'],
  ['Đầu làng có một cây đa cổ thụ.', 'phần bắt đầu của làng', 'cái đầu của người|người đứng đầu|đầu óc thông minh', 'Đầu làng là nơi bắt đầu con đường vào làng.', undefined, 'Từ "đầu" trong câu có nghĩa là:'],
  ['Lưỡi dao này rất sắc.', 'phần sắc bén dùng để cắt của dao', 'cái lưỡi trong miệng|lời nói khéo|cái lưỡi của con rắn', 'Lưỡi dao là phần dẹt, mỏng để cắt.', undefined, 'Từ "lưỡi" trong câu có nghĩa là:'],
  ['Cổ chai bị vỡ một mảnh.', 'phần thon nhỏ phía trên của chai', 'cái cổ của người|cổ áo|dây đeo cổ', 'Cổ chai là phần thắt nhỏ ở phía trên.', undefined, 'Từ "cổ" trong câu có nghĩa là:'],
  ['Cưa này bị mẻ mất mấy chiếc răng.', 'phần nhọn để cắt gỗ của cưa', 'răng trong miệng người|chiếc lược|cái kéo', 'Răng cưa là những mũi nhọn nhỏ, đều nhau.', undefined, 'Từ "răng" trong câu có nghĩa là:'],
  ['Cánh cửa mở toang.', 'phần cửa có thể đóng mở', 'cánh của con chim|cánh tay|cánh đồng', 'Cánh cửa là tấm đóng mở được của cửa.', undefined, 'Từ "cánh" trong câu có nghĩa là:'],
];

// ---------- Topic 3: câu ghép, quan hệ từ ----------
const COMPOUND = ['Trời mưa to nên đường phố ngập nước.', 'Mặt trời vừa mọc, sương mù tan dần.', 'Nếu em chăm chỉ thì em sẽ đạt điểm cao.', 'Tuy nhà nghèo nhưng Nam vẫn học giỏi.', 'Gió thổi mạnh và mưa rơi xối xả.', 'Vì trời rét nên em mặc áo ấm.', 'Trời càng mưa, đường càng lầy lội.', 'Mẹ nấu cơm còn bố đọc báo.'];
const SIMPLE = ['Mẹ em là giáo viên tiểu học.', 'Con mèo đang ngủ trên ghế.', 'Cả lớp cùng hát bài ca mừng cô.', 'Những bông hoa nở rực rỡ trong vườn.', 'Bạn Nam rất chăm chỉ và học giỏi.', 'Em đi học bằng xe đạp.', 'Buổi sáng, chim hót trên cành cây.', 'Bố tôi làm việc ở nhà máy.'];

const compound: Maker = ({ r, i }): Draft => {
  if (i % 2 === 0) {
    const answer = pick(r, COMPOUND);
    return {
      prompt: 'Câu nào là câu ghép?',
      answer,
      wrong: sample(r, SIMPLE, 3),
      hint: 'Câu ghép có từ hai cụm chủ ngữ - vị ngữ trở lên, mỗi cụm là một vế câu.',
      explain: `"${answer}" có hai vế câu, mỗi vế có chủ ngữ và vị ngữ riêng.`,
    };
  }
  const answer = pick(r, SIMPLE);
  return {
    prompt: 'Câu nào là câu đơn (chỉ có một cụm chủ ngữ - vị ngữ)?',
    answer,
    wrong: sample(r, COMPOUND, 3),
    hint: 'Câu đơn chỉ có một cụm chủ ngữ - vị ngữ.',
    explain: `"${answer}" chỉ có một cụm chủ ngữ - vị ngữ.`,
  };
};

const CONNECTIVES: QA[] = [
  ['Vì trời mưa ___ đường trơn.', 'nên', 'nhưng|tuy|hoặc', 'Quan hệ nguyên nhân - kết quả: vì ... nên ...'],
  ['Tuy nhà nghèo ___ Nam vẫn học giỏi.', 'nhưng', 'nên|nếu|hoặc', 'Quan hệ tương phản: tuy ... nhưng ...'],
  ['Nếu em chăm chỉ ___ em sẽ đạt điểm cao.', 'thì', 'nhưng|hoặc|tuy', 'Quan hệ điều kiện - kết quả: nếu ... thì ...'],
  ['Bạn muốn uống nước cam ___ nước chanh?', 'hay', 'và|nhưng|nên', 'Từ nối hai điều để lựa chọn.'],
  ['Em thích môn Toán ___ môn Tiếng Việt.', 'và', 'nên|nhưng|thì', 'Từ nối hai điều cùng loại.'],
  ['Mưa rất to ___ Nam vẫn đến trường.', 'nhưng', 'nên|hoặc|thì', 'Hai vế có ý trái ngược nhau.'],
  ['Vì em bị ốm ___ em nghỉ học.', 'nên', 'nhưng|hoặc|và', 'Vế sau là kết quả của vế trước.'],
  ['Chúng ta cần ăn uống đủ chất ___ cơ thể khỏe mạnh.', 'để', 'nhưng|hoặc|tuy', 'Từ nối cho biết mục đích.'],
  ['Trong câu "Tuy trời rét nhưng em vẫn đi học", cặp quan hệ từ là:', 'tuy ... nhưng', 'vì ... nên|nếu ... thì|không những ... mà còn', 'Tìm hai từ nối hai vế câu.'],
  ['Trong câu "Nếu trời nắng thì lớp em đi dã ngoại", cặp quan hệ từ là:', 'nếu ... thì', 'tuy ... nhưng|vì ... nên|hễ ... là', 'Tìm hai từ nối hai vế câu.'],
];

const HO_UNG: [string, string][] = [
  ['Trời càng mưa to, đường càng lầy lội.', 'càng ... càng'],
  ['Mẹ vừa đi chợ về, em đã chạy ra đón.', 'vừa ... đã'],
  ['Trời chưa sáng, gà đã gáy.', 'chưa ... đã'],
  ['Bạn Lan không những học giỏi mà còn hát hay.', 'không những ... mà còn'],
  ['Hễ trời mưa là đường ngập.', 'hễ ... là'],
  ['Mẹ đi đâu, con theo đó.', 'đâu ... đó'],
  ['Mẹ cho bao nhiêu, em ăn bấy nhiêu.', 'bao nhiêu ... bấy nhiêu'],
  ['Tuy nhà xa nhưng bạn Nam không bao giờ đi muộn.', 'tuy ... nhưng'],
];
const hoUng: Maker = ({ r, i }): Draft => {
  const [s, ans] = HO_UNG[i % HO_UNG.length];
  return {
    prompt: 'Cặp từ nối hai vế trong câu ghép sau là:',
    formula: s,
    answer: ans,
    wrong: sample(r, HO_UNG.map((x) => x[1]).filter((x) => x !== ans), 3),
    hint: 'Tìm hai từ đứng ở hai vế câu, đi cùng nhau để nối các vế.',
    explain: `Hai vế câu được nối bằng cặp "${ans}".`,
  };
};

// ---------- Topic 4: môi trường, hòa bình ----------
const PROTECT: WordClass = {
  label: 'chỉ việc làm bảo vệ môi trường',
  words: ['trồng cây', 'tiết kiệm nước', 'thu gom rác', 'tái chế', 'bảo vệ rừng', 'giữ vệ sinh', 'dọn dẹp', 'trồng rừng'],
  hint: 'Đó là những việc làm giúp không khí, đất và nước sạch hơn.',
};
const HARM: WordClass = {
  label: 'chỉ việc làm gây hại cho môi trường',
  words: ['xả rác', 'chặt phá rừng', 'đốt rác bừa bãi', 'xả nước thải', 'săn bắt thú', 'phá hoại', 'lãng phí nước', 'khai thác bừa bãi'],
  hint: 'Đó là những việc làm làm ô nhiễm hoặc hủy hoại thiên nhiên.',
};
const ENV_SET = [PROTECT, HARM];

const NATURE: QA[] = [
  ['', 'Không săn bắt, buôn bán thú rừng', 'Săn bắt thú lấy da|Bắt hàng loạt chim về nuôi|Phá rừng lấy đất', 'Bảo vệ động vật hoang dã là để chúng được sống yên trong tự nhiên.', undefined, 'Việc làm nào giúp bảo vệ động vật hoang dã?'],
  ['', 'Để làm sạch không khí và che bóng mát', 'Để cây che khuất nhà|Để có nhiều lá rụng|Vì cây rất tốn nước', 'Cây xanh hút khí cacbonic và nhả khí oxi.', undefined, 'Vì sao cần trồng nhiều cây xanh?'],
  ['', 'Khí cacbonic', 'Khí oxi|Khí nitơ|Khí hiđrô', 'Cây quang hợp: hút khí cacbonic, nhả khí oxi.', undefined, 'Khí nào cây xanh hút vào để quang hợp?'],
  ['', 'tia cực tím có hại từ Mặt Trời', 'mưa đá|động đất|bão', 'Tầng ô-dôn giống như tấm lá chắn trên cao.', undefined, 'Tầng ô-dôn bảo vệ Trái Đất khỏi:'],
  ['', 'lâu phân hủy, gây ô nhiễm đất và nước', 'tan ngay khi gặp nước|làm đất màu mỡ|giúp cây phát triển', 'Túi nhựa có thể tồn tại hàng trăm năm.', undefined, 'Rác thải nhựa có hại vì:'],
  ['', 'Khóa vòi nước khi không dùng', 'Để vòi chảy khi đánh răng|Tưới cây giữa trưa nắng|Rửa xe bằng vòi xả liên tục', 'Tiết kiệm nước là dùng vừa đủ, không để nước chảy phí.', undefined, 'Việc làm nào giúp tiết kiệm nước?'],
  ['', '5 tháng 6', '22 tháng 3|8 tháng 3|1 tháng 6', 'Ngày này nhắc mọi người bảo vệ môi trường.', undefined, 'Ngày Môi trường thế giới là ngày:'],
  ['', '22 tháng 3', '5 tháng 6|22 tháng 4|1 tháng 5', 'Ngày này nhắc mọi người quý trọng nguồn nước.', undefined, 'Ngày Nước thế giới là ngày:'],
];
const PEACE: QA[] = [
  ['', 'hòa bình', 'binh biến|xung đột|đình công', 'Nghĩ đến lúc không còn tiếng súng.', undefined, 'Từ nào có nghĩa "không có chiến tranh"?'],
  ['', 'thái bình', 'loạn lạc|chiến trận|tranh đấu', 'Hai từ này cùng nói về cuộc sống yên ổn.', undefined, 'Từ nào đồng nghĩa với "hòa bình"?'],
  ['', 'gìn giữ hòa bình và hợp tác giữa các nước', 'tổ chức thi đấu thể thao|kinh doanh thương mại|xây dựng đường sá', 'Liên Hợp Quốc là tổ chức của nhiều quốc gia trên thế giới.', undefined, 'Liên Hợp Quốc được thành lập chủ yếu để làm gì?'],
  ['', 'tình bạn thân thiện giữa các nước, các dân tộc', 'sự đối đầu|sự tranh giành|sự lo sợ', '"Hữu" là bạn, "nghị" là tình cảm.', undefined, 'Từ "hữu nghị" có nghĩa là:'],
  ['', 'Kết bạn, giao lưu với thiếu nhi các nước', 'Cãi nhau với bạn nước ngoài|Từ chối giúp bạn|Chê bai văn hóa nước khác', 'Hữu nghị là thân thiện, tôn trọng lẫn nhau.', undefined, 'Việc làm nào thể hiện tinh thần hữu nghị?'],
  ['', 'chim bồ câu', 'chim đại bàng|con hổ|con rồng', 'Con vật này thường mang cành ô-liu trong tranh cổ động.', undefined, 'Biểu tượng của hòa bình là:'],
  ['', '1 tháng 6', '8 tháng 3|20 tháng 11|5 tháng 6', 'Đây là ngày dành riêng cho thiếu nhi.', undefined, 'Ngày Quốc tế Thiếu nhi là ngày:'],
  ['', 'thù địch', 'thân thiện|hòa thuận|đoàn kết', 'Trái nghĩa với hữu nghị là đối đầu, căm ghét nhau.', undefined, 'Từ nào trái nghĩa với "hữu nghị"?'],
];

// ---------- Topic 5: tả người, kể chuyện ----------
const PERSON: RD[] = [
  ['Bà em có mái tóc bạc trắng như mây, đôi mắt hiền từ. Khuôn mặt bà hằn nhiều nếp nhăn.', 'Đoạn văn trên chủ yếu tả:', 'ngoại hình', 'tính tình|hoạt động|cảnh vật', 'Đoạn văn tả tóc, mắt, khuôn mặt.'],
  ['Mẹ em rất hiền và chịu khó. Mẹ luôn nhường phần ngon cho các con.', 'Đoạn văn trên chủ yếu tả:', 'tính tình', 'ngoại hình|hoạt động|cảnh vật', 'Đoạn văn nói về tính nết của mẹ.'],
  ['Bố cầm cuốc ra vườn từ sáng sớm. Bố xới đất, vun luống rất thoăn thoắt.', 'Đoạn văn trên chủ yếu tả:', 'hoạt động', 'ngoại hình|tính tình|cảnh vật', 'Đoạn văn kể bố làm những việc gì.'],
  ['Bạn Nam cao lớn, da ngăm đen, nụ cười luôn rạng rỡ.', 'Đoạn văn trên chủ yếu tả:', 'ngoại hình', 'tính tình|hoạt động|cảnh vật', 'Đoạn văn tả dáng người, nước da, nụ cười.'],
  ['Cô giáo em dịu dàng, luôn quan tâm học sinh và không bao giờ nổi nóng.', 'Đoạn văn trên chủ yếu tả:', 'tính tình', 'ngoại hình|hoạt động|cảnh vật', 'Đoạn văn nói về tính nết của cô.'],
  ['Ông nội ngồi bên hiên, chậm rãi pha trà rồi mở báo ra đọc.', 'Đoạn văn trên chủ yếu tả:', 'hoạt động', 'ngoại hình|tính tình|cảnh vật', 'Đoạn văn kể ông đang làm gì.'],
  ['Chị Hai có dáng người mảnh mai, mái tóc dài buông qua vai.', 'Đoạn văn trên chủ yếu tả:', 'ngoại hình', 'tính tình|hoạt động|cảnh vật', 'Đoạn văn tả dáng người và mái tóc.'],
  ['Anh trai em tính vui vẻ, hay giúp đỡ mọi người và rất trung thực.', 'Đoạn văn trên chủ yếu tả:', 'tính tình', 'ngoại hình|hoạt động|cảnh vật', 'Đoạn văn nói về tính nết của anh.'],
];
const LOOKS: WordClass = {
  label: 'ngữ tả ngoại hình',
  words: ['mái tóc bạc trắng', 'đôi mắt tròn xoe', 'dáng người cao gầy', 'nước da ngăm đen', 'khuôn mặt phúc hậu', 'nụ cười rạng rỡ'],
  hint: 'Ngoại hình là những gì ta nhìn thấy ở người: tóc, mắt, dáng, nước da...',
};
const CHARACTER: WordClass = {
  label: 'ngữ tả tính tình',
  words: ['hiền lành', 'chịu khó', 'trung thực', 'vui vẻ', 'ân cần', 'dịu dàng', 'nóng tính'],
  hint: 'Tính tình là nết của người: hiền, chăm, trung thực...',
};
const DOING: WordClass = {
  label: 'ngữ tả hoạt động',
  words: ['ngồi đọc báo', 'quét sân', 'nấu cơm', 'cầm cuốc ra vườn', 'dạy học', 'đón em'],
  hint: 'Hoạt động là những việc người ấy làm.',
};
const PERSON_SET = [LOOKS, CHARACTER, DOING];

const POINT_OF_VIEW: QA[] = [
  ['Tôi cùng các bạn đi cắm trại.', 'ngôi thứ nhất', 'ngôi thứ hai|ngôi thứ ba|không có ngôi kể', 'Người kể xưng "tôi" là ngôi thứ nhất.'],
  ['Nam đi học về, thấy mẹ đang nấu cơm.', 'ngôi thứ ba', 'ngôi thứ nhất|ngôi thứ hai|không có ngôi kể', 'Người kể gọi nhân vật bằng tên hoặc "anh ấy", "cô ấy".'],
  ['Mình đã quên mang sách nên rất lo.', 'ngôi thứ nhất', 'ngôi thứ hai|ngôi thứ ba|không có ngôi kể', 'Người kể xưng "mình" là ngôi thứ nhất.'],
  ['Cô bé ngồi bên cửa sổ, ngắm mưa rơi.', 'ngôi thứ ba', 'ngôi thứ nhất|ngôi thứ hai|không có ngôi kể', 'Người kể không xưng "tôi" mà kể về cô bé.'],
  ['Em còn nhớ mùa hè năm ấy, em đã theo bà ra đồng.', 'ngôi thứ nhất', 'ngôi thứ hai|ngôi thứ ba|không có ngôi kể', 'Người kể xưng "em" và kể chuyện của chính mình.'],
  ['Chú Hai đang sửa lại chiếc thuyền, ông cười rất tươi.', 'ngôi thứ ba', 'ngôi thứ nhất|ngôi thứ hai|không có ngôi kể', 'Người kể nói về chú Hai từ bên ngoài.'],
].map(([f, a, w, h]) => [f, a, w, h, `Câu chuyện được kể theo ${a}.`, 'Câu chuyện sau được kể theo ngôi nào?'] as QA);

const PERSON_ORDER: string[][] = [
  ['Người em yêu quý nhất là bà nội.', 'Bà có mái tóc bạc trắng và đôi mắt hiền từ.', 'Mỗi sáng, bà dậy sớm quét sân, tưới cây và nấu cơm cho cả nhà.', 'Em mong bà luôn khỏe mạnh để mãi ở bên em.'],
  ['Cô Hương là giáo viên chủ nhiệm của lớp em.', 'Cô có dáng người thanh mảnh và giọng nói ấm áp.', 'Cô luôn kiên nhẫn giảng lại bài cho những bạn chưa hiểu.', 'Em rất biết ơn và kính trọng cô.'],
  ['Bố em là một người thợ mộc.', 'Bố có đôi bàn tay thô ráp, rắn chắc.', 'Bố miệt mài bào, đục từng tấm gỗ đến tối muộn.', 'Em tự hào về người bố chăm chỉ của mình.'],
  ['Bạn Minh ngồi cạnh em là người bạn thân nhất.', 'Minh có khuôn mặt tròn, đôi mắt sáng và nụ cười tươi.', 'Minh luôn sẵn lòng giúp đỡ mọi người trong lớp.', 'Em thấy mình thật may mắn khi có bạn Minh.'],
];

export const vietnameseGrade5: Record<string, SkillDef[]> = {
  'g5-v-t1': [
    { name: 'Từ đồng nghĩa', desc: 'Tìm từ có nghĩa giống hoặc gần giống', diff: 3, make: synonym },
    { name: 'Từ trái nghĩa', desc: 'Tìm từ có nghĩa đối lập', diff: 3, make: antonym },
    { name: 'Từ đồng âm và từ nhiều nghĩa', desc: 'Phân biệt hai loại từ dễ nhầm', diff: 4, make: qa('Những từ đặt trong ngoặc kép là:', HOMONYM) },
  ],
  'g5-v-t2': [
    { name: 'Tìm câu dùng nghĩa gốc', desc: 'Nghĩa gốc là nghĩa đầu tiên của từ', diff: 3, make: qa('Chọn câu đúng:', ORIGINAL) },
    { name: 'Nghĩa gốc hay nghĩa chuyển?', desc: 'Nhận ra từ được dùng theo nghĩa nào', diff: 4, make: sense },
    { name: 'Hiểu nghĩa chuyển của từ', desc: 'Giải thích nghĩa của từ trong câu', diff: 4, make: qa('Chọn nghĩa đúng:', MEANING) },
  ],
  'g5-v-t3': [
    { name: 'Câu ghép và câu đơn', desc: 'Đếm số cụm chủ ngữ - vị ngữ để phân biệt', diff: 4, make: compound },
    { name: 'Quan hệ từ nối các vế câu', desc: 'vì ... nên, tuy ... nhưng, nếu ... thì...', diff: 4, make: qa('Chọn quan hệ từ thích hợp:', CONNECTIVES) },
    { name: 'Cặp từ hô ứng', desc: 'càng ... càng, vừa ... đã, hễ ... là...', diff: 5, make: hoUng },
  ],
  'g5-v-t4': [
    { name: 'Từ ngữ về bảo vệ môi trường', desc: 'Việc làm có ích và việc làm có hại', diff: 3, make: mix([whichWord(PROTECT, ENV_SET), oddWord(PROTECT, ENV_SET, PROTECT.label), whichWord(HARM, ENV_SET)]) },
    { name: 'Bảo tồn thiên nhiên', desc: 'Rừng, nước, không khí và động vật hoang dã', diff: 4, make: qa('Chọn đáp án đúng:', NATURE) },
    { name: 'Hòa bình và hữu nghị', desc: 'Từ ngữ và hiểu biết về hòa bình', diff: 4, make: qa('Chọn đáp án đúng:', PEACE) },
  ],
  'g5-v-t5': [
    { name: 'Nhận biết đoạn văn tả người', desc: 'Tả ngoại hình, tính tình hay hoạt động', diff: 4, make: reading(PERSON) },
    { name: 'Từ ngữ tả người', desc: 'Từ ngữ tả ngoại hình, tính tình, hoạt động', diff: 4, make: mix([whichWord(LOOKS, PERSON_SET), whichWord(CHARACTER, PERSON_SET), whichWord(DOING, PERSON_SET)]) },
    { name: 'Ngôi kể và sắp xếp bài văn', desc: 'Kể theo ngôi thứ nhất, thứ ba; mở bài - kết bài', diff: 5, make: mix([qa('Câu chuyện sau được kể theo ngôi nào?', POINT_OF_VIEW), ordering(PERSON_ORDER, 'Câu nào nên làm MỞ BÀI?', 'Câu nào nên làm KẾT BÀI?', 'Mở bài giới thiệu người em định tả.', 'Kết bài nêu tình cảm của em với người đó.')]) },
  ],
};
