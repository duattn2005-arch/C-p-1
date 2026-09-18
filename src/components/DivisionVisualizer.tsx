import React, { useState, useMemo, useEffect } from 'react';
import { calculateLongDivision, DivisionResult } from '../utils/divisionHelper';
import { KiddoMascot } from './KiddoMascot';
import { speakVietnamese, stopSpeaking } from '../utils/vietnameseSpeech';
import { 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface DivisionVisualizerProps {
  initialDividend?: number;
  initialDivisor?: number;
  onAskAi?: (question: string) => void;
}

export const DivisionVisualizer: React.FC<DivisionVisualizerProps> = ({
  initialDividend = 51019,
  initialDivisor = 19,
  onAskAi,
}) => {
  const [dividendInput, setDividendInput] = useState<string>(initialDividend.toString());
  const [divisorInput, setDivisorInput] = useState<string>(initialDivisor.toString());
  const [activeDividend, setActiveDividend] = useState<number>(initialDividend);
  const [activeDivisor, setActiveDivisor] = useState<number>(initialDivisor);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const divisionResult: DivisionResult = useMemo(() => {
    try {
      return calculateLongDivision(activeDividend, activeDivisor);
    } catch (e) {
      return calculateLongDivision(51019, 19);
    }
  }, [activeDividend, activeDivisor]);

  const totalSteps = divisionResult.steps.length;

  const handleCalculate = (d: number, r: number) => {
    if (r <= 0) return;
    setActiveDividend(d);
    setActiveDivisor(r);
    setDividendInput(d.toString());
    setDivisorInput(r.toString());
    setCurrentStepIdx(0);
    setShowAllSteps(true);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Text-to-speech for elementary students with Vietnamese pronunciation
  const handleSpeakStep = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    speakVietnamese({
      text,
      lang: 'vi-VN',
      rate: 0.88,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const currentStep = divisionResult.steps[currentStepIdx] || divisionResult.steps[0];

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-[0_10px_30px_rgba(36,50,74,0.06)] flex flex-col gap-6">
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EEFF] text-[#0060AA] flex items-center justify-center text-xl font-black shadow-xs shrink-0">
            ➗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl text-[#24324A]">
                Đặt tính rồi tính: Phép chia số có hai chữ số
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                Toán Lớp 4
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Mô phỏng trực quan từng bước đặt tính chuẩn sách giáo khoa Tiểu học
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400">Ví dụ mẫu:</span>
          <button
            onClick={() => handleCalculate(51019, 19)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeDividend === 51019 && activeDivisor === 19
                ? 'bg-[#0060AA] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#24324A]'
            }`}
          >
            ⭐ 51019 : 19 (Hình đề bài)
          </button>
          <button
            onClick={() => handleCalculate(8496, 24)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeDividend === 8496 && activeDivisor === 24
                ? 'bg-[#0060AA] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#24324A]'
            }`}
          >
            8496 : 24
          </button>
          <button
            onClick={() => handleCalculate(372, 12)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeDividend === 372 && activeDivisor === 12
                ? 'bg-[#0060AA] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#24324A]'
            }`}
          >
            372 : 12
          </button>
        </div>
      </div>

      {/* Input controls */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-[#F7FBFF] rounded-2xl border border-blue-100">
        <span className="text-xs font-black text-slate-600">Nhập phép tính:</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={dividendInput}
            onChange={(e) => setDividendInput(e.target.value)}
            className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-black text-base text-[#24324A] text-center focus:ring-2 focus:ring-[#0060AA] outline-none"
            placeholder="Số bị chia"
          />
          <span className="font-black text-lg text-slate-400">:</span>
          <input
            type="number"
            value={divisorInput}
            onChange={(e) => setDivisorInput(e.target.value)}
            className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-black text-base text-[#24324A] text-center focus:ring-2 focus:ring-[#0060AA] outline-none"
            placeholder="Số chia"
          />
        </div>
        <button
          onClick={() => {
            const d = parseInt(dividendInput, 10);
            const r = parseInt(divisorInput, 10);
            if (!isNaN(d) && !isNaN(r) && r > 0) {
              handleCalculate(d, r);
            }
          }}
          className="px-4 py-2 bg-[#0060AA] hover:bg-[#004C87] text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs"
        >
          Đặt tính ngay
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            {showAllSteps ? 'Xem từng bước một' : 'Xem toàn bộ sơ đồ'}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Vertical Division Diagram, Right Pedagogical Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Classical Vietnamese Long Division (Đặt tính) - 6 Cols */}
        <div className="lg:col-span-6 bg-[#FAFCFF] p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
            Bảng Đặt Tính (Theo quy chuẩn SGK)
          </div>

          {/* Classical Vertical Layout Container */}
          <div className="flex items-start font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#24324A] select-all my-2">
            {/* Left Column: Dividend and successive subtraction/remainders */}
            <div className="flex flex-col items-end pr-5 min-w-[140px] sm:min-w-[160px]">
              {/* Row 0: Dividend */}
              <div className="py-1 tracking-wider text-blue-950 font-black">
                {divisionResult.dividend}
              </div>

              {/* Successive Steps */}
              {divisionResult.steps.map((step, idx) => {
                if (!showAllSteps && idx > currentStepIdx) return null;

                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-end w-full transition-all duration-300 ${
                      isCurrent && !showAllSteps ? 'bg-amber-100/60 rounded-lg p-1' : ''
                    }`}
                  >
                    {/* Multiply row */}
                    <div className="text-slate-800 py-0.5 font-bold">
                      {step.multiplyResult}
                    </div>
                    {/* Underline */}
                    <div className="w-full border-b-2 border-[#24324A] my-0.5" />
                    {/* Remainder + brought down digit */}
                    <div className="py-0.5 font-black text-[#0060AA]">
                      {idx < divisionResult.steps.length - 1 ? (
                        <>
                          <span className="text-slate-700">{step.remainder}</span>
                          {/* Next digit brought down */}
                          <span className="text-purple-600 underline decoration-2">
                            {divisionResult.steps[idx + 1].digitBroughtDown}
                          </span>
                        </>
                      ) : (
                        /* Final remainder */
                        <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded">
                          {step.remainder}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vertical Divider */}
            <div className="w-[3px] bg-[#24324A] self-stretch" />

            {/* Right Column: Divisor on top, Quotient below horizontal line */}
            <div className="flex flex-col pl-5 min-w-[100px] sm:min-w-[120px]">
              {/* Divisor */}
              <div className="py-1 text-[#0060AA] font-black tracking-wider">
                {divisionResult.divisor}
              </div>
              {/* Horizontal Line under Divisor */}
              <div className="w-full border-b-[3px] border-[#24324A] my-0.5" />
              {/* Quotient */}
              <div className="py-1 text-emerald-700 font-black tracking-wider">
                {showAllSteps
                  ? divisionResult.quotient
                  : divisionResult.steps
                      .slice(0, currentStepIdx + 1)
                      .map((s) => s.quotientDigit)
                      .join('')}
              </div>
            </div>
          </div>

          {/* Quick Legend / Callout */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 w-full flex flex-wrap items-center justify-between text-xs font-bold gap-2">
            <span className="text-blue-900">Số bị chia: {divisionResult.dividend}</span>
            <span className="text-[#0060AA]">Số chia: {divisionResult.divisor}</span>
            <span className="text-emerald-700">Thương: {divisionResult.quotient}</span>
            <span className="text-rose-600">Số dư: {divisionResult.remainder}</span>
          </div>
        </div>

        {/* RIGHT: Pedagogical Step Explanation & Mascot - 6 Cols */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Step Navigation Bar */}
          {!showAllSteps && (
            <div className="flex items-center justify-between bg-[#F0F7FF] p-3 rounded-2xl border border-blue-100">
              <span className="text-xs font-black text-[#0060AA]">
                Bước {currentStepIdx + 1} / {totalSteps}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentStepIdx === 0}
                  onClick={() => setCurrentStepIdx((p) => Math.max(0, p - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentStepIdx === totalSteps - 1}
                  onClick={() => setCurrentStepIdx((p) => Math.min(totalSteps - 1, p + 1))}
                  className="w-8 h-8 rounded-full bg-[#0060AA] text-white flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Detailed Step Cards */}
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
            {divisionResult.steps.map((step, idx) => {
              if (!showAllSteps && idx !== currentStepIdx) return null;

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    idx === currentStepIdx
                      ? 'bg-white border-[#0060AA] ring-2 ring-blue-100 shadow-sm'
                      : 'bg-white/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0060AA] text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-[#24324A]">
                        {step.description}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleSpeakStep(step.explanation.replace(/•/g, ''))}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="Đọc giải thích bước này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-line pl-8">
                    {step.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conclusion Box & Verification */}
          <div className="bg-[#E6F9F3] border border-[#68D5B5] p-4 sm:p-5 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#006B55] font-black text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Kết luận và Thử lại (Kiểm tra kết quả):</span>
            </div>
            <p className="text-sm font-black text-[#004637]">
              {divisionResult.dividend} : {divisionResult.divisor} = {divisionResult.quotient}{' '}
              {divisionResult.remainder > 0 ? (
                <span className="text-rose-600">(dư {divisionResult.remainder})</span>
              ) : (
                <span className="text-emerald-700">(phép chia hết)</span>
              )}
            </p>
            <div className="text-xs font-bold text-slate-700 bg-white/70 p-2.5 rounded-xl">
              <strong>Công thức thử lại:</strong> (Thương × Số chia) + Số dư = ({divisionResult.quotient} × {divisionResult.divisor}) + {divisionResult.remainder} ={' '}
              <strong className="text-[#00A37A]">
                {divisionResult.quotient * divisionResult.divisor + divisionResult.remainder}
              </strong>{' '}
              (Bằng đúng số bị chia ban đầu 👏)
            </div>
          </div>

          {/* Button to ask Kiddo AI about this */}
          {onAskAi && (
            <button
              onClick={() =>
                onAskAi(`Thầy giải thích giúp con chi tiết phép chia ${activeDividend} : ${activeDivisor} nhé!`)
              }
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:opacity-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Hỏi thêm Kiddo AI về phép tính này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
