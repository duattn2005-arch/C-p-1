import type { Question } from '../types';
import type { StudentAttempt } from '../types/curriculum';

// Builds the record of one answer from what was on screen, so the tutor can later talk about the real mistake.
export function describeAttempt(
  q: Question,
  chosenId: string,
  opts: { fallbackSkillId: string; startedAt: number; hintStage?: number; source: NonNullable<StudentAttempt['source']> }
): Omit<StudentAttempt, 'id' | 'timestamp'> {
  const chosen = q.options.find((o) => o.id === chosenId);
  const right = q.options.find((o) => o.id === q.correctOptionId);
  const text = [q.prompt, q.formula, q.subPrompt].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  return {
    student_id: 'student_1',
    question_id: q.id,
    skill_id: q.skillId ?? opts.fallbackSkillId,
    chosen_answer: chosen?.text ?? chosenId,
    correct_answer: right?.text ?? '',
    question_text: text.length > 300 ? text.slice(0, 299) + '…' : text,
    is_correct: chosenId === q.correctOptionId,
    time_spent_seconds: Math.max(1, Math.round((Date.now() - opts.startedAt) / 1000)),
    hint_stage: opts.hintStage ?? 0,
    source: opts.source,
  };
}
