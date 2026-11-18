"use client";

import { formatMarks } from "@/lib/marking";
import { formatRate, type PacingSummary, type QuestionStats, type SessionTiming } from "@/lib/test-metrics";
import { ShareChallenge } from "@/components/challenges/ShareChallenge";
import { useEffect, useState, useRef, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartTagPanel } from "@/components/smart-tags/SmartTagPanel";
import type { DiagnosticLoad } from "@/lib/smart-tags-server";
import { QuestionFigure, type QuestionImage } from "@/components/QuestionFigure";
import { QuestionTypeTag } from "@/components/QuestionTypeTag";
import { numericAnswerLabel, multipleAnswerLabel } from "@/lib/question-response";
import { ReportButton } from "@/components/report/ReportButton";
import { MathText } from "@/components/MathText";
import { QuestionExplanation } from "@/components/QuestionExplanation";
import { MatchingQuestion } from "@/components/MatchingQuestion";
import { MatchOption } from "@/components/MatchOption";
import { isMatchingQuestion, isMatchCodeOption } from "@/lib/matching-question-utils";
import { useToast } from "@/components/ui/toast-provider";
import {
  Check,
  X,
  Minus,
  Clock,
  ArrowLeft,
  Eye,
  Play,
  Target,
  AlertTriangle,
  RotateCcw,
  Info,
  BookOpen,
  Zap,
  Timer,
  TrendingUp,
  TrendingDown,
  Award,
  ChevronRight,
  BarChart2,
  Layers,
  Bookmark,
  Brain,
  FlameKindling,
  Gauge,
  ListChecks,
  Shield,
  Lightbulb,
  Copy,
  Printer,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  SlidersHorizontal,
  Compass,
} from "lucide-react";

export interface QuestionTypeStats extends QuestionStats {
  type: "MCQ" | "MSQ" | "NAT";
}

export interface MarksTierStats extends QuestionStats {
  tier: 1 | 2;
}

export interface SubjectBreakdown extends QuestionStats {
  id: string;
  name: string;
  subjectId?: string | null;
}

// ── Types shared with review panel ──────────────────────────────────────────
interface AnswerData {
  numeric_answer?: string | null;
  selected_options?: number[] | null;
  question_id: string;
  selected_option: number | null;
  is_correct: boolean | null;
  questions: {
    id: string;
    question_text: string;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    correct_option: number | null;
    marks_to_all?: boolean;
    question_type?: "MCQ" | "MSQ" | "NAT";
    correct_options?: number[] | null;
    correct_option_sets?: number[][] | null;
    answer_min?: string | number | null;
    answer_max?: number | string | null;
    answer_ranges?: { min: number; max: number }[] | null;
    explanation: string | null;
    image_url?: string | null;
    image_width?: number;
    image_height?: number;
    option_images?: QuestionImage[];
  };
}

export interface ResultContentProps {
  userId?: string;
  isAdmin?: boolean;
  diagnostic?: DiagnosticLoad;
  diagnosticPanel?: ReactNode;
  marks?: { earned: number; deducted: number; maximum: number; net: number };
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  marksToAllCount?: number;
  gradedQuestionCount: number;
  attemptedCount: number;
  accuracy: number | null;
  correctRate: number | null;
  skippedMarks?: number;
  totalQuestions: number;
  timing: SessionTiming;
  hasQuestionTiming?: boolean;
  pacing?: PacingSummary;
  subjectBreakdown: SubjectBreakdown[];
  message: { title: string; subtitle: string; icon: string };
  sessionId: string;
  isSprint?: boolean;
  sourceYear?: number | null;
  sourcePaper?: string | null;
  examName?: string;
  streamName?: string | null;
  questionTypeBreakdown?: QuestionTypeStats[];
  marksTierBreakdown?: MarksTierStats[];
  dataCaveats?: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function AnimatedCounter({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(decimals)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, decimals]);
  return <>{formatMarks(count)}</>;
}

function AnimatedScoreRing({
  value,
  maximum,
  percentage,
}: {
  value: number;
  maximum: number;
  percentage: number | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.max(0, Math.min(100, percentage ?? 0));
  const offset = circumference - (safePercentage / 100) * circumference;
  const isGood = (percentage ?? 0) >= 60;
  const isMid = (percentage ?? 0) >= 40;
  const ringColor = isGood
    ? "hsl(142.1 76.2% 36.3%)"
    : isMid
    ? "hsl(43 74% 66%)"
    : "hsl(var(--primary))";

  return (
    <div className="relative mx-auto h-44 w-44 shrink-0">
      {isGood && (
        <div className="absolute inset-4 rounded-full bg-emerald-400/10 blur-xl" />
      )}
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black tracking-tight tabular-nums leading-none">
          <AnimatedCounter value={value} />
        </span>
        <span className="mt-1 text-xs font-medium text-muted-foreground">
          / {formatMarks(maximum)} marks
        </span>
        <span
          className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{
            background: isGood ? "hsl(142.1 76.2% 36.3% / 0.12)" : isMid ? "hsl(43 74% 66% / 0.15)" : "hsl(var(--primary) / 0.1)",
            color: isGood ? "hsl(142.1 76.2% 36.3%)" : isMid ? "hsl(43 60% 42%)" : "hsl(var(--primary))",
          }}
        >
          {formatRate(percentage)} net
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function MiniBar({ value, color = "bg-primary" }: { value: number | null; color?: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.max(0, Math.min(100, value ?? 0))), 200);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.177 8.177 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.53 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29" />
    </svg>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass ?? "bg-primary/10"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-2xl font-black tabular-nums leading-none">{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground leading-snug">{sub}</p>}
    </div>
  );
}

