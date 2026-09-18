import React, { useState, useEffect } from 'react';
import { SubjectId } from '../types';
import { GradeLevel, Topic, Skill, StudentSkillMastery } from '../types/curriculum';
import { 
  getTopicsByGradeAndSubject, 
  getSkillsByTopic, 
  getQuestionsBySkill, 
  toLegacyLesson,
  getSkillById
} from '../data/curriculumData';
import { storageService } from '../services/storage';
import { QuickCheckModal } from './QuickCheckModal';
import { 
  Calculator, 
  BookOpen, 
  Languages, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Star, 
  Zap,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy
} from 'lucide-react';

interface CurriculumViewProps {
  currentGrade?: number;
  onSelectGrade?: (grade: number) => void;
  onStartLesson: (subjectId: SubjectId, lessonId?: string, grade?: number) => void;
  onOpenFastTest: () => void;
  onUpdateXP?: (earnedXP: number) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  currentGrade = 3,
  onSelectGrade,
  onStartLesson,
  onOpenFastTest,
  onUpdateXP,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>((currentGrade as GradeLevel) || 3);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [quickCheckSkill, setQuickCheckSkill] = useState<Skill | null>(null);
  const [masteries, setMasteries] = useState<Record<string, StudentSkillMastery>>({});

  useEffect(() => {
    if (currentGrade && currentGrade !== selectedGrade) {
      setSelectedGrade((currentGrade as GradeLevel) || 3);
    }
  }, [currentGrade]);

  // Load masteries from storage
  const refreshMasteries = () => {
    setMasteries(storageService.getAllMasteries());
  };

