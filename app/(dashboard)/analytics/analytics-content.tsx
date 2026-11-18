"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-provider";
import {
  BarChart2,
  BarChart3,
  Target,
  Flame,
  Clock,
  Zap,
  BookOpen,
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Info,
  Minus,
  Check,
  X,
  Shield,
  Lightbulb,
  Compass,
  Brain,
  Timer,
  Award,
  Copy,
  Printer,
  Search,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Gauge,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatMarks } from "@/lib/marking";
import {
  formatRate,
  type GroupStats,
  type PacingSummary,
  type QuestionStats,
  type QuestionType,
} from "@/lib/test-metrics";

// ── Types ───────────────────────────────────────────────────────────────────

export interface ScoreTrendItem {
  date: string;
  score: number;
}

export interface WeeklyTrendItem {
  week: string;
  avgScore: number;
}

export interface CumulativePoint {
  label: string;
  avgScore: number;
}

export interface SessionHistoryItem {
  id: string;
  completedAt: string | null;
  dateLabel: string;
  timeLabel: string;
  mode: string;
  paper: string | null;
  year: number | null;
  loadedQuestions: number;
  gradedQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  marksToAll: number;
  ungraded: number;
  correctRate: number | null;
  attemptAccuracy: number | null;
  netMarks: number;
  maximumMarks: number;
  netMarkRate: number | null;
  timingLabel: string;
  timingAvailable: boolean;
  timingSeconds: number | null;
  timingKind: "active" | "elapsed" | "unavailable";
}

export interface TopicAnalyticsItem extends GroupStats {
  subjectName: string;
}

export interface YearWiseItem {
  year: number;
  tests: number;
  graded: number;
  correctRate: number | null;
  netMarks: number;
  maximumMarks: number;
  netMarkRate: number | null;
}

export interface AnalyticsTiming {
  availableSessions: number;
  totalSessions: number;
  totalSeconds: number;
  avgElapsedPerGradedQuestion: number | null;
  perQuestionRecorded: boolean;
  pacing?: PacingSummary;
}

export interface StrategicInsight {
  type: "warning" | "opportunity" | "strength" | "tip";
  title: string;
  description: string;
  stat?: string;
}

export interface AnalyticsContentProps {
  isAdmin?: boolean;
  totalTests: number;
  overall?: QuestionStats;
  byType?: Record<QuestionType, QuestionStats>;
  byTier?: Record<"1" | "2", QuestionStats>;
  subjectStats?: GroupStats[];
  topicStats?: TopicAnalyticsItem[];
  scoreTrend?: ScoreTrendItem[];
  history?: SessionHistoryItem[];
  weeklyTrend?: WeeklyTrendItem[];
  cumulativeProgress?: CumulativePoint[];
  consistencyScore?: number;
  timing?: AnalyticsTiming;
  studyStreak?: number;
  longestStreak?: number;
  streakAvailable?: boolean;
  streakData?: { date: string; count: number }[][];
  dataCaveats?: string[];
  yearWise?: YearWiseItem[];
  examLabel?: string;
  streamLabel?: string;
}

type TabKey = "overview" | "booster" | "syllabus" | "pacing" | "history";

const EMPTY_STATS: QuestionStats = {
  total: 0,
  graded: 0,
  attempted: 0,
  gradedAttempts: 0,
  correct: 0,
  wrong: 0,
  skipped: 0,
  ungraded: 0,
  marksToAll: 0,
  earnedMarks: 0,
  deductedMarks: 0,
  netMarks: 0,
  maximumMarks: 0,
  skippedMarks: 0,
  correctRate: null,
  attemptAccuracy: null,
  netMarkRate: null,
};

function emptyTypeStats(): Record<QuestionType, QuestionStats> {
  return {
    MCQ: { ...EMPTY_STATS },
    MSQ: { ...EMPTY_STATS },
    NAT: { ...EMPTY_STATS },
  };
}

function emptyTierStats(): Record<"1" | "2", QuestionStats> {
  return {
    "1": { ...EMPTY_STATS },
    "2": { ...EMPTY_STATS },
  };
}

