import React, { useState } from 'react';
import { Skill, CurriculumQuestion } from '../types/curriculum';
import { getQuestionsBySkill, toLegacyQuestion } from '../data/curriculumData';
import { evaluatePreTestScore } from '../services/mastery';
import { KiddoMascot } from './KiddoMascot';
import { QuestionVisualView, OptionBody } from './QuestionVisual';
import confetti from 'canvas-confetti';
import { Zap, CheckCircle2, XCircle, ArrowRight, Sparkles, BookOpen, Trophy } from 'lucide-react';

interface QuickCheckModalProps {
  isOpen: boolean;
  skill: Skill;
  onClose: () => void;
  onPassMastered: (earnedXP: number, newMastery: number) => void;
  onStartLesson: (isShortLesson: boolean) => void;
}

export const QuickCheckModal: React.FC<QuickCheckModalProps> = ({
  isOpen,
  skill,
  onClose,
  onPassMastered,
  onStartLesson,
}) => {
  if (!isOpen) return null;

  const rawQuestions = getQuestionsBySkill(skill.id);
  const questions = (rawQuestions.length > 0 ? rawQuestions : []).slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [confirmIndex, setConfirmIndex] = useState(0);

  const currentQ = questions[currentIndex] ? toLegacyQuestion(questions[currentIndex]) : null;

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctOptionId;
    const newAnswers = { ...userAnswers, [currentIndex]: selectedOption };
    setUserAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      } else {
        // Calculate final score
        setIsFinished(true);
        const correctCount = Object.entries(newAnswers).reduce((acc, [idx, ans]) => {
          const q = toLegacyQuestion(questions[Number(idx)]);
          return ans === q.correctOptionId ? acc + 1 : acc;
        }, 0);

        if (correctCount >= 4) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#68D5B5', '#FFD65A', '#5BA7FF', '#A99CFB'],
            });
          } catch (e) {}
        }
      }
    }, 600);
  };

  // Evaluation
  const correctCount = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    const q = questions[Number(idx)] ? toLegacyQuestion(questions[Number(idx)]) : null;
    return q && ans === q.correctOptionId ? acc + 1 : acc;
  }, 0);

  const evaluation = evaluatePreTestScore(correctCount, questions.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-6 relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-black">
              ⚡
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-600">
                Quick Check Kiểm Tra Nhanh
              </div>
              <h3 className="font-black text-lg text-[#24324A] line-clamp-1">
                {skill.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Ongoing Test State */}
        {!isFinished && currentQ && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
              <span className="text-[#3B82F6] font-extrabold">Đúng {correctCount} câu</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Content */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <h4 className="font-extrabold text-base sm:text-lg text-[#24324A]">
                {currentQ.prompt}
              </h4>
              {currentQ.visual && (
                <div className="my-3">
                  <QuestionVisualView visual={currentQ.visual} />
                </div>
              )}
              {currentQ.formula && (
                <div className="font-black text-2xl sm:text-3xl text-[#2563EB] my-3 tracking-wide text-center">
                  {currentQ.formula}
                </div>
              )}
              {currentQ.subPrompt && (
                <p className="text-sm sm:text-base font-bold text-slate-600 leading-relaxed whitespace-pre-line mt-2">{currentQ.subPrompt}</p>
              )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                const isChosen = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                      isChosen
                        ? 'border-[#3B82F6] bg-blue-50/70 text-[#1D4ED8] shadow-xs'
                        : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isChosen ? 'bg-[#3B82F6] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <OptionBody text={opt.text} face={opt.face} textClass="text-base font-extrabold" />
                  </button>
                );
              })}
            </div>

            {/* Confirm button */}
            <button
              disabled={!selectedOption || isAnswerSubmitted}
              onClick={handleConfirmAnswer}
              className={`w-full py-3.5 rounded-full font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedOption
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Xác nhận đáp án</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Finished / Result Screen */}
        {isFinished && (
          <div className="flex flex-col items-center gap-5 text-center py-2 animate-fadeIn">
            <KiddoMascot
              mood={evaluation.passed ? 'cheer' : 'thinking'}
              size="lg"
            />

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 font-black text-xs text-slate-600 mb-2">
                <span>Kết quả: {correctCount}/{questions.length} câu đúng</span>
              </div>
              <h3 className="font-black text-2xl text-[#24324A]">
                {evaluation.passed ? 'Tuyệt vời! Con đã vượt cấp! 🎉' : 'Kiddo AI đã nắm được tình hình! 💡'}
              </h3>
              <p className="text-sm font-bold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                {evaluation.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              {evaluation.action === 'pass_mastered' && (
                <button
                  onClick={() => onPassMastered(50, evaluation.masteryScore)}
                  className="w-full py-4 rounded-full font-black text-base text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span>Nhận +50 XP & Đạt Thành Thạo</span>
                </button>
              )}

              {evaluation.action === 'confirm_questions' && (
                <button
                  onClick={() => onPassMastered(35, evaluation.masteryScore)}
                  className="w-full py-4 rounded-full font-black text-base text-white bg-[#3B82F6] hover:bg-blue-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Xác nhận thành thạo (+35 XP)</span>
                </button>
              )}

              {evaluation.action === 'short_lesson' && (
                <button
                  onClick={() => onStartLesson(true)}
                  className="w-full py-4 rounded-full font-black text-base text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Bắt đầu bài học rút gọn</span>
                </button>
              )}

              {evaluation.action === 'full_lesson' && (
                <button
                  onClick={() => onStartLesson(false)}
                  className="w-full py-4 rounded-full font-black text-base text-white bg-[#FF785A] hover:bg-[#F05B38] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Bắt đầu học bài cùng Thầy Kiddo</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
