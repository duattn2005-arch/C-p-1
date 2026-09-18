import React, { useState, useEffect } from 'react';
import { SubjectId } from '../types';
import { gradeCurriculumCatalog, CatalogLessonItem } from '../data/gradeCurriculum';
import { 
  Calculator, 
  BookOpen, 
  Languages, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Star, 
  Zap,
  GraduationCap
} from 'lucide-react';

interface CurriculumViewProps {
  currentGrade?: number;
  onSelectGrade?: (grade: number) => void;
  onStartLesson: (subjectId: SubjectId, lessonId?: string, grade?: number) => void;
  onOpenFastTest: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  currentGrade = 2,
  onSelectGrade,
  onStartLesson,
  onOpenFastTest,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(currentGrade);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');

  useEffect(() => {
    if (currentGrade && currentGrade !== selectedGrade) {
      setSelectedGrade(currentGrade);
    }
  }, [currentGrade]);

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    onSelectGrade?.(grade);
  };

  const gradeList = [1, 2, 3, 4, 5];

  const subjectsConfig = [
    { id: 'math' as SubjectId, name: 'Toán học', icon: '🔢', color: '#5BA7FF', lightColor: '#EFF6FF' },
    { id: 'vietnamese' as SubjectId, name: 'Tiếng Việt', icon: '📖', color: '#FF8A7A', lightColor: '#FFF4F2' },
    { id: 'english' as SubjectId, name: 'Tiếng Anh', icon: '🇬🇧', color: '#8B5CF6', lightColor: '#F5F3FF' },
  ];

  // Load distinct curriculum for each grade and subject
  const currentGradeLessons = gradeCurriculumCatalog[selectedGrade] || gradeCurriculumCatalog[2];
  const activeLessons: CatalogLessonItem[] = currentGradeLessons[selectedSubject] || [];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16">
      {/* Grade Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#3B82F6]" />
            <span className="font-black text-lg text-[#24324A]">Chương trình học:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {gradeList.map((g) => (
              <button
                key={g}
                onClick={() => handleGradeChange(g)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-sm transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-[#3B82F6] text-white shadow-xs scale-105'
                    : 'text-slate-500 hover:text-[#24324A]'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
            Khối Lớp {selectedGrade} • Chuẩn Bộ GD&ĐT
          </span>
          <button
            onClick={onOpenFastTest}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] text-[#1D4ED8] hover:bg-blue-100 font-extrabold text-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Kiểm tra nhanh nhảy lớp</span>
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {subjectsConfig.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`p-4 sm:p-5 rounded-3xl border-2 flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-white shadow-md'
                  : 'bg-white/70 hover:bg-white border-transparent'
              }`}
              style={{
                borderColor: isSelected ? sub.color : 'transparent',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: sub.lightColor }}
              >
                {sub.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg text-[#24324A]">
                  {sub.name}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Lớp {selectedGrade}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson List */}
      <div className="flex flex-col gap-4">
        {activeLessons.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in-progress';
          const isLocked = item.status === 'locked';

          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.isAiRecommended
                  ? 'border-purple-300 ring-2 ring-purple-100 shadow-md'
                  : 'border-slate-100 shadow-xs hover:shadow-sm'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : isInProgress
                      ? 'bg-blue-100 text-[#1D4ED8]'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : index + 1}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-lg text-[#24324A]">{item.title}</h3>
                    {item.isAiRecommended && (
                      <span className="bg-purple-100 text-[#6D28D9] text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>🤖</span> AI khuyên học
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex flex-col gap-1 w-28 text-right">
                  <span className="text-xs font-black text-slate-600">
                    {item.progress}% hoàn thành
                  </span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isInProgress
                          ? 'bg-[#3B82F6]'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  disabled={isLocked}
                  onClick={() => onStartLesson(selectedSubject, item.id, selectedGrade)}
                  className={`px-5 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : isInProgress
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white btn-tactile-blue'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isCompleted ? 'Ôn tập lại' : isInProgress ? 'Tiếp tục học' : 'Khoá'}</span>
                  {!isLocked && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
