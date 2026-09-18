import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import { execSync } from 'child_process';
import { GoogleGenAI, ThinkingLevel, type GenerateContentParameters } from '@google/genai';
import { calculateLongDivision } from '../src/utils/divisionHelper.js';

const app = express();

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 10) {
      try {
        geminiClient = new GoogleGenAI({ apiKey: key });
      } catch (e) {
        console.warn('Failed to initialize GoogleGenAI with key:', e);
      }
    }
  }
  return geminiClient;
}

// Models are tried in order: a retired (404) or overloaded (503) model falls through to the next one.
// gemini-2.5-flash is no longer available to new API keys, so it must not be the default.
const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// Gemini 3 "thinks" by default (8-15s per reply); minimal thinking answers a tutoring question in ~4s.
const MINIMAL_THINKING = { thinkingLevel: ThinkingLevel.MINIMAL };

// A request, fallbacks included, must finish inside the 60s Vercel function limit (vercel.json).
const GEMINI_BUDGET_MS = 50000;
const GEMINI_ATTEMPT_TIMEOUT_MS = 30000;

async function generateWithFallback(ai: GoogleGenAI, params: Omit<GenerateContentParameters, 'model'>) {
  const deadline = Date.now() + GEMINI_BUDGET_MS;
  let lastError: unknown = new Error('No Gemini model configured');
  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 3000) break;
    try {
      return await ai.models.generateContent({
        ...params,
        model,
        config: {
          thinkingConfig: MINIMAL_THINKING,
          ...params.config,
          httpOptions: { timeout: Math.min(GEMINI_ATTEMPT_TIMEOUT_MS, remaining) },
        },
      });
    } catch (e: any) {
      console.warn(`Gemini model ${model} failed (${e?.status ?? 'error'}), trying next:`, e?.message);
      lastError = e;
    }
  }
  throw lastError;
}

// What a child of each grade already knows (Chương trình GDPT 2018), so answers never go beyond it
const GRADE_GUIDE: Record<number, string> = {
  1: 'Học sinh Lớp 1 (6-7 tuổi), mới tập đọc. Dùng câu thật ngắn, từ đơn giản và nhiều hình vui (🍎🍊🐟). Toán chỉ trong phạm vi 20: đếm, so sánh, cộng trừ, hình vuông - tròn - tam giác, xăng-ti-mét. Tiếng Việt: chữ cái, dấu thanh, vần, ghép tiếng, đọc từ và câu ngắn. Tiếng Anh: chỉ làm quen từ đơn giản (chữ cái, số 1-10, màu sắc, gia đình, con vật), KHÔNG dạy ngữ pháp. Không dùng từ khó như "số hạng", "biểu thức", "từ loại".',
  2: 'Học sinh Lớp 2. Toán: số đến 1000, cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5, dm - m - kg - lít, xem đồng hồ. Tiếng Việt: từ chỉ sự vật - hoạt động - đặc điểm, câu Ai là gì? Ai làm gì? Ai thế nào?, dấu chấm - chấm hỏi - chấm than - phẩy. Tiếng Anh: từ vựng trường lớp, cơ thể, đồ ăn, đồ chơi và câu rất ngắn.',
  3: 'Học sinh Lớp 3. Toán: số đến 100 000, bảng nhân chia đến 9, nhân chia số nhiều chữ số cho số có một chữ số, chu vi - diện tích hình chữ nhật và hình vuông, xem đồng hồ. Tiếng Việt: so sánh, nhân hóa, dấu hai chấm, ngoặc kép, đoạn văn tả ngắn. Tiếng Anh: hiện tại đơn và hiện tại tiếp diễn cơ bản, can / can\'t, giờ giấc, quần áo, thời tiết.',
  4: 'Học sinh Lớp 4. Toán: số đến hàng triệu - tỉ, nhân chia số lớn (chia cho số có hai chữ số), dấu hiệu chia hết cho 2, 3, 5, 9, phân số và bốn phép tính, hình bình hành - hình thoi, bài toán tổng - hiệu, tổng - tỉ. Tiếng Việt: danh từ - động từ - tính từ, cấu tạo tiếng, trạng ngữ, văn miêu tả cây cối và con vật. Tiếng Anh: quốc gia, ngày tháng, môn học, quá khứ đơn (was / were), so sánh hơn.',
  5: 'Học sinh Lớp 5. Toán: số thập phân và bốn phép tính, tỉ số phần trăm, diện tích hình tam giác - hình thang - hình tròn, thể tích, vận tốc - quãng đường - thời gian. Tiếng Việt: từ đồng nghĩa - trái nghĩa - đồng âm - nhiều nghĩa, nghĩa gốc - nghĩa chuyển, câu ghép và quan hệ từ, văn tả người. Tiếng Anh: trạng từ chỉ tần suất, be going to, lời khuyên, so sánh nhất, đọc hiểu đoạn ngắn.',
};

