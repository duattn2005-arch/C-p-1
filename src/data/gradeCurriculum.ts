import { Lesson, SubjectId } from '../types';

export interface CatalogLessonItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'locked';
  xp: number;
  isAiRecommended?: boolean;
}

// ----------------------------------------------------
// FULL CURRICULUM CATALOG BY GRADE (1 - 5) & SUBJECT
// ----------------------------------------------------

export const gradeCurriculumCatalog: Record<
  number,
  Record<SubjectId, CatalogLessonItem[]>
> = {
  // ===================== LỚP 1 =====================
  1: {
    math: [
      {
        id: 'math-g1-1',
        title: 'Phép cộng, phép trừ trong phạm vi 10 và 20',
        subtitle: 'Làm quen các phép tính cơ bản 8 + 5, 14 − 6, đếm nhanh',
        progress: 60,
        status: 'in-progress',
        xp: 25,
        isAiRecommended: true,
      },
      {
        id: 'math-g1-2',
        title: 'Nhận biết hình vuông, hình tròn, hình tam giác',
        subtitle: 'Đặc điểm các hình khối quen thuộc xung quanh bé',
        progress: 100,
        status: 'completed',
        xp: 20,
      },
      {
        id: 'math-g1-3',
        title: 'So sánh lớn hơn, bé hơn và bằng nhau (>, <, =)',
        subtitle: 'So sánh số lượng que tính và đồ vật trong phạm vi 20',
        progress: 0,
        status: 'locked',
        xp: 25,
      },
      {
        id: 'math-g1-4',
        title: 'Các số đến 100 và Đọc viết số tròn chục',
        subtitle: '10, 20, 30... đến 100, cấu tạo số có hai chữ số',
        progress: 0,
        status: 'locked',
        xp: 30,
      },
    ],
    vietnamese: [
      {
        id: 'vn-g1-1',
        title: 'Bảng chữ cái và Phân biệt c/k, g/gh, ng/ngh',
        subtitle: 'Quy tắc chính tả khi đi với các nguyên âm e, ê, i',
        progress: 50,
        status: 'in-progress',
        xp: 25,
        isAiRecommended: true,
      },
      {
        id: 'vn-g1-2',
        title: 'Dấu thanh Tiếng Việt: Sắc, Huyền, Hỏi, Ngã, Nặng',
        subtitle: 'Luyện đọc đúng dấu thanh qua các từ quen thuộc',
        progress: 100,
        status: 'completed',
        xp: 20,
      },
      {
        id: 'vn-g1-3',
        title: 'Ghép vần cơ bản: an, at, am, ap, ong, oc',
        subtitle: 'Luyện đọc từ ngữ và câu văn ngắn 3-4 chữ',
        progress: 0,
        status: 'locked',
        xp: 25,
      },
    ],
    english: [
      {
        id: 'en-g1-1',
        title: 'Colors & Numbers 1 to 10 (Màu sắc & Số đếm)',
        subtitle: 'Red, Blue, Yellow, Green & One, Two, Three...',
        progress: 75,
        status: 'in-progress',
        xp: 25,
        isAiRecommended: true,
      },
      {
        id: 'en-g1-2',
        title: 'My Pets & Cute Animals (Thú cưng & Con vật)',
        subtitle: 'Cat, Dog, Bird, Fish, Rabbit',
        progress: 100,
        status: 'completed',
        xp: 20,
      },
      {
        id: 'en-g1-3',
        title: 'Greetings & Hello, Goodbye (Chào hỏi căn bản)',
        subtitle: 'How are you? I am fine, thank you!',
        progress: 0,
        status: 'locked',
        xp: 25,
      },
    ],
  },

  // ===================== LỚP 2 =====================
  2: {
    math: [
      {
        id: 'math-g2-1',
        title: 'Phép trừ có nhớ trong phạm vi 100',
        subtitle: '52 − 27, 64 − 38, 83 − 59, quy tắc mượn 1 chục',
        progress: 45,
        status: 'in-progress',
        xp: 30,
        isAiRecommended: true,
      },
      {
        id: 'math-g2-2',
        title: 'Phép cộng có nhớ trong phạm vi 100',
        subtitle: '36 + 28, 47 + 35, 59 + 26, quy tắc nhớ 1 sang hàng chục',
        progress: 80,
        status: 'in-progress',
        xp: 30,
      },
      {
        id: 'math-g2-3',
        title: 'Bảng nhân 2 và Bảng nhân 5',
        subtitle: 'Học thuộc bảng nhân, tính nhẩm nhanh và bài toán đếm chân gà, tay áo',
        progress: 100,
        status: 'completed',
        xp: 35,
      },
      {
        id: 'math-g2-4',
        title: 'Đo lường: Đề-xi-mét (dm), Mét (m) và Lít (l)',
        subtitle: 'Đổi đơn vị độ dài và dung tích, giải toán thực tế',
        progress: 0,
        status: 'locked',
        xp: 30,
      },
    ],
    vietnamese: [
      {
        id: 'vn-g2-1',
        title: 'Mở rộng vốn từ: Bạn bè và Trường học',
        subtitle: 'Từ chỉ hoạt động, từ chỉ đặc điểm lớp học, câu kiểu Ai làm gì?',
        progress: 70,
        status: 'in-progress',
        xp: 25,
        isAiRecommended: true,
      },
      {
        id: 'vn-g2-2',
        title: 'Phân biệt chính tả l/n, s/x và d/r/gi',
        subtitle: 'Luyện phát âm chuẩn và mẹo ghi nhớ chính tả đúng',
        progress: 100,
        status: 'completed',
        xp: 25,
      },
      {
        id: 'vn-g2-3',
        title: 'Dấu chấm, Dấu phẩy và Dấu chấm hỏi',
        subtitle: 'Cách ngắt câu hợp lý khi viết đoạn văn ngắn',
        progress: 0,
        status: 'locked',
        xp: 30,
      },
    ],
    english: [
      {
        id: 'en-g2-1',
        title: 'School Objects & Classroom (Đồ dùng học tập)',
        subtitle: 'Pen, Pencil, Ruler, Eraser, School bag, Book',
        progress: 85,
        status: 'in-progress',
        xp: 30,
        isAiRecommended: true,
      },
      {
        id: 'en-g2-2',
        title: 'My Family Members (Thành viên gia đình)',
        subtitle: 'Father, Mother, Brother, Sister, Baby',
        progress: 100,
        status: 'completed',
        xp: 25,
      },
      {
        id: 'en-g2-3',
        title: 'Feelings and Emotions (Cảm xúc)',
        subtitle: 'Happy, Sad, Angry, Sleepy, Excited',
        progress: 0,
        status: 'locked',
        xp: 30,
      },
    ],
  },

  // ===================== LỚP 3 =====================
  3: {
    math: [
      {
        id: 'math-g3-1',
        title: 'Bảng nhân 7, Bảng nhân 8 và Ứng dụng thực tế',
        subtitle: 'Thuộc bảng nhân 7, 8, tính nhẩm nhanh và giải toán gấp nhiều lần',
        progress: 90,
        status: 'in-progress',
        xp: 35,
        isAiRecommended: true,
      },
      {
        id: 'math-g3-2',
        title: 'Hình chữ nhật, Hình vuông và Cách tính Chu vi',
        subtitle: 'Công thức tính chu vi hình chữ nhật và chu vi hình vuông',
        progress: 100,
        status: 'completed',
        xp: 35,
      },
      {
        id: 'math-g3-3',
        title: 'Nhân, chia số có ba chữ số cho số có một chữ số',
        subtitle: '248 × 3 = 744, 648 : 2 = 324, đặt tính chuẩn',
        progress: 30,
        status: 'in-progress',
        xp: 40,
      },
      {
        id: 'math-g3-4',
        title: 'Làm quen với chữ số La Mã (I, V, X) và Xem đồng hồ',
        subtitle: 'Đọc giờ chính xác, xem kim phút và hiểu số La Mã',
        progress: 0,
        status: 'locked',
        xp: 35,
      },
    ],
    vietnamese: [
      {
        id: 'vn-g3-1',
        title: 'Biện pháp tu từ: So sánh và Nhân hóa trong câu văn',
        subtitle: 'Nhận diện hình ảnh so sánh "Mặt trời như quả cầu lửa"',
        progress: 60,
        status: 'in-progress',
        xp: 30,
        isAiRecommended: true,
      },
      {
        id: 'vn-g3-2',
        title: 'Phân biệt chính tả ch / tr và Dấu hỏi / ngã',
        subtitle: 'Quy tắc chính tả qua bài tập điền từ và đoạn thơ',
        progress: 100,
        status: 'completed',
        xp: 25,
      },
      {
        id: 'vn-g3-3',
        title: 'Tập làm văn: Kể về người thân trong gia đình em',
        subtitle: 'Dàn ý và cấu trúc đoạn văn 5-7 câu giàu cảm xúc',
        progress: 0,
        status: 'locked',
        xp: 35,
      },
    ],
    english: [
      {
        id: 'en-g3-1',
        title: 'Action Verbs: Can you swim, dance, sing?',
        subtitle: 'I can swim, I cannot fly. Phỏng vấn bạn bè',
        progress: 80,
        status: 'in-progress',
        xp: 30,
        isAiRecommended: true,
      },
      {
        id: 'en-g3-2',
        title: 'Daily Activities & Time (Hoạt động hàng ngày)',
        subtitle: 'What time do you get up? I have breakfast at 6:30 AM',
        progress: 100,
        status: 'completed',
        xp: 30,
      },
      {
        id: 'en-g3-3',
        title: 'Foods and Drinks (Món ăn và Thức uống yêu thích)',
        subtitle: 'Chicken, Rice, Bread, Milk, Orange juice',
        progress: 0,
        status: 'locked',
        xp: 35,
      },
    ],
  },

  // ===================== LỚP 4 =====================
  4: {
    math: [
      {
        id: 'math-g4-1',
        title: '⭐ Đặt tính rồi tính: Phép chia cho số có hai chữ số',
        subtitle: '51019 : 19 = 2685 (dư 4), 8496 : 24, ước lượng thương',
        progress: 85,
        status: 'in-progress',
        xp: 45,
        isAiRecommended: true,
      },
      {
        id: 'math-g4-2',
        title: 'Dấu hiệu chia hết cho 2, 3, 5, 9',
        subtitle: 'Nhận biết nhanh số chia hết dựa vào chữ số tận cùng và tổng các chữ số',
        progress: 100,
        status: 'completed',
        xp: 35,
      },
      {
        id: 'math-g4-3',
        title: 'Phân số và Các phép tính cộng, trừ phân số',
        subtitle: 'Quy đồng mẫu số, rút gọn phân số và tính giá trị biểu thức',
        progress: 25,
        status: 'in-progress',
        xp: 40,
      },
      {
        id: 'math-g4-4',
        title: 'Tìm hai số khi biết Tổng và Hiệu của hai số đó',
        subtitle: 'Công thức: Số lớn = (Tổng + Hiệu) : 2, Số bé = (Tổng − Hiệu) : 2',
        progress: 0,
        status: 'locked',
        xp: 45,
      },
    ],
    vietnamese: [
      {
        id: 'vn-g4-1',
        title: 'Từ loại Tiếng Việt: Danh từ, Động từ, Tính từ',
        subtitle: 'Phân biệt chính xác bản chất và chức năng ngữ pháp trong câu',
        progress: 75,
        status: 'in-progress',
        xp: 35,
        isAiRecommended: true,
      },
      {
        id: 'vn-g4-2',
        title: 'Câu kể: Ai làm gì? Ai thế nào? Ai là gì?',
        subtitle: 'Xác định Chủ ngữ và Vị ngữ của từng mẫu câu',
        progress: 100,
        status: 'completed',
        xp: 30,
      },
      {
        id: 'vn-g4-3',
        title: 'Tập làm văn miêu tả con vật và cây cối',
        subtitle: 'Mở bài trực tiếp/gián tiếp, kết bài mở rộng',
        progress: 0,
        status: 'locked',
        xp: 40,
      },
    ],
    english: [
      {
        id: 'en-g4-1',
        title: 'Where are you from? (Quốc gia & Quốc tịch)',
        subtitle: 'Vietnam, America, Japan, Australia, English',
        progress: 70,
        status: 'in-progress',
        xp: 35,
        isAiRecommended: true,
      },
      {
        id: 'en-g4-2',
        title: 'School Subjects & Timetable (Các môn học)',
        subtitle: 'Maths, Vietnamese, English, Science, IT, Music, Art',
        progress: 100,
        status: 'completed',
        xp: 30,
      },
      {
        id: 'en-g4-3',
        title: 'Days of the Week & Hobbies (Ngày trong tuần)',
        subtitle: 'What do you do on Mondays? I play football',
        progress: 0,
        status: 'locked',
        xp: 35,
      },
    ],
  },

  // ===================== LỚP 5 =====================
  5: {
    math: [
      {
        id: 'math-g5-1',
        title: 'Số thập phân và Các phép tính với số thập phân',
        subtitle: '25,8 + 14,25 = 40,05; 45,6 : 1,2 = 38; đặt tính chuẩn hàng',
        progress: 50,
        status: 'in-progress',
        xp: 45,
        isAiRecommended: true,
      },
      {
        id: 'math-g5-2',
        title: 'Toán chuyển động đều: Vận tốc, quãng đường, thời gian',
        subtitle: 'Công thức s = v × t; hai xe đi ngược chiều, cùng chiều',
        progress: 100,
        status: 'completed',
        xp: 50,
      },
      {
        id: 'math-g5-3',
        title: 'Tỉ số phần trăm và Giải toán tỉ số phần trăm',
        subtitle: 'Tính tỉ số phần trăm, tìm giá trị phần trăm của một số',
        progress: 0,
        status: 'locked',
        xp: 45,
      },
      {
        id: 'math-g5-4',
        title: 'Hình học: Diện tích hình thang, hình tròn & Thể tích',
        subtitle: 'S hình thang = (a + b) × h : 2; V hình hộp chữ nhật = a × b × c',
        progress: 0,
        status: 'locked',
        xp: 50,
      },
    ],
    vietnamese: [
      {
        id: 'vn-g5-1',
        title: 'Từ đồng nghĩa, Từ trái nghĩa và Từ nhiều nghĩa',
        subtitle: 'Mở rộng vốn từ tinh tế, đặt câu hay và tránh lặp từ',
        progress: 80,
        status: 'in-progress',
        xp: 40,
        isAiRecommended: true,
      },
      {
        id: 'vn-g5-2',
        title: 'Quan hệ từ và Nối các vế câu ghép',
        subtitle: 'Vì... nên..., Tuy... nhưng..., Không những... mà còn...',
        progress: 100,
        status: 'completed',
        xp: 35,
      },
      {
        id: 'vn-g5-3',
        title: 'Tập làm văn tả người (Tả mẹ, thầy cô, bạn thân)',
        subtitle: 'Ngoại hình, tính tình, hoạt động và kỉ niệm sâu sắc',
        progress: 0,
        status: 'locked',
        xp: 45,
      },
    ],
    english: [
      {
        id: 'en-g5-1',
        title: 'What will the weather be like tomorrow? (Thời tiết)',
        subtitle: 'It will be hot and sunny. What season do you like best?',
        progress: 65,
        status: 'in-progress',
        xp: 35,
        isAiRecommended: true,
      },
      {
        id: 'en-g5-2',
        title: 'Health Problems & Advice (Sức khỏe & Lời khuyên)',
        subtitle: 'I have a headache. You should go to the doctor',
        progress: 100,
        status: 'completed',
        xp: 35,
      },
      {
        id: 'en-g5-3',
        title: 'Future Jobs and Careers (Nghề nghiệp tương lai)',
        subtitle: 'What would you like to be? I would like to be an astronaut',
        progress: 0,
        status: 'locked',
        xp: 40,
      },
    ],
  },
};

