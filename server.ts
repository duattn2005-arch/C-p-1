import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { calculateLongDivision } from './src/utils/divisionHelper';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      geminiClient = new GoogleGenAI({ apiKey: key });
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
   - Phép trừ/cộng có nhớ: Giải thích chi tiết mượn và trả theo hàng chục.
   - Tiếng Việt (Từ chỉ sự vật, danh từ, động từ, chính tả): Đưa ví dụ thân thuộc như trường học, bạn bè, con vật.
   - Tiếng Anh: Cung cấp từ vựng, phiên âm đơn giản và câu ví dụ vui.

4. Văn phong: Thân thiện, khích lệ, dùng các biểu tượng vui tươi (🌟, 💡, ➗, 🎯, 👏, 🚀), ngắt đoạn mạch lạc, dễ đọc trên màn hình điện thoại hoặc máy tính.`;

// Local intelligent fallback generator if Gemini API key is missing
function generateLocalElementaryResponse(userText: string): string {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();

  // Greetings
  if (['hello', 'hi', 'chào', 'chao', 'xin chào', 'halo', 'hey'].some(g => lower.startsWith(g) || lower === g)) {
    return `Chào con! Thầy là Kiddo AI đây 🤖✨\n\nRất vui được gặp con hôm nay! Con đang học bài nào hay có câu hỏi gì cần thầy giúp không? Con có thể gõ bất kỳ phép tính nào (ví dụ: phép chia 51019 : 19, phép trừ có nhớ 52 − 27) hoặc hỏi thầy về môn Tiếng Việt, Tiếng Anh nhé! 🚀`;
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
  if (lower.includes('bảng nhân') || lower.includes('bảng cửu chương')) {
    return `Mẹo nhớ bảng nhân của Kiddo AI nè con! 🌟\nVí dụ bảng nhân 7: Mỗi lần nhân thêm 1 số là cộng thêm đúng 7 đơn vị (7, 14, 21, 28, 35, 42, 49, 56, 63, 70). Con có thể lấy mốc 7 × 5 = 35 làm điểm tựa để nhớ nhé!`;
  }

  return `Thầy Kiddo AI đã nhận được câu hỏi: "${trimmed}" của con! 💡\n\nCon hãy cùng thầy quan sát và phân tích từng bước nhé. Nếu đây là bài tập Toán, con có thể gõ rõ số hoặc biểu thức để thầy hướng dẫn phương pháp đặt tính rồi tính chi tiết từng bước cho con nhé! 🌟`;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// In-memory cache for audio buffers
const ttsCache = new Map<string, Buffer>();

// Pre-generated 450ms MP3 silence buffer to insert natural pauses between rhythmic segments
let silenceMp3Buffer: Buffer = Buffer.alloc(0);
try {
  if (fs.existsSync('/tmp/silence_450ms.mp3')) {
    silenceMp3Buffer = fs.readFileSync('/tmp/silence_450ms.mp3');
  } else {
    execSync('ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.45 -b:a 64k -f mp3 /tmp/silence_450ms.mp3 2>/dev/null');
    silenceMp3Buffer = fs.readFileSync('/tmp/silence_450ms.mp3');
  }
} catch (e) {
  console.warn('Could not initialize silence MP3 buffer, continuing without extra pause frames:', e);
}

interface PacedSegment {
  text: string;
  pauseAfter: boolean;
}

// Function to split text into paced segments with deliberate pauses
function parseToPacedSegments(text: string, maxLen = 150): PacedSegment[] {
  let rawSegments: string[] = [];
  if (text.includes('||')) {
    // Explicit rhythmic chunks (e.g. Question || Option A || Option B ...)
    rawSegments = text
      .split(/\s*\|\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    // Natural sentence pauses on . ! ? ; or newlines
    rawSegments = text
      .replace(/[*#`_~]/g, '')
      .split(/(?<=[.!?;\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const result: PacedSegment[] = [];
  for (const seg of rawSegments) {
    if (seg.length <= maxLen) {
      result.push({ text: seg, pauseAfter: true });
    } else {
      const words = seg.split(' ');
      let current = '';
      for (const w of words) {
        if ((current + ' ' + w).trim().length <= maxLen) {
          current = (current + ' ' + w).trim();
        } else {
          if (current) result.push({ text: current, pauseAfter: false });
          current = w;
        }
      }
      if (current) result.push({ text: current, pauseAfter: true });
    }
  }

  return result.length > 0 ? result : [{ text: text.slice(0, maxLen), pauseAfter: false }];
}

// API: Authentic Vietnamese Text-to-Speech Streaming Proxy with rhythmic pacing
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
      const cached = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached);
    }

    const segments = parseToPacedSegments(cleanText);
    const audioBuffers: Buffer[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const targetLang = lang === 'en' || lang === 'en-us' ? 'en' : 'vi';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        seg.text
      )}&tl=${targetLang}&client=tw-ob`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const buf = Buffer.from(await response.arrayBuffer());
        audioBuffers.push(buf);

        // If this segment has a pause and is not the final segment, append natural silence pause
        if (seg.pauseAfter && i < segments.length - 1 && silenceMp3Buffer.length > 0) {
          audioBuffers.push(silenceMp3Buffer);
        }
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ error: 'Could not generate audio' });
    }

    const combined = Buffer.concat(audioBuffers);
    if (ttsCache.size > 300) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, combined);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(combined);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS conversion failed' });
  }
});

// API: Long Division Step-by-Step Calculator
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

// API: Chat with Kiddo AI Tutor
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Tin nhắn không hợp lệ' });
  }

  try {
    const ai = getGemini();

    if (ai) {
      // Build conversation history contents for Gemini
      const contents: any[] = [];

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
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || '';
      if (replyText.trim()) {
        return res.json({ reply: replyText });
      }
    }

    // Fallback to local intelligent pedagogical engine
    const fallbackReply = generateLocalElementaryResponse(message);
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Gemini API error, falling back to local solver:', error);
    const fallbackReply = generateLocalElementaryResponse(message);
    return res.json({ reply: fallbackReply });
  }
});

async function startServer() {
  // Vite middleware in dev mode
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
    console.log(`KIDDO.AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
