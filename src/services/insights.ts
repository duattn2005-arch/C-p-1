import type { Skill, StudentAttempt, StudentSkillMastery, SubjectId } from '../types/curriculum';

// Reads the log of answers the child really gave and works out where they are weak.
// Nothing here invents data: a skill the child never answered is "not started", never "weak".

const WINDOW = 12; // the latest answers of a skill that decide whether it is weak
const MIN_ERRORS = 2; // one slip is not a pattern
const WEAK_BELOW = 70; // % correct in that window
const MAX_SECONDS = 120; // an answer never counts for more than this (a tab left open is not study time)
const ENOUGH_ANSWERS = 5; // below this the tutor says it has too little data

export interface OpenMistake {
  skillId: string;
  questionId: string;
  question: string;
  chosen: string;
  correct: string;
  at: string;
}

export interface SkillStat {
  skill: Skill;
  answered: number;
  correct: number;
  accuracy: number; // % over every answer
  recentAnswered: number;
  recentErrors: number;
  recentAccuracy: number; // % over the latest WINDOW answers
  openMistakes: number; // questions whose latest answer is still wrong
  lastAt: string;
  mastery: number;
}

export interface Activity {
  streakDays: number;
  todayMinutes: number;
  weekMinutes: number[]; // Monday .. Sunday of the current week
  weekTotal: number;
  todayIndex: number; // 0 = Monday
  accuracy: number | null; // null when nothing was answered yet
}

export interface Insights extends Activity {
  answered: number;
  correct: number;
  todayAnswered: number;
  todayCorrect: number;
  todaySkills: Skill[];
  stats: SkillStat[]; // skills with at least one answer
  weak: SkillStat[]; // worst first
  strong: SkillStat[];
  untouched: Skill[]; // never answered, in curriculum order
  mistakes: OpenMistake[]; // newest first
  next: Skill | null; // where to continue: the first skill not mastered yet
  level: 'none' | 'few' | 'enough';
}

const dayKey = (d: Date): string => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const seconds = (a: StudentAttempt): number => Math.max(0, Math.min(MAX_SECONDS, Number(a.time_spent_seconds) || 0));
const toMinutes = (sec: number): number => (sec > 0 ? Math.max(1, Math.round(sec / 60)) : 0);

