import React, { useState, useEffect } from 'react';
import { Lesson, StudentProfile } from '../types';
import { KiddoMascot } from './KiddoMascot';
import confetti from 'canvas-confetti';
import { 
  speakVietnamese, 
  stopSpeaking, 
  formatMathForVietnameseSpeech,
  buildQuestionAudioText
} from '../utils/vietnameseSpeech';
import { 
  ArrowLeft, 
  Calculator, 
  Lightbulb, 
  Brain, 
  Volume2, 
  VolumeX, 
  Zap, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  PartyPopper,
  HelpCircle,
  Check,
  Headphones
} from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
  profile: StudentProfile;
  onBack: () => void;
  onCompleteLesson: (earnedXp: number) => void;
  onOpenFastTest: () => void;
  onUpdateMastery: (newMastery: number) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  profile,
  onBack,
  onCompleteLesson,
  onOpenFastTest,
  onUpdateMastery,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    lesson.currentQuestionIndex || 0
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState<boolean>(false);
  const [aiSpeechMessage, setAiSpeechMessage] = useState<string>(
    '"Cố lên, Minh làm được mà! Hãy nhớ mượn 1 chục khi số bị trừ nhỏ hơn số trừ nhé! ✨"'
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);

  const currentQuestion = lesson.questions[currentQuestionIndex] || lesson.questions[0];
  const totalQuestions = lesson.questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Reset states when moving to next question
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setShowStepByStep(false);
    setAiSpeechMessage(
      `"Cố lên, ${profile.name} làm được mà! Hãy quan sát kỹ câu hỏi số ${currentQuestionIndex + 1} nhé! ✨"`
    );

    return () => {
      stopSpeaking();
    };
  }, [currentQuestionIndex, profile.name]);

  // Handle Option Click
  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted && isCorrect) return; // already solved

    setSelectedOptionId(optionId);
    const correct = optionId === currentQuestion.correctOptionId;
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      setConsecutiveCorrect((prev) => prev + 1);
      const congrat = `Tuyệt vời! ${profile.name} đã chọn đáp án hoàn toàn chính xác! Con tính rất nhanh và chuẩn xác! 🌟`;
      setAiSpeechMessage(congrat);
      // Trigger festive confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#68D5B5', '#5BA7FF', '#FFD65A', '#A99CFB'],
        });
      } catch (e) {
        // ignore if not supported
      }
      onUpdateMastery(Math.min(100, profile.mathMastery + 6));
    } else {
      setConsecutiveCorrect(0);
      setAiSpeechMessage(
        'Chưa chính xác rồi! Đừng lo nhé con, hãy thử xem gợi ý hoặc kiểm tra lại từng bước xem sao nhé! 💪'
      );
    }
  };

  // Handle Next Question
  const handleNextQuestion = () => {
    stopSpeaking();
    setIsSpeaking(false);
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Lesson finished!
      onCompleteLesson(30);
    }
  };

  // Handle Retry
  const handleRetry = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAiSpeechMessage(
      'Con đã sẵn sàng làm lại rồi! Hãy đọc kỹ từng bước và chọn lại nhé! 🚀'
    );
  };

  // Read question text aloud with authentic Vietnamese voice and math verbalization
  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = buildQuestionAudioText({
      prompt: currentQuestion.prompt,
      formula: currentQuestion.formula,
      subPrompt: currentQuestion.subPrompt,
      options: currentQuestion.options,
    });

    const success = speakVietnamese({
      text: textToRead,
      lang: 'vi-VN',
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    if (!success) {
      setAiSpeechMessage(`🔊 Đang đọc: "${textToRead}"`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-16">
      {/* 1. TOP HEADER (Tinh gọn) */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-[0_8px_30px_rgba(36,50,74,0.04)] border border-slate-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              stopSpeaking();
              onBack();
            }}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-[#24324A] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D3E4FF] text-[#0060AA] flex items-center justify-center font-bold shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[12px] text-[#0060AA] uppercase tracking-wider">
                {lesson.subjectName}
              </span>
              <span className="font-black text-lg sm:text-xl text-[#24324A] leading-tight">
                {lesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Progress & XP Pill */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex flex-col gap-1 w-36">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Tiến độ</span>
              <span className="font-black text-[#24324A]">
                {currentQuestionIndex + 1} / {totalQuestions} bài
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#0060AA] to-[#68D5B5] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FEF9E7] px-4 py-2 rounded-full border border-amber-200 shadow-xs">
            <span className="text-lg">⭐</span>
            <span className="font-black text-sm text-amber-700">
              {profile.xp.toLocaleString('vi-VN')} XP
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: QUESTION & AI TUTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT/CENTER: QUESTION & 4 ANSWER CARDS (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Main Question Card */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-[0_12px_32px_rgba(36,50,74,0.06)] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[260px]">
            {/* Question Index Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#D3E4FF] text-[#003A6B] px-3.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-xs">
              Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
            </div>

            {/* Hint Trigger Button */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{showHint ? 'Ẩn cách làm' : 'Xem cách làm'}</span>
            </button>

            {/* Question Prompt & Math Formula */}
            <div className="my-6 flex flex-col items-center max-w-lg">
              <span className="text-sm font-bold text-slate-400 mb-2">
                {currentQuestion.prompt}
              </span>
              {currentQuestion.subPrompt && (
                <p className="text-base font-bold text-[#24324A] mb-3">
                  {currentQuestion.subPrompt}
                </p>
              )}
              <h2 className="text-4xl sm:text-6xl font-black text-[#24324A] tracking-tight select-all">
                {currentQuestion.formula || currentQuestion.prompt}
              </h2>

              {/* Prominent Voice Audio Button for Vietnamese Kids */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleSpeakQuestion}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-400 text-amber-950 scale-105 ring-4 ring-amber-100'
                      : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
                  }`}
                  title="Nghe giọng đọc Tiếng Việt chuẩn"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 animate-bounce" />
                      <span>Đang đọc... (Bấm để dừng)</span>
                      <span className="flex gap-0.5 items-end h-3.5">
                        <span className="w-1 bg-amber-950 h-full animate-pulse" />
                        <span className="w-1 bg-amber-950 h-2 animate-pulse" />
                        <span className="w-1 bg-amber-950 h-3 animate-pulse" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#2563EB]" />
                      <span>🔊 Đọc to câu hỏi bằng Tiếng Việt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Hint Box */}
            {showHint && (
              <div className="w-full bg-[#F0F7FF] p-4 rounded-2xl text-left border-l-4 border-[#0060AA] mt-2 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-[#0060AA] font-black text-sm mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Mẹo từ thầy AI Kiddo:</span>
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  {currentQuestion.hint}
                </p>
              </div>
            )}
          </div>

          {/* 4 Large Answer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isOptionCorrect = opt.id === currentQuestion.correctOptionId;

              // Compute button styling based on state
              let cardStyle = 'bg-white hover:bg-slate-50 border-slate-200/80 text-[#24324A]';
              let badgeStyle = 'bg-slate-100 text-slate-600 group-hover:bg-[#0060AA] group-hover:text-white';
              let iconStyle = 'text-slate-200 group-hover:text-[#0060AA]';

              if (isSubmitted && isSelected) {
                if (isOptionCorrect) {
                  // Correct state -> Mint Green
                  cardStyle = 'bg-[#E6F9F3] border-[#68D5B5] ring-2 ring-[#68D5B5] text-[#004637]';
                  badgeStyle = 'bg-[#00A37A] text-white';
                  iconStyle = 'text-[#00A37A]';
                } else {
                  // Incorrect state -> Soft Coral
                  cardStyle = 'bg-[#FFF4F2] border-[#FF8A7A] ring-2 ring-[#FF8A7A] text-[#93000A]';
                  badgeStyle = 'bg-[#FF8A7A] text-white';
                  iconStyle = 'text-[#FF8A7A]';
                }
              } else if (isSubmitted && isOptionCorrect) {
                // Highlight correct answer if user got it wrong
                cardStyle = 'bg-[#E6F9F3] border-[#68D5B5] text-[#004637]';
                badgeStyle = 'bg-[#00A37A] text-white';
                iconStyle = 'text-[#00A37A]';
              }

              return (
                <button
                  key={opt.id}
                  disabled={isSubmitted && isCorrect === true}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`group flex items-center justify-between p-4 sm:p-5 rounded-3xl shadow-[0_8px_20px_rgba(36,50,74,0.03)] border-2 transition-all text-left cursor-pointer active:scale-[0.99] ${cardStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-colors shadow-xs ${badgeStyle}`}
                    >
                      {opt.id}
                    </div>
                    <span className="font-black text-2xl sm:text-3xl text-inherit">
                      {opt.text}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center">
                    <CheckCircle className={`w-6 h-6 ${iconStyle}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. SUCCESS FEEDBACK BANNER (Mint Green state) */}
          {isSubmitted && isCorrect && (
            <div className="bg-[#E6F9F3] border-2 border-[#68D5B5] p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_12px_32px_rgba(0,107,85,0.08)] animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00A37A] text-white flex items-center justify-center shadow-md shrink-0">
                  <PartyPopper className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg sm:text-xl text-[#004637] flex items-center gap-1.5">
                    Chính xác! +10 XP 🎉
                  </span>
                  <span className="font-bold text-sm text-[#006B55]">
                    Minh siêu quá, phép trừ có nhớ không làm khó được bạn!
                  </span>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto bg-[#00A37A] hover:bg-[#008F6B] text-white px-7 py-3.5 rounded-full font-black text-base btn-tactile-mint transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>
                  {currentQuestionIndex + 1 < totalQuestions
                    ? 'Câu tiếp theo'
                    : 'Hoàn thành bài học'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 4. INCORRECT FEEDBACK BANNER (Soft Coral state) */}
          {isSubmitted && !isCorrect && (
            <div className="bg-[#FFF4F2] border-2 border-[#FF8A7A] p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_24px_rgba(255,138,122,0.1)] animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8A7A] text-white flex items-center justify-center shadow-sm shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg text-[#93000A]">
                    Chưa đúng, thử lại nhé 💪
                  </span>
                  <span className="font-bold text-sm text-slate-600">
                    Đừng nản nhé, xem gợi ý để tìm ra kết quả đúng nào!
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowHint(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full font-extrabold text-sm transition-all cursor-pointer"
                >
                  Xem gợi ý
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#FF785A] hover:bg-[#E86350] text-white rounded-full font-black text-sm btn-tactile-coral transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* Step-by-Step Explanation Box (when opened by AI tutor) */}
          {showStepByStep && (
            <div className="bg-white border border-purple-200 p-5 rounded-3xl shadow-sm flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2 text-[#6D28D9] font-black text-base">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Giải thích từng bước chi tiết:</span>
                </div>
                <button
                  onClick={() => setShowStepByStep(false)}
                  className="text-xs font-extrabold text-slate-400 hover:text-slate-600"
                >
                  Đóng lại
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {currentQuestion.stepByStep.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-purple-50/60 text-sm font-bold text-purple-950"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Shortcut: "Con biết bài này rồi – Kiểm tra nhanh" */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onOpenFastTest}
              className="w-full sm:w-auto bg-[#E8EEFF] hover:bg-[#D6E3FF] text-[#0060AA] px-6 py-3.5 rounded-full font-black text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-[#0060AA]" />
              <span>⚡ Con biết bài này rồi – Kiểm tra nhanh</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: AI KIDDO ASSISTANT & STATS (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(36,50,74,0.05)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            {/* Soft background aura */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

            {/* Mascot Avatar */}
            <div className="mb-4">
              <KiddoMascot
                mood={
                  isSubmitted && isCorrect
                    ? 'happy'
                    : isSubmitted && !isCorrect
                    ? 'oops'
                    : showStepByStep
                    ? 'thinking'
                    : 'encouraging'
                }
                size="lg"
                withCap={true}
              />
            </div>

            {/* Kiddo AI Speech Bubble */}
            <div className="bg-[#F4F2FF] p-4 rounded-2xl w-full relative mb-5 border border-purple-100 shadow-xs">
              {/* Triangle Tail */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F4F2FF] rotate-45 border-t border-l border-purple-100" />
              <h3 className="font-black text-lg text-[#3C2E87] mb-1">Kiddo AI</h3>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {aiSpeechMessage}
              </p>
            </div>

            {/* 3 AI Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {/* 💡 Gợi ý nhanh */}
              <button
                onClick={() => {
                  setShowHint(true);
                  setAiSpeechMessage(
                    `"Thầy gợi ý cho Minh nè: ${currentQuestion.hint} 💡"`
                  );
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#E5DEFF] hover:bg-[#D6CBFF] text-[#3C2E87] py-3 px-4 rounded-full font-black text-sm transition-all cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>💡 Gợi ý nhanh</span>
              </button>

              {/* 🧠 Giải thích từng bước */}
              <button
                onClick={() => {
                  setShowStepByStep(!showStepByStep);
                  setAiSpeechMessage(
                    '"Đây là các bước làm chi tiết, con hãy đọc từng bước một nhé! 🧠"'
                  );
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#E8EEFF] hover:bg-[#D6E3FF] text-[#003A6B] py-3 px-4 rounded-full font-black text-sm transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4 text-purple-600" />
                <span>🧠 Giải thích từng bước</span>
              </button>

              {/* 🔊 Đọc đề */}
              <button
                onClick={handleSpeakQuestion}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full font-black text-sm transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-purple-50 hover:bg-purple-100 text-[#5E51AA]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Dừng đọc</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>🔊 Đọc đề</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mini Real-Time Stats */}
          <div className="bg-white/80 p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="text-slate-500 font-bold">Chuỗi liên tiếp:</span>
              <span className="font-black text-[#24324A]">{profile.streakDays} ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-slate-500 font-bold">Độ chính xác:</span>
              <span className="font-black text-[#24324A]">{profile.accuracyRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
