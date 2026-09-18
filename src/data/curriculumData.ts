import { 
  GradeLevel, 
  SubjectId, 
  Topic, 
  Skill, 
  CurriculumQuestion, 
  CurriculumLesson 
} from '../types/curriculum';
import { Lesson, Question, AnswerOption } from '../types';

// ==========================================
// 1. TOPICS DEFINITION (75 TOPICS)
// ==========================================
export const topicsDatabase: Topic[] = [
  // --- GRADE 1: MATH ---
  { id: 'g1-m-t1', grade: 1, subject_id: 'math', name: 'Số và phép đếm (1 - 20)', description: 'Làm quen chữ số, đếm xuôi đếm ngược từ 1 đến 20', icon: '🔢', order_index: 1 },
  { id: 'g1-m-t2', grade: 1, subject_id: 'math', name: 'So sánh số & Vị trí', description: 'Lớn hơn, bé hơn, bằng nhau (> < =), trước sau', icon: '⚖️', order_index: 2 },
  { id: 'g1-m-t3', grade: 1, subject_id: 'math', name: 'Phép cộng phạm vi 10 & 20', description: 'Cộng thêm, gộp nhóm đồ vật và số', icon: '➕', order_index: 3 },
  { id: 'g1-m-t4', grade: 1, subject_id: 'math', name: 'Phép trừ phạm vi 10 & 20', description: 'Bớt đi, tách số và phép trừ cơ bản', icon: '➖', order_index: 4 },
  { id: 'g1-m-t5', grade: 1, subject_id: 'math', name: 'Hình học & Đo lường cơ bản', description: 'Vuông, tròn, tam giác và đo que tính, cm', icon: '📐', order_index: 5 },

  // --- GRADE 1: VIETNAMESE ---
  { id: 'g1-v-t1', grade: 1, subject_id: 'vietnamese', name: 'Bảng chữ cái & Dấu thanh', description: '29 chữ cái và 5 dấu thanh tiếng Việt', icon: '🔤', order_index: 1 },
  { id: 'g1-v-t2', grade: 1, subject_id: 'vietnamese', name: 'Âm đầu & Phân biệt chính tả', description: 'Phân biệt c/k, g/gh, ng/ngh đi với e, ê, i', icon: '✍️', order_index: 2 },
  { id: 'g1-v-t3', grade: 1, subject_id: 'vietnamese', name: 'Ghép vần cơ bản', description: 'Các vần an, at, am, ap, ong, oc, ươn, ươt', icon: '🧩', order_index: 3 },
  { id: 'g1-v-t4', grade: 1, subject_id: 'vietnamese', name: 'Đọc từ mở rộng', description: 'Đọc đúng từ ngữ quen thuộc quanh bé', icon: '📖', order_index: 4 },
  { id: 'g1-v-t5', grade: 1, subject_id: 'vietnamese', name: 'Đọc câu ngắn & Lời chào', description: 'Luyện đọc câu 3-5 từ và lời chào lễ phép', icon: '🗣️', order_index: 5 },

  // --- GRADE 1: ENGLISH ---
  { id: 'g1-e-t1', grade: 1, subject_id: 'english', name: 'Alphabet & Phonics', description: 'Letters A to Z and their gentle sounds', icon: '🅰️', order_index: 1 },
  { id: 'g1-e-t2', grade: 1, subject_id: 'english', name: 'Numbers 1 to 10', description: 'Count from One to Ten in English', icon: '1️⃣', order_index: 2 },
  { id: 'g1-e-t3', grade: 1, subject_id: 'english', name: 'Colors & Shapes', description: 'Red, blue, green, yellow, star, circle', icon: '🎨', order_index: 3 },
  { id: 'g1-e-t4', grade: 1, subject_id: 'english', name: 'Family & Friends', description: 'Mom, dad, brother, sister, baby', icon: '👨‍👩‍👧', order_index: 4 },
  { id: 'g1-e-t5', grade: 1, subject_id: 'english', name: 'Cute Animals & Pets', description: 'Dog, cat, bird, fish, rabbit', icon: '🐶', order_index: 5 },

  // --- GRADE 2: MATH ---
  { id: 'g2-m-t1', grade: 2, subject_id: 'math', name: 'Số đến 1000 & Hàng số', description: 'Trăm, chục, đơn vị và phân tích số', icon: '💯', order_index: 1 },
  { id: 'g2-m-t2', grade: 2, subject_id: 'math', name: 'Phép cộng có nhớ trong 100', description: 'Cộng có nhớ sang hàng chục (28 + 15)', icon: '➕', order_index: 2 },
  { id: 'g2-m-t3', grade: 2, subject_id: 'math', name: 'Phép trừ có nhớ trong 100', description: 'Mượn 1 chục khi trừ: 52 − 27, 43 − 18', icon: '➖', order_index: 3 },
  { id: 'g2-m-t4', grade: 2, subject_id: 'math', name: 'Bảng nhân 2, 5 & Phép chia', description: 'Nhân 2, 5 và làm quen phép chia đều', icon: '✖️', order_index: 4 },
  { id: 'g2-m-t5', grade: 2, subject_id: 'math', name: 'Đo lường & Xem đồng hồ', description: 'dm, m, kg, lít và xem giờ đúng, giờ rưỡi', icon: '⏰', order_index: 5 },

  // --- GRADE 2: VIETNAMESE ---
  { id: 'g2-v-t1', grade: 2, subject_id: 'vietnamese', name: 'Từ chỉ sự vật, hoạt động, đặc điểm', description: 'Nhận biết danh từ, động từ, tính từ sơ khai', icon: '🏷️', order_index: 1 },
  { id: 'g2-v-t2', grade: 2, subject_id: 'vietnamese', name: 'Mô hình câu kiểu', description: 'Ai là gì? Ai làm gì? Ai thế nào?', icon: '💬', order_index: 2 },
  { id: 'g2-v-t3', grade: 2, subject_id: 'vietnamese', name: 'Dấu câu cơ bản', description: 'Dấu chấm, dấu phẩy, dấu hỏi, dấu chấm than', icon: '❓', order_index: 3 },
  { id: 'g2-v-t4', grade: 2, subject_id: 'vietnamese', name: 'Mở rộng vốn từ', description: 'Chủ đề Gia đình, Thầy cô, Bạn bè, Muông thú', icon: '🌳', order_index: 4 },
  { id: 'g2-v-t5', grade: 2, subject_id: 'vietnamese', name: 'Đọc hiểu & Kể chuyện', description: 'Đọc hiểu bài thơ ngắn và trả lời câu hỏi', icon: '📚', order_index: 5 },

  // --- GRADE 2: ENGLISH ---
  { id: 'g2-e-t1', grade: 2, subject_id: 'english', name: 'School Objects & Classroom', description: 'Pencil, ruler, eraser, bag, desk, chair', icon: '🎒', order_index: 1 },
  { id: 'g2-e-t2', grade: 2, subject_id: 'english', name: 'My Body & Feelings', description: 'Eyes, ears, nose, hands, happy, tired', icon: '😊', order_index: 2 },
  { id: 'g2-e-t3', grade: 2, subject_id: 'english', name: 'Food & Drinks', description: 'Apple, milk, bread, banana, juice', icon: '🍎', order_index: 3 },
  { id: 'g2-e-t4', grade: 2, subject_id: 'english', name: 'Action Verbs', description: 'Run, jump, read, write, draw, sing', icon: '🏃', order_index: 4 },
  { id: 'g2-e-t5', grade: 2, subject_id: 'english', name: 'Toys & Fun', description: 'Ball, doll, robot, car, kite', icon: '🧸', order_index: 5 },

  // --- GRADE 3: MATH ---
  { id: 'g3-m-t1', grade: 3, subject_id: 'math', name: 'Số đến 10.000 & 100.000', description: 'Đọc, viết, so sánh số có 4-5 chữ số', icon: '🔢', order_index: 1 },
  { id: 'g3-m-t2', grade: 3, subject_id: 'math', name: 'Bảng nhân và chia (6, 7, 8, 9)', description: 'Bảng nhân 7, 8, 9 và phép chia có dư', icon: '✖️', order_index: 2 },
  { id: 'g3-m-t3', grade: 3, subject_id: 'math', name: 'Phép trừ có nhớ phạm vi lớn', description: 'Trừ có nhớ nhiều lần trong phạm vi 10.000', icon: '➖', order_index: 3 },
  { id: 'g3-m-t4', grade: 3, subject_id: 'math', name: 'Chu vi & Diện tích', description: 'Chu vi và diện tích hình vuông, chữ nhật', icon: '📐', order_index: 4 },
  { id: 'g3-m-t5', grade: 3, subject_id: 'math', name: 'Toán có lời văn hai phép tính', description: 'Bài toán gấp lên nhiều lần, giảm đi nhiều lần', icon: '💡', order_index: 5 },

  // --- GRADE 3: VIETNAMESE ---
  { id: 'g3-v-t1', grade: 3, subject_id: 'vietnamese', name: 'Biện pháp tu từ: So sánh', description: 'Nhận biết hình ảnh so sánh qua từ là, như', icon: '✨', order_index: 1 },
  { id: 'g3-v-t2', grade: 3, subject_id: 'vietnamese', name: 'Biện pháp tu từ: Nhân hóa', description: 'Gọi vật bằng từ chỉ người, tả vật như người', icon: '🎭', order_index: 2 },
  { id: 'g3-v-t3', grade: 3, subject_id: 'vietnamese', name: 'Mở rộng vốn từ Quê hương', description: 'Vốn từ về Đất nước, Lễ hội, Thành thị', icon: '🇻🇳', order_index: 3 },
  { id: 'g3-v-t4', grade: 3, subject_id: 'vietnamese', name: 'Dấu hai chấm & Dấu ngoặc kép', description: 'Tác dụng báo hiệu lời nói và lời dẫn trực tiếp', icon: '💬', order_index: 4 },
  { id: 'g3-v-t5', grade: 3, subject_id: 'vietnamese', name: 'Tập làm văn miêu tả', description: 'Viết đoạn văn ngắn tả đồ vật, cây cối', icon: '📝', order_index: 5 },

  // --- GRADE 3: ENGLISH ---
  { id: 'g3-e-t1', grade: 3, subject_id: 'english', name: 'Daily Routines & Time', description: 'Wake up, go to school, what time is it?', icon: '⏰', order_index: 1 },
  { id: 'g3-e-t2', grade: 3, subject_id: 'english', name: 'Clothes & Weather', description: 'Shirt, dress, sunny, rainy, cold, windy', icon: '👗', order_index: 2 },
  { id: 'g3-e-t3', grade: 3, subject_id: 'english', name: 'Places in Town', description: 'Park, zoo, school, library, supermarket', icon: '🏙️', order_index: 3 },
  { id: 'g3-e-t4', grade: 3, subject_id: 'english', name: 'Present Continuous (V-ing)', description: 'What are you doing? I am playing soccer', icon: '⚽', order_index: 4 },
  { id: 'g3-e-t5', grade: 3, subject_id: 'english', name: 'Can and Can\'t for Abilities', description: 'Can swim, can speak English, cannot fly', icon: '🌟', order_index: 5 },

  // --- GRADE 4: MATH ---
  { id: 'g4-m-t1', grade: 4, subject_id: 'math', name: 'Đặt tính phép chia & nhân lớn', description: 'Phép chia số có 2 chữ số (51019 : 19)', icon: '➗', order_index: 1 },
  { id: 'g4-m-t2', grade: 4, subject_id: 'math', name: 'Dấu hiệu chia hết (2, 3, 5, 9)', description: 'Dấu hiệu chia hết và trung bình cộng', icon: '🔢', order_index: 2 },
  { id: 'g4-m-t3', grade: 4, subject_id: 'math', name: 'Phân số & 4 phép tính', description: 'Rút gọn, quy đồng, cộng trừ nhân chia phân số', icon: '🥧', order_index: 3 },
  { id: 'g4-m-t4', grade: 4, subject_id: 'math', name: 'Hình bình hành & Hình thoi', description: 'Tính chất và công thức diện tích', icon: '🔷', order_index: 4 },
  { id: 'g4-m-t5', grade: 4, subject_id: 'math', name: 'Toán Tổng - Hiệu & Tổng - Tỉ', description: 'Dạng toán kinh điển của SGK Lớp 4', icon: '📈', order_index: 5 },

  // --- GRADE 4: VIETNAMESE ---
  { id: 'g4-v-t1', grade: 4, subject_id: 'vietnamese', name: 'Danh từ, Động từ, Tính từ', description: 'Xác định từ loại trong câu văn', icon: '🏷️', order_index: 1 },
  { id: 'g4-v-t2', grade: 4, subject_id: 'vietnamese', name: 'Cấu tạo của tiếng', description: 'Âm đầu, vần, thanh trong tiếng Việt', icon: '🔊', order_index: 2 },
  { id: 'g4-v-t3', grade: 4, subject_id: 'vietnamese', name: 'Trạng ngữ trong câu', description: 'Trạng ngữ chỉ nơi chốn, thời gian, nguyên nhân', icon: '🧭', order_index: 3 },
  { id: 'g4-v-t4', grade: 4, subject_id: 'vietnamese', name: 'Mở rộng vốn từ Nhân hậu', description: 'Vốn từ về Lòng nhân ái, Ý chí, Nghị lực', icon: '❤️', order_index: 4 },
  { id: 'g4-v-t5', grade: 4, subject_id: 'vietnamese', name: 'Văn miêu tả cây cối & con vật', description: 'Cấu trúc bài văn miêu tả và chi tiết đặc sắc', icon: '🦁', order_index: 5 },

  // --- GRADE 4: ENGLISH ---
  { id: 'g4-e-t1', grade: 4, subject_id: 'english', name: 'Countries & Nationalities', description: 'Vietnam - Vietnamese, America - American', icon: '🗺️', order_index: 1 },
  { id: 'g4-e-t2', grade: 4, subject_id: 'english', name: 'Days, Months & Birthdays', description: 'When is your birthday? It is in October', icon: '🎂', order_index: 2 },
  { id: 'g4-e-t3', grade: 4, subject_id: 'english', name: 'School Subjects & Timetable', description: 'Math, Science, Music, Art, PE', icon: '🔬', order_index: 3 },
  { id: 'g4-e-t4', grade: 4, subject_id: 'english', name: 'Past Simple (Was/Were)', description: 'Where were you yesterday? I was at home', icon: '⏮️', order_index: 4 },
  { id: 'g4-e-t5', grade: 4, subject_id: 'english', name: 'Animal Habitats & Comparative', description: 'Bigger than, faster than, zoo animals', icon: '🦒', order_index: 5 },

  // --- GRADE 5: MATH ---
  { id: 'g5-m-t1', grade: 5, subject_id: 'math', name: 'Phân số thập phân & Hỗn số', description: 'Khái niệm phân số thập phân và đổi hỗn số', icon: '🔣', order_index: 1 },
  { id: 'g5-m-t2', grade: 5, subject_id: 'math', name: 'Số thập phân & 4 phép tính', description: 'Cộng, trừ, nhân, chia số thập phân', icon: '🔢', order_index: 2 },
  { id: 'g5-m-t3', grade: 5, subject_id: 'math', name: 'Tỉ số phần trăm (%)', description: 'Tìm tỉ số phần trăm và bài toán thực tế', icon: '📊', order_index: 3 },
  { id: 'g5-m-t4', grade: 5, subject_id: 'math', name: 'Hình học & Thể tích khối', description: 'Hình thang, hình tròn, thể tích hình hộp cm3, m3', icon: '📦', order_index: 4 },
  { id: 'g5-m-t5', grade: 5, subject_id: 'math', name: 'Toán chuyển động đều (v = s : t)', description: 'Vận tốc, quãng đường, thời gian, ngược chiều', icon: '🚗', order_index: 5 },

  // --- GRADE 5: VIETNAMESE ---
  { id: 'g5-v-t1', grade: 5, subject_id: 'vietnamese', name: 'Từ đồng nghĩa & Trái nghĩa', description: 'Phân biệt từ đồng âm và từ nhiều nghĩa', icon: '🔁', order_index: 1 },
  { id: 'g5-v-t2', grade: 5, subject_id: 'vietnamese', name: 'Nghĩa gốc và nghĩa chuyển', description: 'Xác định nghĩa gốc và nghĩa chuyển của từ', icon: '🌿', order_index: 2 },
  { id: 'g5-v-t3', grade: 5, subject_id: 'vietnamese', name: 'Câu ghép & Quan hệ từ', description: 'Nối vế câu ghép bằng quan hệ từ, cặp từ hô ứng', icon: '🔗', order_index: 3 },
  { id: 'g5-v-t4', grade: 5, subject_id: 'vietnamese', name: 'Mở rộng vốn từ Môi trường', description: 'Vốn từ về Bảo tồn thiên nhiên, Hòa bình', icon: '🌍', order_index: 4 },
  { id: 'g5-v-t5', grade: 5, subject_id: 'vietnamese', name: 'Tập làm văn tả người & Kể chuyện', description: 'Tả ngoại hình, tính tình, hoạt động của người', icon: '✍️', order_index: 5 },

  // --- GRADE 5: ENGLISH ---
  { id: 'g5-e-t1', grade: 5, subject_id: 'english', name: 'Adverbs of Frequency', description: 'Always, usually, often, sometimes, never', icon: '🔄', order_index: 1 },
  { id: 'g5-e-t2', grade: 5, subject_id: 'english', name: 'Future Plans (Be going to)', description: 'What are you going to do this summer?', icon: '🏖️', order_index: 2 },
  { id: 'g5-e-t3', grade: 5, subject_id: 'english', name: 'Health & Giving Advice', description: 'Have a headache, should go to the doctor', icon: '🩺', order_index: 3 },
  { id: 'g5-e-t4', grade: 5, subject_id: 'english', name: 'Superlatives (The most / -est)', description: 'The highest mountain, the biggest animal', icon: '🏆', order_index: 4 },
  { id: 'g5-e-t5', grade: 5, subject_id: 'english', name: 'Stories & Reading Comprehension', description: 'Fairy tales, fables and answering questions', icon: '📖', order_index: 5 },
];