// Streak, minutes and accuracy over every answer ever given (any grade)
export function activityStats(attempts: StudentAttempt[], now: Date = new Date()): Activity {
  const days = new Set(attempts.map((a) => dayKey(new Date(a.timestamp))));
  const cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // yesterday still keeps a streak alive
  let streakDays = 0;
  while (days.has(dayKey(cursor))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const todayIndex = (now.getDay() + 6) % 7;
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - todayIndex);
  const secByDay = [0, 0, 0, 0, 0, 0, 0];
  for (const a of attempts) {
    const diff = Math.round((startOfDay(new Date(a.timestamp)).getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) secByDay[diff] += seconds(a);
  }
  const weekMinutes = secByDay.map(toMinutes);
  const correct = attempts.filter((a) => a.is_correct).length;

  return {
    streakDays,
    todayMinutes: weekMinutes[todayIndex],
    weekMinutes,
    weekTotal: weekMinutes.reduce((sum, m) => sum + m, 0),
    todayIndex,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : null,
  };
}

// `skills` are the skills of the grade the child is studying now, in curriculum order
export function analyzeLearning(
  attempts: StudentAttempt[],
  skills: Skill[],
  masteries: Record<string, StudentSkillMastery>,
  now: Date = new Date()
): Insights {
  const bySkill = new Map<string, StudentAttempt[]>();
  for (const a of [...attempts].sort((x, y) => x.timestamp.localeCompare(y.timestamp))) {
    if (!bySkill.has(a.skill_id)) bySkill.set(a.skill_id, []);
    bySkill.get(a.skill_id)!.push(a);
  }

  const stats: SkillStat[] = [];
  const untouched: Skill[] = [];
  const mistakes: OpenMistake[] = [];
  let answered = 0;
  let correct = 0;
  let todayAnswered = 0;
  let todayCorrect = 0;
  const today = dayKey(now);
  const todaySkills: Skill[] = [];

  for (const skill of skills) {
    const list = bySkill.get(skill.id) ?? [];
    if (list.length === 0) {
      untouched.push(skill);
      continue;
    }
    const ok = list.filter((a) => a.is_correct).length;
    const recent = list.slice(-WINDOW);
    const recentErrors = recent.filter((a) => !a.is_correct).length;

    // A question counts as an open mistake while its latest answer is wrong
    const latest = new Map<string, StudentAttempt>();
    for (const a of list) latest.set(a.question_id, a);
    const open = [...latest.values()].filter((a) => !a.is_correct);
    for (const a of open) {
      mistakes.push({
        skillId: skill.id,
        questionId: a.question_id,
        question: a.question_text ?? '',
        chosen: a.chosen_answer,
        correct: a.correct_answer ?? '',
        at: a.timestamp,
      });
    }

    const todays = list.filter((a) => dayKey(new Date(a.timestamp)) === today);
    if (todays.length) todaySkills.push(skill);
    todayAnswered += todays.length;
    todayCorrect += todays.filter((a) => a.is_correct).length;
    answered += list.length;
    correct += ok;

    stats.push({
      skill,
      answered: list.length,
      correct: ok,
      accuracy: Math.round((ok / list.length) * 100),
      recentAnswered: recent.length,
      recentErrors,
      recentAccuracy: Math.round(((recent.length - recentErrors) / recent.length) * 100),
      openMistakes: open.length,
      lastAt: list[list.length - 1].timestamp,
      mastery: masteries[skill.id]?.mastery_score ?? 0,
    });
  }

  const weak = stats
    .filter((s) => s.recentErrors >= MIN_ERRORS && s.recentAccuracy < WEAK_BELOW)
    .sort((a, b) => a.recentAccuracy - b.recentAccuracy || b.openMistakes - a.openMistakes || b.lastAt.localeCompare(a.lastAt));
  const strong = stats
    .filter((s) => s.answered >= 4 && s.accuracy >= 85)
    .sort((a, b) => b.accuracy - a.accuracy || b.answered - a.answered);

  mistakes.sort((a, b) => b.at.localeCompare(a.at));

  const next = skills.find((s) => (masteries[s.id]?.mastery_score ?? 0) < 70) ?? skills[0] ?? null;

  return {
    ...activityStats(attempts, now),
    answered,
    correct,
    todayAnswered,
    todayCorrect,
    todaySkills,
    stats,
    weak,
    strong,
    untouched,
    mistakes,
    next,
    level: answered === 0 ? 'none' : answered < ENOUGH_ANSWERS ? 'few' : 'enough',
  };
}

// ---------- what the tutor is told about the child (sent with every chat message) ----------

const SUBJECT_NAME: Record<SubjectId, string> = { math: 'Toán', vietnamese: 'Tiếng Việt', english: 'Tiếng Anh' };
const clip = (s: string, n: number): string => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export interface LearningSummary {
  answeredTotal: number;
  accuracyPercent: number | null;
  enoughData: boolean;
  answeredToday: number;
  correctToday: number;
  skillsToday: string[];
  weakSkills: { skill: string; subject: string; answered: number; wrong: number; accuracyPercent: number }[];
  strongSkills: { skill: string; accuracyPercent: number }[];
  recentMistakes: { skill: string; question: string; childAnswer: string; correctAnswer: string }[];
  notStarted: string[];
}

export function summarizeForTutor(ins: Insights): LearningSummary {
  const nameOf = (id: string) => ins.stats.find((s) => s.skill.id === id)?.skill.name ?? '';
  return {
    answeredTotal: ins.answered,
    accuracyPercent: ins.answered ? Math.round((ins.correct / ins.answered) * 100) : null,
    enoughData: ins.level === 'enough',
    answeredToday: ins.todayAnswered,
    correctToday: ins.todayCorrect,
    skillsToday: ins.todaySkills.map((s) => s.name).slice(0, 5),
    weakSkills: ins.weak.slice(0, 3).map((s) => ({
      skill: s.skill.name,
      subject: SUBJECT_NAME[s.skill.subject_id],
      answered: s.recentAnswered,
      wrong: s.recentErrors,
      accuracyPercent: s.recentAccuracy,
    })),
    strongSkills: ins.strong.slice(0, 3).map((s) => ({ skill: s.skill.name, accuracyPercent: s.accuracy })),
    recentMistakes: ins.mistakes.slice(0, 3).map((m) => ({
      skill: nameOf(m.skillId),
      question: clip(m.question, 160),
      childAnswer: clip(m.chosen, 60),
      correctAnswer: clip(m.correct, 60),
    })),
    notStarted: ins.untouched.slice(0, 3).map((s) => s.name),
  };
}

// ---------- plain-Vietnamese lines for the screen (no server needed, so they never say anything untrue) ----------

export function progressSentence(ins: Insights): string {
  if (ins.level === 'none') return 'Con chưa làm câu nào ở lớp này, nên thầy chưa biết con mạnh hay yếu ở đâu.';
  const acc = Math.round((ins.correct / ins.answered) * 100);
  const base = `Thầy đã xem con làm ${ins.answered} câu, đúng ${ins.correct} câu (${acc}%).`;
  if (ins.level === 'few') return `${base} Mới có ít câu nên thầy chưa kết luận con yếu ở đâu được.`;
  if (ins.weak.length > 0) {
    const w = ins.weak[0];
    return `${base} Phần con hay sai nhất là "${w.skill.name}": đúng ${w.recentAnswered - w.recentErrors}/${w.recentAnswered} câu gần đây.`;
  }
  return `${base} Thầy chưa thấy phần nào con yếu. Con cứ học tiếp bài mới nhé!`;
}

export function tutorGreeting(name: string, grade: number, ins: Insights): string {
  const hello = `Chào ${name}! Thầy là Kiddo AI - gia sư Lớp ${grade} của con 🤖.`;
  if (ins.level === 'none') {
    return `${hello}\n\n${progressSentence(ins)} Con làm vài câu trong mục Học tập trước nhé. Làm xong, thầy sẽ chỉ ra phần con cần luyện thêm.`;
  }
  if (ins.level === 'few') return `${hello}\n\n${progressSentence(ins)} Con làm thêm vài câu nữa nhé.`;
  const tail = ins.weak.length > 0 ? ' Con bấm "Luyện phần con đang yếu" để luyện ngay nhé!' : '';
  return `${hello}\n\n${progressSentence(ins)}${tail}`;
}

export function todaySentence(ins: Insights): string {
  if (ins.todayAnswered === 0) return 'Hôm nay con chưa làm câu nào.';
  const names = ins.todaySkills.map((s) => `"${s.name}"`).join(', ');
  return `Hôm nay con làm ${ins.todayAnswered} câu, đúng ${ins.todayCorrect} câu, ở: ${names}.`;
}