  useEffect(() => {
    refreshMasteries();
  }, [selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: number) => {
    const gl = (Math.max(1, Math.min(5, grade)) as GradeLevel);
    setSelectedGrade(gl);
    onSelectGrade?.(gl);
  };

  const gradeList: GradeLevel[] = [1, 2, 3, 4, 5];

  const subjectsConfig: {
    id: SubjectId;
    name: string;
    icon: string;
    color: string;
    lightColor: string;
    borderColor: string;
  }[] = [
    { id: 'math', name: 'Toán học', icon: '🔢', color: '#5BA7FF', lightColor: '#EFF6FF', borderColor: '#BFDBFE' },
    { id: 'vietnamese', name: 'Tiếng Việt', icon: '📖', color: '#FF8A7A', lightColor: '#FFF4F2', borderColor: '#FECDD3' },
    { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧', color: '#8B5CF6', lightColor: '#F5F3FF', borderColor: '#DDD6FE' },
  ];

  // Topics for current Grade & Subject
  const topics: Topic[] = getTopicsByGradeAndSubject(selectedGrade, selectedSubject);

  // Auto-expand first topic if none is selected
  useEffect(() => {
    if (topics.length > 0 && (!expandedTopicId || !topics.some(t => t.id === expandedTopicId))) {
      setExpandedTopicId(topics[0].id);
    }
  }, [topics]);

  // Calculate metrics for each topic
  const calculateTopicMetrics = (topicId: string) => {
    const skills = getSkillsByTopic(topicId);
    if (skills.length === 0) return { progressPercent: 0, studiedCount: 0, totalSkills: 0, avgMastery: 0 };

    let totalMastery = 0;
    let studiedCount = 0;

    skills.forEach((s) => {
      const m = masteries[s.id];
      if (m && m.attempts > 0) {
        studiedCount++;
        totalMastery += m.mastery_score;
      }
    });

    const avgMastery = studiedCount > 0 ? Math.round(totalMastery / studiedCount) : 0;
    const progressPercent = Math.round((studiedCount / skills.length) * 100);

    return {
      progressPercent,
      studiedCount,
      totalSkills: skills.length,
      avgMastery,
    };
  };

  const getSkillStatusInfo = (skillId: string) => {
    const m = masteries[skillId];
    if (!m || m.attempts === 0) {
      return {
        label: 'Chưa học',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        score: 0,
      };
    }
    if (m.mastery_score >= 90) {
      return {
        label: 'Đã thành thạo',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        score: m.mastery_score,
      };
    }
    if (m.mastery_score < 50) {
      return {
        label: 'Cần luyện thêm',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        score: m.mastery_score,
      };
    }
    return {
      label: 'Đang học',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      score: m.mastery_score,
    };
  };

  const handleQuickCheckPass = (earnedXP: number, newMastery: number) => {
    if (quickCheckSkill) {
      const current = storageService.getSkillMastery(quickCheckSkill.id);
      storageService.saveSkillMastery({
        ...current,
        mastery_score: newMastery,
        status: newMastery >= 90 ? 'mastered' : 'learning',
        attempts: current.attempts + 5,
        correct_attempts: current.correct_attempts + 4,
        last_practiced_at: new Date().toISOString(),
      });
      storageService.addXP(earnedXP, `Vượt cấp Quick Check: ${quickCheckSkill.name}`, quickCheckSkill.id);
      onUpdateXP?.(earnedXP);
      refreshMasteries();
    }
    setQuickCheckSkill(null);
  };

  const handleStartSkillLesson = (skill: Skill) => {
    onStartLesson(selectedSubject, skill.id, selectedGrade);
  };

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
            Khối Lớp {selectedGrade} • Chuẩn SGK Bộ GD&ĐT
          </span>
          <button
            onClick={onOpenFastTest}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF6FF] text-[#1D4ED8] hover:bg-blue-100 font-extrabold text-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Kiểm tra nhảy lớp</span>
          </button>
        </div>
      </div>

      {/* 3 Subject Tabs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {subjectsConfig.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left cursor-pointer ${
                isSelected
                  ? 'border-[#3B82F6] bg-white shadow-md shadow-blue-500/10 scale-[1.01]'
                  : 'border-slate-100 bg-white hover:border-slate-200 shadow-xs'
              }`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs"
                style={{ backgroundColor: sub.lightColor }}
              >
                {sub.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg text-[#24324A]">
                  {sub.name}
                </span>
                <span className="text-xs font-extrabold text-slate-400">
                  Lớp {selectedGrade} • {topics.length} Chủ đề
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Topic List Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="font-black text-xl text-[#24324A] flex items-center gap-2">
          <span>Danh sách Chủ đề & Kỹ năng</span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Khối Lớp {selectedGrade}
          </span>
        </h2>
        <span className="text-xs font-bold text-slate-400">
          Nhấn vào chủ đề để xem chi tiết kỹ năng
        </span>
      </div>

      {/* Topics Accordion List */}
      <div className="flex flex-col gap-4">
        {topics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          const metrics = calculateTopicMetrics(topic.id);
          const skills = getSkillsByTopic(topic.id);

          return (
            <div
              key={topic.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-blue-200 shadow-md shadow-blue-500/5'
                  : 'border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
            >
              {/* Topic Header Card */}
              <div
                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-[#24324A]">
                      {topic.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mt-0.5">
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Topic Metrics Bar */}
                <div className="flex items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Progress % */}
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                      Tiến độ
                    </span>
                    <span className="font-black text-base text-[#3B82F6]">
                      {metrics.progressPercent}%
                    </span>
                  </div>

                  {/* Skills Completed */}
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                      Kỹ năng
                    </span>
                    <span className="font-black text-base text-slate-700">
                      {metrics.studiedCount}/{metrics.totalSkills}
                    </span>
                  </div>

                  {/* Mastery Score */}
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                      Mastery TB
                    </span>
                    <span className="font-black text-base text-purple-600">
                      {metrics.avgMastery}%
                    </span>
                  </div>

                  {/* Toggle Arrow */}
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Skills Nested List */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#FBFDFF] p-4 sm:p-6 flex flex-col gap-3.5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                    Các kỹ năng của chủ đề:
                  </div>

                  {skills.map((skill, sIdx) => {
                    const status = getSkillStatusInfo(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs hover:border-blue-100 transition-all"
                      >
                        {/* Skill info */}
                        <div className="flex items-start gap-3.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#3B82F6] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-base text-[#24324A]">
                                {skill.name}
                              </h4>
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${status.badgeClass}`}
                              >
                                {status.label}
                                {status.score > 0 ? ` (${status.score}%)` : ''}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {skill.description}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Quick Check + Learn */}
                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                          {/* Quick Check Pre-test button */}
                          <button
                            onClick={() => setQuickCheckSkill(skill)}
                            className="px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Làm 5 câu trắc nghiệm để vượt cấp nhanh nếu con đã biết!"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                            <span>Con biết phần này rồi</span>
                          </button>

                          {/* Start Practice / Lesson */}
                          <button
                            onClick={() => handleStartSkillLesson(skill)}
                            className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Học bài</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Check Modal */}
      {quickCheckSkill && (
        <QuickCheckModal
          isOpen={true}
          skill={quickCheckSkill}
          onClose={() => setQuickCheckSkill(null)}
          onPassMastered={handleQuickCheckPass}
          onStartLesson={(isShort) => {
            const s = quickCheckSkill;
            setQuickCheckSkill(null);
            handleStartSkillLesson(s);
          }}
        />
      )}
    </div>
  );
};