function gradeGuide(grade: unknown): string {
  const g = Math.round(Number(grade));
  return GRADE_GUIDE[g] ?? '';
}

// Example the student can type, matched to what their grade calculates
const GRADE_EXAMPLE: Record<number, string> = { 1: '3 + 4', 2: '52 - 27', 3: '8 x 7', 4: '51019 : 19', 5: '3,5 x 2,4' };

function buildSystemInstruction(grade?: unknown): string {
  const g = Math.round(Number(grade));
  const guide = gradeGuide(g);
  const example = GRADE_EXAMPLE[g] ?? '52 - 27';
  return `Bạn là Thầy giáo Kiddo AI - trợ lý học tập và gia sư thông minh, ân cần, kiên nhẫn dành riêng cho học sinh Tiểu học Việt Nam (Lớp 1 đến Lớp 5).

${guide ? `TRÌNH ĐỘ CỦA HỌC SINH NÀY - RẤT QUAN TRỌNG:\n${guide}\nChỉ giải thích bằng kiến thức của lớp này hoặc các lớp dưới. Nếu con hỏi kiến thức của lớp trên, hãy nói nhẹ nhàng rằng con sẽ được học sau, rồi chỉ giải thích ở mức đơn giản.\n` : 'Hãy hỏi con đang học lớp mấy để giải thích đúng trình độ, và không dùng kiến thức vượt quá lớp của con.\n'}
Quy tắc giảng dạy và phản hồi:
1. Khi học sinh chào hỏi (ví dụ: "hello", "hi", "chào thầy", "chào Kiddo"):
   - Chào đón con vui vẻ, ấm áp, xưng hô "Thầy - Con".
   - Hỏi con đang gặp bài Toán, câu Tiếng Việt hay từ Tiếng Anh nào cần thầy hướng dẫn.
   - Gợi ý nhẹ nhàng: "Con có thể gõ phép tính (như ${example}) để thầy hướng dẫn từng bước nhé!".

2. Khi học sinh hỏi bài Toán: giải thích từng bước ngắn gọn, đúng phương pháp Sách giáo khoa của lớp con, nêu kết quả rõ ràng và cách thử lại nếu phù hợp. Lớp 1: dùng hình (🍎 + 🍎) hoặc đếm que tính thay vì quy tắc dài.
   - Phép chia đặt tính (lớp 4 trở lên): chia từ trái sang phải; mỗi lần chia nêu ước lượng thương, nhân ngược, trừ, hạ chữ số tiếp theo; thử lại bằng (Thương × Số chia) + Số dư = Số bị chia.
   - Cộng trừ có nhớ (lớp 2): giải thích mượn - trả theo hàng chục.

3. Khi học sinh hỏi Tiếng Việt: đưa ví dụ thân thuộc (trường học, bạn bè, con vật). Khi hỏi Tiếng Anh: cho từ vựng, cách đọc đơn giản và một câu ví dụ vui, đúng mức của lớp con.

4. Văn phong: thân thiện, khích lệ, câu ngắn, dùng biểu tượng vui (🌟, 💡, 🎯, 👏, 🚀), ngắt đoạn mạch lạc, dễ đọc trên điện thoại. Không dùng ký hiệu in đậm kiểu ** hay ***.`;
}

