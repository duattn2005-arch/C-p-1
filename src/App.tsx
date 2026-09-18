import React, { useState } from 'react';
import { ViewMode, SubjectId, Lesson, StudentProfile, DailyMission } from './types';
import { 
  initialStudentProfile, 
  defaultMissions, 
  mathLesson
} from './data/mockData';
import { getLessonForGradeAndSubject } from './data/gradeCurriculum';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LessonView } from './components/LessonView';
import { FastTestView } from './components/FastTestView';
import { AITutorView } from './components/AITutorView';
import { CurriculumView } from './components/CurriculumView';
import { AchievementsView } from './components/AchievementsView';
import { RewardsView } from './components/RewardsView';
import { MobileNav } from './components/MobileNav';
import confetti from 'canvas-confetti';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(initialStudentProfile);
  const [missions, setMissions] = useState<DailyMission[]>(defaultMissions);
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => 
    getLessonForGradeAndSubject(initialStudentProfile.grade, 'math')
  );
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Show cheerful floating toast
  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Change grade handler
  const handleGradeChange = (newGrade: number) => {
    setProfile((prev) => ({
      ...prev,
      grade: newGrade,
    }));
    showToast(`Đã chuyển sang chương trình học Lớp ${newGrade}! 🎓`);
  };

  // Toggle mission status
  const handleToggleMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          const nextState = !m.completed;
          if (nextState) {
            // Reward XP on completion!
            setProfile((p) => ({ ...p, xp: p.xp + m.xpReward }));
            showToast(`Tuyệt vời! Hoàn thành nhiệm vụ: +${m.xpReward} XP ⭐`);
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#68D5B5', '#FFD65A', '#5BA7FF'],
              });
            } catch (e) {}
          }
          return { ...m, completed: nextState };
        }
        return m;
      })
    );
  };

  // Start specific subject lesson with grade and lessonId
  const handleStartSubject = (subjectId: SubjectId, lessonId?: string, grade?: number) => {
    const targetGrade = grade || profile.grade;
    const lesson = getLessonForGradeAndSubject(targetGrade, subjectId, lessonId);
    setActiveLesson(lesson);
    setViewMode('lesson');
  };

  // AI Spotlight button -> 5 min practice tailored to current grade
  const handleStartAiPractice = () => {
    const lesson = getLessonForGradeAndSubject(profile.grade, 'math');
    setActiveLesson(lesson);
    setViewMode('lesson');
    showToast(`Bắt đầu thử thách 5 phút cùng Kiddo AI môn Toán Lớp ${profile.grade}! 🤖`);
  };

  // Fast Test Pass
  const handlePassFastTest = (earnedXp: number, newMastery: number) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      mathMastery: newMastery,
      studiedMinutesToday: Math.min(prev.dailyGoalMinutes, prev.studiedMinutesToday + 5),
    }));
    showToast(`Chúc mừng con đã vượt cấp thành công! +${earnedXp} XP 🏆`);
    setViewMode('dashboard');
  };

  // Fast Test Fail -> redirect to learn
  const handleFailFastTest = () => {
    const lesson = getLessonForGradeAndSubject(profile.grade, 'math');
    setActiveLesson(lesson);
    setViewMode('lesson');
    showToast('Kiddo AI sẽ đồng hành cùng con nắm chắc bài học này nhé! 🚀');
  };

  // Lesson completed
  const handleCompleteLesson = (earnedXp: number) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      mathMastery: Math.min(100, prev.mathMastery + 15),
      studiedMinutesToday: Math.min(prev.dailyGoalMinutes, prev.studiedMinutesToday + 5),
    }));
    showToast(`Xuất sắc! Hoàn thành bài học: +${earnedXp} XP 🎉`);
    setViewMode('dashboard');
  };

  // Claim chest
  const handleClaimChest = (xpAmount: number) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + xpAmount,
    }));
    showToast(`Đã nhận quà tuần: +${xpAmount} XP 🎁`);
  };

  // Update mastery directly from lesson answering
  const handleUpdateMastery = (newMastery: number) => {
    setProfile((prev) => ({
      ...prev,
      mathMastery: newMastery,
      xp: prev.xp + 10,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7FBFF] flex">
      {/* Desktop Persistent Left Sidebar */}
      <Sidebar
        currentView={viewMode}
        onSelectView={(v) => setViewMode(v)}
        className="hidden lg:flex"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Persistent Top Header (only show default title when not in specialized full lesson view) */}
        <Header
          profile={profile}
          onChangeGrade={handleGradeChange}
          onOpenProfile={() => setViewMode('achievements')}
          title={
            viewMode === 'lesson'
              ? `${activeLesson.subjectName}`
              : viewMode === 'fast-test'
              ? 'Kiểm tra nhanh Mastery'
              : viewMode === 'ai-tutor'
              ? 'Trò chuyện cùng Kiddo AI'
              : viewMode === 'achievements'
              ? 'Thành tích & Huy hiệu'
              : viewMode === 'rewards'
              ? 'Kho báu & Phần thưởng'
              : viewMode === 'curriculum'
              ? 'Chương trình học tập'
              : undefined
          }
          subtitle={
            viewMode === 'lesson'
              ? `Chủ đề: ${activeLesson.title}`
              : undefined
          }
        />

        {/* Dynamic Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {viewMode === 'dashboard' && (
            <DashboardView
              profile={profile}
              missions={missions}
              onToggleMission={handleToggleMission}
              onStartSubject={handleStartSubject}
              onStartAiPractice={handleStartAiPractice}
              onOpenFastTest={() => setViewMode('fast-test')}
              onOpenRewards={() => setViewMode('rewards')}
              onOpenAchievements={() => setViewMode('achievements')}
              onOpenDivisionTopic={() => {
                handleGradeChange(4);
                handleStartSubject('math', 'math-g4-1', 4);
              }}
            />
          )}

          {viewMode === 'lesson' && (
            <LessonView
              lesson={activeLesson}
              profile={profile}
              onBack={() => setViewMode('dashboard')}
              onCompleteLesson={handleCompleteLesson}
              onOpenFastTest={() => setViewMode('fast-test')}
              onUpdateMastery={handleUpdateMastery}
            />
          )}

          {viewMode === 'fast-test' && (
            <FastTestView
              profile={profile}
              onClose={() => setViewMode('dashboard')}
              onPassFastTest={handlePassFastTest}
              onFailFastTest={handleFailFastTest}
            />
          )}

          {viewMode === 'practice' && (
            <LessonView
              lesson={activeLesson}
              profile={profile}
              onBack={() => setViewMode('dashboard')}
              onCompleteLesson={handleCompleteLesson}
              onOpenFastTest={() => setViewMode('fast-test')}
              onUpdateMastery={handleUpdateMastery}
            />
          )}

          {viewMode === 'ai-tutor' && (
            <AITutorView
              profile={profile}
              onStartPracticeLesson={handleStartAiPractice}
            />
          )}

          {viewMode === 'curriculum' && (
            <CurriculumView
              currentGrade={profile.grade}
              onSelectGrade={handleGradeChange}
              onStartLesson={handleStartSubject}
              onOpenFastTest={() => setViewMode('fast-test')}
            />
          )}

          {viewMode === 'achievements' && (
            <AchievementsView
              profile={profile}
              onOpenLesson={() => handleStartSubject('math')}
            />
          )}

          {viewMode === 'rewards' && (
            <RewardsView
              profile={profile}
              onClaimChest={handleClaimChest}
            />
          )}
        </main>
      </div>

      {/* Floating Encouragement Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#24324A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn border border-slate-700">
          <span className="text-xl">✨</span>
          <span className="font-bold text-sm">{toastNotification}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={viewMode}
        onSelectView={(v) => setViewMode(v)}
      />
    </div>
  );
}
