// Utility for natural, authentic Vietnamese Text-to-Speech (TTS)
// Specially tailored for Vietnamese Primary School students (Lớp 1 - Lớp 5)

let cachedVietnameseVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Preload and find the best Vietnamese voice in the browser
export function initVietnameseVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const updateVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Search order:
    // 1. Exact vi-VN or vi_VN
    // 2. Starts with 'vi'
    // 3. Name has 'Vietnam' or 'Tiếng Việt'
    let v = voices.find(
      (voice) => voice.lang === 'vi-VN' || voice.lang === 'vi_VN'
    );
    if (!v) {
      v = voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith('vi') ||
          voice.name.toLowerCase().includes('vietnam') ||
          voice.name.toLowerCase().includes('tiếng việt')
      );
    }

    if (v) {
      cachedVietnameseVoice = v;
      voicesLoaded = true;
    }
  };

  updateVoice();
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = updateVoice;
  }
}

// Ensure voices are loaded immediately
initVietnameseVoices();

export function getVietnameseVoice(): SpeechSynthesisVoice | null {
  if (!cachedVietnameseVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    cachedVietnameseVoice =
      voices.find((v) => v.lang === 'vi-VN' || v.lang === 'vi_VN') ||
      voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('vi') ||
          v.name.toLowerCase().includes('vietnam') ||
          v.name.toLowerCase().includes('tiếng việt')
      ) ||
      null;
  }
  return cachedVietnameseVoice;
}

/**
 * Chuyển đổi công thức toán học và ký hiệu thành câu đọc tiếng Việt tự nhiên,
 * chuẩn phát âm sách giáo khoa Tiểu học Việt Nam.
 * Ví dụ: "51019 : 19 = ?" -> "51019 chia cho 19 bằng bao nhiêu"
 */
export function formatMathForVietnameseSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Replace markdown markers
  text = text.replace(/[*#`_~]/g, '');

  // Decimal comma in Vietnamese: e.g. "45,8" -> "45 phẩy 8"
  text = text.replace(/(\d+),(\d+)/g, '$1 phẩy $2');

  // Units
  text = text.replace(/\bdm\b/gi, ' đề-xi-mét ');
  text = text.replace(/\bcm\b/gi, ' xen-ti-mét ');
  text = text.replace(/\bkm\b/gi, ' ki-lô-mét ');
  text = text.replace(/\bkg\b/gi, ' ki-lô-gam ');
  text = text.replace(/\bml\b/gi, ' mi-li-lít ');

  // Math symbols
  text = text.replace(/\s*[:÷]\s*/g, ' chia cho ');
  text = text.replace(/\s*\/\s*/g, ' chia cho ');
  text = text.replace(/\s*[×*]\s*/g, ' nhân ');
  text = text.replace(/\s*[−–]\s*/g, ' trừ ');
  text = text.replace(/(\d+)\s*-\s*(\d+)/g, '$1 trừ $2');
  text = text.replace(/\s*-\s*/g, ' trừ ');
  text = text.replace(/\s*\+\s*/g, ' cộng ');
  text = text.replace(/\s*=\s*\?+/g, ' bằng bao nhiêu');
  text = text.replace(/\s*=\s*/g, ' bằng ');
  text = text.replace(/\(dư\s*(\d+)\)/gi, 'dư $1');

  // Question mark cleanup
  text = text.replace(/\?+/g, '');

  return text.trim();
}

/**
 * Chuẩn hóa toàn bộ câu hỏi và các phương án lựa chọn thành các phân đoạn nhịp điệu rõ ràng:
 * - Đọc câu hỏi xong ngắt nhịp (nghỉ)
 * - Đọc đáp án a xong ngắt nhịp
 * - Đọc đáp án b xong ngắt nhịp
 * - Đọc đáp án c xong ngắt nhịp
 * - Đọc đáp án d
 */
export function buildQuestionAudioText(question: {
  prompt: string;
  formula?: string;
  subPrompt?: string;
  options: Array<{ id: string; text: string; face?: { only?: boolean } }>;
}): string {
  let basePrompt = (question.prompt || '').trim();
  let formulaText = question.formula ? formatMathForVietnameseSpeech(question.formula) : '';
  let subPromptText = question.subPrompt ? formatMathForVietnameseSpeech(question.subPrompt) : '';

  let questionSentence = '';
  if (formulaText) {
    const cleanedPrompt = basePrompt.replace(/[:：?.\s]+$/, '').trim();
    questionSentence = cleanedPrompt ? `${cleanedPrompt} ${formulaText}` : formulaText;
  } else {
    questionSentence = basePrompt.replace(/[:：\s]+$/, '').trim();
  }

  if (subPromptText && !questionSentence.includes(subPromptText)) {
    questionSentence += `. ${subPromptText}`;
  }

  questionSentence = questionSentence.replace(/[?.\s]+$/, '');
  questionSentence += '?';

  // Từng lựa chọn đáp án được tách nhịp rõ ràng:
  const optionSegments = (question.options || []).map((opt, index) => {
    const letter = (opt.id || '').toLowerCase();
    // a picture-only option has no words to read: name it by its letter
    const cleanText = opt.face?.only ? `hình ${letter}` : formatMathForVietnameseSpeech(opt.text || '');
    if (index === 0) {
      return `đáp án ${letter}: ${cleanText}`;
    }
    return `${letter}: ${cleanText}`;
  });

  // Sử dụng ký tự phân cách nhịp ngắt ' || '
  return [questionSentence, ...optionSegments].join(' || ');
}

/**
 * Play gentle notification chime via Web Audio API for sensory feedback
 */
export function playChimeTone(type: 'start' | 'correct' | 'hint' = 'start') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'correct') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // AudioContext might be blocked until user interaction
  }
}

