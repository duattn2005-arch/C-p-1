import React, { useState, useEffect, useRef } from 'react';
import { Lesson, StudentProfile } from '../types';
import { KiddoMascot } from './KiddoMascot';
import confetti from 'canvas-confetti';
import { 
  speakVietnamese, 
  stopSpeaking, 
  formatMathForVietnameseSpeech,
  buildQuestionAudioText
} from '../utils/vietnameseSpeech';
import { QuestionVisualView, OptionBody } from './QuestionVisual';
import { storageService } from '../services/storage';
import { updateSkillMasteryAfterAnswer } from '../services/mastery';
import { describeAttempt } from '../services/attemptLog';
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
  Headphones,
  Trophy
} from 'lucide-react';

// First clue, worded for the subject (the old text talked about the units column for every question)
const FIRST_HINT: Record<string, string> = {
  math: 'Đọc kĩ đề bài, xem đề hỏi gì và có những số nào, hình nào nhé con!',
  vietnamese: 'Đọc thật kĩ câu hỏi và từng đáp án, rồi loại bớt những đáp án sai nhé con!',
  english: 'Nhìn kĩ hình, đọc từng đáp án và đoán nghĩa của từ nhé con!',
};

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
  const [hintStage, setHintStage] = useState<number>(0); // 0: none, 1: small clue, 2: detailed hint, 3: full solution
  const [aiSpeechMessage, setAiSpeechMessage] = useState<string>(
    `"Cố lên, ${profile.name} làm được mà! Hãy quan sát kỹ câu hỏi nhé! ✨"`
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const currentQuestion = lesson.questions[currentQuestionIndex] || lesson.questions[0];
  // A practice lesson mixes skills, so every question carries the skill it trains
  const skillId = currentQuestion.skillId ?? lesson.id;
  const shownAt = useRef<number>(Date.now());
  const [currentMasteryScore, setCurrentMasteryScore] = useState<number>(() => storageService.getSkillMastery(skillId).mastery_score);
  const totalQuestions = lesson.questions.length;
  const firstHint = FIRST_HINT[lesson.subjectId] ?? FIRST_HINT.math;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Reset states when moving to next question
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setHintStage(0);
    shownAt.current = Date.now();
    setCurrentMasteryScore(storageService.getSkillMastery(skillId).mastery_score);
    setAiSpeechMessage(
      `"Cố lên, ${profile.name} làm được mà! Hãy quan sát kỹ câu hỏi số ${currentQuestionIndex + 1} nhé! ✨"`
    );

    return () => {
      stopSpeaking();
    };
  }, [currentQuestionIndex, profile.name, skillId]);

  // Handle Option Click
  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted && isCorrect) return; // already solved

    setSelectedOptionId(optionId);
    const correct = optionId === currentQuestion.correctOptionId;
    setIsSubmitted(true);
    setIsCorrect(correct);

    // Dynamic Mastery Calculation
    const prevMastery = storageService.getSkillMastery(skillId);
    const nextStreak = correct ? consecutiveCorrect + 1 : -1;
    const diffMap: Record<string, 1 | 2 | 3 | 4 | 5> = { easy: 2, medium: 3, hard: 4 };
    const diffLevel = diffMap[currentQuestion.difficulty] || 3;

    const updated = updateSkillMasteryAfterAnswer(prevMastery, correct, diffLevel, nextStreak);
    storageService.saveSkillMastery(updated);
    setCurrentMasteryScore(updated.mastery_score);

    // Record student attempt history
    storageService.recordAttempt(
      describeAttempt(currentQuestion, optionId, {
        fallbackSkillId: lesson.id,
        startedAt: shownAt.current,
        hintStage,
        source: lesson.isPractice ? 'practice' : 'lesson',
      })
    );

    if (correct) {
      setConsecutiveCorrect((prev) => prev + 1);
      const congrat = `Tuyệt vời! ${profile.name} đã chọn đáp án hoàn toàn chính xác! Con tính rất nhanh và chuẩn xác! 🌟`;
      setAiSpeechMessage(congrat);
      
      // Reward XP with anti-exploit
      storageService.addXP(10, `Trả lời đúng câu ${currentQuestionIndex + 1}`, currentQuestion.id);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#68D5B5', '#5BA7FF', '#FFD65A', '#A99CFB'],
        });
      } catch (e) {}

      onUpdateMastery(updated.mastery_score);
    } else {
      setConsecutiveCorrect(0);
      setAiSpeechMessage(
        'Chưa chính xác rồi! Đừng lo nhé con, hãy bấm xem gợi ý nhỏ để tìm ra kết quả đúng nhé! 💪'
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
      // Lesson completed
      storageService.addXP(30, `Hoàn thành bài học: ${lesson.title}`, lesson.id);
      onCompleteLesson(30);
    }
  };

  // Handle Retry
  const handleRetry = () => {
    shownAt.current = Date.now();
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAiSpeechMessage(
      'Con đã sẵn sàng làm lại rồi! Hãy đọc kỹ từng bước và chọn lại nhé! 🚀'
    );
  };

  // Read question text aloud
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

  // Progressive Hinting Logic
  const handleRequestHint = () => {
    if (hintStage === 0) {
      setHintStage(1);
      setAiSpeechMessage('💡 Gợi ý 1: ' + firstHint);
    } else if (hintStage === 1) {
      setHintStage(2);
      setAiSpeechMessage(`💡 Gợi ý 2: ${currentQuestion.hint}`);
    } else {
      setHintStage(3);
      setAiSpeechMessage('📖 Hãy xem từng bước hướng dẫn giải chi tiết bên dưới nhé con!');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-16">
      {/* 1. TOP HEADER */}
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {lesson.subjectName}
              </span>
              <span className="text-xs font-bold text-slate-400">
                • {lesson.topic}
              </span>
            </div>
            <h1 className="font-black text-lg sm:text-xl text-[#24324A] mt-0.5">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSpeakQuestion}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
            title="Đọc to câu hỏi bằng tiếng Việt chuẩn"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Dừng đọc</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Đọc câu hỏi</span>
              </>
            )}
          </button>

          {/* Progressive Hint Button */}
          <button
            onClick={handleRequestHint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>
              {hintStage === 0 ? 'Gợi ý' : hintStage === 1 ? 'Gợi ý 2' : 'Xem cách làm'}
            </span>
          </button>
        </div>
      </header>

      {/* Progress Bar & Adaptive Mastery Pill */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 shrink-0">
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#5BA7FF] to-[#68D5B5] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Mastery Badge */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-black">
            <span>Mastery:</span>
            <span className="text-sm font-black text-[#7C3AED]">{currentMasteryScore}%</span>
          </div>
          <div className="text-xs font-extrabold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Độ khó: Cấp {currentQuestion.difficulty === 'hard' ? '4' : currentQuestion.difficulty === 'medium' ? '3' : '2'}/5
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: QUESTION & CHOICES (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgba(36,50,74,0.04)] border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Câu hỏi luyện tập #{currentQuestionIndex + 1}
              </span>
              {consecutiveCorrect >= 2 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-black border border-orange-200 animate-bounce">
                  🔥 Chuỗi đúng {consecutiveCorrect} câu!
                </span>
              )}
            </div>

            <h2 className="font-black text-xl sm:text-2xl text-[#24324A] leading-snug">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.visual && <QuestionVisualView visual={currentQuestion.visual} />}

            {currentQuestion.formula && (
              <div className="p-6 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-2xl border border-slate-200/80 text-center select-none shadow-xs">
                <span className="font-black text-3xl sm:text-4xl text-[#1E3A8A] tracking-wider font-mono">
                  {currentQuestion.formula}
                </span>
              </div>
            )}

            {currentQuestion.subPrompt && (
              <p className="text-base sm:text-lg font-bold text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-2xl p-4">
                {currentQuestion.subPrompt}
              </p>
            )}

            {/* Progressive Hint Banners */}
            {hintStage >= 1 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 animate-fadeIn">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-black text-xs text-amber-800 uppercase tracking-wider">
                    {hintStage === 1 ? 'Gợi ý bước đầu:' : 'Gợi ý chi tiết:'}
                  </span>
                  <p className="text-sm font-extrabold text-amber-900 leading-relaxed">
                    {hintStage === 1
                      ? firstHint
                      : currentQuestion.hint}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ANSWER CHOICES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let cardStyle = 'border-slate-200 bg-white hover:border-[#5BA7FF] hover:bg-blue-50/20';
              let badgeStyle = 'bg-slate-100 text-slate-600';
              let textStyle = 'text-[#24324A]';
              let iconStyle = 'text-transparent';

              if (isSubmitted) {
                if (option.id === currentQuestion.correctOptionId) {
                  cardStyle = 'border-2 border-[#68D5B5] bg-[#E6F9F3] shadow-md shadow-[#68D5B5]/20 scale-[1.02]';
                  badgeStyle = 'bg-[#00A37A] text-white';
                  textStyle = 'text-[#004637] font-black';
                  iconStyle = 'text-[#00A37A]';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'border-2 border-[#FF8A7A] bg-[#FFF4F2] scale-95 opacity-85';
                  badgeStyle = 'bg-[#E86350] text-white';
                  textStyle = 'text-[#93000A] font-extrabold line-through';
                  iconStyle = 'text-[#E86350]';
                }
              } else if (isSelected) {
                cardStyle = 'border-2 border-[#5BA7FF] bg-blue-50/60 shadow-md shadow-blue-500/10';
                badgeStyle = 'bg-[#3B82F6] text-white';
                textStyle = 'text-[#1D4ED8] font-black';
              }

              return (
                <button
                  key={option.id}
                  disabled={isSubmitted && isCorrect === true}
                  onClick={() => handleSelectOption(option.id)}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${badgeStyle}`}>
                      {option.id}
                    </span>
                    <OptionBody text={option.text} face={option.face} textClass={`text-lg sm:text-xl font-black ${textStyle}`} />
                  </div>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center">
                    <CheckCircle className={`w-6 h-6 ${iconStyle}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* SUCCESS BANNER */}
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
                    {profile.name} làm bài xuất sắc lắm! Tiếp tục phát huy nhé!
                  </span>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto bg-[#00A37A] hover:bg-[#008F6B] text-white px-7 py-3.5 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
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

          {/* INCORRECT BANNER */}
          {isSubmitted && !isCorrect && (
            <div className="bg-[#FFF4F2] border-2 border-[#FF8A7A] p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_24px_rgba(255,138,122,0.1)] animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8A7A] text-white flex items-center justify-center shadow-sm shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg text-[#93000A]">
                    Chưa đúng rồi, đừng nản nhé 💪
                  </span>
                  <span className="font-bold text-sm text-slate-600">
                    Bấm xem gợi ý hoặc thử làm lại một lần nữa nào!
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRequestHint}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full font-extrabold text-sm transition-all cursor-pointer"
                >
                  Xem gợi ý
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#FF785A] hover:bg-[#E86350] text-white rounded-full font-black text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* Step-by-Step Explanation Box (when hintStage === 3) */}
          {hintStage >= 3 && (
            <div className="bg-white border border-purple-200 p-5 rounded-3xl shadow-sm flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2 text-[#6D28D9] font-black text-base">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Giải thích từng bước chi tiết:</span>
                </div>
                <button
                  onClick={() => setHintStage(0)}
                  className="text-xs font-extrabold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Đóng lại
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {currentQuestion.stepByStep.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-50/60 text-sm font-bold text-purple-950"
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

          {/* Mastered Alert Banner (Mastery >= 90) */}
          {currentMasteryScore >= 90 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-500 fill-amber-400 shrink-0" />
                <div>
                  <h4 className="font-black text-base text-amber-950">
                    Đã đạt mức Thành thạo (Mastered {currentMasteryScore}%)! 🏆
                  </h4>
                  <p className="text-xs font-bold text-amber-800">
                    Con đã nắm vững toàn bộ kiến thức kỹ năng này, sẵn sàng chinh phục kỹ năng tiếp theo rồi!
                  </p>
                </div>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs"
              >
                Chuyển kỹ năng mới
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: AI MASCOT & PEDAGOGICAL COMPANION (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(36,50,74,0.05)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

            {/* Mascot Avatar */}
            <div className="mb-4">
              <KiddoMascot
                mood={
                  isSubmitted && isCorrect
                    ? 'cheer'
                    : isSubmitted && !isCorrect
                    ? 'thinking'
                    : hintStage > 0
                    ? 'thinking'
                    : 'happy'
                }
                size="lg"
                withCap={true}
              />
            </div>

            {/* Speech Bubble */}
            <div className="bg-[#F4F2FF] p-4 rounded-2xl w-full relative mb-5 border border-purple-100 shadow-xs">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F4F2FF] rotate-45 border-t border-l border-purple-100" />
              <h3 className="font-black text-lg text-[#3C2E87] mb-1">Thầy Kiddo AI</h3>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                {aiSpeechMessage}
              </p>
            </div>

            {/* Quick action button inside mascot card */}
            <button
              onClick={onOpenFastTest}
              className="w-full py-3 bg-[#EAF2FF] hover:bg-[#D8E6FF] text-[#2563EB] rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Kiểm tra nhanh nhảy lớp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
