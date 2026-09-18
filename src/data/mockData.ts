import { DailyMission, StudentProfile } from '../types';

// A new child starts with nothing: every number below is filled in from the answers they really give
export const initialStudentProfile: StudentProfile = {
  name: 'Minh',
  grade: 3,
  streakDays: 0,
  xp: 0,
  level: 1,
  levelProgress: 0,
  accuracyRate: 0,
  dailyGoalMinutes: 15,
  studiedMinutesToday: 0,
  weeklyTotalMinutes: 0,
  mathMastery: 0,
  vietnameseMastery: 0,
  englishMastery: 0,
};

export const defaultMissions: DailyMission[] = [
  { id: 'mission-1', title: '1 bài ôn tập Toán', subtitle: 'Chưa bắt đầu', xpReward: 20, completed: false, subject: 'math' },
  { id: 'mission-2', title: '1 bài Tiếng Anh', subtitle: 'Chưa bắt đầu', xpReward: 15, completed: false, subject: 'english' },
  { id: 'mission-3', title: '1 bài đọc Tiếng Việt', subtitle: 'Chưa bắt đầu', xpReward: 15, completed: false, subject: 'vietnamese' },
];