// Local intelligent fallback generator if Gemini API key is missing
function generateLocalElementaryResponse(userText: string, context?: any): string {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // Greetings
  if (['hello', 'hi', 'chào', 'chao', 'xin chào', 'halo', 'hey'].some(g => lower.startsWith(g) || lower === g)) {
    const gradeInfo = context?.grade ? `Lớp ${context.grade}` : 'Tiểu học';
    return `Chào con! Thầy là Kiddo AI đây 🤖✨\n\nRất vui được đồng hành cùng con trong chương trình học ${gradeInfo}! Con đang gặp bài toán, câu Tiếng Việt hay từ vựng Tiếng Anh nào cần thầy hướng dẫn từng bước không? Cứ hỏi thầy nhé! 🚀`;
  }

  // Check for division pattern: e.g., "51019 : 19", "51019/19", "chia 51019 cho 19"
  const divisionMatch = lower.match(/(\d+)\s*(?::|\/|chia cho|chia)\s*(\d+)/);
  if (divisionMatch || lower.includes('51019') || lower.includes('phép chia') || lower.includes('chia')) {
    const a = divisionMatch ? parseInt(divisionMatch[1], 10) : 51019;
    const b = divisionMatch ? parseInt(divisionMatch[2], 10) : 19;

    if (b > 0) {
      try {
        const divRes = calculateLongDivision(a, b);
        let resp = `Thầy hướng dẫn con thực hiện phép chia **${a} : ${b}** theo đúng phương pháp Đặt tính rồi tính của học sinh Tiểu học nhé! ➗✨\n\n`;
        resp += `### 📝 Các bước thực hiện (từ trái sang phải):\n`;
        divRes.steps.forEach(step => {
          resp += `\n**${step.description}:**\n${step.explanation}\n`;
        });
        resp += `\n🎯 **Kết luận:**\n**${a} : ${b} = ${divRes.quotient}**${divRes.remainder > 0 ? ` (dư **${divRes.remainder}**)` : ' (phép chia hết)'}\n\n`;
        resp += `🔍 **Cách thử lại:**\n(${divRes.quotient} × ${b}) + ${divRes.remainder} = ${divRes.quotient * b + divRes.remainder} (chính xác tuyệt đối! 👏)`;
        return resp;
      } catch (e) {
        // continue
      }
    }
  }

  // Check for subtraction with borrow
  if (lower.includes('52 - 27') || lower.includes('52 − 27') || (lower.includes('mượn') && lower.includes('trừ'))) {
    return `Cách thực hiện phép trừ có nhớ **52 − 27**:\n\n1. **Ở hàng đơn vị:** 2 không trừ được 7, ta mượn 1 chục (10 đơn vị) thành 12. Lấy 12 − 7 = **5**, viết 5, nhớ 1.\n2. **Ở hàng chục:** Thêm 1 vào 2 được 3. Lấy 5 − 3 = **2**, viết 2.\n👉 **Kết quả:** 52 − 27 = **25**! ✨`;
  }

  // Simple arithmetic such as "1+1 bằng mấy", "12 - 5", "7 x 8" (division is handled above)
  const arithmeticMatch = lower.match(/(?<![\d.,])(\d+)\s*([+\-−×x*])\s*(\d+)(?![.,]\d)/);
  if (arithmeticMatch) {
    const n1 = parseInt(arithmeticMatch[1], 10);
    const op = arithmeticMatch[2];
    const n2 = parseInt(arithmeticMatch[3], 10);

    if (op === '+') {
      return `**${n1} + ${n2} = ${n1 + n2}** 🎯\n\nCon lấy ${n1} rồi cộng thêm ${n2} nữa, ta được **${n1 + n2}**.\n\n🔍 **Cách thử lại:** ${n1 + n2} − ${n2} = ${n1} (đúng rồi! 👏)`;
    }
    if ((op === '-' || op === '−') && n1 >= n2) {
      return `**${n1} − ${n2} = ${n1 - n2}** 🎯\n\nCon lấy ${n1} bớt đi ${n2}, còn lại **${n1 - n2}**.\n\n🔍 **Cách thử lại:** ${n1 - n2} + ${n2} = ${n1} (đúng rồi! 👏)`;
    }
    if (op === '×' || op === 'x' || op === '*') {
      const check = n2 > 0 ? `\n\n🔍 **Cách thử lại:** ${n1 * n2} : ${n2} = ${n1} (đúng rồi! 👏)` : '';
      return `**${n1} × ${n2} = ${n1 * n2}** 🎯\n\nNghĩa là ${n2} lần số ${n1}, ta được **${n1 * n2}**.${check}`;
    }
  }

  // Check for multiplication table
  if (lower.includes('bảng nhân') || lower.includes('bảng cửu chương') || lower.includes('bảng nhân 7')) {
    return `Mẹo nhớ bảng nhân 7 của Kiddo AI nè con! 🌟\nMỗi lần nhân thêm 1 số là cộng thêm đúng 7 đơn vị:\n• 7 × 1 = 7\n• 7 × 2 = 14\n• 7 × 5 = 35 (mốc dễ nhớ)\n• 7 × 6 = 42\n• 7 × 7 = 49\n• 7 × 8 = 56\n• 7 × 9 = 63\n• 7 × 10 = 70.`;
  }

  // Check for parts of speech (Tiếng Việt)
  if (lower.includes('danh từ') || lower.includes('động từ') || lower.includes('tính từ')) {
    return `Mẹo phân biệt từ loại Tiếng Việt dễ nhớ nè con! 📖✨\n• **Danh từ:** Từ chỉ sự vật, người, con vật, cây cối (ví dụ: *học sinh, cô giáo, cái bàn, con mèo*).\n• **Động từ:** Từ chỉ hoạt động, trạng thái (ví dụ: *chạy, nhảy, đọc sách, múa hát*).\n• **Tính từ:** Từ chỉ màu sắc, hình dáng, tính nết (ví dụ: *xanh biếc, chăm chỉ, tròn xoe, thông minh*).`;
  }

  return `Thầy Kiddo AI đã nhận được câu hỏi: "${trimmed}" của con! 💡\n\nCon hãy cùng thầy quan sát và phân tích từng bước nhé. Nếu đây là bài tập Toán, con có thể gõ rõ số hoặc biểu thức để thầy hướng dẫn phương pháp đặt tính rồi tính chi tiết từng bước cho con nhé! 🌟`;
}

