import { cache } from "react";
import { getExamContext } from "@/lib/exam-context";
import { createClient } from "@/lib/supabase/server";
import { DAILY_REVISION_CAP, type RevisionQueue, type RevisionQuestion } from "@/lib/revision";

export interface DeckQuestion {
  id: string;
  stage: number;
  interval_days?: number;
  repetition_count?: number;
  nextReviewDate?: string | null;
  mastered_at?: string | null;
  source: "srs" | "mistake" | "bookmark";
  question: RevisionQuestion["question"];
}

export interface DeckForecast {
  stage: number;
  label: string;
  intervalDays: number;
  count: number;
}

export interface DeckInfo {
  totalCount: number;
  dueTodayCount: number;
  scheduledTomorrow: number;
  stageCounts: Record<number, number>;
  masteredCount: number;
  retentionRate: number;
  forecast: DeckForecast[];
  sourceCounts: { srs: number; mistake: number; bookmark: number };
  questions: DeckQuestion[];
  /** True when direct SELECT on spaced_repetition is permission-blocked. */
  srsSelectFailed?: boolean;
}

function getStageFromInterval(days: number): number {
  if (days >= 30) return 5;
  if (days >= 14) return 4;
  if (days >= 7) return 3;
  if (days >= 3) return 2;
  return 1;
}

export async function getRevisionQueue(): Promise<RevisionQueue> {
  const { user, exam, stream } = await getExamContext();
  if (!user || !exam || (exam.requires_stream && !stream)) throw new Error("Choose an exam first");
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("revision_queue", { p_exam: exam.id, p_stream: stream?.id ?? null });
    if (!error && data && Array.isArray((data as RevisionQueue).questions)) {
      const qData = data as RevisionQueue;
      return qData;
    }
  } catch (rpcErr) {
    console.warn("revision_queue RPC exception, using fallback deck query:", rpcErr);
  }

  // Fallback: Build queue from deck (test mistakes, bookmarks, and spaced_repetition)
  const deck = await getRevisionDeck();
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  // Prioritize due questions today, lower stages first
  const dueQuestions = deck.questions.filter(
    (q) => !q.nextReviewDate || q.nextReviewDate <= todayStr
  );
  const remaining = deck.questions.filter(
    (q) => q.nextReviewDate && q.nextReviewDate > todayStr
  );
  const sorted = [...dueQuestions, ...remaining].sort((a, b) => a.stage - b.stage);

  const queueQuestions: RevisionQuestion[] = sorted.slice(0, DAILY_REVISION_CAP).map((q) => ({
    id: q.id,
    stage: q.stage,
    interval_days: q.interval_days,
    repetition_count: q.repetition_count,
    next_review_date: q.nextReviewDate,
    source: q.source,
    question: q.question,
  }));

  return {
    reviewDate: todayStr,
    questions: queueQuestions,
    summary: {
      dueCount: queueQuestions.length,
      deferredCount: Math.max(0, sorted.length - queueQuestions.length),
      completedCount: 0,
      dailyCap: DAILY_REVISION_CAP,
      totalCount: queueQuestions.length,
      xpEarned: 0,
      queueComplete: queueQuestions.length === 0,
    },
  };
}

export async function addToSRSQueue(questionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revision_add", { p_question: questionId });
  if (error) {
    console.error("SRS enrollment failed via revision_add RPC:", error);
    throw new Error("Unable to enroll question into revision. Please try again.");
  }
}

export async function addBatchToSRSQueue(questionIds: string[]): Promise<void> {
  if (questionIds.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("revision_add_batch", { p_questions: questionIds });
  if (error) {
    // Fallback to parallel single adds if batch RPC is pending deployment
    const results = await Promise.allSettled(
      questionIds.map((qid) => supabase.rpc("revision_add", { p_question: qid }))
    );
    const hasSuccess = results.some(
      (r) => r.status === "fulfilled" && !(r.value as any).error
    );
    if (!hasSuccess) {
      console.error("SRS batch enrollment failed:", error);
      throw new Error("Unable to enroll questions into revision. Please try again.");
    }
  }
}

export async function updateSRSAfterAnswer(
  questionId: string,
  result: "correct" | "wrong",
  reviewDate: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revision_answer", {
    p_question: questionId,
    p_correct: result === "correct",
    p_day: reviewDate,
  });
  if (error || !data) {
    console.error("revision_answer RPC failed:", error);
    throw new Error("Unable to save revision progress. Please try again.");
  }
  return data;
}

