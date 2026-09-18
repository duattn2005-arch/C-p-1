import { GradeLevel, SubjectId, Topic, Skill, CurriculumQuestion } from '../types/curriculum';
import { Lesson, Question, AnswerOption } from '../types';
import { topicSkillDefs } from './content/index';
import { buildSkillQuestions } from './content/core';

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
  { id: 'g4-m-t1', grade: 4, subject_id: 'math', name: 'Đặt tính phép chia & nhân lớn', description: 'Nhân số lớn, chia cho số có hai chữ số', icon: '➗', order_index: 1 },
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
// 2. SKILLS AND QUESTIONS
// Every topic teaches three skills. Each skill has its own question maker in ./content, written for that grade
// (grade 1 shows pictures, grade 5 uses decimals and speed problems). Questions are built once, deterministically.
// ==========================================
export const skillsDatabase: Skill[] = [];
export const questionBank: CurriculumQuestion[] = [];

topicsDatabase.forEach((topic) => {
  (topicSkillDefs[topic.id] ?? []).forEach((def, k) => {
    const id = `${topic.id}-s${k + 1}`;
    skillsDatabase.push({
      id,
      grade: topic.grade,
      subject_id: topic.subject_id,
      topic_id: topic.id,
      name: def.name,
      description: def.desc,
      difficulty: def.diff,
      order_index: k + 1,
    });
    questionBank.push(...buildSkillQuestions(id, topic.grade, topic.subject_id, topic.name, def));
  });
});

// ==========================================
// 3. QUERY HELPERS & ADAPTERS
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
    face: cq.choice_faces?.[idx] ?? undefined,
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
    skillId: cq.skill,
    prompt: cq.question_content,
    formula: cq.formula,
    subPrompt: cq.subPrompt,
    visual: cq.visual,
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

  return {
    id: skill.id,
    subjectId: skill.subject_id,
    subjectName: subjectNames[skill.subject_id],
    grade: skill.grade,
    title: skill.name,
    topic: skill.description,
    currentQuestionIndex: 0,
    questions: questions.map(toLegacyQuestion),
  };
}
