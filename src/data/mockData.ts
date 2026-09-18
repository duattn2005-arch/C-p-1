import { DailyMission, StudentProfile } from '../types';

export const initialStudentProfile: StudentProfile = {
  name: 'Minh',
  grade: 3,
  streakDays: 5,
  xp: 1250,
  level: 8,
  levelProgress: 75,
  accuracyRate: 95,
  dailyGoalMinutes: 15,
  studiedMinutesToday: 10,
  weeklyTotalMinutes: 85,
  mathMastery: 48, // Kỹ năng phép trừ có nhớ đang ở 48%
  vietnameseMastery: 45,
  englishMastery: 80,
};

export const defaultMissions: DailyMission[] = [
  {
    id: 'mission-1',
    title: '1 bài ôn tập Toán',
    subtitle: 'Tuyệt vời! Đã xong ✨',
    xpReward: 20,
    completed: true,
    subject: 'math',
  },
  {
    id: 'mission-2',
    title: '5 từ tiếng Anh mới',
    subtitle: 'Đã làm 3/5 từ',
    xpReward: 15,
    completed: false,
    subject: 'english',
  },
  {
    id: 'mission-3',
    title: '1 bài đọc Tiếng Việt',
    subtitle: 'Chưa bắt đầu',
    xpReward: 15,
    completed: false,
    subject: 'vietnamese',
  },
];
