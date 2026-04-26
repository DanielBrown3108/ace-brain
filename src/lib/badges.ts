// Mastery badges — purely derived from existing data (lesson_progress,
// lesson_comments) so no extra schema is needed.

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  earned: boolean;
  progress?: { current: number; goal: number };
};

type Inputs = {
  totalLessonsDone: number;
  currentStreak: number;
  longestStreak: number;
  maxLessonsInOneDay: number;
  commentsPosted: number;
  apOneCompleted: boolean;
};

export function computeBadges(input: Inputs): Badge[] {
  const all: Array<Omit<Badge, "earned" | "progress"> & {
    earned: boolean;
    progress?: { current: number; goal: number };
  }> = [
    {
      id: "first-steps",
      emoji: "🥇",
      title: "First steps",
      description: "Completed your first lesson.",
      earned: input.totalLessonsDone >= 1,
      progress: { current: Math.min(input.totalLessonsDone, 1), goal: 1 },
    },
    {
      id: "marathoner",
      emoji: "🏃",
      title: "Marathoner",
      description: "Completed 10 lessons.",
      earned: input.totalLessonsDone >= 10,
      progress: { current: Math.min(input.totalLessonsDone, 10), goal: 10 },
    },
    {
      id: "centurion",
      emoji: "💯",
      title: "Centurion",
      description: "Completed 100 lessons.",
      earned: input.totalLessonsDone >= 100,
      progress: { current: Math.min(input.totalLessonsDone, 100), goal: 100 },
    },
    {
      id: "week-streak",
      emoji: "🔥",
      title: "On a roll",
      description: "Studied 7 days in a row.",
      earned: input.longestStreak >= 7,
      progress: { current: Math.min(input.longestStreak, 7), goal: 7 },
    },
    {
      id: "month-streak",
      emoji: "🚀",
      title: "Unstoppable",
      description: "Studied 30 days in a row.",
      earned: input.longestStreak >= 30,
      progress: { current: Math.min(input.longestStreak, 30), goal: 30 },
    },
    {
      id: "quick-learner",
      emoji: "⚡",
      title: "Quick learner",
      description: "Completed 5 lessons in a single day.",
      earned: input.maxLessonsInOneDay >= 5,
      progress: { current: Math.min(input.maxLessonsInOneDay, 5), goal: 5 },
    },
    {
      id: "ap1-scholar",
      emoji: "🩺",
      title: "A&P I scholar",
      description: "Completed every lesson in Anatomy & Physiology I.",
      earned: input.apOneCompleted,
    },
    {
      id: "discussion-starter",
      emoji: "💬",
      title: "Discussion starter",
      description: "Posted 5 comments.",
      earned: input.commentsPosted >= 5,
      progress: { current: Math.min(input.commentsPosted, 5), goal: 5 },
    },
  ];
  return all;
}
