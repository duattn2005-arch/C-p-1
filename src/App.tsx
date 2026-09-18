import React, { useState, useEffect } from 'react';
import { ViewMode, SubjectId, Lesson, StudentProfile, DailyMission } from './types';
import { GradeLevel } from './types/curriculum';
import { 
  initialStudentProfile, 
  defaultMissions 
} from './data/mockData';
import { 
  skillsDatabase, 
  getSkillById, 
  getQuestionsBySkill, 
  toLegacyLesson,
  getSkillsByTopic,
  topicsDatabase
} from './data/curriculumData';
import { getLessonForGradeAndSubject } from './data/gradeCurriculum';
import { storageService } from './services/storage';
import { findWeakestSkill } from './services/mastery';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LessonView } from './components/LessonView';
import { FastTestView } from './components/FastTestView';
import { AITutorView } from './components/AITutorView';
import { CurriculumView } from './components/CurriculumView';
import { AchievementsView } from './components/AchievementsView';
import { RewardsView } from './components/RewardsView';
import { AdminView } from './components/AdminView';
import { OnboardingModal } from './components/OnboardingModal';
import { MobileNav } from './components/MobileNav';
import confetti from 'canvas-confetti';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(() => storageService.getProfile());
  const [missions, setMissions] = useState<DailyMission[]>(() => storageService.getDailyMissions());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !storageService.isOnboardingCompleted());
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Active lesson state
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    const p = storageService.getProfile();
    const gSkills = skillsDatabase.filter((s) => s.grade === p.grade && s.subject_id === 'math');
    if (gSkills.length > 0) {
      const qList = getQuestionsBySkill(gSkills[0].id);
      return toLegacyLesson(gSkills[0], qList);
    }
    return getLessonForGradeAndSubject(p.grade, 'math');
  });

  // Show cheerful floating toast
  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Change grade handler
  const handleGradeChange = (newGrade: number) => {
    const gl = (Math.max(1, Math.min(5, newGrade)) as GradeLevel);
    const updated = storageService.updateGrade(gl);
    setProfile(updated);
    showToast(`Đã chuyển sang chương trình học Lớp ${gl}! 🎓`);
  };

  // Onboarding grade selection
  const handleOnboardingSelectGrade = (grade: GradeLevel) => {
    const updated = storageService.updateGrade(grade);
    storageService.setOnboardingCompleted(true);
    setProfile(updated);
    setIsOnboardingOpen(false);
    showToast(`Chào mừng con đến với chương trình học Lớp ${grade}! 🚀`);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#68D5B5', '#5BA7FF', '#FFD65A', '#A99CFB'],
      });
    } catch (e) {}
  };

  // Toggle mission status
  const handleToggleMission = (missionId: string) => {
    setMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.id === missionId) {
          const nextState = !m.completed;
          if (nextState) {
            // Reward XP on completion with storage persistence
            const res = storageService.addXP(m.xpReward, `Hoàn thành nhiệm vụ: ${m.title}`, m.id);
            setProfile(storageService.getProfile());
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
      });
      storageService.saveDailyMissions(updated);
      return updated;
    });
  };

  // Start specific subject lesson with grade and skillId
  const handleStartSubject = (subjectId: SubjectId, skillOrLessonId?: string, grade?: number) => {
    const targetGrade = grade || profile.grade;

    if (skillOrLessonId) {
      const skill = getSkillById(skillOrLessonId);
      if (skill) {
        const questions = getQuestionsBySkill(skill.id);
        const lesson = toLegacyLesson(skill, questions);
        setActiveLesson(lesson);
        setViewMode('lesson');
        return;
      }
    }

    // Look for first skill of target subject & grade
    const gradeSkills = skillsDatabase.filter((s) => s.grade === targetGrade && s.subject_id === subjectId);
    if (gradeSkills.length > 0) {
      const firstSkill = gradeSkills[0];
      const questions = getQuestionsBySkill(firstSkill.id);
      const lesson = toLegacyLesson(firstSkill, questions);
      setActiveLesson(lesson);
      setViewMode('lesson');
      return;
    }

    const lesson = getLessonForGradeAndSubject(targetGrade, subjectId, skillOrLessonId);
    setActiveLesson(lesson);
    setViewMode('lesson');
  };

  // AI Spotlight button -> 5 min practice tailored to child's weakest skill
  const handleStartAiPractice = () => {
    const masteries = storageService.getAllMasteries();
    const gradeSkills = skillsDatabase.filter((s) => s.grade === profile.grade);
    const weakest = findWeakestSkill(masteries, gradeSkills);

    if (weakest) {
      const questions = getQuestionsBySkill(weakest.id);
      const lesson = toLegacyLesson(weakest, questions);
      setActiveLesson(lesson);
      setViewMode('lesson');
      showToast(`Bắt đầu thử thách 5 phút rèn luyện "${weakest.name}"! 🤖`);
    } else {
      handleStartSubject('math', undefined, profile.grade);
    }
  };

  // Fast Test Pass
  const handlePassFastTest = (earnedXp: number, newMastery: number) => {
    storageService.addXP(earnedXp, 'Vượt cấp kiểm tra nhanh', 'fast-test');
    const updated = storageService.getProfile();
    setProfile({
      ...updated,
      mathMastery: newMastery,
      studiedMinutesToday: Math.min(updated.dailyGoalMinutes, updated.studiedMinutesToday + 5),
    });
    showToast(`Chúc mừng con đã vượt cấp thành công! +${earnedXp} XP 🏆`);
    setViewMode('dashboard');
  };

  // Fast Test Fail -> redirect to learn
  const handleFailFastTest = () => {
    handleStartSubject('math', undefined, profile.grade);
    showToast('Kiddo AI sẽ đồng hành cùng con nắm chắc bài học này nhé! 🚀');
  };

  // Lesson completed
  const handleCompleteLesson = (earnedXp: number) => {
    storageService.addXP(earnedXp, `Hoàn thành bài học: ${activeLesson.title}`, activeLesson.id);
    const updated = storageService.getProfile();
    setProfile({
      ...updated,
      studiedMinutesToday: Math.min(updated.dailyGoalMinutes, updated.studiedMinutesToday + 5),
    });
    showToast(`Xuất sắc! Hoàn thành bài học: +${earnedXp} XP 🎉`);
    setViewMode('dashboard');
  };

  // Claim chest
  const handleClaimChest = (xpAmount: number) => {
    storageService.addXP(xpAmount, 'Nhận rương phần thưởng tuần', 'weekly-chest');
    setProfile(storageService.getProfile());
    showToast(`Đã nhận quà tuần: +${xpAmount} XP 🎁`);
  };

  // Update mastery directly from lesson answering
  const handleUpdateMastery = (newMastery: number) => {
    setProfile(storageService.getProfile());
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
        {/* Persistent Top Header */}
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
              : viewMode === 'admin'
              ? 'Quản trị CMS'
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
                handleStartSubject('math', 'g4-m-s1', 4);
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
              onUpdateXP={() => setProfile(storageService.getProfile())}
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

          {viewMode === 'admin' && (
            <AdminView
              onBackToDashboard={() => setViewMode('dashboard')}
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

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onSelectGrade={handleOnboardingSelectGrade}
      />
    </div>
  );
}