// ----------------------------------------------------
// FULL INTERACTIVE LESSONS MAPPED PER GRADE & SUBJECT
// ----------------------------------------------------

export const interactiveLessonsDatabase: Record<string, Lesson> = {
  // LỚP 1 TOÁN
  'math-g1-1': {
    id: 'math-g1-1',
    subjectId: 'math',
    subjectName: 'Toán Lớp 1',
    grade: 1,
    title: 'Phép cộng, phép trừ trong phạm vi 10 và 20',
    topic: 'Cộng trừ cơ bản Lớp 1',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g1-m-q1',
        prompt: 'Tính kết quả của phép cộng sau:',
        formula: '8 + 5 = ?',
        options: [
          { id: 'A', text: '12' },
          { id: 'B', text: '13' },
          { id: 'C', text: '14' },
          { id: 'D', text: '11' },
        ],
        correctOptionId: 'B',
        hint: 'Tách 5 thành 2 và 3: 8 + 2 = 10, rồi lấy 10 + 3 = 13.',
        stepByStep: [
          'Bước 1: Lấy 8 cộng thêm 2 để được 10 tròn chục.',
          'Bước 2: 5 bớt 2 còn lại 3.',
          'Bước 3: 10 + 3 = 13.',
        ],
        explanation: '8 + 5 = 13.',
        difficulty: 'easy',
      },
      {
        id: 'g1-m-q2',
        prompt: 'Tìm hiệu của phép trừ sau:',
        formula: '14 − 6 = ?',
        options: [
          { id: 'A', text: '7' },
          { id: 'B', text: '9' },
          { id: 'C', text: '8' },
          { id: 'D', text: '6' },
        ],
        correctOptionId: 'C',
        hint: '14 trừ 4 bằng 10, 10 trừ tiếp 2 bằng 8.',
        stepByStep: [
          'Bước 1: 14 − 4 = 10.',
          'Bước 2: 6 tách thành 4 và 2.',
          'Bước 3: 10 − 2 = 8.',
        ],
        explanation: '14 − 6 = 8.',
        difficulty: 'easy',
      },
      {
        id: 'g1-m-q3',
        prompt: 'Điền dấu thích hợp vào chỗ chấm:',
        formula: '9 + 7 ... 15',
        options: [
          { id: 'A', text: '>' },
          { id: 'B', text: '<' },
          { id: 'C', text: '=' },
          { id: 'D', text: 'Không so sánh được' },
        ],
        correctOptionId: 'A',
        hint: 'Tính 9 + 7 trước: 9 + 7 = 16. So sánh 16 với 15.',
        stepByStep: [
          'Bước 1: 9 + 7 = 16.',
          'Bước 2: 16 lớn hơn 15.',
          'Bước 3: Điền dấu >.',
        ],
        explanation: 'Vì 9 + 7 = 16 mà 16 > 15 nên điền dấu >.',
        difficulty: 'easy',
      },
    ],
  },

  // LỚP 2 TOÁN (Phép trừ có nhớ trong phạm vi 100)
  'math-g2-1': {
    id: 'math-g2-1',
    subjectId: 'math',
    subjectName: 'Toán Lớp 2',
    grade: 2,
    title: 'Phép trừ có nhớ trong phạm vi 100',
    topic: 'Phép trừ có nhớ Lớp 2',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g2-m-q1',
        prompt: 'Thực hiện phép tính trừ có nhớ sau:',
        formula: '52 − 27 = ?',
        options: [
          { id: 'A', text: '25' },
          { id: 'B', text: '35' },
          { id: 'C', text: '24' },
          { id: 'D', text: '31' },
        ],
        correctOptionId: 'A',
        hint: '2 không trừ được 7, mượn 1 chục là 12: 12 − 7 = 5 (nhớ 1). 2 thêm 1 là 3; 5 − 3 = 2.',
        stepByStep: [
          'Bước 1: Ở hàng đơn vị: 2 không trừ được 7, mượn 1 chục thành 12. 12 − 7 = 5 (viết 5, nhớ 1).',
          'Bước 2: Ở hàng chục: Thêm 1 vào 2 được 3. Lấy 5 − 3 = 2 (viết 2).',
          'Bước 3: Kết quả bằng 25.',
        ],
        explanation: '52 − 27 = 25.',
        difficulty: 'medium',
      },
      {
        id: 'g2-m-q2',
        prompt: 'Tính giá trị biểu thức:',
        formula: '64 − 38 = ?',
        options: [
          { id: 'A', text: '36' },
          { id: 'B', text: '26' },
          { id: 'C', text: '24' },
          { id: 'D', text: '34' },
        ],
        correctOptionId: 'B',
        hint: '4 mượn 1 chục là 14. 14 − 8 = 6. 6 − (3 + 1) = 2.',
        stepByStep: [
          'Bước 1: 14 − 8 = 6, viết 6 nhớ 1.',
          'Bước 2: 3 thêm 1 bằng 4, 6 − 4 = 2.',
          'Bước 3: Kết quả: 26.',
        ],
        explanation: '64 − 38 = 26.',
        difficulty: 'medium',
      },
      {
        id: 'g2-m-q3',
        prompt: 'Bác An có 83 quả cam, bác đã bán đi 59 quả. Hỏi bác An còn lại bao nhiêu quả cam?',
        formula: '83 − 59 = ?',
        options: [
          { id: 'A', text: '24 quả' },
          { id: 'B', text: '34 quả' },
          { id: 'C', text: '26 quả' },
          { id: 'D', text: '14 quả' },
        ],
        correctOptionId: 'A',
        hint: '13 − 9 = 4 (nhớ 1). 8 − 6 = 2.',
        stepByStep: [
          'Bước 1: 13 − 9 = 4, nhớ 1.',
          'Bước 2: 5 thêm 1 là 6; 8 − 6 = 2.',
          'Bước 3: Còn lại 24 quả cam.',
        ],
        explanation: '83 − 59 = 24 quả cam.',
        difficulty: 'medium',
      },
    ],
  },

  // LỚP 2 TOÁN (Phép cộng có nhớ)
  'math-g2-2': {
    id: 'math-g2-2',
    subjectId: 'math',
    subjectName: 'Toán Lớp 2',
    grade: 2,
    title: 'Phép cộng có nhớ trong phạm vi 100',
    topic: 'Cộng có nhớ Lớp 2',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g2-m2-q1',
        prompt: 'Tính tổng của hai số 36 và 28:',
        formula: '36 + 28 = ?',
        options: [
          { id: 'A', text: '54' },
          { id: 'B', text: '64' },
          { id: 'C', text: '62' },
          { id: 'D', text: '58' },
        ],
        correctOptionId: 'B',
        hint: '6 + 8 = 14 (viết 4 nhớ 1). 3 + 2 = 5, thêm 1 là 6.',
        stepByStep: [
          'Bước 1: 6 + 8 = 14, viết 4 nhớ 1.',
          'Bước 2: 3 + 2 = 5, thêm 1 bằng 6.',
          'Bước 3: Kết quả: 64.',
        ],
        explanation: '36 + 28 = 64.',
        difficulty: 'easy',
      },
      {
        id: 'g2-m2-q2',
        prompt: 'Tìm số thích hợp điền vào dấu hỏi chấm:',
        formula: '47 + 35 = ?',
        options: [
          { id: 'A', text: '82' },
          { id: 'B', text: '72' },
          { id: 'C', text: '81' },
          { id: 'D', text: '78' },
        ],
        correctOptionId: 'A',
        hint: '7 + 5 = 12 (nhớ 1). 4 + 3 + 1 = 8.',
        stepByStep: [
          'Bước 1: 7 + 5 = 12, viết 2 nhớ 1.',
          'Bước 2: 4 + 3 = 7, thêm 1 là 8.',
          'Bước 3: Kết quả: 82.',
        ],
        explanation: '47 + 35 = 82.',
        difficulty: 'easy',
      },
    ],
  },

  // LỚP 3 TOÁN (Bảng nhân 7 và Chu vi)
  'math-g3-1': {
    id: 'math-g3-1',
    subjectId: 'math',
    subjectName: 'Toán Lớp 3',
    grade: 3,
    title: 'Bảng nhân 7, Bảng nhân 8 và Ứng dụng',
    topic: 'Bảng nhân Lớp 3',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g3-m-q1',
        prompt: 'Mỗi tuần có 7 ngày. Hỏi 8 tuần có tất cả bao nhiêu ngày?',
        formula: '7 × 8 = ?',
        options: [
          { id: 'A', text: '54 ngày' },
          { id: 'B', text: '56 ngày' },
          { id: 'C', text: '49 ngày' },
          { id: 'D', text: '63 ngày' },
        ],
        correctOptionId: 'B',
        hint: 'Tra bảng nhân 7: 7 nhân 8 bằng bao nhiêu?',
        stepByStep: [
          'Bước 1: 7 × 7 = 49.',
          'Bước 2: 49 cộng thêm 7 = 56.',
          'Bước 3: Vậy 7 × 8 = 56 ngày.',
        ],
        explanation: '7 × 8 = 56 ngày.',
        difficulty: 'easy',
      },
      {
        id: 'g3-m-q2',
        prompt: 'Tính chu vi của hình chữ nhật có chiều dài 8cm và chiều rộng 5cm:',
        formula: 'Chu vi = (8 + 5) × 2 = ?',
        options: [
          { id: 'A', text: '26 cm' },
          { id: 'B', text: '13 cm' },
          { id: 'C', text: '40 cm' },
          { id: 'D', text: '28 cm' },
        ],
        correctOptionId: 'A',
        hint: 'Muốn tính chu vi hình chữ nhật ta lấy (chiều dài + chiều rộng) rồi nhân với 2.',
        stepByStep: [
          'Bước 1: Nửa chu vi = 8 + 5 = 13 cm.',
          'Bước 2: Chu vi = 13 × 2 = 26 cm.',
        ],
        explanation: 'Chu vi hình chữ nhật là 26 cm.',
        difficulty: 'medium',
      },
    ],
  },

  // LỚP 4 TOÁN (ĐẶT TÍNH RỒI TÍNH: PHÉP CHIA 51019 : 19)
  'math-g4-1': {
    id: 'math-g4-1',
    subjectId: 'math',
    subjectName: 'Toán Lớp 4',
    grade: 4,
    title: 'Đặt tính rồi tính: Phép chia cho số có hai chữ số',
    topic: 'Phép chia số tự nhiên Lớp 4',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g4-m-q1',
        prompt: 'Thực hiện phép chia đặt tính rồi tính (SGK Toán Lớp 4):',
        formula: '51019 : 19 = ?',
        options: [
          { id: 'A', text: '2685 (dư 4)' },
          { id: 'B', text: '2684 (dư 5)' },
          { id: 'C', text: '2585 (dư 4)' },
          { id: 'D', text: '2685 (phép chia hết)' },
        ],
        correctOptionId: 'A',
        hint: 'Chia từ trái sang phải: 51:19 được 2 (dư 13); hạ 0 được 130:19 được 6 (dư 16); hạ 1 được 161:19 được 8 (dư 9); hạ 9 được 99:19 được 5 (dư 4).',
        stepByStep: [
          'Lần 1: 51 chia 19 được 2, viết 2. 2 × 19 = 38; 51 − 38 = 13.',
          'Lần 2: Hạ 0 được 130; 130 chia 19 được 6, viết 6. 6 × 19 = 114; 130 − 114 = 16.',
          'Lần 3: Hạ 1 được 161; 161 chia 19 được 8, viết 8. 8 × 19 = 152; 161 − 152 = 9.',
          'Lần 4: Hạ 9 được 99; 99 chia 19 được 5, viết 5. 5 × 19 = 95; 99 − 95 = 4.',
          'Kết luận: 51019 : 19 = 2685 (dư 4). Thử lại: 2685 × 19 + 4 = 51019.',
        ],
        explanation: 'Thực hiện 4 lần chia lần lượt từ trái sang phải. Thương là 2685, số dư cuối cùng là 4.',
        difficulty: 'medium',
      },
      {
        id: 'g4-m-q2',
        prompt: 'Tính giá trị của phép chia sau:',
        formula: '8496 : 24 = ?',
        options: [
          { id: 'A', text: '354' },
          { id: 'B', text: '344' },
          { id: 'C', text: '356' },
          { id: 'D', text: '354 (dư 2)' },
        ],
        correctOptionId: 'A',
        hint: '84 chia 24 được 3 (dư 12). Hạ 9 được 129 chia 24 được 5 (dư 9). Hạ 6 được 96 chia 24 được 4 (dư 0).',
        stepByStep: [
          'Lần 1: 84 : 24 = 3, 3 × 24 = 72, 84 − 72 = 12.',
          'Lần 2: Hạ 9 được 129, 129 : 24 = 5, 5 × 24 = 120, 129 − 120 = 9.',
          'Lần 3: Hạ 6 được 96, 96 : 24 = 4, 4 × 24 = 96, 96 − 96 = 0.',
          'Kết luận: 8496 : 24 = 354 (phép chia hết).',
        ],
        explanation: '8496 : 24 = 354 không có số dư.',
        difficulty: 'easy',
      },
      {
        id: 'g4-m-q3',
        prompt: 'Trong các số sau, số nào vừa chia hết cho 2 vừa chia hết cho 5?',
        formula: '345, 680, 512, 789',
        options: [
          { id: 'A', text: '680' },
          { id: 'B', text: '345' },
          { id: 'C', text: '512' },
          { id: 'D', text: '789' },
        ],
        correctOptionId: 'A',
        hint: 'Số có chữ số tận cùng là 0 thì chia hết cho cả 2 và 5.',
        stepByStep: [
          'Bước 1: Dấu hiệu chia hết cho cả 2 và 5 là chữ số tận cùng bằng 0.',
          'Bước 2: Trong các số đã cho, chỉ có 680 có tận cùng là 0.',
        ],
        explanation: '680 có chữ số tận cùng là 0 nên vừa chia hết cho 2, vừa chia hết cho 5.',
        difficulty: 'easy',
      },
    ],
  },

  // LỚP 5 TOÁN (Số thập phân & Chuyển động đều)
  'math-g5-1': {
    id: 'math-g5-1',
    subjectId: 'math',
    subjectName: 'Toán Lớp 5',
    grade: 5,
    title: 'Số thập phân và Các phép tính với số thập phân',
    topic: 'Số thập phân Lớp 5',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g5-m-q1',
        prompt: 'Tính tổng của hai số thập phân sau:',
        formula: '25,8 + 14,25 = ?',
        options: [
          { id: 'A', text: '39,05' },
          { id: 'B', text: '40,05' },
          { id: 'C', text: '40,5' },
          { id: 'D', text: '39,85' },
        ],
        correctOptionId: 'B',
        hint: 'Đặt tính thẳng cột các dấu phẩy: 25,80 + 14,25.',
        stepByStep: [
          'Bước 1: Đặt tính thẳng hàng dấu phẩy: 25,80 + 14,25.',
          'Bước 2: Hàng phần trăm: 0 + 5 = 5.',
          'Bước 3: Hàng phần mười: 8 + 2 = 10 (viết 0, nhớ 1).',
          'Bước 4: 25 + 14 = 39, thêm 1 là 40.',
          'Bước 5: Kết quả = 40,05.',
        ],
        explanation: '25,8 + 14,25 = 40,05.',
        difficulty: 'medium',
      },
      {
        id: 'g5-m-q2',
        prompt: 'Một ô tô đi với vận tốc 50 km/h trong thời gian 2,5 giờ. Tính quãng đường ô tô đi được:',
        formula: 's = v × t = 50 × 2,5 = ?',
        options: [
          { id: 'A', text: '125 km' },
          { id: 'B', text: '120 km' },
          { id: 'C', text: '100 km' },
          { id: 'D', text: '150 km' },
        ],
        correctOptionId: 'A',
        hint: 'Quãng đường bằng vận tốc nhân thời gian: s = 50 × 2,5.',
        stepByStep: [
          'Bước 1: Lấy 50 nhân với 2,5.',
          'Bước 2: 50 × 2 = 100; 50 × 0,5 = 25.',
          'Bước 3: 100 + 25 = 125 km.',
        ],
        explanation: 'Quãng đường ô tô đi được là 125 km.',
        difficulty: 'medium',
      },
    ],
  },

  // TIẾNG VIỆT LỚP 2
  'vn-g2-1': {
    id: 'vn-g2-1',
    subjectId: 'vietnamese',
    subjectName: 'Tiếng Việt Lớp 2',
    grade: 2,
    title: 'Mở rộng vốn từ: Bạn bè và Trường học',
    topic: 'Từ chỉ sự vật, hoạt động Lớp 2',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g2-v-q1',
        prompt: 'Đọc câu văn sau và trả lời câu hỏi:',
        formula: 'Các bạn học sinh đang chăm chỉ đọc sách dưới bóng cây.',
        subPrompt: 'Trong câu trên, từ nào là từ chỉ hoạt động?',
        options: [
          { id: 'A', text: 'Đọc sách' },
          { id: 'B', text: 'Học sinh' },
          { id: 'C', text: 'Bóng cây' },
          { id: 'D', text: 'Chăm chỉ' },
        ],
        correctOptionId: 'A',
        hint: 'Từ chỉ hoạt động là từ chỉ cử động của con người hoặc con vật (như chạy, nhảy, đọc, viết).',
        stepByStep: [
          'Bước 1: "Học sinh" là từ chỉ người.',
          'Bước 2: "Chăm chỉ" là từ chỉ tính nết.',
          'Bước 3: "Đọc sách" là hoạt động mở sách đọc chữ.',
        ],
        explanation: '"Đọc sách" là từ chỉ hoạt động của học sinh.',
        difficulty: 'easy',
      },
      {
        id: 'g2-v-q2',
        prompt: 'Điền dấu câu thích hợp vào cuối câu sau:',
        formula: 'Hôm nay bạn có mang bút màu đi học không...',
        options: [
          { id: 'A', text: 'Dấu chấm (.)' },
          { id: 'B', text: 'Dấu chấm hỏi (?)' },
          { id: 'C', text: 'Dấu chấm than (!)' },
          { id: 'D', text: 'Dấu phẩy (,)' },
        ],
        correctOptionId: 'B',
        hint: 'Đây là câu dùng để hỏi bạn bè điều chưa biết, nên dùng dấu gì?',
        stepByStep: [
          'Bước 1: Câu có từ "có... không" là câu hỏi.',
          'Bước 2: Cuối câu hỏi phải đặt dấu chấm hỏi (?).',
        ],
        explanation: 'Cuối câu hỏi đặt dấu chấm hỏi (?).',
        difficulty: 'easy',
      },
    ],
  },

  // TIẾNG ANH LỚP 2
  'en-g2-1': {
    id: 'en-g2-1',
    subjectId: 'english',
    subjectName: 'Tiếng Anh Lớp 2',
    grade: 2,
    title: 'School Objects & Classroom Items',
    topic: 'School Supplies',
    currentQuestionIndex: 0,
    questions: [
      {
        id: 'g2-e-q1',
        prompt: 'What is this school object? (Em dùng để tẩy vết bút chì):',
        formula: 'It is an _______.',
        options: [
          { id: 'A', text: 'eraser' },
          { id: 'B', text: 'ruler' },
          { id: 'C', text: 'pencil' },
          { id: 'D', text: 'book' },
        ],
        correctOptionId: 'A',
        hint: 'Cục tẩy tiếng Anh bắt đầu bằng chữ "e".',
        stepByStep: [
          'Bước 1: Eraser có nghĩa là cục tẩy / gôm.',
          'Bước 2: Ruler là thước kẻ, Pencil là bút chì.',
          'Bước 3: Chọn đáp án A: eraser.',
        ],
        explanation: 'An eraser = cục tẩy.',
        difficulty: 'easy',
      },
      {
        id: 'g2-e-q2',
        prompt: 'Choose the correct answer for the question:',
        formula: 'What color is your school bag? - It is _______.',
        options: [
          { id: 'A', text: 'blue' },
          { id: 'B', text: 'two' },
          { id: 'C', text: 'happy' },
          { id: 'D', text: 'pen' },
        ],
        correctOptionId: 'A',
        hint: '"What color" hỏi về màu sắc (đỏ, xanh, vàng...).',
        stepByStep: [
          'Bước 1: Câu hỏi "What color" là hỏi về màu.',
          'Bước 2: Blue là màu xanh dương.',
        ],
        explanation: 'Blue là từ chỉ màu sắc phù hợp cho câu hỏi What color.',
        difficulty: 'easy',
      },
    ],
  },
};

