import type { SkillDef } from './core.js';
import { mathGrade1 } from './math1.js';
import { mathGrade2 } from './math2.js';
import { mathGrade3 } from './math3.js';
import { mathGrade4 } from './math4.js';
import { mathGrade5 } from './math5.js';
import { englishGrade1, englishGrade2 } from './english12.js';
import { englishGrade3, englishGrade4, englishGrade5 } from './english345.js';

// topic id -> the three skills taught in that topic (each skill knows how to make its own questions)
export const topicSkillDefs: Record<string, SkillDef[]> = {
  ...mathGrade1,
  ...mathGrade2,
  ...mathGrade3,
  ...mathGrade4,
  ...mathGrade5,
  ...englishGrade1,
  ...englishGrade2,
  ...englishGrade3,
  ...englishGrade4,
  ...englishGrade5,
};
