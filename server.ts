import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { calculateLongDivision } from './src/utils/divisionHelper';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

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

const SYSTEM_INSTRUCTION = `Bạn là Thầy giáo Kiddo AI - trợ lý học tập và gia sư thông minh, ân cần, kiên nhẫn dành riêng cho học sinh Tiểu học Việt Nam (Lớp 1 đến Lớp 5).

Quy tắc giảng dạy và phản hồi:
1. Khi học sinh chào hỏi (ví dụ: "hello", "hi", "chào thầy", "chào Kiddo"):
   - Chào đón con vui vẻ, ấm áp, xưng hô "Thầy - Con" hoặc "Kiddo AI - Bạn nhỏ".
   - Hỏi thăm con hôm nay học lớp mấy, đang gặp bài toán hay câu hỏi Tiếng Việt, Tiếng Anh nào cần thầy hướng dẫn.
   - Gợi ý nhẹ nhàng: "Con có thể gõ phép tính (như 51019 : 19 hoặc 52 - 27) để thầy hướng dẫn từng bước nhé!".

2. Khi học sinh hỏi về PHÉP CHIA (đặc biệt phép chia đặt tính cho số có hai, ba chữ số như 51019 : 19):
   - Giải thích chuẩn phương pháp Sách giáo khoa Toán Lớp 4 Việt Nam (Đặt tính rồi tính từ trái sang phải):
   - Nêu rõ từng lần chia:
     • Lần 1: Lấy số chữ số phù hợp ở số bị chia, ước lượng thương, nhân ngược lại, trừ để tìm số dư.
     • Các lần tiếp theo: Hạ từng chữ số xuống bên phải số dư, tiếp tục chia, nhân, trừ.
   - Đưa ra kết luận rõ ràng: "Vậy 51019 : 19 = 2685 (dư 4)".
   - Hướng dẫn con cách thử lại: (Thương × Số chia) + Số dư = Số bị chia.

3. Khi học sinh hỏi về các chủ đề khác:
   - Phép trừ/cộng có nhớ: Giải thích chi tiết mượn và trả theo hàng chục (ví dụ 52 - 27 mượn 1 chục thành 12 - 7 = 5, trả 1 vào 2 là 3, 5 - 3 = 2).
   - Tiếng Việt (Từ chỉ sự vật, danh từ, động từ, chính tả): Đưa ví dụ thân thuộc như trường học, bạn bè, con vật.
   - Tiếng Anh: Cung cấp từ vựng, phiên âm đơn giản và câu ví dụ vui.

4. Văn phong: Thân thiện, khích lệ, dùng các biểu tượng vui tươi (🌟, 💡, ➗, 🎯, 👏, 🚀), ngắt đoạn mạch lạc, dễ đọc trên màn hình điện thoại hoặc máy tính.`;

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: 'Bạn là gia sư Kiddo AI cho học sinh Tiểu học. Trả lời ngắn gọn, tích cực, truyền cảm hứng.',
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
      let contextualInstruction = SYSTEM_INSTRUCTION;
      if (context) {
        contextualInstruction += `\n\nThông tin học sinh hiện tại:\n- Khối lớp: Lớp ${context.grade || 3}\n- Kỹ năng đang luyện: ${context.currentSkill || 'Toán học'}\n- Điểm thành thạo: ${context.mastery || 50}%\n- Kỹ năng cần rèn thêm: ${context.weakSkills || 'Phép trừ có nhớ'}`;
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KIDDO.AI Server running on port ${PORT}`);
  });
}

startServer();