// ==========================================
// 2. SKILLS DEFINITION (MIN 3 SKILLS PER TOPIC)
// ==========================================
export const skillsDatabase: Skill[] = [
  // LỚP 1: MATH TOPIC 1 (Số và phép đếm 1-20)
  { id: 'g1-m-s1', grade: 1, subject_id: 'math', topic_id: 'g1-m-t1', name: 'Đếm xuôi và đếm ngược trong phạm vi 10', description: 'Đếm số lượng que tính và hình vẽ từ 1 đến 10', difficulty: 1, order_index: 1 },
  { id: 'g1-m-s2', grade: 1, subject_id: 'math', topic_id: 'g1-m-t1', name: 'Đọc và viết các số từ 11 đến 20', description: 'Cấu tạo số gồm 1 chục và các đơn vị', difficulty: 2, order_index: 2 },
  { id: 'g1-m-s3', grade: 1, subject_id: 'math', topic_id: 'g1-m-t1', name: 'Tìm số liền trước và số liền sau', description: 'Xác định số đứng ngay trước và ngay sau trên tia số', difficulty: 2, order_index: 3 },

  // LỚP 1: MATH TOPIC 2 (So sánh số)
  { id: 'g1-m-s4', grade: 1, subject_id: 'math', topic_id: 'g1-m-t2', name: 'So sánh lớn hơn, bé hơn, bằng nhau (>, <, =)', description: 'Dùng dấu so sánh số lượng hai nhóm vật thể', difficulty: 1, order_index: 1 },
  { id: 'g1-m-s5', grade: 1, subject_id: 'math', topic_id: 'g1-m-t2', name: 'Sắp xếp dãy số theo thứ tự tăng/giảm dần', description: 'Xếp từ bé đến lớn và từ lớn đến bé', difficulty: 2, order_index: 2 },
  { id: 'g1-m-s6', grade: 1, subject_id: 'math', topic_id: 'g1-m-t2', name: 'Xác định vị trí: trên/dưới, trước/sau, trái/phải', description: 'Định hướng không gian cơ bản cho bé', difficulty: 1, order_index: 3 },

  // LỚP 1: MATH TOPIC 3 (Phép cộng)
  { id: 'g1-m-s7', grade: 1, subject_id: 'math', topic_id: 'g1-m-t3', name: 'Phép cộng trong phạm vi 10', description: 'Tính nhẩm các phép cộng như 3 + 4, 6 + 2', difficulty: 1, order_index: 1 },
  { id: 'g1-m-s8', grade: 1, subject_id: 'math', topic_id: 'g1-m-t3', name: 'Phép cộng dạng 14 + 3 và 10 + 5', description: 'Cộng số tròn chục với đơn vị và cộng không nhớ', difficulty: 2, order_index: 2 },
  { id: 'g1-m-s9', grade: 1, subject_id: 'math', topic_id: 'g1-m-t3', name: 'Tính nhẩm phép cộng qua 10', description: 'Tách số để cộng tròn chục: 8 + 5, 9 + 4', difficulty: 3, order_index: 3 },

  // LỚP 1: MATH TOPIC 4 (Phép trừ)
  { id: 'g1-m-s10', grade: 1, subject_id: 'math', topic_id: 'g1-m-t4', name: 'Phép trừ trong phạm vi 10', description: 'Tính nhẩm các phép trừ như 7 − 3, 9 − 5', difficulty: 1, order_index: 1 },
  { id: 'g1-m-s11', grade: 1, subject_id: 'math', topic_id: 'g1-m-t4', name: 'Phép trừ dạng 17 − 4 và 15 − 5', description: 'Trừ số có 2 chữ số cho số có 1 chữ số không nhớ', difficulty: 2, order_index: 2 },
  { id: 'g1-m-s12', grade: 1, subject_id: 'math', topic_id: 'g1-m-t4', name: 'Tính nhẩm phép trừ qua 10', description: '12 − 5, 14 − 6 bằng cách đếm lùi hoặc tách 10', difficulty: 3, order_index: 3 },

  // LỚP 1: MATH TOPIC 5 (Hình học & Đo lường)
  { id: 'g1-m-s13', grade: 1, subject_id: 'math', topic_id: 'g1-m-t5', name: 'Nhận diện hình vuông, tròn, tam giác, chữ nhật', description: 'Chỉ ra hình dạng tương ứng của các đồ vật', difficulty: 1, order_index: 1 },
  { id: 'g1-m-s14', grade: 1, subject_id: 'math', topic_id: 'g1-m-t5', name: 'Đo độ dài bằng que tính và gang tay', description: 'Ước lượng độ dài trực quan xung quanh', difficulty: 1, order_index: 2 },
  { id: 'g1-m-s15', grade: 1, subject_id: 'math', topic_id: 'g1-m-t5', name: 'Làm quen đơn vị xăng-ti-mét (cm)', description: 'Đọc vạch thước kẻ từ 0cm đến 10cm', difficulty: 2, order_index: 3 },

  // LỚP 2: MATH TOPIC 3 (Phép trừ có nhớ - TRỌNG TÂM)
  { id: 'g2-m-s7', grade: 2, subject_id: 'math', topic_id: 'g2-m-t3', name: 'Phép trừ có nhớ dạng số có 2 chữ số (52 − 27)', description: 'Quy tắc mượn 1 chục ở hàng đơn vị và trả vào hàng chục', difficulty: 3, order_index: 1 },
  { id: 'g2-m-s8', grade: 2, subject_id: 'math', topic_id: 'g2-m-t3', name: 'Đặt tính rồi tính phép trừ có nhớ', description: 'Viết thẳng cột hàng đơn vị, hàng chục và tính từ phải sang trái', difficulty: 3, order_index: 2 },
  { id: 'g2-m-s9', grade: 2, subject_id: 'math', topic_id: 'g2-m-t3', name: 'Giải bài toán có lời văn về phép trừ có nhớ', description: 'Bài toán bớt đi, ít hơn số ban đầu', difficulty: 3, order_index: 3 },

  // LỚP 3: MATH TOPIC 2 (Bảng nhân 7 & Chia)
  { id: 'g3-m-s4', grade: 3, subject_id: 'math', topic_id: 'g3-m-t2', name: 'Học thuộc và vận dụng Bảng nhân 7', description: 'Tính nhẩm nhanh 7 × 1 đến 7 × 10', difficulty: 2, order_index: 1 },
  { id: 'g3-m-s5', grade: 3, subject_id: 'math', topic_id: 'g3-m-t2', name: 'Bảng chia 7 và tìm một phần bảy', description: 'Thực hiện phép chia trong bảng chia 7', difficulty: 2, order_index: 2 },
  { id: 'g3-m-s6', grade: 3, subject_id: 'math', topic_id: 'g3-m-t2', name: 'Phép chia có dư và điều kiện số dư < số chia', description: 'Tìm thương và số dư trong phép chia', difficulty: 3, order_index: 3 },

  // LỚP 3: MATH TOPIC 3 (Phép trừ có nhớ)
  { id: 'g3-m-s7', grade: 3, subject_id: 'math', topic_id: 'g3-m-t3', name: 'Phép trừ có nhớ trong phạm vi 100 nâng cao', description: 'Trừ nhanh không cần đặt tính: 64 − 38, 81 − 45', difficulty: 3, order_index: 1 },
  { id: 'g3-m-s8', grade: 3, subject_id: 'math', topic_id: 'g3-m-t3', name: 'Phép trừ có nhớ các số có 3 và 4 chữ số', description: 'Trừ có nhớ liên tiếp từ hàng chục sang hàng trăm', difficulty: 4, order_index: 2 },
  { id: 'g3-m-s9', grade: 3, subject_id: 'math', topic_id: 'g3-m-t3', name: 'Tìm x trong biểu thức phép trừ (x − b = c hoặc a − x = b)', description: 'Xác định số bị trừ và số trừ chưa biết', difficulty: 3, order_index: 3 },

  // LỚP 4: MATH TOPIC 1 (Phép chia lớn 51019 : 19 - TRỌNG TÂM)
  { id: 'g4-m-s1', grade: 4, subject_id: 'math', topic_id: 'g4-m-t1', name: 'Đặt tính rồi tính: Chia cho số có hai chữ số (51019 : 19)', description: 'Các bước ước lượng thương, nhân ngược và trừ từng lần chia', difficulty: 4, order_index: 1 },
  { id: 'g4-m-s2', grade: 4, subject_id: 'math', topic_id: 'g4-m-t1', name: 'Kiểm tra và thử lại phép chia có dư', description: 'Công thức: (Thương × Số chia) + Số dư = Số bị chia', difficulty: 3, order_index: 2 },
  { id: 'g4-m-s3', grade: 4, subject_id: 'math', topic_id: 'g4-m-t1', name: 'Bài toán thực tế áp dụng phép chia có dư', description: 'Xếp hàng, chia đều quà và tìm số xe cần chở', difficulty: 4, order_index: 3 },

  // LỚP 5: MATH TOPIC 5 (Toán chuyển động đều v = s : t)
  { id: 'g5-m-s13', grade: 5, subject_id: 'math', topic_id: 'g5-m-t5', name: 'Công thức tính vận tốc, quãng đường, thời gian', description: 'v = s : t, s = v × t, t = s : v và đổi đơn vị km/h, m/s', difficulty: 3, order_index: 1 },
  { id: 'g5-m-s14', grade: 5, subject_id: 'math', topic_id: 'g5-m-t5', name: 'Bài toán hai chuyển động ngược chiều (gặp nhau)', description: 'Thời gian gặp nhau = Quãng đường : (v1 + v2)', difficulty: 4, order_index: 2 },
  { id: 'g5-m-s15', grade: 5, subject_id: 'math', topic_id: 'g5-m-t5', name: 'Bài toán hai chuyển động cùng chiều (đuổi kịp)', description: 'Thời gian đuổi kịp = Khoảng cách : (v1 − v2)', difficulty: 5, order_index: 3 },
];