// Deterministic Math Question Validator & Reviewer
function reviewAndVerifyMathQuestion(q: any): { valid: boolean; question: any; error?: string } {
  if (!q.question || !Array.isArray(q.choices) || q.choices.length < 2 || !q.correctAnswer) {
    return { valid: false, question: q, error: 'Cấu trúc câu hỏi thiếu trường bắt buộc' };
  }

  // Parse arithmetic expression like: "52 - 27", "62 − 38 = ?", "15 + 28 = ?", "7 * 8 = ?"
  const text = `${q.question} ${q.formula || ''}`;
  const clean = text.replace(/−/g, '-').replace(/×/g, '*').replace(/÷|:/g, '/');
  const match = clean.match(/(\d+)\s*([+\-*\/])\s*(\d+)/);

  if (match) {
    const n1 = parseInt(match[1], 10);
    const op = match[2];
    const n2 = parseInt(match[3], 10);

    let expected = 0;
    if (op === '+') expected = n1 + n2;
    if (op === '-') expected = n1 - n2;
    if (op === '*') expected = n1 * n2;
    if (op === '/' && n2 > 0) expected = Math.floor(n1 / n2);

    const expectedStr = expected.toString();
    const currentCorrect = q.correctAnswer.toString().trim();

    // If AI hallucinates an incorrect answer for a deterministic math calculation
    if (currentCorrect !== expectedStr && !currentCorrect.includes(expectedStr)) {
      console.warn(`[Deterministic Math Validator]: Corrected AI math calculation from "${currentCorrect}" to "${expectedStr}" for "${n1} ${op} ${n2}"`);
      q.correctAnswer = expectedStr;
      if (!q.choices.includes(expectedStr)) {
        q.choices[0] = expectedStr;
      }
    }
  }

  // Ensure correctAnswer is included in choices
  if (!q.choices.includes(q.correctAnswer)) {
    q.choices.push(q.correctAnswer);
  }

  return { valid: true, question: q };
}

