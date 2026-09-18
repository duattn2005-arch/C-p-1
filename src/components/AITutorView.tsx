import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile } from '../types';
import { KiddoMascot } from './KiddoMascot';
import { DivisionVisualizer } from './DivisionVisualizer';
import { speakVietnamese, stopSpeaking } from '../utils/vietnameseSpeech';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Smile,
  Zap,
  RotateCcw,
  Calculator
} from 'lucide-react';

interface AITutorViewProps {
  profile: StudentProfile;
  onStartPracticeLesson: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  hasDivisionTool?: boolean;
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  profile,
  onStartPracticeLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'division'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Xin chào ${profile.name}! Thầy là Kiddo AI 🤖. Hôm nay con có bài tập nào khó hay muốn thầy hướng dẫn cách giải bài nào không? Con có thể hỏi thầy bất kỳ phép tính nào (ví dụ phép chia đặt tính 51019 : 19 hay phép trừ có nhớ) nhé!`,
      timestamp: 'Vừa xong',
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Thầy đã chuẩn bị sẵn sơ đồ "Đặt tính rồi tính" phép chia 51019 : 19 chuẩn theo SGK Toán Lớp 4. Con có thể bấm vào tab "Đặt tính phép chia" ở trên hoặc hỏi thầy trực tiếp tại đây nhé!',
      timestamp: 'Vừa xong',
      hasDivisionTool: true,
      suggestedAction: {
        label: '➗ Mở ngay bảng Đặt tính phép chia 51019 : 19',
        action: () => setActiveTab('division'),
      },
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPromptChips = [
    '➗ Giải thích phép chia 51019 : 19',
    '👋 Xin chào thầy Kiddo!',
    '💡 Tại sao 52 − 27 phải mượn 1?',
    '🔢 Mẹo nhớ bảng nhân 7',
    '📖 Danh từ khác động từ như thế nào?',
  ];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    // Clean markdown tags for natural speech
    const cleanText = text.replace(/[*#•`_]/g, '');
    speakVietnamese({
      text: cleanText,
      lang: 'vi-VN',
      rate: 0.88,
      onStart: () => setSpeakingMessageId(msgId),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      // Call full-stack AI server endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const reply = data.reply || 'Thầy Kiddo AI luôn sẵn sàng hỗ trợ con! Con hãy gõ bài toán cần giải nhé.';

      const isDivisionQuery = text.includes('51019') || text.includes('chia');

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: 'Vừa xong',
        hasDivisionTool: isDivisionQuery,
        suggestedAction: isDivisionQuery
          ? {
              label: '📊 Mở bảng trực quan Đặt tính rồi tính',
              action: () => setActiveTab('division'),
            }
          : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Fallback in case of local network issue
      let fallbackText = `Chào con! Thầy nghe câu hỏi "${text}" của con rồi. `;
      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('chào')) {
        fallbackText = `Chào con! Thầy là Kiddo AI đây 🤖✨. Hôm nay con muốn cùng thầy học Toán, Tiếng Việt hay Tiếng Anh nào? Con có thể hỏi thầy bài tập bất kỳ nhé!`;
      } else if (text.includes('51019') || text.includes('chia')) {
        fallbackText = `Để thực hiện phép chia 51019 : 19 theo SGK Toán Lớp 4:\n• Lần 1: 51 chia 19 được 2, 2 × 19 = 38, 51 − 38 = 13.\n• Lần 2: Hạ 0 được 130, 130 chia 19 được 6, 6 × 19 = 114, 130 − 114 = 16.\n• Lần 3: Hạ 1 được 161, 161 chia 19 được 8, 8 × 19 = 152, 161 − 152 = 9.\n• Lần 4: Hạ 9 được 99, 99 chia 19 được 5, 5 × 19 = 95, 99 − 95 = 4.\n👉 Kết quả: 51019 : 19 = 2685 (dư 4)!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText,
          timestamp: 'Vừa xong',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 pb-12">
      {/* Tab Switcher: Chat AI vs Đặt tính phép chia */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trò chuyện cùng Kiddo AI</span>
          </button>

          <button
            onClick={() => setActiveTab('division')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'division'
                ? 'bg-[#0060AA] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">➗</span>
            <span>Đặt tính phép chia (51019 : 19)</span>
          </button>
        </div>

        <button
          onClick={onStartPracticeLesson}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current text-purple-600" />
          <span>Vào bài luyện tập 5 phút</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE DIVISION TOOL */}
      {activeTab === 'division' && (
        <div className="animate-fadeIn">
          <DivisionVisualizer
            initialDividend={51019}
            initialDivisor={19}
            onAskAi={(q) => {
              setActiveTab('chat');
              handleSend(q);
            }}
          />
        </div>
      )}

      {/* TAB 2: CHAT WITH KIDDO AI */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[calc(100vh-210px)] min-h-[580px] bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(36,50,74,0.04)] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 to-blue-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center text-xl shadow-md">
                🤖
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg text-[#24324A]">
                    Kiddo AI Tutor
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Sẵn sàng giải đáp
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Hỏi đáp thông minh, phương pháp sư phạm chuẩn Tiểu học Lớp 1–5
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('division')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0060AA] rounded-full font-black text-xs transition-colors cursor-pointer"
            >
              <span>Xem phép chia 51019 : 19</span>
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 bg-[#FAF8FF]/40">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] ${
                    isAi ? 'self-start' : 'self-end flex-row-reverse'
                  }`}
                >
                  {isAi ? (
                    <div className="shrink-0 mt-1">
                      <KiddoMascot mood="encouraging" size="sm" withCap={true} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-1">
                      {profile.name[0]}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 max-w-full">
                    <div
                      className={`p-4 sm:p-5 rounded-3xl text-sm font-bold leading-relaxed whitespace-pre-line shadow-xs ${
                        isAi
                          ? 'bg-white text-[#24324A] border border-purple-100 rounded-tl-sm'
                          : 'bg-[#0060AA] text-white rounded-tr-sm'
                      }`}
                    >
                      {msg.text}

                      {/* Suggested action button inside chat message */}
                      {msg.suggestedAction && (
                        <div className="mt-3 pt-3 border-t border-purple-100/70">
                          <button
                            onClick={msg.suggestedAction.action}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
                          >
                            {msg.suggestedAction.label}
                          </button>
                        </div>
                      )}

                      {/* Read out loud button for AI */}
                      {isAi && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleSpeak(msg.id, msg.text)}
                            className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                              speakingMessageId === msg.id
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'text-slate-400 hover:text-[#0060AA] hover:bg-slate-100'
                            }`}
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Đọc lời thầy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold text-slate-400 px-2 ${
                        isAi ? 'text-left' : 'text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3 self-start animate-fadeIn">
                <KiddoMascot mood="thinking" size="sm" withCap={true} />
                <div className="bg-white border border-purple-100 p-3.5 rounded-2xl rounded-tl-sm shadow-xs flex items-center gap-2 text-purple-600 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                  <span className="ml-1 text-slate-500">
                    Kiddo AI đang suy nghĩ và chuẩn bị giải thích cho con...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Suggestions */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-extrabold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
              Gợi ý hỏi:
            </span>
            {quickPromptChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-black whitespace-nowrap border border-purple-200/60 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi (ví dụ: giải thích phép chia 51019 : 19, chào thầy, cách làm toán...)"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full font-bold text-sm text-[#24324A] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
              className="w-11 h-11 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:hover:bg-[#7C3AED] text-white flex items-center justify-center shrink-0 btn-tactile-purple cursor-pointer transition-all shadow-xs"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