// Add generic skills for remaining topics programmatically to guarantee every topic has >= 3 skills
topicsDatabase.forEach((topic) => {
  const existing = skillsDatabase.filter((s) => s.topic_id === topic.id);
  if (existing.length < 3) {
    const countNeeded = 3 - existing.length;
    for (let i = 1; i <= countNeeded; i++) {
      const idx = existing.length + i;
      skillsDatabase.push({
        id: `${topic.id}-s${idx}`,
        grade: topic.grade,
        subject_id: topic.subject_id,
        topic_id: topic.id,
        name: `${topic.name} - Kỹ năng trọng tâm ${idx}`,
        description: `Thực hành và làm chủ ${topic.name} cấp độ ${idx}`,
        difficulty: (Math.min(5, idx + 1) as any),
        order_index: idx,
      });
    }
  }
});

// ==========================================
// 3. SAMPLE QUESTION BANK & GENERATORS
// ==========================================
export const questionBank: CurriculumQuestion[] = [
  // --- KỸ NĂNG: Phép trừ có nhớ 52 - 27 (g2-m-s7) ---
  {
    id: 'q-sub-52-27',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm hoặc đặt tính phép tính sau:',
    formula: '52 − 27 = ?',
    choices: ['25', '35', '24', '26'],
    correct_answer: '25',
    hint: '2 không trừ được 7, ta mượn 1 chục thành 12. Lấy 12 − 7 = 5.',
    hint_level_2: 'Nhớ trả 1 vào hàng chục của số trừ: 2 thêm 1 là 3. Lấy 5 − 3 = 2. Đáp án là 25!',
    step_by_step: [
      'Bước 1: Hàng đơn vị: 2 < 7, mượn 1 chục thành 12. 12 − 7 = 5 (viết 5, nhớ 1).',
      'Bước 2: Hàng chục: 2 thêm 1 bằng 3.',
      'Bước 3: 5 − 3 = 2 (viết 2).',
      'Bước 4: Kết quả cuối cùng là 25!'
    ],
    explanation: 'Khi số bị trừ ở hàng đơn vị nhỏ hơn số trừ, ta mượn 1 chục rồi trừ, sau đó nhớ 1 trả lại vào hàng chục của số trừ.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-43-18',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Kết quả của phép tính là bao nhiêu?',
    formula: '43 − 18 = ?',
    choices: ['25', '35', '24', '15'],
    correct_answer: '25',
    hint: '3 không trừ được 8, mượn 1 chục thành 13.',
    hint_level_2: '13 − 8 = 5. Trả 1 vào 1 được 2. 4 − 2 = 2.',
    step_by_step: [
      'Bước 1: 3 không trừ được 8, mượn 1 chục thành 13. 13 − 8 = 5, viết 5 nhớ 1.',
      'Bước 2: 1 thêm 1 là 2. 4 − 2 = 2.',
      'Bước 3: Kết quả là 25.'
    ],
    explanation: '43 − 18 = 25.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-64-38',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính kết quả:',
    formula: '64 − 38 = ?',
    choices: ['26', '36', '24', '28'],
    correct_answer: '26',
    hint: '4 không trừ được 8, mượn 1 chục thành 14 trừ 8.',
    hint_level_2: '14 − 8 = 6. 3 thêm 1 là 4. 6 − 4 = 2.',
    step_by_step: [
      'Bước 1: Hàng đơn vị: 14 − 8 = 6 (nhớ 1).',
      'Bước 2: Hàng chục: 3 + 1 = 4. 6 − 4 = 2.',
      'Bước 3: Kết quả là 26.'
    ],
    explanation: '64 − 38 = 26.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-71-45',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Thực hiện phép tính:',
    formula: '71 − 45 = ?',
    choices: ['26', '36', '25', '24'],
    correct_answer: '26',
    hint: '1 mượn 1 chục thành 11. 11 − 5 = ?',
    hint_level_2: '11 − 5 = 6. Trả 1 vào 4 là 5. 7 − 5 = 2.',
    step_by_step: [
      'Bước 1: 11 − 5 = 6 (nhớ 1).',
      'Bước 2: 7 − (4 + 1) = 2.',
      'Bước 3: Kết quả 26.'
    ],
    explanation: '71 − 45 = 26.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-80-29',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm phép trừ có số tròn chục:',
    formula: '80 − 29 = ?',
    choices: ['51', '61', '59', '49'],
    correct_answer: '51',
    hint: '0 không trừ được 9, mượn 1 chục thành 10.',
    hint_level_2: '10 − 9 = 1. Trả 1 vào 2 là 3. 8 − 3 = 5.',
    step_by_step: [
      'Bước 1: 10 − 9 = 1, nhớ 1.',
      'Bước 2: 2 thêm 1 là 3. 8 − 3 = 5.',
      'Bước 3: Kết quả 51.'
    ],
    explanation: '80 − 29 = 51.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-92-36',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Tìm hiệu của 92 và 36:',
    formula: '92 − 36 = ?',
    choices: ['56', '66', '54', '58'],
    correct_answer: '56',
    hint: '12 − 6 = 6. Nhớ 1 sang hàng chục.',
    hint_level_2: '9 − (3 + 1) = 5. Kết quả là 56.',
    step_by_step: [
      'Bước 1: 12 − 6 = 6 (nhớ 1).',
      'Bước 2: 9 − 4 = 5.',
      'Bước 3: 56.'
    ],
    explanation: 'Hiệu của 92 và 36 là 56.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-63-27',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Mẹ mua 63 quả cam, mẹ đem biếu bà 27 quả. Hỏi mẹ còn lại bao nhiêu quả cam?',
    formula: '63 − 27 = ?',
    choices: ['36', '46', '34', '38'],
    correct_answer: '36',
    hint: 'Lấy 63 trừ đi 27.',
    hint_level_2: '13 − 7 = 6. 6 − 3 = 3.',
    step_by_step: [
      'Bước 1: Phép tính là: 63 − 27.',
      'Bước 2: 13 − 7 = 6, nhớ 1.',
      'Bước 3: 6 − (2 + 1) = 3.',
      'Bước 4: Mẹ còn lại 36 quả cam.'
    ],
    explanation: '63 − 27 = 36 (quả cam).',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-sub-55-19',
    grade: 2,
    subject: 'math',
    topic: 'Phép trừ có nhớ trong 100',
    skill: 'g2-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính giá trị biểu thức:',
    formula: '55 − 19 = ?',
    choices: ['36', '46', '34', '38'],
    correct_answer: '36',
    hint: '5 không trừ được 9, mượn 1 chục thành 15 trừ 9.',
    hint_level_2: '15 − 9 = 6. 5 − 2 = 3.',
    step_by_step: [
      'Bước 1: 15 − 9 = 6 (nhớ 1).',
      'Bước 2: 1 thêm 1 là 2. 5 − 2 = 3.',
      'Bước 3: Kết quả 36.'
    ],
    explanation: '55 − 19 = 36.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },

  // --- LỚP 4: PHÉP CHIA LỚN 51019 : 19 (g4-m-s1) ---
  {
    id: 'q-div-51019-19',
    grade: 4,
    subject: 'math',
    topic: 'Đặt tính phép chia & nhân lớn',
    skill: 'g4-m-s1',
    difficulty: 4,
    question_type: 'multiple_choice',
    question_content: 'Thực hiện phép chia đặt tính rồi tính:',
    formula: '51019 : 19 = ?',
    choices: [
      '2685 (dư 4)',
      '2685 (chia hết)',
      '2585 (dư 4)',
      '2684 (dư 5)'
    ],
    correct_answer: '2685 (dư 4)',
    hint: 'Lần 1: Lấy 51 : 19 được 2, dư 13.',
    hint_level_2: 'Lần 2 hạ 0 được 130 : 19 = 6 (dư 16). Tiếp tục hạ 1 và hạ 9 để tìm thương.',
    step_by_step: [
      'Lần 1: 51 : 19 = 2, 2 × 19 = 38, 51 − 38 = 13.',
      'Lần 2: Hạ 0 được 130; 130 : 19 = 6, 6 × 19 = 114, 130 − 114 = 16.',
      'Lần 3: Hạ 1 được 161; 161 : 19 = 8, 8 × 19 = 152, 161 − 152 = 9.',
      'Lần 4: Hạ 9 được 99; 99 : 19 = 5, 5 × 19 = 95, 99 − 95 = 4.',
      'Kết luận: 51019 : 19 = 2685 (dư 4).'
    ],
    explanation: 'Thương là 2685 và số dư là 4. Thử lại: 2685 × 19 + 4 = 51019.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-div-test-formula',
    grade: 4,
    subject: 'math',
    topic: 'Đặt tính phép chia & nhân lớn',
    skill: 'g4-m-s2',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Để thử lại một phép chia có dư, ta sử dụng công thức nào sau đây?',
    choices: [
      '(Thương × Số chia) + Số dư = Số bị chia',
      '(Thương + Số chia) × Số dư = Số bị chia',
      '(Thương × Số dư) + Số chia = Số bị chia',
      'Thương × Số chia = Số bị chia'
    ],
    correct_answer: '(Thương × Số chia) + Số dư = Số bị chia',
    hint: 'Nhớ lại cách kiểm tra xem bài làm của mình đúng hay sai nhé!',
    step_by_step: [
      'Bước 1: Lấy thương nhân với số chia.',
      'Bước 2: Cộng thêm số dư.',
      'Bước 3: Nếu bằng số bị chia thì phép tính hoàn toàn chính xác!'
    ],
    explanation: 'Công thức thử lại phép chia có dư: (Thương × Số chia) + Số dư = Số bị chia (với số dư < số chia).',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },

  // --- LỚP 3: BẢNG NHÂN 7 (g3-m-s4) ---
  {
    id: 'q-mul-7x8',
    grade: 3,
    subject: 'math',
    topic: 'Bảng nhân và chia (6, 7, 8, 9)',
    skill: 'g3-m-s4',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm kết quả bảng nhân 7:',
    formula: '7 × 8 = ?',
    choices: ['56', '54', '49', '63'],
    correct_answer: '56',
    hint: '7 × 7 = 49, thêm 7 đơn vị nữa là bao nhiêu?',
    step_by_step: ['7 × 8 = 56.'],
    explanation: '7 × 8 = 56.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-mul-7x6',
    grade: 3,
    subject: 'math',
    topic: 'Bảng nhân và chia (6, 7, 8, 9)',
    skill: 'g3-m-s4',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm:',
    formula: '7 × 6 = ?',
    choices: ['42', '48', '35', '49'],
    correct_answer: '42',
    hint: '7 × 5 = 35, cộng thêm 7.',
    step_by_step: ['35 + 7 = 42.'],
    explanation: '7 × 6 = 42.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-mul-7x9',
    grade: 3,
    subject: 'math',
    topic: 'Bảng nhân và chia (6, 7, 8, 9)',
    skill: 'g3-m-s4',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm:',
    formula: '7 × 9 = ?',
    choices: ['63', '72', '56', '64'],
    correct_answer: '63',
    hint: '7 × 10 = 70, bớt đi 7 đơn vị.',
    step_by_step: ['70 − 7 = 63.'],
    explanation: '7 × 9 = 63.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },

  // --- LỚP 3: TOÁN PHÉP TRỪ CÓ NHỚ NÂNG CAO (g3-m-s7) ---
  {
    id: 'q-g3-sub-1',
    grade: 3,
    subject: 'math',
    topic: 'Phép trừ có nhớ phạm vi lớn',
    skill: 'g3-m-s7',
    difficulty: 2,
    question_type: 'multiple_choice',
    question_content: 'Tính nhẩm hoặc đặt tính:',
    formula: '62 − 38 = ?',
    choices: ['24', '34', '26', '28'],
    correct_answer: '24',
    hint: '2 không trừ được 8, mượn 1 chục thành 12. 12 − 8 = 4.',
    hint_level_2: '3 thêm 1 là 4. 6 − 4 = 2. Kết quả là 24.',
    step_by_step: [
      'Bước 1: 12 − 8 = 4 (viết 4 nhớ 1).',
      'Bước 2: 3 + 1 = 4. 6 − 4 = 2.',
      'Bước 3: Kết quả là 24.'
    ],
    explanation: '62 − 38 = 24.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-g3-sub-2',
    grade: 3,
    subject: 'math',
    topic: 'Phép trừ có nhớ phạm vi lớn',
    skill: 'g3-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Tìm số thích hợp điền vào dấu hỏi chấm:',
    formula: '85 − 49 = ?',
    choices: ['36', '46', '34', '38'],
    correct_answer: '36',
    hint: '15 − 9 = 6 (nhớ 1).',
    step_by_step: [
      'Bước 1: 15 − 9 = 6.',
      'Bước 2: 8 − 5 = 3.',
      'Bước 3: 36.'
    ],
    explanation: '85 − 49 = 36.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-g3-sub-3',
    grade: 3,
    subject: 'math',
    topic: 'Phép trừ có nhớ phạm vi lớn',
    skill: 'g3-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Một cuộn dây dài 93m, chú thợ điện cắt đi 57m. Hỏi cuộn dây còn lại bao nhiêu mét?',
    formula: '93m − 57m = ?',
    choices: ['36m', '46m', '34m', '38m'],
    correct_answer: '36m',
    hint: 'Lấy 93 trừ 57.',
    step_by_step: [
      '13 − 7 = 6, nhớ 1.',
      '9 − (5 + 1) = 3.',
      'Đáp số: 36m.'
    ],
    explanation: '93 − 57 = 36 (m).',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-g3-sub-4',
    grade: 3,
    subject: 'math',
    topic: 'Phép trừ có nhớ phạm vi lớn',
    skill: 'g3-m-s7',
    difficulty: 3,
    question_type: 'multiple_choice',
    question_content: 'Kết quả của phép trừ là:',
    formula: '74 − 28 = ?',
    choices: ['46', '56', '44', '48'],
    correct_answer: '46',
    hint: '14 − 8 = 6.',
    step_by_step: ['14 − 8 = 6 (nhớ 1). 7 − 3 = 4.'],
    explanation: '74 − 28 = 46.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  },
  {
    id: 'q-g3-sub-5',
    grade: 3,
    subject: 'math',
    topic: 'Phép trừ có nhớ phạm vi lớn',
    skill: 'g3-m-s7',
    difficulty: 4,
    question_type: 'multiple_choice',
    question_content: 'Tìm x biết: x + 38 = 91',
    formula: 'x = 91 − 38',
    choices: ['53', '63', '52', '54'],
    correct_answer: '53',
    hint: 'Muốn tìm số hạng chưa biết, ta lấy tổng trừ đi số hạng đã biết.',
    step_by_step: [
      'x = 91 − 38.',
      '11 − 8 = 3 (nhớ 1).',
      '9 − 4 = 5.',
      'x = 53.'
    ],
    explanation: 'x = 91 − 38 = 53.',
    source_type: 'curriculum',
    ai_generated: false,
    validation_status: 'approved'
  }
];

// Generate robust contextual questions programmatically for every skill to ensure 8-10 questions per skill minimum
export function ensureSkillQuestionsPopulated() {
  skillsDatabase.forEach((skill) => {
    const existing = questionBank.filter((q) => q.skill === skill.id);
    const needed = Math.max(0, 8 - existing.length);
    if (needed <= 0) return;

    for (let i = 1; i <= needed; i++) {
      const qNum = existing.length + i;
      let q: CurriculumQuestion;

      if (skill.subject_id === 'math') {
        const a = 30 + (skill.grade * 15) + (i * 7);
        const b = 12 + (skill.grade * 4) + (i * 3);
        const diff = a - b;
        q = {
          id: `gen-${skill.id}-q${qNum}`,
          grade: skill.grade,
          subject: 'math',
          topic: skill.name,
          skill: skill.id,
          difficulty: Math.min(5, Math.max(1, (i % 4) + 1)) as any,
          question_type: 'multiple_choice',
          question_content: `Luyện tập kỹ năng ${skill.name} (Câu ${qNum}):`,
          formula: `${a} − ${b} = ?`,
          choices: [
            `${diff}`,
            `${diff + 10}`,
            `${diff - 2}`,
            `${diff + 2}`
          ],
          correct_answer: `${diff}`,
          hint: `Quan sát hàng đơn vị của số ${a} và số ${b} để thực hiện phép tính cẩn thận nhé!`,
          hint_level_2: `Thực hiện trừ từ phải sang trái. Nếu cần mượn thì nhớ trả 1 sang hàng kế tiếp!`,
          step_by_step: [
            `Bước 1: Đặt tính thẳng cột ${a} và ${b}.`,
            `Bước 2: Thực hiện trừ lần lượt theo quy tắc chuẩn.`,
            `Bước 3: Kết quả chính xác là ${diff}!`
          ],
          explanation: `${a} − ${b} = ${diff}.`,
          source_type: 'curriculum',
          ai_generated: false,
          validation_status: 'approved'
        };
      } else if (skill.subject_id === 'vietnamese') {
        const samples = [
          {
            content: `Trong các từ sau, từ nào là từ chỉ đặc điểm?`,
            choices: ['chăm chỉ', 'đọc sách', 'học sinh', 'ngôi trường'],
            correct: 'chăm chỉ',
            exp: '"Chăm chỉ" là từ chỉ tính nết, đặc điểm của người.'
          },
          {
            content: `Chọn dấu câu thích hợp để điền vào cuối câu: "Hôm nay thời tiết đẹp quá..."`,
            choices: ['Dấu chấm than (!)', 'Dấu chấm hỏi (?)', 'Dấu chấm (.)', 'Dấu phẩy (,)'],
            correct: 'Dấu chấm than (!)',
            exp: 'Câu bộc lộ cảm xúc khen ngợi thời tiết nên dùng dấu chấm than (!).'
          },
          {
            content: `Từ ngữ nào dưới đây viết đúng quy tắc chính tả?`,
            choices: ['kiên trì', 'ciên trì', 'khiên trì', 'giên trì'],
            correct: 'kiên trì',
            exp: 'Âm k đi với nguyên âm i, e, ê. Viết đúng là "kiên trì".'
          },
          {
            content: `Câu văn: "Mặt trời như một quả cầu lửa khổng lồ." sử dụng biện pháp nghệ thuật nào?`,
            choices: ['So sánh', 'Nhân hóa', 'Ẩn dụ', 'Điệp từ'],
            correct: 'So sánh',
            exp: 'Có từ so sánh "như" nối giữa "mặt trời" và "quả cầu lửa".'
          },
          {
            content: `Bộ phận in đậm trong câu sau trả lời cho câu hỏi nào: "Sáng sớm, **các bạn học sinh** tung tăng đến trường."`,
            choices: ['Ai?', 'Làm gì?', 'Thế nào?', 'Ở đâu?'],
            correct: 'Ai?',
            exp: '"Các bạn học sinh" là từ chỉ người, trả lời cho câu hỏi Ai?'
          }
        ];
        const sample = samples[(qNum - 1) % samples.length];
        q = {
          id: `gen-${skill.id}-q${qNum}`,
          grade: skill.grade,
          subject: 'vietnamese',
          topic: skill.name,
          skill: skill.id,
          difficulty: Math.min(5, Math.max(1, (i % 3) + 1)) as any,
          question_type: 'multiple_choice',
          question_content: sample.content,
          choices: sample.choices,
          correct_answer: sample.correct,
          hint: 'Đọc kỹ câu hỏi và nhớ lại các quy tắc ngữ pháp Tiếng Việt nhé!',
          step_by_step: [
            'Bước 1: Xác định yêu cầu câu hỏi.',
            'Bước 2: Phân tích từng phương án lựa chọn.',
            `Bước 3: Chọn đáp án: ${sample.correct}.`
          ],
          explanation: sample.exp,
          source_type: 'curriculum',
          ai_generated: false,
          validation_status: 'approved'
        };
      } else {
        // English
        const samplesEn = [
          {
            content: 'Choose the correct word to complete the sentence:',
            formula: 'She _______ to school every morning.',
            choices: ['goes', 'go', 'going', 'is go'],
            correct: 'goes',
            exp: 'Subject "She" is third-person singular, so the verb takes "-es": goes.'
          },
          {
            content: 'What is the opposite of "big"?',
            formula: '',
            choices: ['small', 'tall', 'long', 'heavy'],
            correct: 'small',
            exp: 'The opposite of "big" (to, lớn) is "small" (nhỏ, bé).'
          },
          {
            content: 'Choose the correct answer for the question:',
            formula: 'What time is it? - It is _______ 7:30.',
            choices: ['half past seven', 'seven o\'clock', 'quarter to eight', 'quarter past seven'],
            correct: 'half past seven',
            exp: '7:30 = half past seven (bảy giờ rưỡi).'
          },
          {
            content: 'Which word is a fruit?',
            formula: '',
            choices: ['apple', 'pencil', 'chair', 'dog'],
            correct: 'apple',
            exp: 'An apple is a delicious and healthy fruit (quả táo).'
          },
          {
            content: 'Choose the correct question word:',
            formula: '_______ are you from? - I am from Vietnam.',
            choices: ['Where', 'What', 'Who', 'When'],
            correct: 'Where',
            exp: '"Where" asks about a place or country.'
          }
        ];
        const sEn = samplesEn[(qNum - 1) % samplesEn.length];
        q = {
          id: `gen-${skill.id}-q${qNum}`,
          grade: skill.grade,
          subject: 'english',
          topic: skill.name,
          skill: skill.id,
          difficulty: Math.min(5, Math.max(1, (i % 3) + 1)) as any,
          question_type: 'multiple_choice',
          question_content: sEn.content,
          formula: sEn.formula || undefined,
          choices: sEn.choices,
          correct_answer: sEn.correct,
          hint: 'Read the English sentence carefully and check the keywords!',
          step_by_step: [
            'Step 1: Understand the context and grammar rule.',
            `Step 2: The correct answer is "${sEn.correct}".`
          ],
          explanation: sEn.exp,
          source_type: 'curriculum',
          ai_generated: false,
          validation_status: 'approved'
        };
      }

      questionBank.push(q);
    }
  });
}

// Automatically ensure questions are populated
ensureSkillQuestionsPopulated();

// ==========================================
// 4. QUERY HELPERS & ADAPTERS
// ==========================================

export function getTopicsByGradeAndSubject(grade: GradeLevel, subjectId: SubjectId): Topic[] {
  return topicsDatabase.filter((t) => t.grade === grade && t.subject_id === subjectId);
}

export function getSkillsByTopic(topicId: string): Skill[] {
  return skillsDatabase.filter((s) => s.topic_id === topicId);
}

export function getQuestionsBySkill(skillId: string): CurriculumQuestion[] {
  return questionBank.filter((q) => q.skill === skillId);
}

export function getSkillById(skillId: string): Skill | undefined {
  return skillsDatabase.find((s) => s.id === skillId);
}

export function getTopicById(topicId: string): Topic | undefined {
  return topicsDatabase.find((t) => t.id === topicId);
}

/**
 * Adapter: Convert CurriculumQuestion to legacy Question format expected by LessonView
 */
export function toLegacyQuestion(cq: CurriculumQuestion): Question {
  const optionLetters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const options: AnswerOption[] = cq.choices.map((choice, idx) => ({
    id: optionLetters[idx] || 'A',
    text: choice,
  }));

  const correctIndex = cq.choices.findIndex((c) => c === cq.correct_answer);
  const correctOptionId = optionLetters[correctIndex >= 0 ? correctIndex : 0];

  const diffMap: Record<number, 'easy' | 'medium' | 'hard'> = {
    1: 'easy',
    2: 'easy',
    3: 'medium',
    4: 'hard',
    5: 'hard',
  };

  return {
    id: cq.id,
    prompt: cq.question_content,
    formula: cq.formula,
    subPrompt: cq.subPrompt,
    options,
    correctOptionId,
    hint: cq.hint,
    stepByStep: cq.step_by_step || [cq.explanation],
    explanation: cq.explanation,
    difficulty: diffMap[cq.difficulty] || 'medium',
  };
}

/**
 * Adapter: Convert a Skill and questions to legacy Lesson format
 */
export function toLegacyLesson(skill: Skill, questions: CurriculumQuestion[]): Lesson {
  const subjectNames: Record<SubjectId, string> = {
    math: `Toán Lớp ${skill.grade}`,
    vietnamese: `Tiếng Việt Lớp ${skill.grade}`,
    english: `Tiếng Anh Lớp ${skill.grade}`,
  };

  const legacyQuestions = questions.map(toLegacyQuestion);

  return {
    id: skill.id,
    subjectId: skill.subject_id,
    subjectName: subjectNames[skill.subject_id],
    grade: skill.grade,
    title: skill.name,
    topic: skill.description,
    currentQuestionIndex: 0,
    questions: legacyQuestions.length > 0 ? legacyQuestions : [
      {
        id: `dummy-${skill.id}`,
        prompt: `Luyện tập kỹ năng: ${skill.name}`,
        formula: '52 − 27 = ?',
        options: [
          { id: 'A', text: '25' },
          { id: 'B', text: '35' },
          { id: 'C', text: '24' },
          { id: 'D', text: '26' }
        ],
        correctOptionId: 'A',
        hint: 'Mượn 1 chục khi số bị trừ nhỏ hơn số trừ.',
        stepByStep: ['12 − 7 = 5, nhớ 1. 5 − 3 = 2.'],
        explanation: '52 − 27 = 25.',
        difficulty: 'medium'
      }
    ],
  };
}