// Fallback question generator when AI is unavailable
function generateLocalQuestionSet(grade: number, subject: string, skillName: string, count: number = 3) {
  const questions: any[] = [];
  for (let i = 1; i <= count; i++) {
    if (subject === 'math') {
      const a = 35 + (grade * 12) + (i * 5);
      const b = 16 + (grade * 3) + (i * 2);
      const res = a - b;
      questions.push({
        question: `Tính nhẩm hoặc đặt tính: ${a} − ${b} = ?`,
        choices: [`${res}`, `${res + 10}`, `${res - 2}`, `${res + 2}`],
        correctAnswer: `${res}`,
        explanation: `Ta thực hiện trừ từ phải sang trái: ${a} − ${b} = ${res}.`,
        hint: `Quan sát hàng đơn vị, nếu cần thì mượn 1 chục rồi trừ nhé con!`,
        difficulty: Math.min(5, Math.max(1, (i % 3) + 1)),
      });
    } else if (subject === 'vietnamese') {
      questions.push({
        question: `Chọn từ ngữ thích hợp để hoàn thiện câu văn sau (Lớp ${grade}):`,
        choices: ['chăm chỉ học tập', 'lười biếng', 'quậy phá', 'ngủ gật'],
        correctAnswer: 'chăm chỉ học tập',
        explanation: 'Học sinh ngoan luôn chăm chỉ học tập để đạt kết quả tốt.',
        hint: 'Chọn từ mang ý nghĩa tích cực khen ngợi đức tính tốt nhé!',
        difficulty: 2,
      });
    } else {
      questions.push({
        question: `Choose the correct answer for Grade ${grade}:`,
        choices: ['I like learning English', 'I likes English', 'Me like English', 'I is like English'],
        correctAnswer: 'I like learning English',
        explanation: 'With subject "I", verb remains in base form: "like".',
        hint: 'Pay attention to subject-verb agreement.',
        difficulty: 2,
      });
    }
  }
  return questions;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    geminiConfigured: !!getGemini(),
    time: new Date().toISOString() 
  });
});

// Authentic Vietnamese Text-to-Speech Streaming Proxy
const ttsCache = new Map<string, Buffer>();
let silenceMp3Buffer: Buffer = Buffer.alloc(0);
try {
  if (fs.existsSync('/tmp/silence_450ms.mp3')) {
    silenceMp3Buffer = fs.readFileSync('/tmp/silence_450ms.mp3');
  } else {
    execSync('ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.45 -b:a 64k -f mp3 /tmp/silence_450ms.mp3 2>/dev/null');
    silenceMp3Buffer = fs.readFileSync('/tmp/silence_450ms.mp3');
  }
} catch (e) {
  // silent
}

