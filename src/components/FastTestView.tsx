import React, { useState, useEffect } from 'react';
import { Question, StudentProfile } from '../types';
import { fastTestQuestions } from '../data/mockData';
import { KiddoMascot } from './KiddoMascot';
import confetti from 'canvas-confetti';
import { 
  speakVietnamese, 
  stopSpeaking, 
  buildQuestionAudioText 
} from '../utils/vietnameseSpeech';
import { 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX
} from 'lucide-react';

interface FastTestViewProps {
  profile: StudentProfile;
  onClose: () => void;
  onPassFastTest: (earnedXp: number, newMastery: number) => void;
  onFailFastTest: () => void;
}

export const FastTestView: React.FC<FastTestViewProps> = ({
  profile,
  onClose,
  onPassFastTest,
  onFailFastTest,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const total = fastTestQuestions.length;
  const currentQ: Question = fastTestQuestions[currentIdx];

  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = buildQuestionAudioText({
      prompt: currentQ.prompt,
      formula: currentQ.formula,
      subPrompt: currentQ.subPrompt,
      options: currentQ.options,
    });

    speakVietnamese({
      text: textToRead,
      lang: 'vi-VN',
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Calculate score
  const correctCount = Object.entries(answers).reduce((acc, [idx, chosen]) => {
    const q = fastTestQuestions[Number(idx)];
    return chosen === q.correctOptionId ? acc + 1 : acc;
  }, 0);

  const isPassed = correctCount >= 2;

  const handleSelect = (optionId: string) => {
    stopSpeaking();
    setIsSpeaking(false);
    const newAnswers = { ...answers, [currentIdx]: optionId };
    setAnswers(newAnswers);

    if (currentIdx + 1 < total) {
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1);
      }, 300);
    } else {
      // Finished all 3
      setIsFinished(true);
      const finalCorrect = Object.entries(newAnswers).reduce((acc, [idx, chosen]) => {
        const q = fastTestQuestions[Number(idx)];
        return chosen === q.correctOptionId ? acc + 1 : acc;
      }, 0);

      if (finalCorrect >= 2) {
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#FFD65A', '#68D5B5', '#5BA7FF', '#A99CFB'],
          });
        } catch (e) {}
      }
    }
  };

  const handleFinishAction = () => {
    if (isPassed) {
      onPassFastTest(50, 92);
    } else {
      onFailFastTest();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      {/* Top Breadcrumb & Exit */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#24324A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0060AA] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-[#0060AA]" />
              <span>Thử thách vượt cấp</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#24324A]">
              Kiểm tra nhanh: Đánh giá Mastery
            </h2>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {fastTestQuestions.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentIdx
                  ? 'bg-[#3B82F6] scale-125 ring-4 ring-blue-100'
                  : answers[i]
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-[0_12px_32px_rgba(36,50,74,0.06)] flex flex-col items-center">
        {!isFinished ? (
          <>
            {/* Header info */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3.5 py-1 rounded-full font-black text-xs mb-2">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Câu {currentIdx + 1} / {total}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Nếu con làm tốt, hệ thống sẽ cho con bỏ qua phần dễ và nhận +50 XP!
              </p>
            </div>

            {/* Question Formula Card */}
            <div className="w-full bg-[#F7FBFF] rounded-2xl p-6 sm:p-8 border border-blue-100/70 text-center mb-8 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                {currentQ.prompt}
              </span>
              <h3 className="text-5xl sm:text-6xl font-black text-[#24324A] tracking-tight">
                {currentQ.formula}
              </h3>

              {/* Sound Audio Button */}
              <button
                onClick={handleSpeakQuestion}
                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-400 text-amber-950 scale-105 ring-4 ring-amber-100'
                    : 'bg-white text-[#1D4ED8] hover:bg-[#EFF6FF] border border-blue-200'
                }`}
                title="Nghe đọc câu hỏi bằng Tiếng Việt"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 animate-bounce" />
                    <span>Đang đọc... (Bấm để dừng)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#2563EB]" />
                    <span>🔊 Đọc to câu hỏi bằng Tiếng Việt</span>
                  </>
                )}
              </button>
            </div>

            {/* 4 Choices */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt) => {
                const isChosen = answers[currentIdx] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between font-black text-2xl transition-all cursor-pointer ${
                      isChosen
                        ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB]'
                        : 'border-slate-100 hover:border-slate-300 bg-white text-[#24324A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg text-slate-600">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* RESULT SCREEN */
          <div className="flex flex-col items-center text-center py-4 animate-fadeIn max-w-lg w-full">
            {isPassed ? (
              <>
                <KiddoMascot mood="happy" size="xl" withCap={true} />
                <div className="w-16 h-16 rounded-3xl bg-[#E6F9F3] text-[#00A37A] flex items-center justify-center mt-4 mb-2 shadow-xs">
                  <Trophy className="w-9 h-9" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#004637] mb-2">
                  Tuyệt vời! Con đã nắm vững kiến thức này. 🏆
                </h3>
                <p className="text-sm font-bold text-slate-600 mb-6">
                  Con đã trả lời đúng{' '}
                  <strong className="text-[#00A37A] font-black">
                    {correctCount}/{total} câu hỏi
                  </strong>
                  . Hệ thống ghi nhận độ thành thạo đạt{' '}
                  <strong className="text-purple-600 font-black">92%</strong> và cho phép bỏ qua phần cơ bản!
                </p>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 mb-6 w-full justify-center">
                  <span className="text-2xl">⭐</span>
                  <span className="font-black text-amber-800 text-sm">
                    Phần thưởng vượt cấp: +50 XP & Huy hiệu Bứt Phá!
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-full text-sm transition-all cursor-pointer"
                  >
                    Về trang chủ
                  </button>
                  <button
                    onClick={handleFinishAction}
                    className="flex-1 py-3.5 bg-[#00A37A] hover:bg-[#008F6B] text-white font-black rounded-full text-sm btn-tactile-mint transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Chuyển sang bài tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <KiddoMascot mood="oops" size="xl" withCap={true} />
                <h3 className="text-2xl sm:text-3xl font-black text-[#93000A] mt-4 mb-2">
                  Con cần luyện thêm một chút nhé. 💪
                </h3>
                <p className="text-sm font-bold text-slate-600 mb-6">
                  Con đã làm đúng {correctCount}/{total} câu. Đừng buồn nhé, Kiddo AI sẽ đồng hành và giúp con thuần thục từng bước của phép trừ có nhớ ngay bây giờ!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => {
                      setCurrentIdx(0);
                      setAnswers({});
                      setIsFinished(false);
                    }}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-full text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại bài test</span>
                  </button>
                  <button
                    onClick={handleFinishAction}
                    className="flex-1 py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black rounded-full text-sm btn-tactile-blue transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Bắt đầu học bài</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
