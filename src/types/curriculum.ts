export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type SubjectId = 'math' | 'vietnamese' | 'english';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type QuestionType = 'multiple_choice' | 'fill_in' | 'true_false';

export type SkillMasteryStatus = 'needs_practice' | 'developing' | 'learning' | 'mastered';

export interface Topic {
  id: string;
  grade: GradeLevel;
  subject_id: SubjectId;
  name: string;
  description: string;
  icon: string;
  order_index: number;
}

export interface Skill {
  id: string;
  grade: GradeLevel;
  subject_id: SubjectId;
  topic_id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  order_index: number;
}

export interface CurriculumLesson {
  id: string;
  grade: GradeLevel;
  subject_id: SubjectId;
  topic_id: string;
  skill_id: string;
  title: string;
  description: string;
  theory_summary?: string;
  order_index: number;
}

export interface CurriculumQuestion {
  id: string;
  grade: GradeLevel;
  subject: SubjectId;
  topic: string;
  skill: string;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  question_content: string;
  formula?: string;
  subPrompt?: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
  hint: string;
  hint_level_2?: string;
  step_by_step?: string[];
  source_type: 'curriculum' | 'ai_generated' | 'teacher_created';
  ai_generated: boolean;
  validation_status: 'approved' | 'pending' | 'rejected';
}

export interface StudentSkillMastery {
  student_id: string;
  skill_id: string;
  mastery_score: number; // 0 - 100
  attempts: number;
  correct_attempts: number;
  recent_accuracy: number; // 0 - 100
  current_difficulty: DifficultyLevel;
  last_practiced_at: string;
  status: SkillMasteryStatus;
}

export interface XPTransaction {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  source_id: string;
  timestamp: string;
}

export interface StudentAttempt {
  id: string;
  student_id: string;
  question_id: string;
  skill_id: string;
  chosen_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  timestamp: string;
}

export interface PreTestResult {
  skill_id: string;
  total_questions: number;
  correct_count: number;
  passed: boolean;
  recommended_action: 'pass_mastered' | 'confirm_questions' | 'short_lesson' | 'full_lesson';
}