function formatTime(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const MODE_LABELS: Record<string, string> = {
  full_mock: "Full mock",
  full_paper: "Full paper",
  subject_wise: "Subject-wise",
  topic_wise: "Topic-wise",
  custom: "Custom",
  sprint: "5-Q sprint",
};

const chartTooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// ── Visual Sub-Components (Inspired by Test Result Page) ────────────────────

function AnimatedCounter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 40;
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
        <span className="text-3xl font-black tracking-tight tabular-nums leading-none">
          <AnimatedCounter value={value} />
        </span>
        <span className="mt-1 text-xs font-medium text-muted-foreground">
          / {formatMarks(maximum)} marks
        </span>
        <span
          className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{
            background: isGood
              ? "hsl(142.1 76.2% 36.3% / 0.12)"
              : isMid
              ? "hsl(43 74% 66% / 0.15)"
              : "hsl(var(--primary) / 0.1)",
            color: isGood
              ? "hsl(142.1 76.2% 36.3%)"
              : isMid
              ? "hsl(43 60% 42%)"
              : "hsl(var(--primary))",
          }}
        >
          {formatRate(percentage)} net
        </span>
      </div>
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
    <div className="flex flex-col items-center rounded-2xl border bg-card p-4 text-center shadow-xs transition-all hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass ?? "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-2xl font-black tabular-nums leading-none">{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground leading-snug">{sub}</p>}
    </div>
  );
}

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
          ? "bg-primary text-primary-foreground border-primary shadow-xs"
          : "bg-background text-foreground border-input hover:bg-accent hover:border-muted-foreground/30"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 font-bold ${
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

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
          <span className="text-xs font-semibold rounded-full border px-2.5 py-0.5 bg-background/80">
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

function EmptyState() {
  return (
    <Card className="border-dashed py-16 text-center">
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
          <BookOpen className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">No completed tests yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Complete tests to unlock comprehensive macro analytics, strategic mark booster diagnostics, syllabus breakdowns, and pacing fatigue analysis.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Button asChild>
            <Link href="/practice">
              <Zap className="mr-1.5 h-4 w-4" />
              Start a 5-Q Sprint
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/test/select">
              <BookOpen className="mr-1.5 h-4 w-4" />
              Full Mocks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ANALYTICS REDESIGN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AnalyticsContent({
  isAdmin = false,
  totalTests,
  overall = EMPTY_STATS,
  byType,
  byTier,
  subjectStats = [],
  topicStats = [],
  scoreTrend = [],
  history = [],
  weeklyTrend = [],
  cumulativeProgress = [],
  consistencyScore = 0,
  timing = {
    availableSessions: 0,
    totalSessions: totalTests,
    totalSeconds: 0,
    avgElapsedPerGradedQuestion: null,
    perQuestionRecorded: false,
  },
  studyStreak = 0,
  longestStreak = 0,
  streakAvailable = true,
  streakData = [],
  dataCaveats = [],
  yearWise = [],
  examLabel = "GATE",
  streamLabel,
}: AnalyticsContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [subjectSort, setSubjectSort] = useState<"weakest" | "highest-marks" | "highest-accuracy" | "questions">("weakest");
  const [topicSearch, setTopicSearch] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [historyModeFilter, setHistoryModeFilter] = useState<string>("all");
  const [visibleHistory, setVisibleHistory] = useState(15);
  const { toast } = useToast();

  if (totalTests === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-16 pt-2">
        <header className="flex flex-col gap-1 border-b pb-4">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Your Performance Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Personalized practice intelligence and strategic guidance for your {examLabel} {streamLabel ? `(${streamLabel})` : ""} journey.
          </p>
        </header>
        <EmptyState />
      </div>
    );
  }

  // Derived core numbers
  const marksNet = overall.netMarks;
  const marksMax = overall.maximumMarks > 0 ? overall.maximumMarks : overall.total;
  const marksEarned = overall.earnedMarks;
  const marksDeducted = overall.deductedMarks;
  const marksRate = overall.netMarkRate ?? (marksMax > 0 ? Math.round((marksNet / marksMax) * 100) : null);
  const penaltyPercentage = marksEarned > 0 ? Math.round((marksDeducted / marksEarned) * 100) : null;
  const notEarnedMarks = Math.max(0, marksMax - marksEarned);

  const isGoodScore = (marksRate ?? 0) >= 60;
  const isMidScore = (marksRate ?? 0) >= 40;

  const headerGradient = isGoodScore
    ? "from-emerald-500/10 via-background to-emerald-500/5"
    : isMidScore
    ? "from-amber-500/10 via-background to-amber-500/5"
    : "from-primary/8 via-background to-primary/4";

  // Personal performance status tier
  const personalStatus = isGoodScore
    ? {
        icon: "🌟",
        title: "You are in the Competitive Tier",
        subtitle: "Your accuracy is high and concepts are solid. Focus on speed and pacing refinement.",
      }
    : isMidScore
    ? {
        icon: "⚡",
        title: "You are Building Strong Momentum",
        subtitle: "You have a solid base. Plugging negative mark leaks will give you an immediate score jump.",
      }
    : {
        icon: "🎯",
        title: "You are in the Foundation Building Phase",
        subtitle: "Focusing on high-yield topics and disciplined question selection will rapidly boost your marks.",
      };

  // Types & Tiers
  const typeStats = byType || emptyTypeStats();
  const tierStats = byTier || emptyTierStats();

  // Subject sorting
  const sortedSubjects = useMemo(() => {
    const list = [...subjectStats].filter((s) => s.graded > 0);
    if (subjectSort === "weakest") {
      return list.sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101));
    }
    if (subjectSort === "highest-marks") {
      return list.sort((a, b) => b.netMarks - a.netMarks);
    }
    if (subjectSort === "highest-accuracy") {
      return list.sort((a, b) => (b.attemptAccuracy ?? -1) - (a.attemptAccuracy ?? -1));
    }
    return list.sort((a, b) => b.graded - a.graded);
  }, [subjectStats, subjectSort]);

  const weakestSubject = sortedSubjects[0];
  const strongestSubject = [...sortedSubjects].sort((a, b) => (b.correctRate ?? -1) - (a.correctRate ?? -1))[0];

  // Weakest topics spotlight (<50% correct rate, at least 2 questions)
  const priorityTopics = useMemo(() => {
    return [...topicStats]
      .filter((t) => t.graded >= 2 && (t.correctRate ?? 100) < 55)
      .sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101))
      .slice(0, 6);
  }, [topicStats]);

  // Filtered topics table
  const filteredTopics = useMemo(() => {
    let list = [...topicStats];
    if (selectedSubjectFilter !== "all") {
      list = list.filter((t) => t.subjectId === selectedSubjectFilter);
    }
    if (topicSearch.trim()) {
      const q = topicSearch.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.subjectName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101));
  }, [topicStats, selectedSubjectFilter, topicSearch]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    let list = [...history];
    if (historyModeFilter !== "all") {
      list = list.filter((item) => item.mode === historyModeFilter);
    }
    return list;
  }, [history, historyModeFilter]);

  // Projected Mark Boost Calculation (Dynamic Realistic Modeling)
  const penaltyRecoveryGain = Math.round(marksDeducted * 0.5 * 10) / 10;
  const natUnattemptedOpportunity = Math.round((typeStats.NAT.skipped * 0.8) * 10) / 10;
  const tier1AccuracyGain = Math.round((tierStats["1"].wrong * 0.4 * 1.0) * 10) / 10;
  const totalBoostPotential = Math.max(3, Math.round((penaltyRecoveryGain + natUnattemptedOpportunity + tier1AccuracyGain) * 10) / 10);

  // Pacing quadrants
  const pacingData = timing.pacing;
  const paceQuadrants = pacingData?.available
    ? [
        {
          key: "fastCorrect",
          label: "Quick & correct",
          count: pacingData.quadrants.fastCorrect,
          hint: "Secure mastery — keep these concepts in active recall rotation.",
          bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
          border: "border-emerald-200 dark:border-emerald-800/40",
          countClass: "text-emerald-700 dark:text-emerald-300",
          icon: Zap,
          iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
        },
        {
          key: "fastWrong",
          label: "Quick & wrong",
          count: pacingData.quadrants.fastWrong,
          hint: "Rushed or guessed — slow down question reading; eliminate trap options.",
          bg: "bg-amber-50/70 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-800/40",
          countClass: "text-amber-700 dark:text-amber-300",
          icon: AlertTriangle,
          iconClass: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
        },
        {
          key: "slowCorrect",
          label: "Slow & correct",
          count: pacingData.quadrants.slowCorrect,
          hint: "Accurate but time-expensive — drill shortcuts and standard formulas.",
          bg: "bg-sky-50/70 dark:bg-sky-950/20",
          border: "border-sky-200 dark:border-sky-800/40",
          countClass: "text-sky-700 dark:text-sky-300",
          icon: Clock,
          iconClass: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50",
        },
        {
          key: "slowWrong",
          label: "Slow & wrong",
          count: pacingData.quadrants.slowWrong,
          hint: "Double penalty (lost minutes + negative mark) — priority revision topics.",
          bg: "bg-rose-50/70 dark:bg-rose-950/20",
          border: "border-rose-200 dark:border-rose-800/40",
          countClass: "text-rose-700 dark:text-rose-300",
          icon: X,
          iconClass: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50",
        },
      ]
    : [];

  const driftPercent = pacingData?.drift?.percent ?? null;
  const driftText =
    driftPercent == null
      ? null
      : driftPercent > 10
      ? `You spent ${driftPercent}% more time per question in the final third — late fatigue is eating into your pace.`
      : driftPercent < -10
      ? `You took ${Math.abs(driftPercent)}% less time per question in the final third — ensure you are not rushing the closing questions.`
      : "Your pacing remained remarkably consistent from opening to closing questions.";

  // Share Scorecard handler
  const handleCopyScorecard = () => {
    const text = `🎯 StudentAce Performance Analytics Report
Exam: ${examLabel} ${streamLabel ? `(${streamLabel})` : ""}
Total Tests Completed: ${totalTests}
Net Score: ${formatMarks(marksNet)} / ${formatMarks(marksMax)} marks (${formatRate(marksRate)} net)
Attempt Accuracy: ${formatRate(overall.attemptAccuracy)} | Correct Rate: ${formatRate(overall.correctRate)}
Questions: ${overall.correct} Correct | ${overall.wrong} Wrong | ${overall.skipped} Skipped
Active Streak: ${studyStreak} Days (Longest: ${longestStreak})
${strongestSubject ? `Top Subject: ${strongestSubject.name} (${formatRate(strongestSubject.correctRate)})` : ""}
${weakestSubject ? `Priority Subject: ${weakestSubject.name} (${formatRate(weakestSubject.correctRate)})` : ""}
Estimated Marks Boost Potential: +${totalBoostPotential} marks
Practice more on https://studentace.in`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast("Performance scorecard copied to clipboard!", "success");
    }
  };

  // WhatsApp Share handler
  const handleWhatsAppShare = () => {
    const text = `📊 *StudentAce Performance Analytics Report*
━━━━━━━━━━━━━━━━━━━━━
📚 *Exam:* ${examLabel}${streamLabel ? ` (${streamLabel})` : ""}
📝 *Tests Completed:* ${totalTests} tests
🏆 *Overall Score:* ${formatMarks(marksNet)} / ${formatMarks(marksMax)} marks (${formatRate(marksRate)} net)
🎯 *Accuracy:* ${formatRate(overall.attemptAccuracy)} (Correct Rate: ${formatRate(overall.correctRate)})
📊 *Questions:* ${overall.correct} Correct · ${overall.wrong} Wrong · ${overall.skipped} Skipped
🔥 *Active Streak:* ${studyStreak} Days (Longest: ${longestStreak} days)
${strongestSubject ? `⭐ *Top Subject:* ${strongestSubject.name} (${formatRate(strongestSubject.correctRate)})\n` : ""}${weakestSubject ? `🎯 *Focus Subject:* ${weakestSubject.name} (${formatRate(weakestSubject.correctRate)})\n` : ""}━━━━━━━━━━━━━━━━━━━━━
👉 Track your performance & practice on StudentAce:
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

  // Marks composition bar percentages
  const earnedPct = marksMax > 0 ? Math.min(100, (marksEarned / marksMax) * 100) : 0;
  const deductedPct = marksMax > 0 ? Math.min(100 - earnedPct, (marksDeducted / marksMax) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 pt-2 print:p-0 print:space-y-4">
      {/* ── Navigation & Context Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 pt-1 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {streamLabel && (
              <Badge variant="outline" className="font-medium">
                {streamLabel}
              </Badge>
            )}
            <Badge variant="secondary" className="font-semibold">
              {examLabel} Overall Analytics
            </Badge>
            <span className="text-muted-foreground">· {totalTests} Tests Analyzed</span>
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
            Share Report
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

      {/* ── Hero Card (Comprehensive Performance Summary) ────────────────── */}
      <Card className="overflow-hidden border-0 shadow-md ring-1 ring-border/60">
        <div className={`bg-gradient-to-br ${headerGradient} px-5 py-6 sm:px-8 sm:py-7`}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-xs backdrop-blur-sm">
                <span className="text-base">{personalStatus.icon}</span>
                <span>{personalStatus.title}</span>
                <span className="text-muted-foreground hidden sm:inline">— {personalStatus.subtitle}</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Your Performance &amp; Readiness
                </h1>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Your personalized performance intelligence, consolidated from all {totalTests} completed tests in {examLabel}
                  {streamLabel ? ` · ${streamLabel}` : ""}. Unbiased, objective metrics calculated directly from your question attempts.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="h-3 w-3" /> {overall.correct} Correct
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <X className="h-3 w-3" /> {overall.wrong} Wrong
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Minus className="h-3 w-3" /> {overall.skipped} Skipped
                </span>
                {overall.marksToAll > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Award className="h-3 w-3" /> {overall.marksToAll} Marks to All
                  </span>
                )}
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
              label="Attempt Accuracy"
              value={formatRate(overall.attemptAccuracy)}
              sub={`${overall.correct} / ${overall.gradedAttempts} graded attempts`}
              iconClass="bg-primary/10 text-primary"
            />
            <StatBadge
              icon={Check}
              label="Correct Rate"
              value={formatRate(overall.correctRate)}
              sub={`${overall.correct} / ${overall.graded} total questions`}
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatBadge
              icon={BarChart2}
              label="Net Mark Rate"
              value={formatRate(overall.netMarkRate)}
              sub={`${formatMarks(overall.netMarks)} net / ${formatMarks(overall.maximumMarks)} max`}
              iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            />
            <StatBadge
              icon={Flame}
              label="Study Momentum"
              value={streakAvailable ? `${studyStreak} Days` : `${totalTests} Tests`}
              sub={streakAvailable ? `Best streak: ${longestStreak} days` : "Tests completed"}
              iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Interactive Marks Composition Breakdown Bar */}
          <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Aggregated Marks Composition Ledger
              </span>
              <span className="text-xs text-muted-foreground">
                Max Possible: <strong className="text-foreground">{formatMarks(marksMax)} marks</strong>
              </span>
            </div>

            {/* Segmented Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500 transition-all duration-700"
                style={{ width: `${earnedPct}%` }}
                title={`Earned: ${formatMarks(marksEarned)} marks`}
              />
              <div
                className="bg-rose-500 transition-all duration-700"
                style={{ width: `${deductedPct}%` }}
                title={`Penalties: ${formatMarks(marksDeducted)} marks`}
              />
              <div
                className="bg-muted-foreground/20 transition-all duration-700"
                style={{ width: `${Math.max(0, 100 - earnedPct - deductedPct)}%` }}
                title={`Unearned: ${formatMarks(notEarnedMarks)} marks`}
              />
            </div>

            {/* 3-Column Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50/60 p-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                <div className="font-bold text-sm tabular-nums">+{formatMarks(marksEarned)}</div>
                <div className="text-[11px] opacity-80">Earned Marks</div>
              </div>
              <div className="rounded-lg bg-rose-50/60 p-2 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                <div className="font-bold text-sm tabular-nums">−{formatMarks(marksDeducted)}</div>
                <div className="text-[11px] opacity-80">Negative Deductions</div>
              </div>
              <div className="rounded-lg bg-muted/80 p-2 text-muted-foreground">
                <div className="font-bold text-sm tabular-nums">{formatMarks(notEarnedMarks)}</div>
                <div className="text-[11px] opacity-80">Unearned / Skipped</div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-1">
              <p>
                • Negative penalties shaved <strong>{formatMarks(marksDeducted)} marks</strong> ({penaltyPercentage ?? 0}% of your earned score). In {examLabel}, disciplined elimination protects rank.
              </p>
              <p>
                • Skipped questions left <strong>{formatMarks(overall.skippedMarks)} positive marks</strong> unattempted. Skipping carries zero penalty and never reduces net marks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Data Limitations / Caveats ── */}
      {dataCaveats.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Data observations across your test history</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              {dataCaveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Quick Action Center Bar ── */}
      <Card className="border shadow-xs print:hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Your Action Center
              </h2>
              <p className="text-xs text-muted-foreground">
                Rapidly target your highest-leak weak spots, take a 5-Q sprint, or test a full mock.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
              {weakestSubject && (
                <Button
                  asChild
                  variant="outline"
                  className="h-9 text-xs font-semibold border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  <Link href={`/practice?mode=subject_wise&subject=${weakestSubject.id}`}>
                    <Target className="mr-1.5 h-3.5 w-3.5" />
                    Drill {weakestSubject.name}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="h-9 text-xs font-semibold">
                <Link href="/practice">
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  5-Q Sprint
                </Link>
              </Button>
              <Button asChild className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/test/select">
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Take Full Mock
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Calculation Transparency & Scope Callout ── */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-card to-background p-4 sm:p-4.5 shadow-xs">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
          <Info className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-foreground">How Your Analytics Are Calculated:</span>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary">
              Accumulated · Question-Weighted Basis
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            All data across these tabs is calculated on an <strong>accumulated, question-weighted basis across every single question you solved</strong> in all your {totalTests} completed tests — <em>never as a simple average of test percentages</em>. This ensures full 65-question mock exams carry exact proportional mathematical weight compared to 5-question practice sprints, giving you a completely honest, unskewed assessment of your real exam readiness.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB NAVIGATION — Cleanly separated into 5 strategic views
          ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 -mx-4 border-b bg-background/95 backdrop-blur-md px-4 py-3 sm:-mx-6 sm:px-6 print:hidden">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <TabPill
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={BarChart2}
            label="Executive Scorecard"
          />
          <TabPill
            active={activeTab === "booster"}
            onClick={() => setActiveTab("booster")}
            icon={Sparkles}
            label="Score Booster & Strategy"
            badge={`+${totalBoostPotential} Marks`}
          />
          <TabPill
            active={activeTab === "syllabus"}
            onClick={() => setActiveTab("syllabus")}
            icon={Brain}
            label="Syllabus & Topics"
            badge={String(subjectStats.length)}
          />
          <TabPill
            active={activeTab === "pacing"}
            onClick={() => setActiveTab("pacing")}
            icon={Timer}
            label="Time & Pacing"
          />
          <TabPill
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={ListChecks}
            label="Test History"
            badge={String(totalTests)}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: EXECUTIVE SCORECARD & OVERVIEW
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Tab calculation context & explanation */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <BarChart2 className="h-4 w-4 text-primary shrink-0" />
              <span><strong>Scorecard Calculation:</strong> Accumulated lifetime ledger summing your {overall.graded} graded questions, {overall.correct} correct answers, and −{formatMarks(marksDeducted)} penalty deductions across all tests.</span>
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0 self-start sm:self-auto font-semibold">
              Lifetime Ledger
            </Badge>
          </div>

          {/* Real-Exam Score Projection & Attempt Discipline */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-gradient-to-br from-card to-primary/[0.03] p-5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  Standard 100-Mark Real Exam Target Band
                </span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                  Projected Baseline
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums tracking-tight text-foreground">
                  {Math.max(0, Math.round((marksRate ?? 0) - 4))} – {Math.min(100, Math.round((marksRate ?? 0) + 4))}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Marks / 100</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your question-weighted net mark rate ({formatRate(marksRate)}) translates to this current benchmark band on a standard 100-mark paper. With the score boosters in your next tab, your target climbs to <strong>{Math.min(100, Math.round((marksRate ?? 0) + totalBoostPotential))} marks</strong>.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Question Attempt Discipline Ratio
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:border-emerald-800">
                  {Math.round((overall.attempted / (overall.graded || 1)) * 100)}% Attempted
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums tracking-tight text-foreground">
                  {formatRate(overall.attemptAccuracy)}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Accuracy on Attempts</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {overall.attemptAccuracy != null && overall.attemptAccuracy >= 75
                  ? "High Precision Discipline: Your accuracy when attempting questions is outstanding. You can safely increase your attempt volume, particularly on zero-penalty NAT questions."
                  : overall.attemptAccuracy != null && overall.attemptAccuracy >= 55
                  ? "Balanced Selection: You maintain a reasonable trade-off between speed and risk. Curbing uncertain 4-option guesses will immediately push accuracy past 75%."
                  : "Elevated Risk on MCQs: You are taking excessive penalties from uncalculated guesses. Applying the 50/50 elimination rule will dramatically rescue lost marks."}
              </p>
            </div>
          </div>
          {/* Question Format Mastery (MCQ vs MSQ vs NAT) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight">Question Format Performance Matrix</h2>
                <p className="text-xs text-muted-foreground">
                  GATE and competitive exams evaluate candidates differently across question architectures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* MCQ */}
              <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 font-bold text-xs text-blue-600 dark:text-blue-400">
                      MCQ
                    </span>
                    <span className="font-bold text-sm">Multiple Choice</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300 dark:border-rose-800">
                    Has Negative Marks
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Attempt Accuracy</span>
                    <strong className="font-mono">{formatRate(typeStats.MCQ.attemptAccuracy)}</strong>
                  </div>
                  <MiniBar value={typeStats.MCQ.attemptAccuracy} color="bg-blue-500" />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Correct Rate</span>
                    <strong className="font-mono">{formatRate(typeStats.MCQ.correctRate)}</strong>
                  </div>
                  <div className="flex justify-between text-xs pt-0.5">
                    <span className="text-muted-foreground">Net Marks</span>
                    <strong className="font-mono">{formatMarks(typeStats.MCQ.netMarks)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 pt-0.5">
                    <span>Penalties Conceded</span>
                    <strong className="font-mono">−{formatMarks(typeStats.MCQ.deductedMarks)}</strong>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground pt-1 border-t">
                  Carry 1/3 negative marking. Avoid guessing on 4 options; eliminate at least 2 before taking a calculated risk.
                </p>
              </div>

              {/* MSQ */}
              <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 font-bold text-xs text-purple-600 dark:text-purple-400">
                      MSQ
                    </span>
                    <span className="font-bold text-sm">Multiple Select</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:border-emerald-800">
                    0 Negative Marks
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Attempt Accuracy</span>
                    <strong className="font-mono">{formatRate(typeStats.MSQ.attemptAccuracy)}</strong>
                  </div>
                  <MiniBar value={typeStats.MSQ.attemptAccuracy} color="bg-purple-500" />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Correct Rate</span>
                    <strong className="font-mono">{formatRate(typeStats.MSQ.correctRate)}</strong>
                  </div>
                  <div className="flex justify-between text-xs pt-0.5">
                    <span className="text-muted-foreground">Net Marks</span>
                    <strong className="font-mono">{formatMarks(typeStats.MSQ.netMarks)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-0.5">
                    <span>Questions Graded</span>
                    <strong className="font-mono">{typeStats.MSQ.graded}</strong>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground pt-1 border-t">
                  Zero negative marks, but requires choosing ALL correct choices without partial marks. Requires deep conceptual precision.
                </p>
              </div>

              {/* NAT */}
              <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      NAT
                    </span>
                    <span className="font-bold text-sm">Numerical Answer</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:border-emerald-800">
                    0 Negative Marks
                  </Badge>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Attempt Accuracy</span>
                    <strong className="font-mono">{formatRate(typeStats.NAT.attemptAccuracy)}</strong>
                  </div>
                  <MiniBar value={typeStats.NAT.attemptAccuracy} color="bg-emerald-500" />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Correct Rate</span>
                    <strong className="font-mono">{formatRate(typeStats.NAT.correctRate)}</strong>
                  </div>
                  <div className="flex justify-between text-xs pt-0.5">
                    <span className="text-muted-foreground">Net Marks</span>
                    <strong className="font-mono">{formatMarks(typeStats.NAT.netMarks)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 pt-0.5">
                    <span>Skipped / Unattempted</span>
                    <strong className="font-mono">{typeStats.NAT.skipped} Qs</strong>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground pt-1 border-t">
                  Zero penalty risk! Attempt every NAT where you can calculate a reasonable value — never leave NATs blank without trying!
                </p>
              </div>
            </div>
          </div>

          {/* Question Tier Breakdown (1-Mark vs 2-Mark) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 font-bold text-xs text-primary">
                    1M
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">1-Mark Questions (Foundational)</h3>
                    <p className="text-[11px] text-muted-foreground">Recall, direct formulas, short calculations</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {formatRate(tierStats["1"].correctRate)} Correct
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="rounded-lg bg-muted/60 p-2">
                  <div className="font-bold text-sm">{tierStats["1"].graded}</div>
                  <div className="text-[10px] text-muted-foreground">Total Qs</div>
                </div>
                <div className="rounded-lg bg-emerald-50/60 p-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <div className="font-bold text-sm">{formatRate(tierStats["1"].attemptAccuracy)}</div>
                  <div className="text-[10px] opacity-80">Accuracy</div>
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <div className="font-bold text-sm">{formatMarks(tierStats["1"].netMarks)}</div>
                  <div className="text-[10px] text-muted-foreground">Net Marks</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 font-bold text-xs text-primary">
                    2M
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">2-Mark Questions (Analytical)</h3>
                    <p className="text-[11px] text-muted-foreground">Multi-concept, high weightage, higher negative risk (-0.66)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {formatRate(tierStats["2"].correctRate)} Correct
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="rounded-lg bg-muted/60 p-2">
                  <div className="font-bold text-sm">{tierStats["2"].graded}</div>
                  <div className="text-[10px] text-muted-foreground">Total Qs</div>
                </div>
                <div className="rounded-lg bg-emerald-50/60 p-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <div className="font-bold text-sm">{formatRate(tierStats["2"].attemptAccuracy)}</div>
                  <div className="text-[10px] opacity-80">Accuracy</div>
                </div>
                <div className="rounded-lg bg-muted/60 p-2">
                  <div className="font-bold text-sm">{formatMarks(tierStats["2"].netMarks)}</div>
                  <div className="text-[10px] text-muted-foreground">Net Marks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Trajectory & Growth Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Score Trend (Last 10 Tests) */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Recent Test Score Trajectory
                </CardTitle>
                <CardDescription className="text-xs">
                  Correct rate percentage over your last 10 completed test sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scoreTrend.length > 0 ? (
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => [`${val}%`, "Score"]} />
                        <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.4} />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: "hsl(var(--primary))" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-xs text-muted-foreground">Need at least 2 tests to plot trend.</p>
                )}
              </CardContent>
            </Card>

            {/* Cumulative Running Average */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Cumulative Practice Growth Curve
                </CardTitle>
                <CardDescription className="text-xs">
                  Running overall correct rate evolution over your lifetime test attempts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cumulativeProgress.length > 0 ? (
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cumulativeProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => [`${val}%`, "Running Avg"]} />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          stroke="hsl(142.1 76.2% 36.3%)"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-xs text-muted-foreground">Accumulating session progression data...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Consistency & Study Habit Heatmap */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Flame className="h-4 w-4 text-amber-500" />
                    Practice Consistency &amp; Momentum
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Consistent test taking builds stamina and reduces exam-day anxiety.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="font-semibold">
                    Score Variance Index: ±{consistencyScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {streakData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    52-Week Activity Heatmap
                  </p>
                  <div className="overflow-x-auto pb-2 [scrollbar-width:none]">
                    <div className="flex gap-1 min-w-[680px]">
                      {streakData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                          {week.map((day, dIndex) => {
                            const count = day.count;
                            const bg =
                              count >= 4
                                ? "bg-primary"
                                : count >= 2
                                ? "bg-primary/70"
                                : count === 1
                                ? "bg-primary/35"
                                : "bg-muted/60";
                            return (
                              <div
                                key={dIndex}
                                className={`h-2.5 w-2.5 rounded-xs ${bg} transition-colors`}
                                title={`${day.date || "Day"}: ${count} test${count === 1 ? "" : "s"}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Less activity</span>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-xs bg-muted/60" />
                      <span className="h-2 w-2 rounded-xs bg-primary/35" />
                      <span className="h-2 w-2 rounded-xs bg-primary/70" />
                      <span className="h-2 w-2 rounded-xs bg-primary" />
                    </div>
                    <span>More activity</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: SCORE BOOSTER & REAL-WORLD EXAM STRATEGY PLAYBOOK
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "booster" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Tab calculation context & explanation */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span><strong>Booster Calculation:</strong> Calculated by isolating your exact negative mark deductions (−{formatMarks(marksDeducted)} marks) and {typeStats.NAT.skipped} unattempted NAT questions to model your maximum realistic score recovery.</span>
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0 self-start sm:self-auto font-semibold">
              Recovery Diagnostic
            </Badge>
          </div>

          {/* Hero Marks Boost Potential Card */}
          <Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/[0.05] shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Marks Leak Diagnostic &amp; Recovery Model
                  </div>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                    Recoverable Score Boost: +{totalBoostPotential} Marks
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    In competitive exams like {examLabel}, an extra 8 to 15 marks typically propels you ahead by <strong>1,500 to 5,000 ranks</strong>, frequently turning a borderline score into an interview call or top admission.
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 px-6 py-5 text-center shrink-0">
                  <div>
                    <span className="text-3xl font-black text-primary tabular-nums leading-none">
                      +{totalBoostPotential}
                    </span>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      Potential Marks
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Pillars of Marks Recovery */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-6 mt-6 border-t">
                <div className="rounded-xl border bg-card p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">1. Penalty Recovery</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">+{penaltyRecoveryGain} Marks</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Halving wild guesses on 4-option MCQs rescues direct deducted penalty marks.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">2. Zero-Risk NAT Attempts</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{natUnattemptedOpportunity} Marks</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    NAT questions have zero negative marking. Converting skipped NATs into calculations unlocks pure upside.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">3. 1-Mark Accuracy Uplift</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">+{tier1AccuracyGain} Marks</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Eliminating silly arithmetic mistakes on foundational 1-mark questions locks in high-confidence marks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your 3 High-Impact Action Items for This Week */}
          <Card className="border shadow-xs bg-gradient-to-br from-card to-amber-500/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Target className="h-4 w-4 text-amber-500" />
                Your 3 High-Impact Steps for This Week
              </CardTitle>
              <CardDescription className="text-xs">
                Direct tactical interventions based on your personal numbers to quickly unlock additional marks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
                    <h4 className="text-xs font-bold text-foreground">Defend Against MCQ Penalties</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You have lost <strong>{formatMarks(marksDeducted)} marks</strong> to penalties. In your next 2 tests, strictly apply the 50/50 rule: never click an MCQ unless you have eliminated at least 2 wrong options.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">2</span>
                    <h4 className="text-xs font-bold text-foreground">Attack Zero-Penalty NATs</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    You left <strong>{typeStats.NAT.skipped} NAT questions unattempted</strong>. NATs carry zero negative marks — in your next test, never submit with a blank NAT question if you can compute an approximation.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">3</span>
                    <h4 className="text-xs font-bold text-foreground">
                      Target {weakestSubject ? weakestSubject.name : "Core Subjects"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {weakestSubject
                      ? `Your correct rate in ${weakestSubject.name} is currently ${formatRate(weakestSubject.correctRate)}. Revising its core formulas for 2 hours will yield immediate positive score returns.`
                      : "Review your lowest scoring subject's fundamentals and take a targeted subject quiz to consolidate recall."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Real-World Exam Strategy Playbook */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Compass className="h-5 w-5 text-primary" />
                The 3-Round Real-World Exam Attempt Strategy (3-Pass Method)
              </CardTitle>
              <CardDescription>
                Proven strategy utilized by top rankers to maximize output and avoid the common exam-hall panic traps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Round 1 */}
                <div className="rounded-xl border p-4 space-y-2.5 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Round 1 (0 – 60 Min)</Badge>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Fast Pick</span>
                  </div>
                  <h4 className="font-bold text-sm">Lock in Safe 30–40 Marks</h4>
                  <ul className="text-xs space-y-1.5 text-muted-foreground leading-relaxed list-disc pl-4">
                    <li>Scan all 65 questions swiftly; solve only 100% confident questions.</li>
                    <li>Direct formulas, definitions, simple graphs, and quick 1-mark questions.</li>
                    <li><strong>Benefit:</strong> Settles nerves, kills exam anxiety, and builds huge psychological momentum.</li>
                  </ul>
                </div>

                {/* Round 2 */}
                <div className="rounded-xl border p-4 space-y-2.5 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">Round 2 (60 – 140 Min)</Badge>
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Heavy Lifting</span>
                  </div>
                  <h4 className="font-bold text-sm">Core Problem Solving</h4>
                  <ul className="text-xs space-y-1.5 text-muted-foreground leading-relaxed list-disc pl-4">
                    <li>Tackle 2-mark conceptual questions and multi-step NAT calculations.</li>
                    <li><strong>The 3.5-Minute Rule:</strong> If no clear path emerges within 3.5 minutes, flag it and move on immediately. Never fight a question!</li>
                    <li>Keep scrap pad neat and numbered so you can re-verify steps easily.</li>
                  </ul>
                </div>

                {/* Round 3 */}
                <div className="rounded-xl border p-4 space-y-2.5 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-600 text-white hover:bg-purple-700">Round 3 (140 – 180 Min)</Badge>
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">Zero-Risk Sweep</span>
                  </div>
                  <h4 className="font-bold text-sm">Review &amp; Zero-Negative Sweep</h4>
                  <ul className="text-xs space-y-1.5 text-muted-foreground leading-relaxed list-disc pl-4">
                    <li>Revisit flagged questions with a fresh perspective.</li>
                    <li>Double check unit conversions (e.g. mm vs m, kHz vs Hz) on numerical answers.</li>
                    <li><strong>Free Opportunity:</strong> Make educated attempts on ALL pending NATs and MSQs — they carry ZERO penalty!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Negative Marking & Calculated Risk Shield */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-sm">Negative Marking Elimination Rule</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                In a 2-mark MCQ, a wrong answer inflicts a <strong>2.66 mark swing</strong> (2 unearned marks + 0.66 penalty). Three careless errors wipe out an entire hard-earned 2-mark question.
              </p>
              <div className="rounded-xl bg-muted/50 p-3 space-y-1 text-xs">
                <div className="font-bold text-foreground">The 50/50 Rule:</div>
                <p className="text-muted-foreground leading-relaxed">
                  • <strong>4 options open:</strong> Never guess. Statistical expectation is negative.
                  <br />
                  • <strong>2 options ruled out:</strong> Calculated guess is mathematically advantageous (+0.33 expected value).
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm">NAT &amp; MSQ Precision Checklist</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Numerical Answer Types (NAT) and Multiple Select Questions (MSQ) have <strong>zero negative marking</strong>.
              </p>
              <div className="rounded-xl bg-muted/50 p-3 space-y-1 text-xs">
                <div className="font-bold text-foreground">Top Real Exam Trap Triggers:</div>
                <p className="text-muted-foreground leading-relaxed">
                  • Decimal precision: Round off only at the FINAL step, never in intermediate equations.
                  <br />
                  • Virtual Calculator hygiene: Always click &apos;C&apos; before starting a new formula to clear memory registers.
                </p>
              </div>
            </div>
          </div>

          {/* Immediate High-Yield Revision Targets */}
          {priorityTopics.length > 0 && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Your Highest-Yield Weak Topics (Fastest Score Jump)
                </CardTitle>
                <CardDescription className="text-xs">
                  Revising these topics will produce the fastest turnaround in your overall net marks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {priorityTopics.map((topic) => (
                    <div key={topic.id} className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold line-clamp-1">{topic.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{topic.subjectName}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">
                          {formatRate(topic.correctRate)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                        <span>{topic.graded} graded Qs</span>
                        <Link
                          href={`/practice?mode=topic_wise&topic=${topic.id}`}
                          className="font-semibold text-primary hover:underline flex items-center gap-0.5"
                        >
                          Practice Topic <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: SYLLABUS & TOPIC MASTERY
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "syllabus" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Tab calculation context & explanation */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <Brain className="h-4 w-4 text-primary shrink-0" />
              <span><strong>Syllabus Calculation:</strong> Aggregated question-by-question within each subject and topic, weighting high-frequency syllabus areas proportionally across your entire test history.</span>
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0 self-start sm:self-auto font-semibold">
              Proportional Weighting
            </Badge>
          </div>
          {/* Subject Performance Breakdown */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Subject Mastery Matrix</CardTitle>
                  <CardDescription className="text-xs">
                    Evaluated across all test sessions. Prioritize subjects with lower correct rates.
                  </CardDescription>
                </div>
                {/* Sort controls */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-muted-foreground mr-1">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setSubjectSort("weakest")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold border transition-all",
                      subjectSort === "weakest" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    Weakest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectSort("highest-marks")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold border transition-all",
                      subjectSort === "highest-marks" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    Marks
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectSort("highest-accuracy")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold border transition-all",
                      subjectSort === "highest-accuracy" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    Accuracy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectSort("questions")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold border transition-all",
                      subjectSort === "questions" ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    Volume
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sortedSubjects.map((subject) => {
                  const rate = subject.correctRate ?? 0;
                  const isHigh = rate >= 60;
                  const isMid = rate >= 40;
                  const statusBadge = isHigh
                    ? { label: "Strong", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
                    : isMid
                    ? { label: "Moderate", class: "bg-amber-500/10 text-amber-700 dark:text-amber-300" }
                    : { label: "Needs Revision", class: "bg-rose-500/10 text-rose-700 dark:text-rose-300" };

                  return (
                    <div
                      key={subject.id}
                      className="rounded-2xl border bg-card p-4 space-y-3 transition-shadow hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm">{subject.name}</h3>
                          <p className="text-[11px] text-muted-foreground">
                            {subject.graded} graded questions · {subject.correct} correct · {subject.wrong} wrong
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Correct Rate</span>
                          <strong className="font-mono">{formatRate(subject.correctRate)}</strong>
                        </div>
                        <MiniBar
                          value={subject.correctRate}
                          color={isHigh ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-rose-500"}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground">Net Marks: </span>
                          <strong className="font-mono">{formatMarks(subject.netMarks)}</strong>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-semibold text-primary px-2"
                        >
                          <Link href={`/practice?mode=subject_wise&subject=${subject.id}`}>
                            Practice Subject <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Granular Topic Breakdown with Filter & Search */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Topic-Level Deep Dive</CardTitle>
                  <CardDescription className="text-xs">
                    Inspect granular performance across specific topics and sub-disciplines.
                  </CardDescription>
                </div>
                {/* Search & Subject Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      className="h-8 rounded-lg border bg-background pl-8 pr-3 text-xs w-40 sm:w-52"
                    />
                  </div>
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="h-8 rounded-lg border bg-background px-2.5 text-xs"
                  >
                    <option value="all">All Subjects</option>
                    {subjectStats.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTopics.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border [scrollbar-width:none]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground border-b">
                      <tr>
                        <th className="p-3">Topic</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3 text-center">Questions</th>
                        <th className="p-3 text-center">Correct Rate</th>
                        <th className="p-3 text-center">Accuracy</th>
                        <th className="p-3 text-center">Net Marks</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTopics.map((topic) => {
                        const rate = topic.correctRate ?? 0;
                        const isHigh = rate >= 60;
                        const isMid = rate >= 40;
                        return (
                          <tr key={topic.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-semibold text-foreground">{topic.name}</td>
                            <td className="p-3 text-muted-foreground">{topic.subjectName}</td>
                            <td className="p-3 text-center tabular-nums">{topic.graded}</td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isHigh
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : isMid
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                }`}
                              >
                                {formatRate(topic.correctRate)}
                              </span>
                            </td>
                            <td className="p-3 text-center tabular-nums">{formatRate(topic.attemptAccuracy)}</td>
                            <td className="p-3 text-center font-mono font-medium">{formatMarks(topic.netMarks)}</td>
                            <td className="p-3 text-right">
                              <Link
                                href={`/practice?mode=topic_wise&topic=${topic.id}`}
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                              >
                                Practice <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-muted-foreground">No topics match your current filter.</p>
              )}
            </CardContent>
          </Card>

          {/* Year-Wise Exam History Trend (if available) */}
          {yearWise.length > 0 && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Previous Year Paper Mastery</CardTitle>
                <CardDescription className="text-xs">
                  Your performance across historical {examLabel} question papers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {yearWise.map((item) => (
                    <div key={item.year} className="rounded-xl border bg-card p-3.5 space-y-1.5 text-center">
                      <div className="font-bold text-sm">{item.year > 0 ? `${examLabel} ${item.year}` : "Unclassified"}</div>
                      <div className="text-lg font-black text-primary tabular-nums">{formatRate(item.correctRate)}</div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.tests} test{item.tests === 1 ? "" : "s"} · {formatMarks(item.netMarks)} marks
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 4: TIME, PACING & STAMINA ANALYSIS
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "pacing" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Tab calculation context & explanation */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <Timer className="h-4 w-4 text-primary shrink-0" />
              <span><strong>Pacing Calculation:</strong> Calculated from active foreground session timers ({formatTime(timing.totalSeconds)} recorded) and question response speeds to analyze speed quadrants and late-test stamina drift.</span>
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0 self-start sm:self-auto font-semibold">
              Foreground Timers
            </Badge>
          </div>
          {/* Time Investment & Speed KPIs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatBadge
              icon={Clock}
              label="Total Time Invested"
              value={formatTime(timing.totalSeconds)}
              sub={`Across ${timing.availableSessions} timed tests`}
              iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatBadge
              icon={Timer}
              label="Avg Time Per Graded Q"
              value={timing.avgElapsedPerGradedQuestion ? `${timing.avgElapsedPerGradedQuestion}s` : "—"}
              sub="Recommended: 120s – 150s"
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatBadge
              icon={Activity}
              label="Timed Sessions"
              value={`${timing.availableSessions} / ${timing.totalSessions}`}
              sub="Recorded active tests"
              iconClass="bg-primary/10 text-primary"
            />
          </div>

          {/* 4-Quadrant Pacing Matrix */}
          {pacingData?.available ? (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Speed vs Accuracy Quadrants</CardTitle>
                <CardDescription className="text-xs">
                  Questions mapped across response time benchmark and correctness.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {paceQuadrants.map((quad) => {
                    const Icon = quad.icon;
                    return (
                      <div
                        key={quad.key}
                        className={`rounded-2xl border p-5 ${quad.bg} ${quad.border} space-y-2`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${quad.iconClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm">{quad.label}</span>
                          </div>
                          <span className={`text-2xl font-black tabular-nums ${quad.countClass}`}>
                            {quad.count} Qs
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                          {quad.hint}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {driftText && (
                  <div className="rounded-xl border bg-muted/40 p-4 flex items-start gap-3">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Exam Fatigue &amp; Pacing Drift</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{driftText}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border shadow-xs">
              <CardContent className="py-12 text-center space-y-3">
                <Timer className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="text-sm font-bold">Per-Question Timing Data Processing</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Question-level pacing zones appear as more timed tests are recorded. Overall session elapsed times are tracked in your Test History.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Real-World Exam Hall Stamina Guide */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Exam Hall Cognitive Endurance Strategy</CardTitle>
              <CardDescription className="text-xs">
                3 hours is a marathon. How to prevent mental fatigue from degrading your decision quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4 space-y-1.5 bg-muted/20">
                  <h4 className="font-bold text-foreground">The 90-Minute Mental Reset</h4>
                  <p>
                    At the halfway mark, take a 30-second intentional pause. Stretch your neck, take two deep belly breaths, and sip water. This resets prefrontal cortex fatigue.
                  </p>
                </div>
                <div className="rounded-xl border p-4 space-y-1.5 bg-muted/20">
                  <h4 className="font-bold text-foreground">Virtual Calculator Efficiency</h4>
                  <p>
                    Don&apos;t use the on-screen calculator for trivial arithmetic like 15 × 4. Use it strictly for transcendental functions (ln, exp, trig) and non-integer powers to save precious seconds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 5: TEST HISTORY & DEEP SESSION REVIEW
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Tab calculation context & explanation */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-foreground font-medium">
              <ListChecks className="h-4 w-4 text-primary shrink-0" />
              <span><strong>Session Ledger:</strong> Chronological audit of all your {totalTests} completed test sessions, complete with raw marks, penalty deductions, and direct solution review.</span>
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0 self-start sm:self-auto font-semibold">
              Full Test History
            </Badge>
          </div>
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Completed Test Session Ledger</CardTitle>
                  <CardDescription className="text-xs">
                    Review any completed session, inspect questions, and re-examine errors.
                  </CardDescription>
                </div>
                {/* Filter by test mode */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-muted-foreground mr-1">Mode:</span>
                  {["all", "full_mock", "sprint", "subject_wise"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setHistoryModeFilter(mode)}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-semibold border transition-all capitalize",
                        historyModeFilter === mode
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted"
                      )}
                    >
                      {mode === "all" ? "All Tests" : MODE_LABELS[mode] || mode}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.slice(0, visibleHistory).map((item) => {
                    const isGood = (item.netMarkRate ?? 0) >= 60;
                    const isMid = (item.netMarkRate ?? 0) >= 40;
                    const badgeClass = isGood
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : isMid
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "bg-primary/10 text-primary";

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {item.paper || (item.year ? `${examLabel} ${item.year}` : `${examLabel} Test`)}
                            </span>
                            <Badge variant="secondary" className="text-[10px] font-semibold">
                              {MODE_LABELS[item.mode] || item.mode}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.dateLabel} · {item.timeLabel}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{item.loadedQuestions} Questions</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {item.correct} Correct
                            </span>
                            <span>•</span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                              {item.wrong} Wrong
                            </span>
                            <span>•</span>
                            <span>{item.skipped} Skipped</span>
                            <span>•</span>
                            <span>{item.timingLabel}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0">
                          <div className="text-right">
                            <div className="font-black text-sm tabular-nums">
                              {formatMarks(item.netMarks)} / {formatMarks(item.maximumMarks)}
                            </div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                              {formatRate(item.netMarkRate)} net
                            </span>
                          </div>
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs font-semibold">
                            <Link href={`/result/${item.id}`}>
                              Review Test <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredHistory.length > visibleHistory && (
                    <div className="pt-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleHistory((prev) => prev + 15)}
                        className="text-xs"
                      >
                        Load More Tests ({filteredHistory.length - visibleHistory} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-muted-foreground">No test sessions found for this filter.</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Score Trend */}
          {weeklyTrend.length > 0 && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Weekly Performance Trend</CardTitle>
                <CardDescription className="text-xs">
                  Average score rate across study weeks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => [`${val}%`, "Weekly Avg"]} />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