// ── Tab pill component ───────────────────────────────────────────────────────
function TabPill({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-foreground border-input hover:bg-accent hover:border-muted-foreground/30"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 font-bold ${
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Insight card ─────────────────────────────────────────────────────────────
function InsightCard({
  icon: Icon,
  iconClass,
  bg,
  border,
  title,
  value,
  description,
  pill,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  bg: string;
  border: string;
  title: string;
  value: ReactNode;
  description: string;
  pill?: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${border} space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        {pill && (
          <span className="text-xs font-semibold rounded-full border px-2.5 py-0.5 bg-background/70">
            {pill}
          </span>
        )}
      </div>
      <div className="text-2xl font-black tabular-nums leading-none">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBEDDED REVIEW PANEL WITH INTERACTIVE QUESTION PALETTE & SEARCH
// ═══════════════════════════════════════════════════════════════════════════

const REVIEW_FILTERS = [
  { key: "all", label: "All" },
  { key: "correct", label: "Correct" },
  { key: "wrong", label: "Wrong" },
  { key: "skipped", label: "Skipped" },
  { key: "bookmarked", label: "Bookmarked" },
];

function EmbeddedReviewPanel({
  sessionId,
  userId,
  initialFilter = "all",
}: {
  sessionId: string;
  userId: string;
  initialFilter?: string;
}) {
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const bookmarkBusy = useRef(false);
  const questionListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const client = createClient();
      const [answersRes, bookmarksRes, sessionRes] = await Promise.all([
        client.from("test_answers").select("*, questions(*)").eq("session_id", sessionId),
        client.from("bookmarks").select("question_id").eq("user_id", userId),
        client.from("test_sessions").select("question_ids").eq("id", sessionId).single(),
      ]);

      const questionOrder = new Map<string, number>(
        ((sessionRes.data?.question_ids as string[]) || []).map((id, index) => [id, index])
      );
      const ordered = [...(answersRes.data || [])].sort(
        (a, b) => (questionOrder.get(a.question_id) ?? Infinity) - (questionOrder.get(b.question_id) ?? Infinity)
      );

      setAnswers(ordered as AnswerData[]);
      setBookmarks(new Set((bookmarksRes.data || []).map((b) => b.question_id)));
      setLoading(false);
    };
    load();
  }, [sessionId, userId]);

  const filtered = useMemo(() => {
    let list = answers;
    if (filter === "correct") list = list.filter((a) => !a.questions.marks_to_all && a.is_correct === true);
    if (filter === "wrong") {
      list = list.filter(
        (a) =>
          (a.numeric_answer != null || a.selected_option != null || !!a.selected_options?.length) &&
          a.is_correct === false
      );
    }
    if (filter === "skipped") {
      list = list.filter(
        (a) =>
          !a.questions.marks_to_all &&
          a.numeric_answer == null &&
          a.selected_option == null &&
          !a.selected_options?.length
      );
    }
    if (filter === "bookmarked") list = list.filter((a) => bookmarks.has(a.question_id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.questions.question_text.toLowerCase().includes(q) ||
          a.questions.explanation?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [answers, filter, bookmarks, searchQuery]);

  const wrongCount = answers.filter(
    (a) =>
      (a.numeric_answer != null || a.selected_option != null || !!a.selected_options?.length) &&
      a.is_correct === false
  ).length;
  const skippedCount = answers.filter(
    (a) =>
      !a.questions.marks_to_all &&
      a.numeric_answer == null &&
      a.selected_option == null &&
      !a.selected_options?.length
  ).length;
  const correctCount = answers.filter((a) => !a.questions.marks_to_all && a.is_correct === true).length;
  const marksToAllCount = answers.filter((a) => a.questions.marks_to_all).length;

  const getCount = (key: string) => {
    if (key === "all") return answers.length;
    if (key === "correct") return correctCount;
    if (key === "wrong") return wrongCount;
    if (key === "skipped") return skippedCount;
    if (key === "bookmarked") return answers.filter((a) => bookmarks.has(a.question_id)).length;
    return 0;
  };

  const toggleBookmark = async (questionId: string) => {
    if (bookmarkBusy.current) return;
    bookmarkBusy.current = true;
    setBookmarkPending(true);
    setBookmarkFeedback(null);
    const removing = bookmarks.has(questionId);
    try {
      const client = createClient();
      const { error } = removing
        ? await client.from("bookmarks").delete().eq("user_id", userId).eq("question_id", questionId)
        : await client.from("bookmarks").insert({ user_id: userId, question_id: questionId });
      if (error) throw error;
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (removing) next.delete(questionId);
        else next.add(questionId);
        return next;
      });
      setBookmarkFeedback({ error: false, message: removing ? "Bookmark removed." : "Question bookmarked." });
    } catch {
      setBookmarkFeedback({ error: true, message: "Unable to update bookmark. Please try again." });
    } finally {
      bookmarkBusy.current = false;
      setBookmarkPending(false);
    }
  };

  const toggleExplanation = (questionId: string) => {
    const next = new Set(expandedExplanations);
    if (next.has(questionId)) next.delete(questionId);
    else next.add(questionId);
    setExpandedExplanations(next);
  };

  const expandAllExplanations = () => {
    setExpandedExplanations(new Set(answers.map((a) => a.question_id)));
  };

  const collapseAllExplanations = () => {
    setExpandedExplanations(new Set());
  };

  const scrollToQuestion = (questionId: string) => {
    if (filter !== "all") {
      setFilter("all");
    }
    setActiveQuestionId(questionId);
    setTimeout(() => {
      const el = document.getElementById(`q-card-${questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const optionLabels = ["A", "B", "C", "D"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Loading test questions and solutions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Question Palette / Navigator Card ── */}
      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Question Navigator ({answers.length} Questions)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any question number to jump directly to its complete solution and breakdown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Correct ({correctCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Wrong ({wrongCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Skipped ({skippedCount})
            </span>
            {marksToAllCount > 0 && (
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> MTA ({marksToAllCount})
              </span>
            )}
          </div>
        </div>

        {/* Numbered Palette Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-1.5">
          {answers.map((item, idx) => {
            const isCorrect = !item.questions.marks_to_all && item.is_correct === true;
            const isWrong =
              (item.numeric_answer != null || item.selected_option != null || !!item.selected_options?.length) &&
              item.is_correct === false;
            const isMTA = !!item.questions.marks_to_all;
            const isBookmarked = bookmarks.has(item.question_id);
            const isSelected = activeQuestionId === item.question_id;

            let btnClass = "bg-card border-border text-muted-foreground hover:border-primary";
            if (isMTA) {
              btnClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700";
            } else if (isCorrect) {
              btnClass = "bg-emerald-500/15 text-emerald-700 border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700";
            } else if (isWrong) {
              btnClass = "bg-rose-500/15 text-rose-700 border-rose-400 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700";
            } else {
              btnClass = "bg-muted/70 text-muted-foreground border-muted-foreground/20 hover:border-foreground/40";
            }

            return (
              <button
                key={item.question_id}
                type="button"
                onClick={() => scrollToQuestion(item.question_id)}
                className={`relative flex h-8 items-center justify-center rounded-lg border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${btnClass} ${
                  isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                }`}
                title={`Question ${idx + 1}: ${isMTA ? "Marks to All" : isCorrect ? "Correct" : isWrong ? "Wrong" : "Skipped"}`}
              >
                {idx + 1}
                {isBookmarked && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filters & Search Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-4">
        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {REVIEW_FILTERS.map((f) => {
            const count = getCount(f.key);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFilter(f.key);
                  questionListRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
                }}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-input hover:bg-accent"
                }`}
              >
                {f.label}
                <span
                  className={`text-[11px] rounded-full px-1.5 py-0.2 font-bold ${
                    filter === f.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input & bulk toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in questions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-input bg-background pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAllExplanations}
              className="h-8 text-xs px-2.5"
              title="Expand all explanations"
            >
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
              Expand all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAllExplanations}
              className="h-8 text-xs px-2.5"
              title="Collapse all explanations"
            >
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Collapse
            </Button>
          </div>
        </div>
      </div>

      {bookmarkFeedback && (
        <p
          role={bookmarkFeedback.error ? "alert" : "status"}
          className={`rounded-lg border p-3 text-sm ${
            bookmarkFeedback.error ? "text-destructive border-destructive/30 bg-destructive/5" : "text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300"
          }`}
        >
          {bookmarkFeedback.message}
        </p>
      )}

      {/* ── Question List ── */}
      <div ref={questionListRef} className="space-y-6 scroll-mt-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border bg-muted/10">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <h4 className="text-base font-bold">No questions found</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {searchQuery
                  ? `No questions matched "${searchQuery}". Try clearing your search.`
                  : filter === "wrong"
                  ? "Flawless — you have zero wrong answers in this test!"
                  : filter === "skipped"
                  ? "You attempted every question — zero skipped."
                  : filter === "bookmarked"
                  ? "No bookmarked questions in this session yet."
                  : "No questions match the current filter."}
              </p>
            </div>
            {(filter !== "all" || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          filtered.map((current, questionIndex) => {
            const currentQ = current.questions;
            const isBookmarked = bookmarks.has(current.question_id);
            const globalIndex = answers.findIndex((a) => a.question_id === current.question_id) + 1;
            const isHighlighted = activeQuestionId === current.question_id;

            return (
              <article
                key={current.question_id}
                id={`q-card-${current.question_id}`}
                className={`space-y-3 rounded-2xl border bg-card p-4 sm:p-6 transition-all shadow-sm ${
                  isHighlighted ? "ring-2 ring-primary shadow-md" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="h-7 min-w-[2rem] px-2 rounded-lg bg-primary/10 text-primary text-xs font-bold inline-flex items-center justify-center">
                      Q{globalIndex}
                    </span>
                    <QuestionTypeTag type={currentQ.question_type} />
                    {!currentQ.marks_to_all &&
                      current.numeric_answer == null &&
                      current.selected_option == null &&
                      !current.selected_options?.length && (
                        <Badge variant="secondary" className="text-xs">
                          Skipped
                        </Badge>
                      )}
                    {current.is_correct === true && (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 text-xs font-semibold">
                        {currentQ.marks_to_all ? "Marks to all" : "Correct (+Marks)"}
                      </Badge>
                    )}
                    {current.is_correct === false && (
                      <Badge variant="destructive" className="text-xs font-semibold">
                        Incorrect (-Penalty)
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ReportButton
                      questionId={currentQ.id}
                      questionText={currentQ.question_text}
                      questionNumber={globalIndex}
                      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => toggleBookmark(current.question_id)}
                      disabled={bookmarkPending}
                      className={`inline-flex h-9 w-9 items-center justify-center p-2 rounded-md transition-colors disabled:opacity-50 ${
                        isBookmarked
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                      aria-pressed={isBookmarked}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Question text */}
                <div className="text-sm sm:text-base leading-relaxed pt-1">
                  {isMatchingQuestion(currentQ.question_text) ? (
                    <MatchingQuestion text={currentQ.question_text} />
                  ) : (
                    <MathText text={currentQ.question_text} as="div" className="question-content" />
                  )}
                </div>

                {/* Image */}
                {currentQ.image_url && (
                  <div className="pt-2">
                    <QuestionFigure
                      image={{
                        url: currentQ.image_url,
                        width: currentQ.image_width,
                        height: currentQ.image_height,
                      }}
                    />
                  </div>
                )}

                {/* Options / NAT input display */}
                <div className="pt-2">
                  {currentQ.question_type === "NAT" ? (
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Your numerical answer:</span>
                        <strong className="font-mono text-base">
                          {current.numeric_answer ?? "Unattempted"}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                        <span>Accepted range:</span>
                        <strong className="font-mono">
                          {numericAnswerLabel(
                            currentQ.answer_min,
                            currentQ.answer_max,
                            currentQ.answer_ranges
                          )}
                        </strong>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1 border-t">
                        NAT questions have zero negative marking.
                      </p>
                    </div>
                  ) : (
                    <>
                      {currentQ.question_type === "MSQ" && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Multiple Select: Every correct choice must be selected. No partial marks or negative marking.
                        </p>
                      )}
                      {currentQ.correct_option_sets && (
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                          {multipleAnswerLabel(currentQ.correct_option_sets)}
                        </p>
                      )}
                      <div className="space-y-2">
                        {([1, 2, 3, 4] as const).map((idx) => {
                          const isSelected =
                            current.selected_options?.includes(idx) || current.selected_option === idx;
                          const isCorrect =
                            !!currentQ.marks_to_all ||
                            (currentQ.question_type === "MSQ"
                              ? !!currentQ.correct_options?.includes(idx)
                              : currentQ.correct_option_sets
                              ? currentQ.correct_option_sets.some((set) => set.length === 1 && set[0] === idx)
                              : currentQ.correct_option === idx);
                          const showCorrect =
                            !currentQ.marks_to_all && isCorrect && (!isSelected || current.is_correct === false);

                          return (
                            <div
                              key={idx}
                              className={`rounded-xl border-2 px-3.5 py-2.5 text-sm transition-all ${
                                isSelected
                                  ? isCorrect
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                                    : "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                                  : showCorrect
                                  ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/10"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 mt-0.5 ${
                                    isSelected
                                      ? isCorrect
                                        ? "bg-emerald-500 text-white"
                                        : "bg-rose-500 text-white"
                                      : showCorrect
                                      ? "bg-emerald-500 text-white"
                                      : "border border-muted-foreground/30 text-muted-foreground"
                                  }`}
                                >
                                  {optionLabels[idx - 1]}
                                </span>
                                <div className="min-w-0 flex-1 leading-relaxed break-words">
                                  {(() => {
                                    const optionText = currentQ[`option_${idx}` as keyof typeof currentQ] as string;
                                    if (isMatchCodeOption(optionText || "")) {
                                      return <MatchOption text={optionText || ""} className="text-xs" />;
                                    }
                                    return (
                                      <>
                                        <MathText text={optionText || ""} />
                                        {currentQ.option_images?.[idx - 1] && (
                                          <QuestionFigure image={currentQ.option_images[idx - 1]} inline />
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                                {isSelected && isCorrect && (
                                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                )}
                                {isSelected && !isCorrect && (
                                  <X className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                {showCorrect && !isSelected && (
                                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                )}
                              </div>
                              {isSelected && (
                                <div
                                  className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                                    isCorrect ? "text-emerald-600" : "text-rose-600"
                                  }`}
                                >
                                  Your selection: Option {optionLabels[idx - 1]}
                                </div>
                              )}
                              {showCorrect && !isSelected && (
                                <div className="mt-1 text-xs font-medium flex items-center gap-1 text-emerald-600">
                                  Correct option: {optionLabels[idx - 1]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Explanation */}
                {currentQ.explanation && (
                  <div className="rounded-xl border bg-muted/20 overflow-hidden mt-3">
                    <button
                      type="button"
                      aria-expanded={expandedExplanations.has(current.question_id)}
                      onClick={() => toggleExplanation(current.question_id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Lightbulb
                          className={`h-4 w-4 ${
                            expandedExplanations.has(current.question_id)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        Step-by-Step Solution &amp; Explanation
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expandedExplanations.has(current.question_id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedExplanations.has(current.question_id) && (
                      <div className="px-4 pb-4 pt-1">
                        <div className="border-t border-border/60 pt-3 text-sm text-foreground/90 leading-relaxed">
                          <QuestionExplanation text={currentQ.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type TabKey = "insights" | "time-pace" | "concepts" | "reviews";

export function ResultContent({
  userId: initialUserId,
  isAdmin = false,
  diagnosticPanel,
  diagnostic,
  marks,
  correctCount,
  wrongCount,
  skippedCount,
  marksToAllCount = 0,
  gradedQuestionCount,
  attemptedCount,
  accuracy,
  correctRate,
  skippedMarks = 0,
  totalQuestions,
  timing,
  hasQuestionTiming = false,
  pacing,
  subjectBreakdown,
  message,
  sessionId,
  sourceYear,
  sourcePaper,
  isSprint = false,
  examName = "GATE",
  streamName,
  questionTypeBreakdown = [],
  marksTierBreakdown = [],
  dataCaveats = [],
}: ResultContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("insights");
  const [subjectSort, setSubjectSort] = useState<"weakest" | "highest-marks" | "highest-accuracy" | "questions">("weakest");
  const { toast } = useToast();

  // Derive a userId from Supabase client for the embedded review panel if not passed from server
  const [userId, setUserId] = useState<string | null>(initialUserId ?? null);
  useEffect(() => {
    if (initialUserId) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data?.user?.id) setUserId(data.user.id);
      });
  }, [initialUserId]);

  const marksNet = marks ? marks.net : correctCount;
  const marksMax = marks ? marks.maximum : totalQuestions;
  const marksEarned = marks ? marks.earned : correctCount;
  const marksDeducted = marks ? marks.deducted : 0;
  const marksRate = marksMax > 0 ? Math.round((marksNet / marksMax) * 100) : null;
  const penaltyPercentage = marksEarned > 0 ? Math.round((marksDeducted / marksEarned) * 100) : null;
  const notEarnedMarks = Math.max(0, marksMax - marksEarned);

  const weakestSubject = [...subjectBreakdown]
    .filter((subject) => subject.graded > 0)
    .sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101))[0];

  const strongestSubject = [...subjectBreakdown]
    .filter((subject) => subject.graded > 0 && subject.correct > 0)
    .sort((a, b) => (b.correctRate ?? -1) - (a.correctRate ?? -1))[0];

  const sortedSubjects = useMemo(() => {
    const list = [...subjectBreakdown];
    if (subjectSort === "weakest") {
      return list.sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101));
    }
    if (subjectSort === "highest-marks") {
      return list.sort((a, b) => b.netMarks - a.netMarks);
    }
    if (subjectSort === "highest-accuracy") {
      return list.sort((a, b) => (b.correctRate ?? -1) - (a.correctRate ?? -1));
    }
    return list.sort((a, b) => b.graded - a.graded);
  }, [subjectBreakdown, subjectSort]);

  const practiceParams = new URLSearchParams({ mode: "subject_wise" });
  if (weakestSubject) practiceParams.set("subject", weakestSubject.id);
  if (sourceYear) practiceParams.set("year", String(sourceYear));
  if (sourcePaper) practiceParams.set("paper", sourcePaper);

  const natStats = questionTypeBreakdown.find((t) => t.type === "NAT");
  const msqStats = questionTypeBreakdown.find((t) => t.type === "MSQ");
  const mcqStats = questionTypeBreakdown.find((t) => t.type === "MCQ");
  const tier1 = marksTierBreakdown.find((t) => t.tier === 1);
  const tier2 = marksTierBreakdown.find((t) => t.tier === 2);

  const timingValue = timing.available && timing.seconds != null ? formatTime(timing.seconds) : "—";
  const timingSubtext = timing.available
    ? timing.kind === "active"
      ? "Foreground active time"
      : timing.capped
      ? "Capped at paper duration"
      : "Start to submission"
    : "Timing unavailable";

  const paceQuadrants = pacing?.available
    ? [
        {
          key: "fastCorrect",
          label: "Quick & correct",
          count: pacing.quadrants.fastCorrect,
          hint: "Secure — keep these in rotation.",
          bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
          border: "border-emerald-200 dark:border-emerald-800/40",
          countClass: "text-emerald-700 dark:text-emerald-300",
          icon: Zap,
          iconClass: "text-emerald-600 dark:text-emerald-400",
        },
        {
          key: "fastWrong",
          label: "Quick & wrong",
          count: pacing.quadrants.fastWrong,
          hint: "Guessed or rushed — rebuild the basics here.",
          bg: "bg-amber-50/60 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-800/40",
          countClass: "text-amber-700 dark:text-amber-300",
          icon: AlertTriangle,
          iconClass: "text-amber-600 dark:text-amber-400",
        },
        {
          key: "slowCorrect",
          label: "Slow & correct",
          count: pacing.quadrants.slowCorrect,
          hint: "You know it, but it costs time — drill under a timer.",
          bg: "bg-sky-50/60 dark:bg-sky-950/20",
          border: "border-sky-200 dark:border-sky-800/40",
          countClass: "text-sky-700 dark:text-sky-300",
          icon: Clock,
          iconClass: "text-sky-600 dark:text-sky-400",
        },
        {
          key: "slowWrong",
          label: "Slow & wrong",
          count: pacing.quadrants.slowWrong,
          hint: "Weak foundation — priority revision.",
          bg: "bg-rose-50/60 dark:bg-rose-950/20",
          border: "border-rose-200 dark:border-rose-800/40",
          countClass: "text-rose-700 dark:text-rose-300",
          icon: X,
          iconClass: "text-rose-600 dark:text-rose-400",
        },
      ]
    : [];

  const driftPercent = pacing?.drift?.percent ?? null;
  const driftText =
    driftPercent == null
      ? null
      : driftPercent > 10
      ? `You took ${driftPercent}% more time per question in the final third — late fatigue is eating into your pace.`
      : driftPercent < -10
      ? `You took ${Math.abs(driftPercent)}% less time per question in the final third — make sure you are not rushing the back half.`
      : "Your pace held steady from the first question to the last.";

  const earnedPct = marksMax > 0 ? Math.min(100, (marksEarned / marksMax) * 100) : 0;
  const deductedPct = marksMax > 0 ? Math.min(100 - earnedPct, (marksDeducted / marksMax) * 100) : 0;

  const isGoodScore = (marksRate ?? 0) >= 60;
  const isMidScore = (marksRate ?? 0) >= 40;

  const headerGradient = isGoodScore
    ? "from-emerald-500/10 via-background to-emerald-500/5"
    : isMidScore
    ? "from-amber-500/10 via-background to-amber-500/5"
    : "from-primary/8 via-background to-primary/4";

  // ── Deep analysis derived values ─────────────────────────────────────────
  const efficiencyScore =
    pacing?.available && pacing.recorded > 0
      ? Math.round((pacing.quadrants.fastCorrect / pacing.recorded) * 100)
      : null;

  const riskScore =
    pacing?.available && pacing.recorded > 0
      ? Math.round((pacing.quadrants.fastWrong / pacing.recorded) * 100)
      : null;

  const penaltyRisk = marksDeducted > 0 ? Math.round((marksDeducted / marksMax) * 100) : 0;

  const dominantWeakType =
    questionTypeBreakdown.length > 0
      ? [...questionTypeBreakdown].sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101))[0]
      : null;

  // ── Share Scorecard handler ──
  const handleCopyScorecard = () => {
    const text = `🎯 StudentAce Test Report
Exam: ${examName} ${streamName ? `(${streamName})` : ""} ${sourceYear ? `[${sourceYear}]` : ""}
Net Score: ${formatMarks(marksNet)} / ${formatMarks(marksMax)} marks (${formatRate(marksRate)})
Accuracy: ${formatRate(accuracy)}
Results: ${correctCount} Correct | ${wrongCount} Wrong | ${skippedCount} Skipped
Duration: ${timingValue}
${strongestSubject ? `Top Subject: ${strongestSubject.name} (${formatRate(strongestSubject.correctRate)})` : ""}
Practice more on https://studentace.in`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast("Scorecard summary copied to clipboard!", "success");
    }
  };

  // ── WhatsApp Share handler ──
  const handleWhatsAppShare = () => {
    const text = `🎯 *StudentAce Mock Test Scorecard*
━━━━━━━━━━━━━━━━━━━━━
📚 *Exam:* ${examName}${streamName ? ` (${streamName})` : ""}${sourceYear ? ` [${sourceYear}]` : ""}
🏆 *Net Score:* ${formatMarks(marksNet)} / ${formatMarks(marksMax)} marks (${formatRate(marksRate)})
🎯 *Accuracy:* ${formatRate(accuracy)} (${correctCount} Correct · ${wrongCount} Wrong · ${skippedCount} Skipped)
⏱️ *Duration:* ${timingValue}
${strongestSubject ? `⭐ *Top Subject:* ${strongestSubject.name} (${formatRate(strongestSubject.correctRate)})\n` : ""}━━━━━━━━━━━━━━━━━━━━━
👉 Test your prep & practice mock tests on StudentAce:
https://studentace.in`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* ── Navigation & Context Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 pt-1 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {streamName && (
              <Badge variant="outline" className="font-medium">
                {streamName}
              </Badge>
            )}
            <Badge variant="secondary" className="font-semibold">
              {isSprint ? "⚡ 5-Q Practice Sprint" : sourceYear ? `${examName} ${sourceYear} ${sourcePaper || ""}` : "Practice Test"}
            </Badge>
            <span className="text-muted-foreground">· Complete</span>
          </div>
        </div>

        {/* Action utility buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              asChild
              size="sm"
              className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              <Link href="/admin/analytics">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Admin Analytics
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyScorecard}
            className="h-8 text-xs font-semibold"
            title="Copy test summary to share"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            Share Scorecard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="h-8 text-xs font-semibold border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            title="Share directly via WhatsApp"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 mr-1.5 fill-current text-emerald-600 dark:text-emerald-400" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs font-semibold"
            title="Print or save as PDF"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            Print
          </Button>
        </div>
      </header>

      {/* ── Hero Card (Performance Summary) ──────────────────────────────────
          PRESERVED INTACT AND UNDISTURBED AS REQUESTED ─────────────────── */}
      <Card className="overflow-hidden border-0 shadow-md ring-1 ring-border/60">
        <div className={`bg-gradient-to-br ${headerGradient} px-5 py-6 sm:px-8 sm:py-7`}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-sm backdrop-blur-sm">
                <span className="text-base">{message.icon}</span>
                <span>{message.title}</span>
                <span className="text-muted-foreground">— {message.subtitle}</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Performance Summary
                </h1>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Practice marks calculated from each question&apos;s configured values — not an official {examName} score, rank, or cutoff estimate.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="h-3 w-3" /> {correctCount} Correct
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <X className="h-3 w-3" /> {wrongCount} Wrong
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Minus className="h-3 w-3" /> {skippedCount} Skipped
                </span>
              </div>
            </div>
            <AnimatedScoreRing value={marksNet} maximum={marksMax} percentage={marksRate} />
          </div>
        </div>

        <CardContent className="space-y-6 p-5 sm:p-8">
          {/* 4 Core KPI Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBadge
              icon={Target}
              label="Attempt accuracy"
              value={formatRate(accuracy)}
              sub={`${correctCount} / ${attemptedCount} attempts`}
              iconClass="bg-primary/10 text-primary"
            />
            <StatBadge
              icon={Check}
              label="Correct rate"
              value={formatRate(correctRate)}
              sub={`${correctCount} / ${gradedQuestionCount} graded`}
              iconClass="bg-emerald-500/10 text-emerald-600"
            />
            <StatBadge
              icon={Clock}
              label={timing.available ? timing.label : "Session time"}
              value={timingValue}
              sub={timingSubtext}
              iconClass="bg-sky-500/10 text-sky-600"
            />
            <StatBadge
              icon={Minus}
              label="Skipped"
              value={skippedCount}
              sub={`of ${gradedQuestionCount} graded`}
              iconClass="bg-muted text-muted-foreground"
            />
          </div>

          {/* Marks Breakdown Bar */}
          <div className="rounded-2xl border bg-muted/30 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Marks Breakdown</span>
              <span className="font-mono text-sm font-bold tabular-nums">
                {formatMarks(marksNet)} / {formatMarks(marksMax)}
              </span>
            </div>
            <div className="relative h-4 overflow-hidden rounded-full bg-muted">
              {marksEarned > 0 && (
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${earnedPct}%` }}
                />
              )}
              {marksDeducted > 0 && (
                <div
                  className="absolute top-0 h-full bg-rose-500 transition-all duration-700"
                  style={{ left: `${earnedPct}%`, width: `${deductedPct}%` }}
                />
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50/80 px-2 py-2 dark:bg-emerald-950/20">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">+{formatMarks(marksEarned)}</div>
                <div className="text-emerald-600/70 dark:text-emerald-400/70">Earned</div>
              </div>
              <div className="rounded-lg bg-rose-50/80 px-2 py-2 dark:bg-rose-950/20">
                <div className="font-bold text-rose-700 dark:text-rose-300">−{formatMarks(marksDeducted)}</div>
                <div className="text-rose-600/70 dark:text-rose-400/70">Penalties</div>
              </div>
              <div className="rounded-lg bg-muted/80 px-2 py-2">
                <div className="font-bold text-muted-foreground">{formatMarks(notEarnedMarks)}</div>
                <div className="text-muted-foreground/70">Not earned</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <p>Skipped questions left {formatMarks(skippedMarks)} positive mark{skippedMarks === 1 ? "" : "s"} unearned. Skipping never reduces net marks.</p>
              <p>Penalties reduced earned marks by {penaltyPercentage == null ? "—" : `${penaltyPercentage}%`}.</p>
            </div>
            {marksNet < 0 && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                Net marks are negative because penalties exceeded earned marks. Shown exactly as calculated — not rounded up to zero.
              </p>
            )}
            {marksToAllCount > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                {marksToAllCount} question{marksToAllCount === 1 ? " was" : "s were"} awarded full marks to all candidates and excluded from correct rate and attempt accuracy, but the marks are included above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* ── Data Caveats ── */}
      {dataCaveats.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Data limitations for this session</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              {dataCaveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Quick Actions Bar ── */}
      <Card className="border shadow-sm print:hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Session Action Center
              </h2>
              <p className="text-xs text-muted-foreground">
                Jump directly into solutions, review incorrect answers, or practice your next set.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
              {wrongCount > 0 && (
                <Button
                  onClick={() => setActiveTab("reviews")}
                  className="h-10 text-xs font-semibold border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Review Mistakes ({wrongCount})
                </Button>
              )}
              <Button
                onClick={() => setActiveTab("reviews")}
                variant="outline"
                className="h-10 text-xs font-semibold"
              >
                <ListChecks className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Review All ({totalQuestions})
              </Button>
              <Button asChild className="h-10 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={isSprint ? "/practice" : "/test/select"}>
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {isSprint ? "Another Sprint" : "Take Another Test"}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════
          TAB NAVIGATION — Cleanly separated into 4 intuitive views
          ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 -mx-4 border-b bg-background/95 backdrop-blur-md px-4 py-3 sm:-mx-6 sm:px-6 print:hidden">
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <TabPill
            active={activeTab === "insights"}
            onClick={() => setActiveTab("insights")}
            icon={BarChart2}
            label="Insights & Breakdown"
          />
          <TabPill
            active={activeTab === "time-pace"}
            onClick={() => setActiveTab("time-pace")}
            icon={Timer}
            label="Time & Pace"
          />
          <TabPill
            active={activeTab === "concepts"}
            onClick={() => setActiveTab("concepts")}
            icon={Brain}
            label="Concepts & Syllabus"
          />
          <TabPill
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
            icon={ListChecks}
            label="Solutions & Review"
            badge={String(totalQuestions)}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: INSIGHTS & BREAKDOWN
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* ── Admin Analytics & Telemetry Hub ── */}
          {isAdmin && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 sm:p-5 dark:border-purple-900/50 dark:bg-purple-950/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">Admin Session Telemetry &amp; Analytics</h3>
                      <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0 font-semibold">Admin Access</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Session recorded in database. You can track all aggregate user performance and completion analytics.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                    <Link href="/admin/analytics">
                      <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                      Platform Analytics
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs border-purple-300 dark:border-purple-800">
                    <Link href="/admin/audit">
                      Audit Logs
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="rounded-xl bg-background/80 p-2.5 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">User ID</span>
                  <p className="font-mono text-xs truncate mt-1 text-foreground" title={userId ?? ""}>
                    {userId ? `${userId.slice(0, 16)}…` : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-background/80 p-2.5 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Session ID</span>
                  <p className="font-mono text-xs truncate mt-1 text-foreground" title={sessionId}>
                    {sessionId.slice(0, 16)}…
                  </p>
                </div>
                <div className="rounded-xl bg-background/80 p-2.5 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Duration</span>
                  <p className="font-bold text-xs mt-1 text-foreground">{timingValue}</p>
                </div>
                <div className="rounded-xl bg-background/80 p-2.5 border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attempted / Total</span>
                  <p className="font-bold text-xs mt-1 text-foreground">
                    {attemptedCount} / {totalQuestions} Qs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Key Takeaways & Action Plan ── */}
          <Card className="border shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="h-4 w-4 text-primary" />
                Strategic Insights &amp; Recommendations
              </CardTitle>
              <CardDescription>
                Actionable analysis of your score efficiency, negative marking, and highest-yield next step.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Scoring / Penalty Insight */}
                <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Negative Marking Discipline
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {marksDeducted > 0
                      ? `Penalties consumed ${formatMarks(marksDeducted)} marks (${penaltyPercentage}% of earned score). In ${examName}, disciplined skipping on uncertain MCQs protects your net rank.`
                      : "Flawless discipline! You conceded zero penalty deductions, keeping 100% of earned marks intact."}
                  </p>
                </div>

                {/* NAT Question Strategy */}
                <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Target className="h-4 w-4 text-emerald-600" />
                    Numerical Question (NAT) Opportunity
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {natStats && natStats.skipped > 0
                      ? `You left ${natStats.skipped} NAT questions unattempted. Because NAT has ZERO negative marking, always attempt them with your best calculated value!`
                      : natStats && natStats.total > 0
                      ? `Excellent NAT coverage! You attempted every numerical question with zero downside risk.`
                      : "Multi-format coverage: practice balanced distribution across single and multi-choice formats."}
                  </p>
                </div>

                {/* Pacing & Endurance */}
                <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Clock className="h-4 w-4 text-sky-600" />
                    Pacing &amp; Mental Energy
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {driftPercent && driftPercent > 10
                      ? `Pace slowed by ${driftPercent}% in the final third. Build test stamina with full-length timed tests.`
                      : driftPercent && driftPercent < -10
                      ? `You moved ${Math.abs(driftPercent)}% faster in the final third — be careful not to rush late calculations.`
                      : "Your pace remained consistent from start to finish. Solid time control and focus endurance."}
                  </p>
                </div>

                {/* Top Recommended Next Action */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Lightbulb className="h-4 w-4" />
                    Recommended Next Action
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {weakestSubject && (weakestSubject.correctRate ?? 0) < 60
                      ? `High-ROI drill: ${weakestSubject.name} (${formatRate(weakestSubject.correctRate)} accuracy). Drilling 10-15 targeted questions here will unlock rapid mark gains.`
                      : wrongCount > 0
                      ? `Review your ${wrongCount} mistake${wrongCount === 1 ? "" : "s"} in the Solutions tab to clear concept ambiguities before your next paper.`
                      : "High scoring session! Challenge yourself with another full mock or timed practice sprint."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Subject-Wise Performance ── */}
          {subjectBreakdown.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Subject-Wise Performance
                    </CardTitle>
                    <CardDescription>
                      Breakdown of questions, net marks, and accuracy across each subject.
                    </CardDescription>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Sort:</span>
                    <select
                      value={subjectSort}
                      onChange={(e) => setSubjectSort(e.target.value as any)}
                      className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="weakest">Priority Focus (Lowest Accuracy)</option>
                      <option value="highest-marks">Highest Net Marks</option>
                      <option value="highest-accuracy">Highest Accuracy</option>
                      <option value="questions">Most Questions</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mobile Cards */}
                <div className="space-y-3 sm:hidden">
                  {sortedSubjects.map((subject) => {
                    const isWeak = subject.id === weakestSubject?.id;
                    const isStrong = subject.id === strongestSubject?.id;
                    return (
                      <div
                        key={subject.id}
                        className={`rounded-2xl border p-4 shadow-xs space-y-3 ${
                          isStrong
                            ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                            : isWeak
                            ? "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {isStrong && <Award className="h-3.5 w-3.5 text-emerald-600" />}
                              {isWeak && <TrendingDown className="h-3.5 w-3.5 text-rose-600" />}
                              <p className="font-bold text-sm">{subject.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {subject.graded} question{subject.graded === 1 ? "" : "s"}
                            </p>
                          </div>
                          <span className="font-black text-sm tabular-nums">
                            {formatMarks(subject.netMarks)} marks
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Accuracy</span>
                            <strong className="font-semibold">{formatRate(subject.correctRate)}</strong>
                          </div>
                          <MiniBar
                            value={subject.correctRate}
                            color={isStrong ? "bg-emerald-500" : isWeak ? "bg-rose-500" : "bg-primary"}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="rounded-lg bg-emerald-50/80 p-1.5 dark:bg-emerald-950/30">
                            <div className="font-bold text-emerald-700 dark:text-emerald-300">{subject.correct}</div>
                            <div className="text-[10px] text-muted-foreground">Correct</div>
                          </div>
                          <div className="rounded-lg bg-rose-50/80 p-1.5 dark:bg-rose-950/30">
                            <div className="font-bold text-rose-700 dark:text-rose-300">{subject.wrong}</div>
                            <div className="text-[10px] text-muted-foreground">Wrong</div>
                          </div>
                          <div className="rounded-lg bg-muted/80 p-1.5">
                            <div className="font-bold text-muted-foreground">{subject.skipped}</div>
                            <div className="text-[10px] text-muted-foreground">Skipped</div>
                          </div>
                        </div>

                        <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs">
                          <Link href={isSprint ? "/practice" : `/test/select?mode=subject_wise&subject=${subject.id}`}>
                            Practice {subject.name} <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto rounded-xl border sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-xs font-semibold text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 text-center font-medium">Questions</th>
                        <th className="px-4 py-3 text-center font-medium text-emerald-600 dark:text-emerald-400">Correct</th>
                        <th className="px-4 py-3 text-center font-medium text-rose-600 dark:text-rose-400">Wrong</th>
                        <th className="px-4 py-3 text-center font-medium">Skipped</th>
                        <th className="px-4 py-3 text-center font-medium">Net Marks</th>
                        <th className="px-4 py-3 text-center font-medium">Accuracy</th>
                        <th className="px-4 py-3 pr-4 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedSubjects.map((s) => {
                        const isStrong = s.id === strongestSubject?.id;
                        const isWeak = s.id === weakestSubject?.id;
                        return (
                          <tr
                            key={s.id}
                            className={`transition-colors hover:bg-muted/30 ${
                              isStrong ? "bg-emerald-50/20 dark:bg-emerald-950/10" : isWeak ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isStrong && (
                                  <span title="Top Subject">
                                    <Award className="h-4 w-4 shrink-0 text-emerald-600" />
                                  </span>
                                )}
                                {isWeak && (
                                  <span title="Priority Focus">
                                    <TrendingDown className="h-4 w-4 shrink-0 text-rose-600" />
                                  </span>
                                )}
                                <span className="font-semibold">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{s.graded}</td>
                            <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">{s.correct}</td>
                            <td className="px-4 py-3 text-center font-semibold text-rose-600 tabular-nums dark:text-rose-400">{s.wrong}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{s.skipped}</td>
                            <td className="px-4 py-3 text-center font-black tabular-nums">{formatMarks(s.netMarks)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold tabular-nums text-xs">{formatRate(s.correctRate)}</span>
                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isStrong ? "bg-emerald-500" : isWeak ? "bg-rose-500" : "bg-primary"
                                    }`}
                                    style={{ width: `${Math.max(0, Math.min(100, s.correctRate ?? 0))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 pr-4 text-right">
                              <Button asChild size="sm" variant="ghost" className="h-7 text-xs px-2 text-primary hover:text-primary">
                                <Link href={isSprint ? "/practice" : `/test/select?mode=subject_wise&subject=${s.id}`}>
                                  Practice <ChevronRight className="ml-0.5 h-3 w-3" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {weakestSubject && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
                    <div className="flex items-start gap-2.5">
                      <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                      <div>
                        <span className="font-bold text-foreground">Priority Focus: </span>
                        <span className="text-muted-foreground">
                          {weakestSubject.name} — {weakestSubject.wrong} wrong and {weakestSubject.skipped} skipped out of {weakestSubject.graded} questions.
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white">
                      <Link href={isSprint ? "/practice" : `/test/select?${practiceParams}`}>
                        Drill {weakestSubject.name} <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Question Format Breakdown ── */}
          {questionTypeBreakdown.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Layers className="h-4 w-4 text-primary" />
                      Question Format Performance (MCQ · MSQ · NAT)
                    </CardTitle>
                    <CardDescription>
                      Performance separated by single-choice, multiple-choice, and numerical answer types.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {questionTypeBreakdown.map((item) => {
                    const typeColors: Record<string, string> = {
                      MCQ: "bg-sky-50/80 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/40",
                      MSQ: "bg-violet-50/80 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/40",
                      NAT: "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40",
                    };
                    const typeLabelColors: Record<string, string> = {
                      MCQ: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
                      MSQ: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
                      NAT: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                    };
                    return (
                      <div key={item.type} className={`rounded-2xl border p-4 shadow-xs ${typeColors[item.type] ?? "bg-card border"}`}>
                        <div className="flex items-center justify-between border-b border-current/10 pb-3">
                          <div>
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold ${typeLabelColors[item.type] ?? ""}`}>
                              {item.type}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.type === "MCQ" ? "Single choice" : item.type === "MSQ" ? "Multi-select" : "Numerical"}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {item.total} Q{item.total === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="my-3 space-y-3">
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Correct rate</span>
                              <strong className="font-semibold">{formatRate(item.correctRate)}</strong>
                            </div>
                            <MiniBar value={item.correctRate} color="bg-primary" />
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Attempt accuracy</span>
                              <strong className="font-semibold">{formatRate(item.attemptAccuracy)}</strong>
                            </div>
                            <MiniBar value={item.attemptAccuracy} color="bg-emerald-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 rounded-xl bg-background/60 p-2 text-center text-xs">
                          <div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">{item.correct}</div>
                            <div className="text-[10px] text-muted-foreground">Correct</div>
                          </div>
                          <div>
                            <div className="font-bold text-rose-600 dark:text-rose-400">{item.wrong}</div>
                            <div className="text-[10px] text-muted-foreground">Wrong</div>
                          </div>
                          <div>
                            <div className="font-bold text-muted-foreground">{item.skipped}</div>
                            <div className="text-[10px] text-muted-foreground">Skipped</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
                          <span className="text-muted-foreground">Net marks</span>
                          <strong className="font-black tabular-nums">{formatMarks(item.netMarks)} marks</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── 1-Mark vs 2-Mark Tier Analysis ── */}
          {marksTierBreakdown.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  1-Mark vs 2-Mark Question Balance
                </CardTitle>
                <CardDescription>
                  Comparison of simple fundamental questions (1-mark) vs multi-step comprehensive problems (2-mark).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {marksTierBreakdown.map((t) => (
                    <div key={t.tier} className="rounded-2xl border bg-muted/30 p-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-lg">{t.tier}-Mark Questions</h4>
                          <p className="text-xs text-muted-foreground">{t.total} question{t.total === 1 ? "" : "s"}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary tabular-nums">
                          {formatMarks(t.netMarks)} marks
                        </span>
                      </div>
                      <div className="my-3 space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Correct rate</span>
                            <strong>{formatRate(t.correctRate)}</strong>
                          </div>
                          <MiniBar value={t.correctRate} color="bg-primary" />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Attempt accuracy</span>
                            <strong>{formatRate(t.attemptAccuracy)}</strong>
                          </div>
                          <MiniBar value={t.attemptAccuracy} color="bg-emerald-500" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.correct} correct</span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">{t.wrong} wrong</span>
                        <span>{t.skipped} skipped</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Attempt Strategy Snapshot ── */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Brain className="h-4 w-4 text-primary" />
                Attempt Strategy Snapshot
              </CardTitle>
              <CardDescription>
                High-level diagnostic indicators of guessing tendencies, pace efficiency, and penalty losses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={Gauge}
                  iconClass="bg-emerald-500/10 text-emerald-600"
                  bg="bg-emerald-50/40 dark:bg-emerald-950/10"
                  border="border-emerald-200 dark:border-emerald-800/40"
                  title="Efficiency Index"
                  value={efficiencyScore != null ? `${efficiencyScore}%` : "—"}
                  description={
                    efficiencyScore == null
                      ? "Per-question timing required."
                      : efficiencyScore >= 50
                      ? "Over half your timed attempts were quick and correct — strong foundational confidence."
                      : "Less than half were quick wins. Work on solving core question patterns faster."
                  }
                  pill={efficiencyScore != null ? (efficiencyScore >= 50 ? "Solid" : "Needs speed") : undefined}
                />
                <InsightCard
                  icon={FlameKindling}
                  iconClass="bg-amber-500/10 text-amber-600"
                  bg="bg-amber-50/40 dark:bg-amber-950/10"
                  border="border-amber-200 dark:border-amber-800/40"
                  title="Guess Risk"
                  value={riskScore != null ? `${riskScore}%` : "—"}
                  description={
                    riskScore == null
                      ? "Per-question timing required."
                      : riskScore <= 10
                      ? "Very few fast-wrong answers — minimal blind guessing detected."
                      : "Noticeable fast-wrong answers. Ensure you are not rushing through unfamiliar questions."
                  }
                  pill={riskScore != null ? (riskScore <= 10 ? "Low" : "Watch out") : undefined}
                />
                <InsightCard
                  icon={Shield}
                  iconClass="bg-rose-500/10 text-rose-600"
                  bg="bg-rose-50/40 dark:bg-rose-950/10"
                  border="border-rose-200 dark:border-rose-800/40"
                  title="Penalty Exposure"
                  value={`${penaltyRisk}%`}
                  description={
                    penaltyRisk === 0
                      ? "Zero marks lost to penalties this session."
                      : `Penalties consumed ${penaltyRisk}% of maximum marks. Skipping uncertain questions would protect your score.`
                  }
                  pill={penaltyRisk === 0 ? "Zero" : penaltyRisk <= 10 ? "Mild" : "High"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sprint Challenge Share */}
          {isSprint && <ShareChallenge sessionId={sessionId} />}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: TIME & PACE ANALYSIS
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "time-pace" && (
        <div className="space-y-6">
          {pacing?.available && pacing.benchmark ? (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Timer className="h-4 w-4 text-primary" />
                      Time &amp; Pace Breakdown
                    </CardTitle>
                    <CardDescription>
                      Foreground active time per question, split at{" "}
                      {pacing.benchmark.kind === "limit"
                        ? "your per-question allocated budget"
                        : "your median per-question time"}
                      . Backgrounded time never counts.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pacing.recorded} / {pacing.total} questions timed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pace KPIs */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBadge
                    icon={Clock}
                    label="Recorded focus"
                    value={formatTime(pacing.totalSeconds)}
                    sub={`across ${pacing.recorded} questions`}
                    iconClass="bg-sky-500/10 text-sky-600"
                  />
                  <StatBadge
                    icon={Zap}
                    label="Median / Q"
                    value={pacing.medianSeconds == null ? "—" : formatTime(pacing.medianSeconds)}
                    sub="half were quicker"
                    iconClass="bg-amber-500/10 text-amber-600"
                  />
                  <StatBadge
                    icon={Target}
                    label="Average / Q"
                    value={pacing.meanSeconds == null ? "—" : formatTime(pacing.meanSeconds)}
                    sub={`÷ ${pacing.recorded} recorded`}
                    iconClass="bg-primary/10 text-primary"
                  />
                  <StatBadge
                    icon={Timer}
                    label={pacing.benchmark.kind === "limit" ? "Target Budget" : "Typical Time"}
                    value={formatTime(pacing.benchmark.seconds)}
                    sub={pacing.benchmark.kind === "limit" ? "even allocation" : "median focus"}
                    iconClass="bg-emerald-500/10 text-emerald-600"
                  />
                </div>

                {/* 4 Quadrants Speed vs Accuracy Matrix */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    Speed vs. Accuracy Quadrants
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {paceQuadrants.map((q) => {
                      const Icon = q.icon;
                      return (
                        <div key={q.key} className={`rounded-2xl border p-4 ${q.bg} ${q.border}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${q.iconClass}`} />
                              <span className="text-sm font-semibold">{q.label}</span>
                            </div>
                            <span className={`text-2xl font-black tabular-nums ${q.countClass}`}>{q.count}</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.hint}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {driftText && (
                  <div className="flex items-start gap-2.5 rounded-xl border bg-muted/20 p-3.5 text-xs leading-relaxed">
                    {(driftPercent ?? 0) > 10 ? (
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    ) : (driftPercent ?? 0) < -10 ? (
                      <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                    ) : (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    <p className="text-muted-foreground">
                      <span className="font-bold text-foreground">Pace drift pattern: </span>
                      {driftText}
                    </p>
                  </div>
                )}

                {/* Slowest Wrong Questions */}
                {pacing.slowestWrong.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      Time Lost on Incorrect Answers
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Questions where you spent the most time but ended up with an incorrect answer — revisit these first.
                    </p>
                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                      {pacing.slowestWrong.map((item) => (
                        <li key={item.questionId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                          <span className="min-w-0 truncate font-medium">
                            Question {item.index}
                            <span className="ml-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                              Incorrect
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                            {formatTime(item.seconds)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topics that take time */}
                {pacing.byTopic.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Topic-Wise Time Consumption
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Mean active time per question by topic, slowest first.
                    </p>
                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                      {pacing.byTopic.slice(0, 5).map((topic) => (
                        <li key={topic.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                          <span className="min-w-0 truncate font-medium">
                            {topic.name}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {topic.questions} Q{topic.questions === 1 ? "" : "s"}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
                            {topic.correctRate != null && (
                              <span
                                className={
                                  topic.correctRate >= 70
                                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                    : topic.correctRate >= 40
                                    ? "font-semibold text-amber-600 dark:text-amber-400"
                                    : "font-semibold text-rose-600 dark:text-rose-400"
                                }
                              >
                                {topic.correctRate}% accuracy
                              </span>
                            )}
                            <span className="font-mono font-bold">{formatTime(topic.meanSeconds)} / Q</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border shadow-sm p-8 text-center text-muted-foreground space-y-2">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <h3 className="text-base font-bold text-foreground">Per-Question Timing Not Available</h3>
              <p className="text-xs max-w-md mx-auto">
                Per-question active foreground timing was not recorded for this test session. Total session duration was {timingValue}.
              </p>
            </Card>
          )}

          {/* Timing methodology footnote */}
          <div className="rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground">How Timing Is Measured:</span>
            <p>
              {timing.note} Only active foreground browser time is recorded — tab switches, background delays, or window unfocus are automatically excluded to give you genuine question-solving metrics.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: CONCEPTS & SYLLABUS
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "concepts" && (
        <div className="space-y-6">
          {/* Concept Diagnostics Panel */}
          <div>
            {diagnosticPanel ?? (diagnostic && <SmartTagPanel result={diagnostic} variant="result" />)}
          </div>

          {/* Automated Spaced Repetition Roadmap */}
          {wrongCount > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  Automated Spaced Repetition Queue
                </CardTitle>
                <CardDescription>
                  Your {wrongCount} missed question{wrongCount === 1 ? "" : "s"} from this test have been automatically added to your spaced revision schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <span className="font-bold text-primary">Stage 1</span>
                    <p className="text-[11px] text-muted-foreground mt-1">Tomorrow</p>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <span className="font-bold">Stage 2</span>
                    <p className="text-[11px] text-muted-foreground mt-1">+3 Days</p>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <span className="font-bold">Stage 3</span>
                    <p className="text-[11px] text-muted-foreground mt-1">+7 Days</p>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <span className="font-bold">Stage 4</span>
                    <p className="text-[11px] text-muted-foreground mt-1">+14 Days</p>
                  </div>
                  <div className="rounded-xl border bg-muted/40 p-3 col-span-2 sm:col-span-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Mastery</span>
                    <p className="text-[11px] text-muted-foreground mt-1">+30 Days</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Reviewing missed questions at increasing intervals guarantees long-term retention into exam day.
                  </p>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
                    <Link href="/revision">
                      Open Revision Queue <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 4: SOLUTIONS & ANSWER REVIEW
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Complete Solutions &amp; Question Review
                  </CardTitle>
                  <CardDescription>
                    Review every question, check step-by-step explanations, and bookmark tricky concepts.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
                  <Link href={`/review/${sessionId}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Full-Screen Review
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {userId ? (
                <EmbeddedReviewPanel sessionId={sessionId} userId={userId} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm">Loading solutions…</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Bottom Navigation Row ── */}
      <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3 print:hidden">
        <Button
          onClick={() => setActiveTab("reviews")}
          size="lg"
          className="h-12 w-full font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Eye className="mr-2 h-4 w-4" />
          Review All Solutions
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-12 w-full font-bold">
          <Link href={isSprint ? "/practice" : "/test/select"}>
            <Play className="mr-2 h-4 w-4" />
            {isSprint ? "Another 5-Q Sprint" : "Take Another Test"}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 w-full font-bold">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
