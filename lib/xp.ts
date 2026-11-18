import { createClient } from "@/lib/supabase/server";

export interface LevelInfo {
  currentLevel: number;
  levelName: string;
  xpForNextLevel: number;
  xpProgress: number;
  nextLevelName: string | null;
  nextLevelXp: number | null;
}

export interface AwardXPResult {
  xpAwarded: number;
  newTotal: number;
  leveledUp: boolean;
  newLevelName: string | null;
  newLevelNumber: number | null;
}

export const XP_THRESHOLDS = [
  { level: 0, name: "Officer Cadet", xp: 0 },
  { level: 1, name: "Lieutenant", xp: 500 },
  { level: 2, name: "Captain", xp: 1500 },
  { level: 3, name: "Major", xp: 3500 },
  { level: 4, name: "Colonel", xp: 7000 },
  { level: 5, name: "Brigadier", xp: 12000 },
  { level: 6, name: "General", xp: 20000 },
];

export const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  PERFECT_SCORE_BONUS: 100,
  HIGH_ACCURACY_BONUS: 50,
  FULL_MOCK_COMPLETED: 150,
  MINI_MOCK_COMPLETED: 50,
  DAILY_QUESTION_CORRECT: 25,
  DAILY_QUESTION_ATTEMPTED: 10,
  WEEK_WARRIOR_STREAK: 150,
  IRON_WILL_STREAK: 500,
  FIRST_TEST_BONUS: 100,
} as const;

export function calculateLevel(totalXp: number): LevelInfo {
  let currentLevel = 0;
  let currentName = XP_THRESHOLDS[0].name;

  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i].xp) {
      currentLevel = XP_THRESHOLDS[i].level;
      currentName = XP_THRESHOLDS[i].name;
      break;
    }
  }

  const currentThreshold = XP_THRESHOLDS.find((t) => t.level === currentLevel)!;
  const nextThreshold = XP_THRESHOLDS.find((t) => t.xp > totalXp);

  if (!nextThreshold) {
    return {
      currentLevel,
      levelName: currentName,
      xpForNextLevel: 0,
      xpProgress: 100,
      nextLevelName: null,
      nextLevelXp: null,
    };
  }

  const xpIntoLevel = totalXp - currentThreshold.xp;
  const xpRequired = nextThreshold.xp - currentThreshold.xp;
  const xpProgress = Math.min((xpIntoLevel / xpRequired) * 100, 100);

  return {
    currentLevel,
    levelName: currentName,
    xpForNextLevel: nextThreshold.xp - totalXp,
    xpProgress,
    nextLevelName: nextThreshold.name,
    nextLevelXp: nextThreshold.xp,
  };
}

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<AwardXPResult> {
  const supabase = await createClient();

  const { error: txError } = await supabase.from("xp_transactions").insert({
    user_id: userId,
    amount,
    reason,
    metadata: metadata || {},
  });

  if (txError) throw txError;

  const { data: levelData } = await supabase
    .from("user_levels")
    .select("total_xp")
    .eq("user_id", userId)
    .maybeSingle();

  const currentTotal = levelData?.total_xp || 0;
  const newTotal = currentTotal + amount;

  const oldLevel = calculateLevel(currentTotal);
  const newLevelInfo = calculateLevel(newTotal);

  const leveledUp = newLevelInfo.currentLevel > oldLevel.currentLevel;

  const { error: upsertError } = await supabase
    .from("user_levels")
    .upsert(
      {
        user_id: userId,
        total_xp: newTotal,
        current_level: newLevelInfo.currentLevel,
        level_name: newLevelInfo.levelName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) throw upsertError;

  return {
    xpAwarded: amount,
    newTotal,
    leveledUp,
    newLevelName: leveledUp ? newLevelInfo.levelName : null,
    newLevelNumber: leveledUp ? newLevelInfo.currentLevel : null,
  };
}

export async function getUserLevel(userId: string): Promise<
  LevelInfo & { totalXP: number }
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_levels")
    .select("total_xp")
    .eq("user_id", userId)
    .maybeSingle();

  const totalXp = data?.total_xp || 0;
  const levelInfo = calculateLevel(totalXp);

  return { totalXP: totalXp, ...levelInfo };
}

export async function awardTestXP(
  userId: string,
  sessionId: string
): Promise<AwardXPResult> {
  const supabase = await createClient();

  // Guard: check if XP was already awarded for this session
  const { data: existing } = await supabase
    .from("xp_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", "Test completed")
    .contains("metadata", JSON.stringify({ session_id: sessionId }))
    .maybeSingle();

  if (existing) {
    // Already awarded — return zero XP (idempotent)
    return {
      xpAwarded: 0,
      newTotal: 0,
      leveledUp: false,
      newLevelName: null,
      newLevelNumber: null,
    };
  }

  const { data: session } = await supabase
    .from("test_sessions")
    .select("total_questions")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) throw new Error("Session not found");

  const { data: answers } = await supabase
    .from("test_answers")
    .select("is_correct")
    .eq("session_id", sessionId);

  const correctCount = (answers || []).filter((a) => a.is_correct === true).length;

  // Base XP: 10 XP per correct question
  let totalXP = correctCount * XP_REWARDS.CORRECT_ANSWER;
  const reasons: string[] = [`${correctCount} correct answers (+${correctCount * XP_REWARDS.CORRECT_ANSWER} XP)`];

  // Accuracy bonuses
  const totalQuestions = session.total_questions || 0;
  const accuracyPct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  if (correctCount === totalQuestions && totalQuestions > 0) {
    totalXP += XP_REWARDS.PERFECT_SCORE_BONUS;
    reasons.push(`Sharpshooter 100% Precision (+${XP_REWARDS.PERFECT_SCORE_BONUS} XP)`);
  } else if (accuracyPct >= 80 && totalQuestions >= 10) {
    totalXP += XP_REWARDS.HIGH_ACCURACY_BONUS;
    reasons.push(`High Accuracy ${accuracyPct.toFixed(0)}% (+${XP_REWARDS.HIGH_ACCURACY_BONUS} XP)`);
  }

  // Assessment scale bonus (rewards stamina on full length tests)
  if (totalQuestions >= 30) {
    totalXP += XP_REWARDS.FULL_MOCK_COMPLETED;
    reasons.push(`Full Mock Completion (+${XP_REWARDS.FULL_MOCK_COMPLETED} XP)`);
  } else if (totalQuestions >= 15) {
    totalXP += XP_REWARDS.MINI_MOCK_COMPLETED;
    reasons.push(`Sprint Test Completion (+${XP_REWARDS.MINI_MOCK_COMPLETED} XP)`);
  }

  const { data: prevSessions } = await supabase
    .from("test_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .neq("id", sessionId);

  if (!prevSessions || prevSessions.length === 0) {
    totalXP += XP_REWARDS.FIRST_TEST_BONUS;
    reasons.push(`Commissioning Test (+${XP_REWARDS.FIRST_TEST_BONUS} XP)`);
  }

  return awardXP(userId, totalXP, `Test: ${reasons.join(" · ")}`, {
    session_id: sessionId,
    correct_count: correctCount,
    total_questions: totalQuestions,
    accuracy: accuracyPct,
  });
}

export async function awardDailyQuestionXP(
  userId: string,
  correct: boolean
): Promise<AwardXPResult> {
  const amount = correct
    ? XP_REWARDS.DAILY_QUESTION_CORRECT
    : XP_REWARDS.DAILY_QUESTION_ATTEMPTED;

  return awardXP(
    userId,
    amount,
    correct ? "Daily question correct" : "Daily question attempted"
  );
}