let currentAudio: HTMLAudioElement | null = null;

export interface SpeakOptions {
  text: string;
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

function fallbackBrowserSpeech(
  formattedText: string,
  targetLang: 'vi' | 'en',
  rate: number,
  pitch: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err?: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Trình duyệt không hỗ trợ đọc giọng nói');
    onEnd?.();
    return false;
  }

  const spokenText = formattedText.replace(/\s*\|\|\s*/g, '. ... ');

  // If Vietnamese, ONLY speak with browser TTS if a real Vietnamese voice is found
  // (Prevents English voice from reading Vietnamese phonetics as English gibberish)
  if (targetLang === 'vi') {
    const viVoice = getVietnameseVoice();
    if (!viVoice) {
      console.warn('No native Vietnamese voice found in OS/browser to fallback.');
      onError?.('Không tìm thấy giọng đọc Tiếng Việt trên thiết bị');
      onEnd?.();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = 'vi-VN';
    utterance.voice = viVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      playChimeTone('start');
      onStart?.();
    };
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  } else {
    // English
    const utterance = new SpeechSynthesisUtterance(formattedText);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      playChimeTone('start');
      onStart?.();
    };
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  }
}

/**
 * Đọc to văn bản bằng giọng tiếng Việt chuẩn 100%, hỗ trợ trẻ em học tập.
 * Ưu tiên phát trực tiếp qua audio stream tiếng Việt chuẩn từ server,
 * hoàn toàn không bị lỗi đọc tiếng Anh giả dạng tiếng Việt của trình duyệt.
 */
export function speakVietnamese({
  text,
  rate = 0.88,
  pitch = 1.0,
  lang = 'vi-VN',
  onStart,
  onEnd,
  onError,
}: SpeakOptions): boolean {
  if (typeof window === 'undefined') return false;

  stopSpeaking();

  const isVietnamese = lang === 'vi-VN' || lang === 'vi';
  const formattedText = isVietnamese ? formatMathForVietnameseSpeech(text) : text;
  if (!formattedText) return false;

  const targetLang: 'vi' | 'en' = isVietnamese ? 'vi' : 'en';

  // 1. High-fidelity Server Audio Stream (/api/tts)
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(formattedText)}&lang=${targetLang}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onplay = () => {
      playChimeTone('start');
      onStart?.();
    };

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('Audio stream error, attempting fallback:', e);
      if (currentAudio === audio) {
        currentAudio = null;
      }
      fallbackBrowserSpeech(formattedText, targetLang, rate, pitch, onStart, onEnd, onError);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play rejected, attempting fallback:', err);
        if (currentAudio === audio) {
          currentAudio = null;
        }
        fallbackBrowserSpeech(formattedText, targetLang, rate, pitch, onStart, onEnd, onError);
      });
    }

    return true;
  } catch (err) {
    console.warn('Audio element error:', err);
    return fallbackBrowserSpeech(formattedText, targetLang, rate, pitch, onStart, onEnd, onError);
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