app.get('/api/tts', async (req, res) => {
  try {
    const rawText = (req.query.text as string) || '';
    const lang = ((req.query.lang as string) || 'vi').toLowerCase();
    const cleanText = rawText.trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const cacheKey = `${lang}:${cleanText}`;
    if (ttsCache.has(cacheKey)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(ttsCache.get(cacheKey)!);
    }

    const targetLang = lang === 'en' || lang === 'en-us' ? 'en' : 'vi';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText.slice(0, 200)
    )}&tl=${targetLang}&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (response.ok) {
      const buf = Buffer.from(await response.arrayBuffer());
      ttsCache.set(cacheKey, buf);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buf);
    }
    return res.status(502).json({ error: 'Could not generate audio' });
  } catch (err: any) {
    res.status(500).json({ error: 'TTS conversion failed' });
  }
});

// Step-by-Step Long Division Calculator
app.post('/api/calculate-division', (req, res) => {
  try {
    const { dividend, divisor } = req.body;
    const a = parseInt(dividend, 10);
    const b = parseInt(divisor, 10);

    if (isNaN(a) || isNaN(b) || b <= 0) {
      return res.status(400).json({ error: 'Số chia phải là số tự nhiên lớn hơn 0' });
    }

    const result = calculateLongDivision(a, b);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi tính toán' });
  }
});

// AI QUESTION GENERATOR ENDPOINT
app.post('/api/ai/generate-questions', async (req, res) => {
  const { grade = 3, subject = 'math', topic = 'Phép trừ', skill = 'Phép trừ có nhớ', difficulty = 2, count = 3 } = req.body;

  try {
    const ai = getGemini();

    if (ai) {
      const prompt = `Bạn là chuyên gia sư phạm tiểu học Việt Nam. Hãy tạo ${count} câu hỏi trắc nghiệm khách quan dành cho học sinh Lớp ${grade}.
Môn học: ${subject === 'math' ? 'Toán học' : subject === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}
Chủ đề: ${topic}
Kỹ năng cụ thể: ${skill}
Độ khó (1 đến 5): ${difficulty}

Yêu cầu nghiêm ngặt:
1. Nội dung phải bám sát chương trình Giáo dục phổ thông Tiểu học Việt Nam (Lớp ${grade}). TUYỆT ĐỐI không cho câu hỏi vượt quá trình độ Lớp ${grade}.
Kiến thức của lớp này: ${gradeGuide(grade)}
2. Nếu là môn Toán: các phép tính phải chính xác 100%, có lời giải thích từng bước rõ ràng.
3. Trả về đúng định dạng JSON duy nhất, không thêm markdown code block, không thêm lời chào:
{
  "questions": [
    {
      "question": "Nội dung câu hỏi",
      "choices": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": "Đáp án đúng",
      "explanation": "Giải thích chi tiết",
      "hint": "Gợi ý nhỏ không lộ đáp án",
      "difficulty": ${difficulty}
    }
  ]
}`;

      const response = await generateWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        // Deterministic validation layer
        const validatedQuestions = parsed.questions.map((q: any) => {
          const reviewed = reviewAndVerifyMathQuestion(q);
          return reviewed.question;
        });

        return res.json({
          questions: validatedQuestions,
          source: 'gemini_ai',
          validation_status: 'passed',
        });
      }
    }

    // Graceful fallback to local curriculum generator
    const fallbackQuestions = generateLocalQuestionSet(grade, subject, skill, count);
    return res.json({
      questions: fallbackQuestions,
      source: 'local_fallback',
      validation_status: 'passed',
      message: 'Kiddo AI đang nghỉ một chút, mình tiếp tục với bài luyện có sẵn nhé! ✨',
    });
  } catch (error: any) {
    console.error('AI question generator error, using fallback:', error);
    const fallbackQuestions = generateLocalQuestionSet(grade, subject, skill, count);
    return res.json({
      questions: fallbackQuestions,
      source: 'local_fallback',
      validation_status: 'passed',
      message: 'Kiddo AI đang nghỉ một chút, mình tiếp tục với bài luyện có sẵn nhé! ✨',
    });
  }
});

