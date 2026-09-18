import { StudentProfile, DailyMission } from '../types';
import { 
  GradeLevel, 
  StudentSkillMastery, 
  XPTransaction, 
  StudentAttempt, 
  CurriculumQuestion 
} from '../types/curriculum';
import { defaultMissions, initialStudentProfile } from '../data/mockData';
import { createInitialMastery } from './mastery';
import { activityStats } from './insights';

const STORAGE_KEYS = {
  PROFILE: 'kiddo_student_profile',
  MASTERIES: 'kiddo_student_masteries',
  XP_TRANSACTIONS: 'kiddo_xp_transactions',
  ATTEMPTS: 'kiddo_student_attempts',
  MISSIONS: 'kiddo_daily_missions',
  ONBOARDED: 'kiddo_onboarding_completed',
  AI_QUESTIONS: 'kiddo_ai_questions',
  DATA_VERSION: 'kiddo_data_version',
};

// Bump when stored progress stops matching the content (old skill ids, sample numbers...)
const DATA_VERSION = 2;
const MAX_ATTEMPTS = 600;

// Safe JSON get/set
function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const storageService = {
  // Student Profile
  getProfile(): StudentProfile {
    return getStoredItem<StudentProfile>(STORAGE_KEYS.PROFILE, initialStudentProfile);
  },

  saveProfile(profile: StudentProfile): void {
    setStoredItem(STORAGE_KEYS.PROFILE, profile);
  },

  updateGrade(grade: GradeLevel): StudentProfile {
    const p = this.getProfile();
    const updated: StudentProfile = {
      ...p,
      grade,
    };
    this.saveProfile(updated);
    return updated;
  },

  isOnboardingCompleted(): boolean {
    return getStoredItem<boolean>(STORAGE_KEYS.ONBOARDED, false);
  },

  setOnboardingCompleted(completed: boolean): void {
    setStoredItem(STORAGE_KEYS.ONBOARDED, completed);
  },

  // Skill Masteries
  getAllMasteries(): Record<string, StudentSkillMastery> {
    return getStoredItem<Record<string, StudentSkillMastery>>(STORAGE_KEYS.MASTERIES, {});
  },

  getSkillMastery(skillId: string): StudentSkillMastery {
    const all = this.getAllMasteries();
    if (!all[skillId]) {
      all[skillId] = createInitialMastery('student_1', skillId, 0);
      setStoredItem(STORAGE_KEYS.MASTERIES, all);
    }
    return all[skillId];
  },

  saveSkillMastery(mastery: StudentSkillMastery): void {
    const all = this.getAllMasteries();
    all[mastery.skill_id] = mastery;
    setStoredItem(STORAGE_KEYS.MASTERIES, all);
  },

  // XP & Gamification with Anti-Exploit
  getXPTransactions(): XPTransaction[] {
    return getStoredItem<XPTransaction[]>(STORAGE_KEYS.XP_TRANSACTIONS, []);
  },

  addXP(amount: number, reason: string, sourceId: string): { success: boolean; newTotalXP: number } {
    const profile = this.getProfile();
    const txs = this.getXPTransactions();

    // Prevent exploit: if source is already rewarded for completion within last 5 minutes
    const recentTx = txs.find(
      (t) => t.source_id === sourceId && (Date.now() - new Date(t.timestamp).getTime()) < 300000 && reason.includes('Hoàn thành')
    );

    if (recentTx) {
      return { success: false, newTotalXP: profile.xp };
    }

    const tx: XPTransaction = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      student_id: 'student_1',
      amount,
      reason,
      source_id: sourceId,
      timestamp: new Date().toISOString(),
    };

    txs.push(tx);
    setStoredItem(STORAGE_KEYS.XP_TRANSACTIONS, txs);

    const newXP = profile.xp + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    const levelProgress = Math.min(100, Math.round(((newXP % 200) / 200) * 100));

    const updatedProfile: StudentProfile = {
      ...profile,
      xp: newXP,
      level: newLevel,
      levelProgress,
    };

    this.saveProfile(updatedProfile);
    return { success: true, newTotalXP: newXP };
  },

  // Student Attempts Log
  recordAttempt(attempt: Omit<StudentAttempt, 'id' | 'timestamp'>): void {
    const attempts = getStoredItem<StudentAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
    attempts.push({
      ...attempt,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    });
    const kept = attempts.slice(-MAX_ATTEMPTS);
    setStoredItem(STORAGE_KEYS.ATTEMPTS, kept);

    // Streak, minutes studied and accuracy come from what the child really did, never from a counter
    const activity = activityStats(kept);
    this.saveProfile({
      ...this.getProfile(),
      streakDays: activity.streakDays,
      studiedMinutesToday: activity.todayMinutes,
      weeklyTotalMinutes: activity.weekTotal,
      accuracyRate: activity.accuracy ?? 0,
    });
  },

  getAttempts(): StudentAttempt[] {
    return getStoredItem<StudentAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
  },

  getRecentMistakes(limit: number = 5): StudentAttempt[] {
    return this.getAttempts().filter((a) => !a.is_correct).slice(-limit);
  },

  // Daily Missions
  getDailyMissions(): DailyMission[] {
    return getStoredItem<DailyMission[]>(STORAGE_KEYS.MISSIONS, defaultMissions);
  },

  saveDailyMissions(missions: DailyMission[]): void {
    setStoredItem(STORAGE_KEYS.MISSIONS, missions);
  },

  // AI Generated & Published Questions Cache
  getAiGeneratedQuestions(): CurriculumQuestion[] {
    return getStoredItem<CurriculumQuestion[]>(STORAGE_KEYS.AI_QUESTIONS, []);
  },

  saveAiGeneratedQuestion(q: CurriculumQuestion): void {
    const list = this.getAiGeneratedQuestions();
    list.unshift(q);
    setStoredItem(STORAGE_KEYS.AI_QUESTIONS, list);
  },
};

// The questions were rewritten grade by grade, so progress saved against the old placeholder skills means nothing,
// and the first version shipped made-up numbers (1,250 XP, 48% mastery, a 5-day streak). Start from the truth, once.
function migrateStoredData(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (getStoredItem<number>(STORAGE_KEYS.DATA_VERSION, 1) >= DATA_VERSION) return;
    const old = localStorage.getItem(STORAGE_KEYS.PROFILE);
    for (const key of [STORAGE_KEYS.MASTERIES, STORAGE_KEYS.ATTEMPTS, STORAGE_KEYS.XP_TRANSACTIONS, STORAGE_KEYS.MISSIONS]) {
      localStorage.removeItem(key);
    }
    if (old) {
      const p = JSON.parse(old) as StudentProfile; // keep who the child is and which grade they chose
      localStorage.setItem(
        STORAGE_KEYS.PROFILE,
        JSON.stringify({ ...initialStudentProfile, name: p.name || initialStudentProfile.name, grade: p.grade || initialStudentProfile.grade, dailyGoalMinutes: p.dailyGoalMinutes || initialStudentProfile.dailyGoalMinutes })
      );
    }
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, JSON.stringify(DATA_VERSION));
  } catch (e) {
    console.error('Storage migration failed:', e);
  }
}

migrateStoredData();
