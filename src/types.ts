export type SubjectId = 'math' | 'vietnamese' | 'english';

export type ViewMode = 
  | 'dashboard' 
  | 'lesson' 
  | 'fast-test' 
  | 'practice' 
  | 'ai-tutor' 
  | 'achievements' 
  | 'rewards' 
  | 'curriculum'
  | 'admin';

export interface AnswerOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  subPrompt?: string;
  formula?: string;
  options: AnswerOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  hint: string;
  stepByStep: string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Lesson {
  id: string;
  subjectId: SubjectId;
  subjectName: string;
  grade: number;
  title: string;
  topic: string;
  currentQuestionIndex: number;
  questions: Question[];
}

export interface DailyMission {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  completed: boolean;
  subject: SubjectId;
}

export interface StudentProfile {
  name: string;
  grade: number;
  streakDays: number;
  xp: number;
  level: number;
  levelProgress: number; // 0-100
  accuracyRate: number; // 0-100
  dailyGoalMinutes: number;
  studiedMinutesToday: number;
  weeklyTotalMinutes: number;
  mathMastery: number;
  vietnameseMastery: number;
  englishMastery: number;
}
