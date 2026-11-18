"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FilterDropdown } from "@/components/practice/FilterDropdown";
import filterStyles from "@/components/practice/filters.module.css";
import type { ExamStream } from "@/lib/stream-scope";
import { filterTestPool, type PoolQuestion, type TestTopic, type TestMode } from "@/lib/test-pool";
import { createTest } from "./actions";
import { describeYears, summariseAvailability } from "@/lib/content-availability";
import { PageHeading } from "@/components/workspace/PageHeading";
import {
  PlaySquare,
  Award,
  SlidersHorizontal,
  Clock,
  BookOpen,
  Target,
  Shield,
  Play,
  CheckCircle2,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  RotateCcw,
  ArrowRight,
  Timer,
  ChevronRight,
  Flame,
  ListChecks,
  LayoutGrid,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PastSessionSummary {
  id: string;
  year: number | null;
  paper: string | null;
  status: string;
  completed_at: string | null;
  total_questions: number | null;
}

interface FullPaperCardItem {
  key: string;
  year: number;
  paper: string;
  questionCount: number;
  marks: number;
  lastAttempt?: PastSessionSummary;
}

type Props = {
  initialSelection?: Record<string, string>;
  examId: string;
  examName: string;
  stream: ExamStream | null;
  requiresStream: boolean;
  subjects: { id: string; name: string }[];
  topics: TestTopic[];
  pool: PoolQuestion[];
  pastSessions?: PastSessionSummary[];
};

// ─── Question count presets ──────────────────────────────────────────────────
const COUNT_PRESETS = [10, 25, 50, 65, 100] as const;
const COUNT_EXTRAS = [15, 20, 30, 40, 75, 120, 150];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function durationLabel(qCount: number) {
  // 1 min/Q for practice – same as current actions.ts formula
  return qCount === 1 ? "1 Min" : `${qCount} Mins`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TestSelectForm({
  examId,
  examName,
  stream,
  requiresStream,
  subjects,
  topics,
  pool,
  initialSelection = {},
  pastSessions = [],
}: Props) {
  const router = useRouter();

  // ── Top-level tab: official papers vs custom ──────────────────────────────
  const requestedMode = initialSelection.mode;
  const isCustomRequested =
    requestedMode === "subject_wise" ||
    requestedMode === "topic_wise" ||
    requestedMode === "custom";

  const [activeTab, setActiveTab] = useState<"official" | "custom">(
    isCustomRequested ? "custom" : "official"
  );

  // ── Official papers tab state ─────────────────────────────────────────────
  const [paperYearFilter, setPaperYearFilter] = useState<number | "all">("all");
  const [paperSearchQuery, setPaperSearchQuery] = useState("");
  const [launchingPaperKey, setLaunchingPaperKey] = useState<string | null>(null);
  const [paperLaunchError, setPaperLaunchError] = useState<string | null>(null);

  // ── Custom test mode ──────────────────────────────────────────────────────
  const initialMode: TestMode =
    requestedMode === "subject_wise" ||
    requestedMode === "topic_wise" ||
    requestedMode === "custom"
      ? requestedMode
      : "subject_wise"; // default to subject_wise for PYQ context

  const initialYear = pool.some((q) => String(q.year) === initialSelection.year)
    ? Number(initialSelection.year)
    : null;
  const initialPaper = pool.some(
    (q) => (initialYear == null || q.year === initialYear) && q.paper === initialSelection.paper
  )
    ? initialSelection.paper
    : "";

  const [customMode, setCustomMode] = useState<TestMode>(initialMode);
  const [selectedYears, setYears] = useState<number[]>(initialYear == null ? [] : [initialYear]);
  const [selectedPapers, setPapers] = useState<string[]>(initialPaper ? [initialPaper] : []);
  const [subjectIds, setSubjects] = useState<string[]>(
    subjects.some((s) => s.id === initialSelection.subject) ? [initialSelection.subject] : []
  );
  const [topicIds, setTopics] = useState<string[]>(
    topics.some((t) => t.id === initialSelection.topic) &&
      subjects.some((s) => s.id === initialSelection.subject)
      ? [initialSelection.topic]
      : []
  );

  // For topic-wise: first pick ONE subject then pick topics
  const [topicSubjectId, setTopicSubjectId] = useState<string | null>(
    subjects.some((s) => s.id === initialSelection.subject) ? initialSelection.subject : null
  );

  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(true); // Always timed by default for PYQ
  const [customPending, setCustomPending] = useState(false);
  const [customError, setCustomError] = useState("");
  const [showSourceFilter, setShowSourceFilter] = useState(false);

  // ── Derived pool data ─────────────────────────────────────────────────────
  const years = [...new Set(pool.flatMap((q) => (q.year ? [q.year] : [])))].sort((a, b) => b - a);
  const papers = [
    ...new Set(
      pool
        .filter((q) => !selectedYears.length || (q.year != null && selectedYears.includes(q.year)))
        .flatMap((q) => (q.paper ? [q.paper] : []))
    ),
  ].sort();

  const sourcePool = filterTestPool(
    pool,
    {
      year: null,
      paper: null,
      subjectId: null,
      topicId: null,
      years: selectedYears,
      papers: selectedPapers,
    },
    topics
  );

  const availability = summariseAvailability(pool);

  // Available subjects (those that have questions in the source pool)
  const availableSubjects = useMemo(
    () => subjects.filter((s) => sourcePool.some((q) => q.subject_id === s.id)),
    [subjects, sourcePool]
  );

  // Per-subject question counts from source pool
  const subjectQCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of sourcePool) {
      map.set(q.subject_id, (map.get(q.subject_id) ?? 0) + 1);
    }
    return map;
  }, [sourcePool]);

  // For topic-wise: topics for the chosen subject
  const topicSubjectTopics = useMemo(() => {
    if (!topicSubjectId) return [];
    return topics.filter(
      (t) =>
        t.subject_id === topicSubjectId &&
        filterTestPool(sourcePool, { year: null, paper: null, subjectId: null, topicId: t.id }, topics).length > 0
    );
  }, [topicSubjectId, topics, sourcePool]);

  // Per-topic question counts
  const topicQCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of topicSubjectTopics) {
      const qCount = filterTestPool(
        sourcePool,
        { year: null, paper: null, subjectId: null, topicId: t.id },
        topics
      ).length;
      map.set(t.id, qCount);
    }
    return map;
  }, [topicSubjectTopics, sourcePool, topics]);

  // Matching questions based on current mode selections
  const matching = useMemo(() => {
    if (customMode === "subject_wise") {
      return filterTestPool(
        sourcePool,
        { year: null, paper: null, subjectId: null, topicId: null, subjectIds, topicIds: [] },
        topics
      );
    }
    if (customMode === "topic_wise") {
      const effectiveSubjectIds = topicSubjectId ? [topicSubjectId] : [];
      return filterTestPool(
        sourcePool,
        {
          year: null,
          paper: null,
          subjectId: null,
          topicId: null,
          subjectIds: effectiveSubjectIds,
          topicIds,
        },
        topics
      );
    }
    // custom (mixed)
    return filterTestPool(
      sourcePool,
      { year: null, paper: null, subjectId: null, topicId: null, subjectIds, topicIds: [] },
      topics
    );
  }, [customMode, sourcePool, subjectIds, topicIds, topicSubjectId, topics]);

  const total = Math.min(count, matching.length);
  const sourceReady = !requiresStream || selectedYears.length > 0 || selectedPapers.length > 0;

  const customReady = useMemo(() => {
    if (!matching.length) return false;
    if (customMode === "subject_wise") return subjectIds.length > 0;
    if (customMode === "topic_wise") return !!topicSubjectId && topicIds.length > 0;
    // mixed: no mandatory selection
    return true;
  }, [customMode, matching, subjectIds, topicIds, topicSubjectId]);

  // ── Official paper cards ──────────────────────────────────────────────────
  const officialPaperCards = useMemo(() => {
    const groups = new Map<string, { year: number; paper: string; questions: PoolQuestion[] }>();
    for (const q of pool) {
      if (q.year == null || !q.paper) continue;
      const key = `${q.year}-${q.paper}`;
      const group = groups.get(key) ?? { year: q.year, paper: q.paper, questions: [] };
      group.questions.push(q);
      groups.set(key, group);
    }
    const cards: FullPaperCardItem[] = [];
    for (const [key, group] of groups.entries()) {
      const qCount = group.questions.length;
      const marks = group.questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
      const attempt = pastSessions.find((s) => s.year === group.year && s.paper === group.paper);
      cards.push({ key, year: group.year, paper: group.paper, questionCount: qCount, marks, lastAttempt: attempt });
    }
    return cards.sort((a, b) => b.year - a.year || a.paper.localeCompare(b.paper));
  }, [pool, pastSessions]);

  const availablePaperYears = useMemo(
    () => [...new Set(officialPaperCards.map((c) => c.year))].sort((a, b) => b - a),
    [officialPaperCards]
  );

  const filteredPaperCards = useMemo(() => {
    return officialPaperCards.filter((card) => {
      if (paperYearFilter !== "all" && card.year !== paperYearFilter) return false;
      if (paperSearchQuery.trim()) {
        const q = paperSearchQuery.toLowerCase();
        if (!card.paper.toLowerCase().includes(q) && !String(card.year).includes(q)) return false;
      }
      return true;
    });
  }, [officialPaperCards, paperYearFilter, paperSearchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function launchOfficialPaper(card: FullPaperCardItem) {
    if (launchingPaperKey) return;
    setLaunchingPaperKey(card.key);
    setPaperLaunchError(null);
    try {
      const result = await createTest({
        examId,
        streamId: stream?.id || null,
        mode: "full_paper",
        year: null,
        paper: null,
        subjectId: null,
        topicId: null,
        years: [card.year],
        papers: [card.paper],
        subjectIds: [],
        topicIds: [],
        count: card.questionCount,
        timed: true,
      });
      if ("error" in result) {
        setPaperLaunchError(result.error);
        setLaunchingPaperKey(null);
      } else {
        router.push(`/test/${result.sessionId}`);
      }
    } catch {
      setPaperLaunchError("Unable to initialize official exam session. Please try again.");
      setLaunchingPaperKey(null);
    }
  }

  function resetFocus() {
    setSubjects([]);
    setTopics([]);
    setTopicSubjectId(null);
    setCustomError("");
  }

  const changeCustomMode = useCallback(
    (value: TestMode) => {
      setCustomMode(value);
      resetFocus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function startCustomTest() {
    if (!customReady || customPending) return;
    setCustomPending(true);
    setCustomError("");

    // Build effective subject/topic arrays per mode
    const effectiveSubjectIds =
      customMode === "topic_wise"
        ? topicSubjectId
          ? [topicSubjectId]
          : []
        : subjectIds;
    const effectiveTopicIds = customMode === "topic_wise" ? topicIds : [];

    try {
      const result = await createTest({
        examId,
        streamId: stream?.id || null,
        mode: customMode,
        year: null,
        paper: null,
        subjectId: null,
        topicId: null,
        years: selectedYears,
        papers: selectedPapers,
        subjectIds: effectiveSubjectIds,
        topicIds: effectiveTopicIds,
        count,
        timed,
      });
      if ("error" in result) {
        setCustomError(result.error);
        setCustomPending(false);
      } else {
        router.push(`/test/${result.sessionId}`);
      }
    } catch {
      setCustomError("Unable to start custom practice. Please try again.");
      setCustomPending(false);
    }
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!pool.length) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-8 text-center">
        <h1 className="text-2xl font-bold">{stream?.name || examName}</h1>
        <p className="text-muted-foreground">
          No questions have been configured for this {stream ? "stream" : "exam"} yet.
          Papers and subjects will appear here after questions are synced.
        </p>
        <Button asChild variant="outline">
          <Link href="/onboarding">Change exam or branch</Link>
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`${filterStyles.scope} mx-auto max-w-4xl space-y-6 pb-20 pt-2`}>
      {/* Page Header */}
      <div className="space-y-1">
        <PageHeading
          title="Start a Test"
          eyebrow={`${examName}${stream ? ` · ${stream.name} (${stream.code})` : ""}`}
          icon={<PlaySquare />}
          description="Take a full official PYQ paper or build a custom timed practice session by subject, topic, or mixed."
        />
      </div>

      {/* ── Top Tab Bar ──────────────────────────────────────────────────── */}
      <div className="flex w-full items-center gap-2 rounded-2xl border bg-muted/50 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("official")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "official"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4 text-primary" />
          <span>Full Official Papers</span>
          <Badge
            variant={activeTab === "official" ? "default" : "secondary"}
            className="text-[10px] px-2 py-0.5 font-bold"
          >
            {officialPaperCards.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === "custom"
              ? "bg-card text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Custom Practice</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: FULL OFFICIAL PAPERS
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "official" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Official rules banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-card to-background p-3 sm:px-4 sm:py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Shield className="h-3.5 w-3.5" />
              </span>
              <span className="font-bold text-foreground">Official {examName} Pattern:</span>
              <span className="text-muted-foreground hidden sm:inline">
                65 Questions · 100 Marks · 180 Minutes (3h) · Original Paper Order
              </span>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-semibold">
              {stream ? `${stream.name} (${stream.code})` : "All Branches"}
            </Badge>
          </div>

          {/* Year filter + search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Year:</span>
              <button
                type="button"
                onClick={() => setPaperYearFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                  paperYearFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground hover:bg-muted border-border/80"
                }`}
              >
                All
              </button>
              {availablePaperYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setPaperYearFilter(year)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all whitespace-nowrap ${
                    paperYearFilter === year
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground hover:bg-muted border-border/80"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shift or year..."
                value={paperSearchQuery}
                onChange={(e) => setPaperSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {paperLaunchError && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {paperLaunchError}
            </div>
          )}

          {/* Official paper cards */}
          {filteredPaperCards.length > 0 ? (
            <div className="space-y-2.5">
              {filteredPaperCards.map((card) => {
                const isLaunching = launchingPaperKey === card.key;
                return (
                  <div
                    key={card.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-2xs hover:border-primary/50 hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-black text-xs text-primary">
                        {card.year}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground truncate">{card.paper}</h3>
                          {card.lastAttempt && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                              <Check className="h-2.5 w-2.5" /> Attempted
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {examName} {stream ? `· ${stream.name} (${stream.code})` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span><strong className="text-foreground font-bold">{card.questionCount}</strong> Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span><strong className="text-foreground font-bold">{card.marks}</strong> Marks</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-muted-foreground font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span><strong className="text-foreground font-bold">180</strong> Mins</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0">
                      {card.lastAttempt && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/result/${card.lastAttempt.id}`}>Past Result</Link>
                        </Button>
                      )}
                      <Button
                        onClick={() => launchOfficialPaper(card)}
                        disabled={isLaunching || launchingPaperKey !== null}
                        size="sm"
                        className="h-8 px-4 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
                      >
                        {isLaunching ? (
                          "Starting…"
                        ) : (
                          <>
                            <Play className="mr-1.5 h-3 w-3" />
                            {card.lastAttempt ? "Re-take" : "Start Test"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed py-12 text-center">
              <CardContent className="space-y-3">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="text-sm font-bold">No papers matched your filter</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try clearing the search query or selecting &quot;All&quot; years.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPaperYearFilter("all"); setPaperSearchQuery(""); }}
                  className="text-xs"
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: CUSTOM PRACTICE TEST
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "custom" && (
        <div className="space-y-5 animate-in fade-in-50 duration-200">

          {/* ── Question Bank info pill ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {availability.questionCount} PYQ Questions Available
            </span>
            <span className="text-muted-foreground">
              Across {describeYears(availability.years)} · {availability.papers.length} shifts
            </span>
            <span className="ml-auto flex items-center gap-1 text-primary font-semibold">
              <Timer className="h-3.5 w-3.5" /> All tests are timed
            </span>
          </div>

          {/* ── Step 1: Mode Selection ──────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black">1</span>
              <h2 className="text-sm font-bold text-foreground">Choose Practice Mode</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subject-wise */}
              <ModeCard
                active={customMode === "subject_wise"}
                onClick={() => changeCustomMode("subject_wise")}
                icon={<BookOpen className="h-4 w-4" />}
                title="Subject-wise"
                description="Pick subjects you want to drill — see exact question counts for each."
                badge="Best for revision"
              />
              {/* Topic-wise */}
              <ModeCard
                active={customMode === "topic_wise"}
                onClick={() => changeCustomMode("topic_wise")}
                icon={<Target className="h-4 w-4" />}
                title="Topic-wise"
                description="Deep dive into specific topics within a subject."
                badge="Best for weak areas"
              />
              {/* Mixed */}
              <ModeCard
                active={customMode === "custom"}
                onClick={() => changeCustomMode("custom")}
                icon={<LayoutGrid className="h-4 w-4" />}
                title="Mixed"
                description="Select subjects for a cross-topic randomised challenge."
                badge="Best for mocks"
              />
            </div>
          </section>

          {/* ── Step 2: Source Filter (optional, collapsible) ───────────── */}
          <section className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSourceFilter((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Filter by Source Papers & Years
                {(selectedYears.length > 0 || selectedPapers.length > 0) && (
                  <Badge variant="secondary" className="text-[10px] ml-1">
                    {selectedYears.length ? `${selectedYears.length} yrs` : "All yrs"} · {selectedPapers.length ? `${selectedPapers.length} shifts` : "All shifts"}
                  </Badge>
                )}
              </span>
              {showSourceFilter ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showSourceFilter && (
              <div className="px-4 pb-4 pt-0 grid gap-3 sm:grid-cols-2 border-t animate-in fade-in-50 duration-150">
                <div className="pt-3">
                  <FilterDropdown
                    label="Source years"
                    options={years.map((year) => ({ value: String(year), label: String(year) }))}
                    selected={selectedYears.map(String)}
                    disabled={customPending}
                    emptyLabel={requiresStream ? "Choose source years" : "All years"}
                    onChange={(values) => {
                      setYears(values.map(Number));
                      setPapers([]);
                      resetFocus();
                    }}
                  />
                </div>
                <div className="pt-3">
                  <FilterDropdown
                    label="Papers / shifts"
                    options={papers.map((paper) => ({ value: paper, label: paper }))}
                    selected={selectedPapers}
                    disabled={customPending || (requiresStream && !selectedYears.length)}
                    emptyLabel={requiresStream ? "Choose papers / shifts" : "All papers"}
                    onChange={(values) => {
                      setPapers(values);
                      resetFocus();
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* ── Step 3: Subject / Topic Selection ──────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black">2</span>
                <h2 className="text-sm font-bold text-foreground">
                  {customMode === "subject_wise" && "Select Subjects"}
                  {customMode === "topic_wise" && "Select Subject & Topics"}
                  {customMode === "custom" && "Select Subjects (optional for Mixed)"}
                </h2>
              </div>
              {(subjectIds.length > 0 || topicIds.length > 0 || topicSubjectId) && (
                <button
                  type="button"
                  onClick={resetFocus}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* ── SUBJECT-WISE: subject card grid ──────────────────────── */}
            {customMode === "subject_wise" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {availableSubjects.map((subject) => {
                  const qCount = subjectQCounts.get(subject.id) ?? 0;
                  const isSelected = subjectIds.includes(subject.id);
                  return (
                    <SubjectCard
                      key={subject.id}
                      name={subject.name}
                      qCount={qCount}
                      selected={isSelected}
                      onClick={() => {
                        setSubjects((prev) =>
                          isSelected ? prev.filter((id) => id !== subject.id) : [...prev, subject.id]
                        );
                        setCustomError("");
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* ── TOPIC-WISE: subject picker → topic grid ──────────────── */}
            {customMode === "topic_wise" && (
              <div className="space-y-3">
                {/* Subject picker row */}
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => {
                    const isSelected = topicSubjectId === subject.id;
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          setTopicSubjectId(isSelected ? null : subject.id);
                          setTopics([]);
                          setCustomError("");
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/80"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {subject.name}
                      </button>
                    );
                  })}
                </div>

                {/* Topics grid for selected subject */}
                {topicSubjectId && topicSubjectTopics.length > 0 && (
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Select topics · {topicIds.length} selected
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {topicSubjectTopics.map((topic) => {
                        const qCount = topicQCounts.get(topic.id) ?? 0;
                        const isSelected = topicIds.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => {
                              setTopics((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== topic.id)
                                  : [...prev, topic.id]
                              );
                              setCustomError("");
                            }}
                            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                              isSelected
                                ? "border-primary bg-primary/[0.05] ring-1 ring-primary/40"
                                : "border-border/70 bg-card hover:bg-muted/50"
                            }`}
                          >
                            <span className="font-medium text-foreground leading-snug">{topic.name}</span>
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 font-bold text-[10px] ${
                                isSelected
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {qCount} Q
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {topicSubjectId && topicSubjectTopics.length === 0 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    No topics with available questions for this subject.
                  </p>
                )}
                {!topicSubjectId && (
                  <p className="text-xs text-muted-foreground pl-1">
                    Select a subject above to see its topics.
                  </p>
                )}
              </div>
            )}

            {/* ── MIXED: subject card grid (optional) ──────────────────── */}
            {customMode === "custom" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Leave all unselected to include every subject — or pick subjects to narrow the pool.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {availableSubjects.map((subject) => {
                    const qCount = subjectQCounts.get(subject.id) ?? 0;
                    const isSelected = subjectIds.includes(subject.id);
                    return (
                      <SubjectCard
                        key={subject.id}
                        name={subject.name}
                        qCount={qCount}
                        selected={isSelected}
                        onClick={() => {
                          setSubjects((prev) =>
                            isSelected ? prev.filter((id) => id !== subject.id) : [...prev, subject.id]
                          );
                          setCustomError("");
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ── Step 4: Question Count & Timing ────────────────────────── */}
          <section className="rounded-xl border bg-card p-4 sm:p-5 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black">3</span>
              <h2 className="text-sm font-bold text-foreground">Test Duration & Volume</h2>
            </div>

            {/* Question count row */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Number of Questions</span>
                <span className="text-xs text-muted-foreground">
                  Selected: <strong className="text-foreground">{count} Questions</strong>
                  {timed && (
                    <span className="ml-1.5 text-primary font-semibold">· {durationLabel(total || count)}</span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {COUNT_PRESETS.map((preset) => {
                  const isSelected = count === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCount(preset)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent shadow-xs"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/80"
                      }`}
                    >
                      {preset} Qs {preset === 65 && "• Full Length"}
                    </button>
                  );
                })}
                <div className="w-36">
                  <FilterDropdown
                    label=""
                    options={COUNT_EXTRAS.map((n) => ({ value: String(n), label: `${n} Qs` }))}
                    selected={COUNT_PRESETS.includes(count as typeof COUNT_PRESETS[number]) ? [] : [String(count)]}
                    single
                    searchable={false}
                    disabled={customPending}
                    emptyLabel="Other count..."
                    onChange={(values) => {
                      if (values.length) setCount(Number(values[0]));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timing toggle */}
            <div className="space-y-2 pt-1 border-t">
              <span className="text-xs font-semibold text-foreground">Timing Mode</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Timed */}
                <button
                  type="button"
                  onClick={() => setTimed(true)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    timed
                      ? "border-primary bg-primary/[0.04] ring-1 ring-primary shadow-xs"
                      : "border-border/80 bg-muted/20 hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      timed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground">Timed Test</span>
                      <Badge variant="outline" className="text-[10px] font-semibold py-0">
                        {total ? durationLabel(total) : "1 min/Q"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Countdown timer for realistic exam pacing. Recommended for PYQ practice.
                    </p>
                  </div>
                </button>

                {/* Untimed */}
                <button
                  type="button"
                  onClick={() => setTimed(false)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    !timed
                      ? "border-primary bg-primary/[0.04] ring-1 ring-primary shadow-xs"
                      : "border-border/80 bg-muted/20 hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      !timed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground">Untimed Practice</span>
                      <Badge variant="secondary" className="text-[10px] font-semibold py-0">
                        Self-Paced
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Learn at your own pace without pressure. Ideal for concept mastery.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* ── Launch bar ─────────────────────────────────────────────── */}
          <div className={`rounded-xl border p-4 sm:p-5 space-y-3 shadow-xs transition-all ${
            customReady
              ? "bg-card border-primary/30"
              : "bg-muted/30 border-border"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
                      customReady ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className="font-bold text-sm text-foreground truncate">
                    {customReady ? (
                      <>
                        Ready — {total} Questions ·{" "}
                        {timed ? durationLabel(total) : "Untimed"}
                      </>
                    ) : !sourceReady ? (
                      "Select source years / papers to continue"
                    ) : customMode === "subject_wise" && !subjectIds.length ? (
                      "Select at least one subject to continue"
                    ) : customMode === "topic_wise" && !topicSubjectId ? (
                      "Select a subject to see its topics"
                    ) : customMode === "topic_wise" && !topicIds.length ? (
                      "Select at least one topic to continue"
                    ) : !matching.length ? (
                      "No questions match the current filters"
                    ) : (
                      "Configure the options above to continue"
                    )}
                  </span>
                </div>

                {/* Scope breakdown */}
                {customReady && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pl-5">
                    {customMode === "subject_wise" && subjectIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {subjectIds.length} subject{subjectIds.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                    {customMode === "topic_wise" && topicIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {topicIds.length} topic{topicIds.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                    {customMode === "custom" && (
                      <span className="text-xs text-muted-foreground">
                        {subjectIds.length > 0
                          ? `${subjectIds.length} subject${subjectIds.length > 1 ? "s" : ""}`
                          : "All subjects"}{" "}
                        · Mixed
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {matching.length} questions in pool
                      {matching.length < count && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                          (capped at {matching.length} available)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={startCustomTest}
                disabled={!customReady || customPending}
                aria-busy={customPending}
                className="h-10 px-6 font-bold text-xs sm:text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shadow-xs shrink-0"
              >
                {customPending ? (
                  "Starting…"
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    {timed ? "Start Timed Test" : "Start Practice"}
                  </>
                )}
              </Button>
            </div>

            {customError && (
              <p role="alert" className="text-xs text-destructive font-medium border-t pt-2">
                {customError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeCard({
  active,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/[0.04] ring-1 ring-primary shadow-xs"
          : "border-border/80 bg-card hover:bg-muted/50 hover:border-border"
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:text-foreground"
            }`}
          >
            {icon}
          </span>
          {active && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
        <div>
          <span className="block font-bold text-sm text-foreground">{title}</span>
          <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">{description}</span>
        </div>
      </div>
      <Badge
        variant={active ? "default" : "secondary"}
        className="mt-3 self-start text-[10px] font-semibold"
      >
        {badge}
      </Badge>
    </button>
  );
}

function SubjectCard({
  name,
  qCount,
  selected,
  onClick,
}: {
  name: string;
  qCount: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
        selected
          ? "border-primary bg-primary/[0.05] ring-1 ring-primary/40 shadow-xs"
          : "border-border/70 bg-card hover:bg-muted/40 hover:border-border"
      }`}
    >
      {/* Checkbox indicator */}
      <span
        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
          selected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border bg-background"
        }`}
        style={{ width: 18, height: 18 }}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>

      <div className="flex-1 min-w-0">
        <span className="block font-semibold text-xs text-foreground leading-snug truncate">{name}</span>
      </div>

      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {qCount} Q
      </span>
    </button>
  );
}