/**
 * Helper to get a ready-to-learn Lesson by Subject and Grade, or specific lesson ID
 */
export function getLessonForGradeAndSubject(
  grade: number,
  subjectId: SubjectId,
  lessonId?: string
): Lesson {
  if (lessonId && interactiveLessonsDatabase[lessonId]) {
    return interactiveLessonsDatabase[lessonId];
  }

  const g = Math.max(1, Math.min(5, grade));

  // Try to find matching lesson in database
  const targetKey = `${subjectId}-g${g}-1`;
  if (interactiveLessonsDatabase[targetKey]) {
    return interactiveLessonsDatabase[targetKey];
  }

  // Fallback map
  if (g === 4 && subjectId === 'math') {
    return interactiveLessonsDatabase['math-g4-1'];
  }
  if (g === 2 && subjectId === 'math') {
    return interactiveLessonsDatabase['math-g2-1'];
  }
  if (g === 1 && subjectId === 'math') {
    return interactiveLessonsDatabase['math-g1-1'];
  }
  if (g === 3 && subjectId === 'math') {
    return interactiveLessonsDatabase['math-g3-1'];
  }
  if (g === 5 && subjectId === 'math') {
    return interactiveLessonsDatabase['math-g5-1'];
  }

  // Generic fallback if not found
  return interactiveLessonsDatabase['math-g2-1'];
}
