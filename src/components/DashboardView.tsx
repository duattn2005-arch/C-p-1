import React from 'react';
import { StudentProfile, DailyMission, SubjectId } from '../types';
import { KiddoMascot } from './KiddoMascot';
import { 
  Sun, 
  Timer, 
  ArrowRight, 
  Sparkles, 
  BarChart2, 
  Trophy, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { storageService } from '../services/storage';
import { analyzeLearning } from '../services/insights';
import { skillsDatabase, getTopicById, getTopicsByGradeAndSubject } from '../data/curriculumData';
import type { GradeLevel } from '../types/curriculum';

interface DashboardViewProps {
  profile: StudentProfile;
  missions: DailyMission[];
  onToggleMission: (id: string) => void;
  onStartSubject: (subject: SubjectId, lessonId?: string) => void;
  onStartAiPractice: () => void;
  onOpenFastTest: () => void;
  onOpenRewards: () => void;
  onOpenAchievements: () => void;
}

// The five topics a grade studies in one subject; a tap starts the first skill of that topic
const TopicRoadmap: React.FC<{ subject: SubjectId; grade: GradeLevel; onPick: (skillId: string) => void }> = ({ subject, grade, onPick }) => {
  const topics = getTopicsByGradeAndSubject(grade, subject);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-black uppercase tracking-wider text-slate-400">Lộ trình Lớp {grade}</span>
      {topics.map((t) => {
        const first = skillsDatabase.find((s) => s.topic_id === t.id);
        return (
          <button
            key={t.id}
            disabled={!first}
            onClick={() => first && onPick(first.id)}
            className="flex items-center gap-2 text-left text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-2 py-1 rounded-xl cursor-pointer"
          >
            <span>{t.icon}</span>
            <span className="line-clamp-1">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  missions,
  onToggleMission,
  onStartSubject,
  onStartAiPractice,
  onOpenRewards,
  onOpenAchievements,
}) => {
  const completedMissionsCount = missions.filter((m) => m.completed).length;
  const missionsPercentage = Math.round((completedMissionsCount / missions.length) * 100);

  // Dynamic real data calculation from student mastery storage
  const masteries = storageService.getAllMasteries();
  const gradeSkills = skillsDatabase.filter((s) => s.grade === profile.grade);
  const mathSkills = gradeSkills.filter((s) => s.subject_id === 'math');
  const vnSkills = gradeSkills.filter((s) => s.subject_id === 'vietnamese');
  const enSkills = gradeSkills.filter((s) => s.subject_id === 'english');

  // The next skill to study in each subject: the first one not yet mastered, in the order of the grade's roadmap
  const planFor = (skills: typeof gradeSkills) => {
    const next = skills.find((s) => (masteries[s.id]?.mastery_score ?? 0) < 70) ?? skills[0];
    return { next, topicName: next ? getTopicById(next.topic_id)?.name : undefined };
  };
  const mathPlan = planFor(mathSkills);
  const vnPlan = planFor(vnSkills);
  const enPlan = planFor(enSkills);

  // Progress of a subject = the average mastery of its skills. It is 0% until the child really answers questions.
  const subjectProgress = (skills: typeof gradeSkills) =>
    skills.length === 0 ? 0 : Math.round(skills.reduce((sum, sk) => sum + Math.min(100, masteries[sk.id]?.mastery_score ?? 0), 0) / skills.length);
  const mathProgress = subjectProgress(mathSkills);
  const vnProgress = subjectProgress(vnSkills);
  const enProgress = subjectProgress(enSkills);

  // What the AI knows about the child comes from the log of their answers, never from a default
  const insights = analyzeLearning(storageService.getAttempts(), gradeSkills, masteries);
  const topWeak = insights.weak[0];
  const nextSkill = insights.next;

  const aiRec = topWeak
    ? {
        badge: topWeak.skill.name.toUpperCase(),
        title: `AI phát hiện con hay sai "${topWeak.skill.name}": đúng ${topWeak.recentAnswered - topWeak.recentErrors}/${topWeak.recentAnswered} câu gần đây. Luyện 5 phút để sửa nhé! ✨`,
        mastery: topWeak.mastery,
        note: topWeak.openMistakes > 0 ? `Còn ${topWeak.openMistakes} câu sai chưa sửa` : 'Con phải thử lại nhiều lần mới đúng',
        button: 'Luyện 5 phút (+30 XP)',
        practice: true,
      }
    : insights.level === 'none'
    ? {
        badge: 'CHƯA CÓ DỮ LIỆU',
        title: 'Con chưa làm câu nào. Làm vài câu, AI sẽ chỉ ra phần con cần luyện thêm!',
        mastery: null,
        note: '',
        button: 'Bắt đầu học',
        practice: false,
      }
    : insights.level === 'few'
    ? {
        badge: 'AI ĐANG THEO DÕI',
        title: `Con đã làm ${insights.answered} câu, đúng ${insights.correct} câu. Làm thêm vài câu để AI biết con yếu ở đâu nhé!`,
        mastery: null,
        note: '',
        button: 'Học tiếp',
        practice: false,
      }
    : {
        badge: 'CHƯA THẤY PHẦN YẾU',
        title: 'AI chưa thấy phần nào con yếu. Con học tiếp bài mới nhé! 🌟',
        mastery: null,
        note: '',
        button: 'Học tiếp',
        practice: false,
      };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-7 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EBF3FF] via-[#F1F6FE] to-[#EDE9FE] border border-blue-100/60 p-6 sm:p-8 shadow-[0_10px_25px_-5px_rgba(36,50,74,0.04)]">
        {/* Soft background ambient shapes */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-64 -bottom-10 w-48 h-48 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text & Goal */}
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-white text-[#2563EB] font-extrabold text-[13px] shadow-xs">
              <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Năng lượng ngày mới</span>
            </div>

            <h1 className="font-black text-[26px] sm:text-[32px] text-[#24324A] leading-tight tracking-tight">
              Chào {profile.name}! Sẵn sàng khám phá nhé? 🚀
            </h1>

            {/* Daily Goal Pill & Big Action */}
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-white shadow-xs">
              <div className="flex-1 w-full sm:w-auto px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[14px] text-slate-700 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-[#5BA7FF]" />
                    Mục tiêu: {profile.dailyGoalMinutes} phút
                  </span>
                  <span className="font-black text-[14px] text-[#2563EB]">
                    {insights.todayMinutes}/{profile.dailyGoalMinutes} phút (
                    {Math.round((insights.todayMinutes / profile.dailyGoalMinutes) * 100)}
                    %)
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#5BA7FF] to-[#2563EB] rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (insights.todayMinutes / profile.dailyGoalMinutes) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => onStartSubject('math', mathPlan.next?.id)}
                className="w-full sm:w-auto px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full font-black text-[14px] btn-tactile-blue transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Tiếp tục bài hôm nay</span>
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Cute Mascot Mascot Side */}
          <div className="shrink-0 flex items-center justify-center">
            <KiddoMascot mood="cheer" size="xl" />
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: 3 SUBJECT CARDS + AI SPOTLIGHT + WEEKLY TIME (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-7">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-7 bg-[#5BA7FF] rounded-full" />
              <h2 className="font-black text-[22px] sm:text-[24px] text-[#24324A]">
                Môn học yêu thích
              </h2>
            </div>
            <span className="text-[13px] font-extrabold text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-xs">
              Lớp {profile.grade} • Học kỳ 1
            </span>
          </div>

          {/* 3 SUBJECT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1: Math Card */}
            <div className="flex flex-col justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_20px_rgba(36,50,74,0.03)] hover:shadow-md transition-all gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center text-[30px] shadow-xs">
                    🔢
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-black text-[15px]">
                    ⭐ {mathProgress}%
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[20px] text-[#24324A] line-clamp-2">
                    {mathPlan.next?.name || 'Toán học vui'}
                  </h3>
                  <p className="text-[14px] font-bold text-slate-500 mt-1 line-clamp-2">
                    {mathPlan.topicName || 'Chương trình Toán Lớp ' + profile.grade}
                  </p>
                </div>

                <TopicRoadmap subject="math" grade={profile.grade as GradeLevel} onPick={(id) => onStartSubject('math', id)} />

                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex justify-between text-[14px] font-extrabold">
                    <span className="text-slate-400">Tiến độ bài học</span>
                    <span className="text-[#1D4ED8]">{mathProgress}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                      style={{ width: `${mathProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartSubject('math', mathPlan.next?.id)}
                className="w-full py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full font-black text-[16px] btn-tactile-blue transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Học tiếp</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* 2: Vietnamese Card */}
            <div className="flex flex-col justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_20px_rgba(36,50,74,0.03)] hover:shadow-md transition-all gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF4F2] text-[#FF8A7A] flex items-center justify-center text-[30px] shadow-xs">
                    📖
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#FFF4F2] text-[#E86350] px-3 py-1 rounded-full font-black text-[15px]">
                    ⭐ {vnProgress}%
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[20px] text-[#24324A] line-clamp-2">
                    {vnPlan.next?.name || 'Tiếng Việt diệu kỳ'}
                  </h3>
                  <p className="text-[14px] font-bold text-slate-500 mt-1 line-clamp-2">
                    {vnPlan.topicName || 'Chương trình Tiếng Việt Lớp ' + profile.grade}
                  </p>
                </div>

                <TopicRoadmap subject="vietnamese" grade={profile.grade as GradeLevel} onPick={(id) => onStartSubject('vietnamese', id)} />

                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex justify-between text-[14px] font-extrabold">
                    <span className="text-slate-400">Tiến độ bài học</span>
                    <span className="text-[#E86350]">{vnProgress}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#FF785A] rounded-full transition-all duration-500"
                      style={{ width: `${vnProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartSubject('vietnamese', vnPlan.next?.id)}
                className="w-full py-3.5 bg-[#FF785A] hover:bg-[#F05B38] text-white rounded-full font-black text-[16px] btn-tactile-coral transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Học tiếp</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* 3: English Card */}
            <div className="flex flex-col justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_20px_rgba(36,50,74,0.03)] hover:shadow-md transition-all gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center text-[30px] shadow-xs">
                    🇬🇧
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#F5F3FF] text-[#7C3AED] px-3 py-1 rounded-full font-black text-[15px]">
                    ⭐ {enProgress}%
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-[20px] text-[#24324A] line-clamp-2">
                    {enPlan.next?.name || 'Tiếng Anh vui'}
                  </h3>
                  <p className="text-[14px] font-bold text-slate-500 mt-1 line-clamp-2">
                    {enPlan.topicName || 'Chương trình Tiếng Anh Lớp ' + profile.grade}
                  </p>
                </div>

                <TopicRoadmap subject="english" grade={profile.grade as GradeLevel} onPick={(id) => onStartSubject('english', id)} />

                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex justify-between text-[14px] font-extrabold">
                    <span className="text-slate-400">Tiến độ bài học</span>
                    <span className="text-[#6D28D9]">{enProgress}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500"
                      style={{ width: `${enProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartSubject('english', enPlan.next?.id)}
                className="w-full py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-black text-[16px] btn-tactile-purple transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Học tiếp</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI TUTOR SPOTLIGHT CARD */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EDE9FE] via-[#F3EEFF] to-[#E5DEFF] border border-purple-200/90 p-6 sm:p-7 shadow-[0_8px_25px_rgba(169,156,251,0.15)]">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center text-[28px] shadow-lg shadow-purple-500/25 shrink-0">
                    🤖
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white border border-purple-200 shadow-xs">
                      <span className="text-[14px]">🎯</span>
                      <span className="font-black text-[#6D28D9] text-[12px] sm:text-[13px] tracking-tight">
                        {aiRec.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-[20px] sm:text-[22px] text-purple-950 leading-tight">
                      {aiRec.title}
                    </h3>
                  </div>
                </div>

                {/* Mastery Bar: only when there is a real weak skill to show */}
                {aiRec.mastery !== null && (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-purple-100 shadow-xs">
                  <div className="flex items-center justify-between text-[15px] mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="font-extrabold text-slate-700 text-[14px]">
                        Mức độ thành thạo (Mastery Score):
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-[22px] text-[#7C3AED]">
                        {aiRec.mastery}%
                      </span>
                      <span className="text-[12px] font-bold text-slate-400">/ 100%</span>
                    </div>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#5BA7FF] rounded-full transition-all duration-700"
                      style={{ width: `${aiRec.mastery}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[12px] font-bold text-slate-400">
                    <span>{aiRec.note}</span>
                    <span className="text-[#6D28D9] font-extrabold">Dựa trên bài con đã làm</span>
                  </div>
                </div>
                )}
              </div>

              {/* Action Button */}
              <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                <button
                  onClick={() => (aiRec.practice || !nextSkill ? onStartAiPractice() : onStartSubject(nextSkill.subject_id, nextSkill.id))}
                  className="w-full md:w-auto px-7 py-4 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white rounded-full font-black text-[16px] btn-tactile-purple transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                >
                  <span className="text-[20px]">🤖</span>
                  <span>{aiRec.button}</span>
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                </button>
              </div>
            </div>
          </div>

          {/* WEEKLY STUDY TIME CHART (at bottom of left column) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_15px_rgba(36,50,74,0.02)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[15px] text-slate-700 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#5BA7FF]" />
                Thời gian học trong tuần
              </span>
              <span className="text-[12px] font-black text-[#1D4ED8] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Tổng: {insights.weekTotal} phút
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 items-end h-24">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label, i) => {
                const minutes = insights.weekMinutes[i];
                const isToday = i === insights.todayIndex;
                const top = Math.max(15, ...insights.weekMinutes);
                const height = minutes > 0 ? Math.max(14, Math.round((minutes / top) * 100)) : 8;
                return (
                  <div key={label} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg relative ${isToday ? 'bg-[#3B82F6] shadow-xs' : minutes > 0 ? 'bg-blue-200 hover:bg-blue-300 transition-colors' : 'bg-slate-100'}`}
                      style={{ height: `${height}%` }}
                      title={minutes > 0 ? `${isToday ? 'Hôm nay' : label}: ${minutes} phút` : `${isToday ? 'Hôm nay' : label}: chưa học`}
                    >
                      {isToday && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#24324A] text-white text-[9px] px-1.5 py-0.5 rounded font-black whitespace-nowrap shadow-sm">
                          Hôm nay
                        </div>
                      )}
                    </div>
                    <span className={`text-[12px] ${isToday ? 'font-black text-[#2563EB]' : 'font-bold text-slate-400'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY MISSIONS & REWARDS (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* CARD: DAILY MISSIONS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_20px_rgba(36,50,74,0.03)] flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-[18px] text-[#24324A]">Nhiệm vụ hôm nay</h3>
                <span className="text-[18px]">🎯</span>
              </div>
              {/* +50 XP Sticker */}
              <div className="flex items-center gap-1 bg-[#FEF9E7] border border-amber-300 text-amber-600 px-3 py-1 rounded-full font-black text-[13px] shadow-xs">
                <span>+50 XP</span>
                <span>⭐</span>
              </div>
            </div>

            {/* Overall Mission Progress */}
            <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-[13px] font-extrabold">
                <span className="text-slate-500">Tiến độ hoàn thành:</span>
                <span className="text-[#2563EB]">
                  {completedMissionsCount}/{missions.length} xong
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${missionsPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="flex flex-col gap-3">
              {missions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onToggleMission(m.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all ${
                    m.completed
                      ? 'bg-emerald-50/70 border border-emerald-200'
                      : 'bg-white border border-slate-200/80 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <button className="text-emerald-500 shrink-0">
                    {m.completed ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex flex-col flex-1">
                    <span
                      className={`font-extrabold text-[15px] ${
                        m.completed ? 'text-slate-700 line-through opacity-75' : 'text-[#24324A]'
                      }`}
                    >
                      {m.title}
                    </span>
                    <span
                      className={`text-[12px] font-bold ${
                        m.completed ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {m.subtitle}
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-black ${
                      m.completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-50 text-[#2563EB]'
                    }`}
                  >
                    +{m.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD: TREASURE CHEST & BADGES */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_20px_rgba(36,50,74,0.03)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-[18px] text-[#24324A]">Kho báu & Huy hiệu</h3>
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <button
                onClick={onOpenRewards}
                className="text-[13px] font-extrabold text-[#2563EB] hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {/* Weekly Treasure Chest */}
            <div
              onClick={onOpenRewards}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9EB] via-[#FFF3D6] to-[#FFE8B3] border border-amber-200 flex items-center gap-4 shadow-xs hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <div className="text-[42px] animate-bounce shrink-0 select-none">
                🎁
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[15px] text-amber-900">
                    Rương kho báu tuần
                  </span>
                  <span className="text-[11px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Cấp {profile.level}
                  </span>
                </div>
                <p className="text-[12px] font-bold text-amber-800/90 mt-0.5">
                  {insights.streakDays >= 7 ? (
                    'Con đã học đủ 7 ngày liên tiếp: mở quà lớn nào!'
                  ) : (
                    <>
                      Còn <strong className="text-amber-950 font-black">{7 - insights.streakDays} ngày</strong> học liên tiếp để mở quà lớn!
                    </>
                  )}
                </p>
                <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden mt-2 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((insights.streakDays / 7) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Junior Mathematician Badge */}
            <div
              onClick={onOpenAchievements}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-[26px] shadow-xs shrink-0 border border-amber-300/60">
                🏅
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-extrabold text-[14px] text-[#24324A] flex items-center gap-1.5">
                  Nhà Toán Học Nhí <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                </span>
                <span className="text-[12px] font-bold text-slate-500">
                  {profile.xp >= 500 ? (
                    'Đã mở khoá'
                  ) : (
                    <>
                      Cần thêm <strong className="text-purple-600 font-black">{500 - profile.xp} XP</strong> để mở khoá
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Streak card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-slate-50 border border-orange-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[22px] shadow-xs text-orange-500">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[14px] text-[#24324A]">
                    Chuỗi học tập
                  </span>
                  <span className="text-[12px] font-bold text-slate-400">
                    {profile.streakDays} ngày học liên tiếp!
                  </span>
                </div>
              </div>
              <span className="font-black text-[13px] text-orange-600 bg-white border border-orange-200 px-3 py-1 rounded-full shadow-xs">
                {profile.streakDays} NGÀY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
