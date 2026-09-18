import { 
  DifficultyLevel, 
  SkillMasteryStatus, 
  StudentSkillMastery, 
  Skill 
} from '../types/curriculum';

export function calculateMasteryStatus(score: number): SkillMasteryStatus {
  if (score >= 90) return 'mastered';
  if (score >= 70) return 'learning';
  if (score >= 50) return 'developing';
  return 'needs_practice';
}

export function createInitialMastery(studentId: string, skillId: string, initialScore: number = 0): StudentSkillMastery {
  return {
    student_id: studentId,
    skill_id: skillId,
    mastery_score: initialScore,
    attempts: 0,
    correct_attempts: 0,
    recent_accuracy: 0,
    current_difficulty: 2,
    last_practiced_at: new Date().toISOString(),
    status: calculateMasteryStatus(initialScore),
  };
}

/**
 * Adaptive mastery engine calculation
 * Implements weighted knowledge state updating ready for BKT/Elo extension
 */
export function updateSkillMasteryAfterAnswer(
  current: StudentSkillMastery,
  isCorrect: boolean,
  questionDifficulty: DifficultyLevel,
  consecutiveStreak: number
): StudentSkillMastery {
  const attempts = current.attempts + 1;
  const correct_attempts = current.correct_attempts + (isCorrect ? 1 : 0);

  // Exponential moving average for recent accuracy (alpha = 0.3)
  const previousAccuracy = current.recent_accuracy || (attempts > 1 ? (current.correct_attempts / (attempts - 1)) * 100 : 0);
  const currentOutcomeValue = isCorrect ? 100 : 0;
  const recent_accuracy = Math.round(previousAccuracy * 0.7 + currentOutcomeValue * 0.3);

  let scoreDelta = 0;
  let nextDifficulty = current.current_difficulty;

  if (isCorrect) {
    // Correct answer gain depends on question difficulty and streak
    const baseGain = 7 + questionDifficulty * 2;
    const streakBonus = Math.min(6, Math.floor(consecutiveStreak / 2) * 2);
    scoreDelta = baseGain + streakBonus;

    // Adaptive increase in difficulty if answering correctly on medium/high streaks
    if (consecutiveStreak >= 2 && nextDifficulty < 5) {
      nextDifficulty = (nextDifficulty + 1) as DifficultyLevel;
    }
  } else {
    // Penalty on mistake
    const basePenalty = 8 - Math.min(3, questionDifficulty);
    scoreDelta = -basePenalty;

    // Adaptive decrease in difficulty if struggling
    if (consecutiveStreak <= -2 && nextDifficulty > 1) {
      nextDifficulty = (nextDifficulty - 1) as DifficultyLevel;
    }
  }

  const newScore = Math.min(100, Math.max(0, current.mastery_score + scoreDelta));
  const newStatus = calculateMasteryStatus(newScore);

  return {
    ...current,
    attempts,
    correct_attempts,
    recent_accuracy,
    current_difficulty: nextDifficulty,
    mastery_score: newScore,
    status: newStatus,
    last_practiced_at: new Date().toISOString(),
  };
}

/**
 * Pre-test / Quick Check evaluator
 * 5/5: pass_mastered (mastery set to 95)
 * 4/5: confirm_questions (ask 2 confirmation questions)
 * 3/5: short_lesson
 * <3/5: full_lesson
 */
export function evaluatePreTestScore(correctCount: number, totalQuestions: number = 5): {
  passed: boolean;
  masteryScore: number;
  action: 'pass_mastered' | 'confirm_questions' | 'short_lesson' | 'full_lesson';
  message: string;
} {
  if (correctCount >= 5) {
    return {
      passed: true,
      masteryScore: 95,
      action: 'pass_mastered',
      message: 'Xuất sắc tuyệt đối (5/5)! Con đã hoàn toàn làm chủ kiến thức cơ bản này! 🏆',
    };
  }
  if (correctCount === 4) {
    return {
      passed: true,
      masteryScore: 80,
      action: 'confirm_questions',
      message: 'Rất tốt (4/5)! Hãy trả lời thêm 2 câu thử thách để đạt danh hiệu Thành thạo nhé! ⚡',
    };
  }
  if (correctCount === 3) {
    return {
      passed: false,
      masteryScore: 60,
      action: 'short_lesson',
      message: 'Khá tốt (3/5)! Con chỉ cần ôn luyện bài học rút gọn vài phút là nắm chắc rồi! 📖',
    };
  }
  return {
    passed: false,
    masteryScore: 35,
    action: 'full_lesson',
    message: 'Kiddo AI sẽ đồng hành hướng dẫn con học kỹ từng bước để hiểu sâu bài học này nhé! 🚀',
  };
}

/**
 * Identify the student's weakest skill to personalize Practice Session
 */
export function findWeakestSkill(
  masteries: Record<string, StudentSkillMastery>,
  availableSkills: Skill[]
): Skill | null {
  if (!availableSkills || availableSkills.length === 0) return null;

  let weakestSkill: Skill | null = null;
  let lowestScore = 999;

  for (const skill of availableSkills) {
    const record = masteries[skill.id];
    const score = record ? record.mastery_score : 0;
    if (score < lowestScore) {
      lowestScore = score;
      weakestSkill = skill;
    }
  }

  return weakestSkill || availableSkills[0] || null;
}