// AI PROGRESSIVE HINT ENDPOINT
app.post('/api/ai/hint', async (req, res) => {
  const { question, choices, correctAnswer, studentGrade = 3, hintLevel = 1 } = req.body;

  try {
    const ai = getGemini();

    if (ai) {
      let prompt = '';
      if (hintLevel === 1) {
        prompt = `Học sinh Lớp ${studentGrade} đang làm câu hỏi: "${question}". Đáp án đúng là "${correctAnswer}". Hãy đưa ra một GỢI Ý NHỎ BƯỚC ĐẦU (1-2 câu), gợi ý hướng suy nghĩ, TUYỆT ĐỐI KHÔNG NÓI ĐÁP ÁN.`;
      } else if (hintLevel === 2) {
        prompt = `Học sinh Lớp ${studentGrade} đang làm câu hỏi: "${question}". Hãy đưa ra GỢI Ý CHI TIẾT HƠN (hướng dẫn cách mượn số, tra từ điển hoặc nhận biết từ loại), vẫn KHÔNG nói thẳng đáp án.`;
      } else {
        prompt = `Học sinh Lớp ${studentGrade} muốn xem cách giải chi tiết câu hỏi: "${question}". Đáp án đúng là "${correctAnswer}". Hãy giải thích từng bước thật ân cần, ngắn gọn, dễ hiểu.`;
      }

      const response = await generateWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `Bạn là gia sư Kiddo AI cho học sinh Tiểu học. Trả lời ngắn gọn, tích cực, truyền cảm hứng. ${gradeGuide(studentGrade)}`,
          temperature: 0.5,
        },
      });

      const reply = response.text || '';
      if (reply.trim()) {
        return res.json({ hint: reply.trim(), level: hintLevel });
      }
    }

    // Local Fallback hint
    const fallbackHints: Record<number, string> = {
      1: 'Con hãy quan sát kỹ từ hàng đơn vị từ phải sang trái hoặc tìm từ khóa chính của câu nhé!',
      2: 'Nếu là phép trừ có nhớ, hãy nhớ mượn 1 chục ở hàng chục rồi trả lại vào số trừ nhé!',
      3: `Đáp án đúng là "${correctAnswer}". Ta thực hiện tính toán từng bước theo đúng quy tắc SGK nhé!`,
    };

    return res.json({ hint: fallbackHints[hintLevel] || fallbackHints[1], level: hintLevel });
  } catch (error: any) {
    return res.json({
      hint: 'Hãy quan sát kỹ từng phương án và làm theo từng bước con nhé! 🌟',
      level: hintLevel,
    });
  }
});

// CONTEXT-AWARE AI TUTOR CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Tin nhắn không hợp lệ' });
  }

  try {
    const ai = getGemini();

    if (ai) {
      const contents: any[] = [];

      // Add context header if available
      let contextualInstruction = buildSystemInstruction(context?.grade);
      if (context) {
        const facts = [
          context.grade ? `- Khối lớp: Lớp ${context.grade}` : '',
          context.currentSkill ? `- Kỹ năng đang luyện: ${context.currentSkill}` : '',
          context.mastery !== undefined ? `- Điểm thành thạo: ${context.mastery}%` : '',
          context.weakSkills ? `- Kỹ năng cần rèn thêm: ${context.weakSkills}` : '',
        ].filter(Boolean);
        if (facts.length) contextualInstruction += `\n\nThông tin học sinh hiện tại:\n${facts.join('\n')}`;
      }

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.text && item.sender) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await generateWithFallback(ai, {
        contents,
        config: {
          systemInstruction: contextualInstruction,
          temperature: 0.6,
        },
      });

      const replyText = response.text || '';
      if (replyText.trim()) {
        return res.json({ reply: replyText });
      }
    }

    const fallbackReply = generateLocalElementaryResponse(message, context);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Gemini API error, falling back:', error);
    const fallbackReply = generateLocalElementaryResponse(message, context);
    return res.json({ reply: fallbackReply });
  }
});

export default app;
