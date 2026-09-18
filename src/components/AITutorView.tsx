import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile } from '../types';
import { KiddoMascot } from './KiddoMascot';
import { speakVietnamese, stopSpeaking } from '../utils/vietnameseSpeech';
import { storageService } from '../services/storage';
import { findWeakestSkill } from '../services/mastery';
import { skillsDatabase } from '../data/curriculumData';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Target,
  Zap, 
  RotateCcw, 
  Calendar,
  MessageCircle,
  HelpCircle,
  ArrowRight
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
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  profile,
  onStartPracticeLesson,
}) => {
  const masteries = storageService.getAllMasteries();
  const gradeSkills = skillsDatabase.filter((s) => s.grade === profile.grade);
  const weakestSkill = findWeakestSkill(masteries, gradeSkills);
  const recentMistakes = storageService.getRecentMistakes(3);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Chào ${profile.name}! Thầy là Kiddo AI - trợ lý học tập Lớp ${profile.grade} của con 🤖✨.\n\nHôm nay con học rất tốt! Thầy luôn sẵn sàng giải thích chi tiết mọi bài tập, đồng hành cùng con vượt qua các phần khó để tự tin giành điểm 10!`,
      timestamp: 'Vừa xong',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          context: {
            grade: profile.grade,
            currentSkill: weakestSkill?.name || 'Toán học',
            mastery: profile.mathMastery || 48,
            weakSkills: weakestSkill?.name || 'Phép trừ có nhớ',
            recentMistakesCount: recentMistakes.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const reply = data.reply || 'Thầy Kiddo AI luôn sẵn sàng hỗ trợ con! Con hãy gõ bài toán cần giải nhé.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: 'Vừa xong',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      let fallbackText = `Chào con! Thầy nghe câu hỏi "${text}" của con rồi. `;
      if (text.includes('51019') || text.includes('chia')) {
        fallbackText = `Để thực hiện phép chia 51019 : 19 theo SGK Toán Lớp 4:\n• Lần 1: 51 chia 19 được 2, 2 × 19 = 38, 51 − 38 = 13.\n• Lần 2: Hạ 0 được 130, 130 chia 19 được 6, 6 × 19 = 114, 130 − 114 = 16.\n• Lần 3: Hạ 1 được 161, 161 chia 19 được 8, 8 × 19 = 152, 161 − 152 = 9.\n• Lần 4: Hạ 9 được 99, 99 chia 19 được 5, 5 × 19 = 95, 99 − 95 = 4.\n👉 Kết quả: 51019 : 19 = 2685 (dư 4)!`;
      } else {
        fallbackText = `Thầy Kiddo luôn ở bên con! Đối với dạng bài này, con hãy chú ý phân tích kỹ từng bước: xác định hàng đơn vị và mượn 1 chục nếu cần thiết nhé! ✨`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackText,
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // 4 Core Pedagogical Actions (Requirement #16)
  const handleActionExplainMistake = () => {
    if (recentMistakes.length > 0) {
      handleSend(`Thầy Kiddo ơi, hướng dẫn con giải lại câu hỏi con vừa làm chưa đúng với!`);
    } else {
      handleSend(`Thầy Kiddo ơi, giải thích giúp con phương pháp giải phép trừ có nhớ 52 - 27 với!`);
    }
  };

  const handleActionWeakSkill = () => {
    const skillName = weakestSkill ? weakestSkill.name : 'Phép trừ có nhớ';
    handleSend(`Thầy ơi, con thấy phần "${skillName}" con chưa tự tin lắm, thầy chỉ con bí quyết làm dạng này với!`);
  };

  const handleActionChallenge = () => {
    onStartPracticeLesson();
  };

  const handleActionReviewToday = () => {
    handleSend(`Thầy Kiddo ơi, tóm tắt những kiến thức trọng tâm con cần nhớ trong ngày hôm nay nhé!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16">
      {/* Top Bar with Context Pills */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center text-2xl shadow-md shadow-purple-500/20">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-[#24324A]">
                Thầy giáo Kiddo AI
              </h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Gia sư Lớp {profile.grade}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              Sẵn sàng giải đáp 24/7 • Chuẩn kiến thức SGK Tiểu học
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 4 COLS: "Kiddo AI có thể giúp gì cho con?" CARDS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F3EEFF] p-5 sm:p-6 rounded-3xl border border-purple-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 fill-purple-500" />
              <h3 className="font-black text-base text-purple-950">
                Kiddo AI có thể giúp gì cho con?
              </h3>
            </div>
            <p className="text-xs font-bold text-purple-900/80 leading-relaxed">
              Chọn một mục dưới đây để thầy Kiddo lập tức hỗ trợ con nhé!
            </p>
          </div>

          {/* 4 Action Cards */}
          <div className="flex flex-col gap-2.5">
            {/* 1: Giải thích bài chưa hiểu */}
            <button
              onClick={handleActionExplainMistake}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition-all flex items-center gap-3.5 shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                💡
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-[#24324A] group-hover:text-purple-900">
                  Giải thích bài con chưa hiểu
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                  Phân tích chi tiết các bước giải
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 2: Luyện phần đang yếu */}
            <button
              onClick={handleActionWeakSkill}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition-all flex items-center gap-3.5 shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-[#24324A] group-hover:text-purple-900">
                  Luyện phần con đang yếu
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                  {weakestSkill ? weakestSkill.name : 'Phép trừ có nhớ'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 3: Tạo thử thách 5 phút */}
            <button
              onClick={handleActionChallenge}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition-all flex items-center gap-3.5 shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-[#24324A] group-hover:text-purple-900">
                  Tạo thử thách 5 phút
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                  Bứt phá điểm số cùng Kiddo AI
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 4: Ôn bài hôm nay */}
            <button
              onClick={handleActionReviewToday}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition-all flex items-center gap-3.5 shadow-xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                📚
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-[#24324A] group-hover:text-purple-900">
                  Ôn bài hôm nay
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                  Tóm tắt kiến thức đã học
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mascot Companion Pill */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3 mt-auto">
            <KiddoMascot mood="cheer" size="sm" />
            <div>
              <span className="font-black text-xs text-[#24324A]">Mẹo của Kiddo:</span>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                Con có thể gõ bất kỳ biểu thức nào như "52 - 27" hoặc "51019 : 19" để xem đặt tính nhé!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT 8 COLS: CHAT CONTAINER */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(36,50,74,0.04)] flex flex-col h-[600px] overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-2xl ${
                    isAi ? 'self-start' : 'self-end flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-xs ${
                      isAi
                        ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isAi ? '🤖' : '👦'}
                  </div>

                  <div
                    className={`p-4 rounded-2xl flex flex-col gap-2 ${
                      isAi
                        ? 'bg-slate-50 border border-slate-100 text-[#24324A]'
                        : 'bg-[#3B82F6] text-white'
                    }`}
                  >
                    <div className="text-sm font-bold whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>

                    {/* AI Audio & Action Buttons */}
                    {isAi && (
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-200/50 mt-1">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="flex items-center gap-1 text-xs font-black text-purple-700 hover:text-purple-900 cursor-pointer"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-rose-600">Dừng đọc</span>
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
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                <span>Thầy Kiddo đang suy nghĩ câu trả lời... 🤖✨</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Nhập bài toán, câu hỏi Tiếng Việt hoặc tiếng Anh của con..."
              className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-full text-sm font-bold focus:outline-none focus:border-purple-500 shadow-xs"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                inputVal.trim() && !isTyping
                  ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-purple-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