export const getRevisionDeck = cache(async (): Promise<DeckInfo> => {
  const { user, exam, stream } = await getExamContext();
  if (!user || !exam) throw new Error("Choose an exam first");
  const supabase = await createClient();

  let srsData: any[] | null = null;
  let srsSelectFailed = false;
  const [fullQuery, { data: sessions }, { data: bookmarks }] = await Promise.all([
    supabase
      .from("spaced_repetition")
      .select(
        "id, question_id, stage, interval_days, next_review_date, repetition_count, mastered_at, questions(id, question_text, question_type, option_1, option_2, option_3, option_4, correct_option, correct_options, correct_option_sets, answer_min, answer_max, answer_ranges, answer_decimal_places, explanation, year, image_url, image_width, image_height, option_images, exam_id, stream_id, marks_to_all)"
      )
      .eq("user_id", user.id),
    supabase
      .from("test_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .eq("exam_id", exam.id)
      .order("completed_at", { ascending: false })
      .limit(50),
    supabase
      .from("bookmarks")
      .select(
        "question_id, questions(id, question_text, question_type, option_1, option_2, option_3, option_4, correct_option, correct_options, correct_option_sets, answer_min, answer_max, answer_ranges, answer_decimal_places, explanation, year, image_url, image_width, image_height, option_images, exam_id, stream_id, marks_to_all)"
      )
      .eq("user_id", user.id)
      .limit(100),
  ]);

  if (!fullQuery.error && fullQuery.data) {
    srsData = fullQuery.data;
  } else {
    srsSelectFailed = true;
    console.warn("spaced_repetition SELECT unavailable; deck will exclude direct SRS items:", fullQuery.error);
    const baseQuery = await supabase
      .from("spaced_repetition")
      .select(
        "id, question_id, interval_days, next_review_date, repetition_count, questions(id, question_text, question_type, option_1, option_2, option_3, option_4, correct_option, correct_options, correct_option_sets, answer_min, answer_max, answer_ranges, answer_decimal_places, explanation, year, image_url, image_width, image_height, option_images, exam_id, stream_id, marks_to_all)"
      )
      .eq("user_id", user.id);
    if (!baseQuery.error) {
      srsData = baseQuery.data;
      srsSelectFailed = false;
    }
  }

  const sessionIds = (sessions || []).map((s) => s.id);
  const { data: wrongAnswers } =
    sessionIds.length > 0
      ? await supabase
          .from("test_answers")
          .select(
            "question_id, questions(id, question_text, question_type, option_1, option_2, option_3, option_4, correct_option, correct_options, correct_option_sets, answer_min, answer_max, answer_ranges, answer_decimal_places, explanation, year, image_url, image_width, image_height, option_images, exam_id, stream_id, marks_to_all)"
          )
          .in("session_id", sessionIds)
          .eq("is_correct", false)
          .limit(300)
      : { data: [] };

  const questionsMap = new Map<string, DeckQuestion>();
  const stageCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const sourceCounts = { srs: 0, mistake: 0, bookmark: 0 };
  let masteredCount = 0;
  let scheduledTomorrow = 0;
  let dueTodayCount = 0;
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  // Helper to check if a question is relevant to the student's exam
  const matchesExam = (q: any) => {
    if (!q || typeof q !== "object" || q.marks_to_all) return false;
    if (q.exam_id && q.exam_id !== exam.id) return false;
    return true;
  };

  // 1. Process SRS records
  for (const row of (srsData || []) as any[]) {
    const rawQ = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    if (!matchesExam(rawQ)) continue;

    const stage = Number(row.stage ?? getStageFromInterval(row.interval_days || 0));
    const nextDate = row.next_review_date;

    if (row.mastered_at) {
      masteredCount++;
    } else {
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      if (nextDate && nextDate <= todayStr) {
        dueTodayCount++;
      } else if (nextDate && nextDate > todayStr) {
        scheduledTomorrow++;
      }
    }
    sourceCounts.srs++;

    const q = rawQ as unknown as RevisionQuestion["question"];
    questionsMap.set(q.id, {
      id: row.id,
      stage,
      interval_days: row.interval_days,
      repetition_count: row.repetition_count,
      nextReviewDate: nextDate,
      mastered_at: row.mastered_at,
      source: "srs",
      question: q,
    });
  }

  // 2. Process mistakes from test sessions (auto-enroll if not in SRS map)
  for (const ans of wrongAnswers || []) {
    const rawQ = Array.isArray(ans.questions) ? ans.questions[0] : ans.questions;
    if (!matchesExam(rawQ)) continue;

    const q = rawQ as unknown as RevisionQuestion["question"];
    if (q && !questionsMap.has(q.id)) {
      stageCounts[1] = (stageCounts[1] || 0) + 1;
      dueTodayCount++;
      sourceCounts.mistake++;
      questionsMap.set(q.id, {
        id: `mistake-${q.id}`,
        stage: 1,
        interval_days: 1,
        repetition_count: 0,
        nextReviewDate: todayStr, // Day 1 mistake is immediately due today!
        source: "mistake",
        question: q,
      });
    }
  }

  // 3. Process bookmarks
  for (const bm of bookmarks || []) {
    const rawQ = Array.isArray(bm.questions) ? bm.questions[0] : bm.questions;
    if (!matchesExam(rawQ)) continue;

    const q = rawQ as unknown as RevisionQuestion["question"];
    if (q && !questionsMap.has(q.id)) {
      stageCounts[1] = (stageCounts[1] || 0) + 1;
      dueTodayCount++;
      sourceCounts.bookmark++;
      questionsMap.set(q.id, {
        id: `bm-${q.id}`,
        stage: 1,
        interval_days: 1,
        repetition_count: 0,
        nextReviewDate: todayStr,
        source: "bookmark",
        question: q,
      });
    }
  }

  // Sort questions: priority to user's stream, then common, then other papers of the exam
  const allQuestions = Array.from(questionsMap.values()).sort((a, b) => {
    const streamA = stream && a.question.stream_id === stream.id ? 0 : !a.question.stream_id ? 1 : 2;
    const streamB = stream && b.question.stream_id === stream.id ? 0 : !b.question.stream_id ? 1 : 2;
    if (streamA !== streamB) return streamA - streamB;
    return a.stage - b.stage;
  });

  const totalActive = allQuestions.filter((q) => !q.mastered_at).length;
  const advancedPastStage1 = allQuestions.filter((q) => q.mastered_at || q.stage > 1).length;
  const retentionRate = totalActive + masteredCount > 0
    ? Math.round((advancedPastStage1 / (totalActive + masteredCount)) * 100)
    : 0;

  const forecast: DeckForecast[] = [
    { stage: 1, label: "Stage 1 · First Recall (Day 1)", intervalDays: 1, count: stageCounts[1] || 0 },
    { stage: 2, label: "Stage 2 · Reinforce (3 Days)", intervalDays: 3, count: stageCounts[2] || 0 },
    { stage: 3, label: "Stage 3 · Strengthen (7 Days)", intervalDays: 7, count: stageCounts[3] || 0 },
    { stage: 4, label: "Stage 4 · Retain (14 Days)", intervalDays: 14, count: stageCounts[4] || 0 },
    { stage: 5, label: "Stage 5 · Mastery Check (30 Days)", intervalDays: 30, count: stageCounts[5] || 0 },
  ];

  return {
    totalCount: allQuestions.length,
    dueTodayCount,
    scheduledTomorrow: srsSelectFailed ? 0 : scheduledTomorrow,
    stageCounts,
    masteredCount,
    retentionRate,
    forecast,
    sourceCounts,
    questions: allQuestions,
    srsSelectFailed,
  };
});
