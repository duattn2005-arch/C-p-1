import type { OptionFace, QuestionVisual } from './types/curriculum';

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
  face?: OptionFace;
}

export interface Question {
  id: string;
  skillId?: string; // the skill this question trains (a practice lesson mixes several skills)
  prompt: string;
  subPrompt?: string;
  formula?: string;
  visual?: QuestionVisual;
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
  isPractice?: boolean; // built from the child's mistakes instead of being one fixed skill
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
