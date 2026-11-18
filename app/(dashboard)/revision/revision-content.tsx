"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
  Bookmark,
  Layers,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Target,
  Trophy,
  BarChart3,
  Search,
  Brain,
  TrendingUp,
  ShieldCheck,
  Info,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/workspace/PageHeading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionPrompt } from "@/components/QuestionPrompt";
import { QuestionFigure } from "@/components/QuestionFigure";
import { QuestionExplanation } from "@/components/QuestionExplanation";
import { MathText } from "@/components/MathText";
import { MatchingQuestion } from "@/components/MatchingQuestion";
import { MatchOption } from "@/components/MatchOption";
import { isMatchingQuestion, isMatchCodeOption } from "@/lib/matching-question-utils";
import { GateCalculator } from "@/components/calculator/GateCalculator";
import { multipleAnswerLabel, numericAnswerLabel } from "@/lib/question-response";
import {
  DAILY_REVISION_CAP,
  REVISION_INTERVALS,
  type RevisionQueue,
  type RevisionQuestion,
} from "@/lib/revision";
import styles from "./revision.module.css";
import type { DeckInfo, DeckQuestion } from "@/lib/srs";

interface RevisionContentProps {
  initialQueue?: RevisionQueue | null;
  initialDeck?: DeckInfo | null;
  initialError?: string;
}

const STAGE_NAMES = [
  "First recall",
  "Reinforce",
  "Strengthen",
  "Retain",
  "Final recall",
] as const;

export default function RevisionContent({
  initialQueue,
  initialDeck,
  initialError = "",
}: RevisionContentProps = {}) {
  const [queue, setQueue] = useState<RevisionQueue | null>(initialQueue ?? null);
  const [deck, setDeck] = useState<DeckInfo | null>(initialDeck ?? null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(initialQueue === undefined && !initialError);
  const [error, setError] = useState(initialError);
  const [revealed, setRevealed] = useState(false);
  const [calculator, setCalculator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [srsUnavailable, setSrsUnavailable] = useState(Boolean(initialDeck?.srsSelectFailed));
  const busy = useRef(false);
  const heading = useRef<HTMLDivElement>(null);
  const reviewPanel = useRef<HTMLDivElement>(null);

  // Tabs: 'queue' | 'analytics' | 'deck'
  const [activeTab, setActiveTab] = useState<"queue" | "analytics" | "deck">("queue");

  // Deck exploration state
  const [studyAhead, setStudyAhead] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [deckRevealed, setDeckRevealed] = useState(false);
  const [deckSelectedOptions, setDeckSelectedOptions] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const [deckSearchQuery, setDeckSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<number | "all">("all");

  const tabIdQueue = useId();
  const tabIdAnalytics = useId();
  const tabIdDeck = useId();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [dueRes, deckRes] = await Promise.all([
        fetch("/api/srs?action=due", { cache: "no-store" }).catch(() => null),
        fetch("/api/srs?action=deck", { cache: "no-store" }).catch(() => null),
      ]);

      let dueData: RevisionQueue | null = null;
      if (dueRes && dueRes.ok) {
        dueData = await dueRes.json();
      }

      let deckData: DeckInfo | null = null;
      if (deckRes && deckRes.ok) {
        deckData = await deckRes.json();
        setDeck(deckData);
        setSrsUnavailable(Boolean(deckData?.srsSelectFailed));
        if (deckData?.srsSelectFailed) {
          setNotice(
            "Spaced-repetition items are temporarily hidden while we fix a data permission issue. Your wrong answers and bookmarks are still available below."
          );
        }
      }

      if (dueData) {
        setQueue(dueData);
        setIndex(0);
        setRevealed(false);
        setSelectedOptions([]);
      } else if (deckData && deckData.questions.length > 0) {
        const fallbackQuestions: RevisionQuestion[] = deckData.questions
          .slice(0, DAILY_REVISION_CAP)
          .map((q) => ({
            id: q.id,
            stage: q.stage,
            interval_days: q.interval_days,
            repetition_count: q.repetition_count,
            next_review_date: q.nextReviewDate,
            source: q.source,
            question: q.question,
          }));

        setQueue({
          reviewDate: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
          }).format(new Date()),
          questions: fallbackQuestions,
          summary: {
            dueCount: fallbackQuestions.length,
            deferredCount: Math.max(0, deckData.totalCount - fallbackQuestions.length),
            completedCount: 0,
            dailyCap: DAILY_REVISION_CAP,
            totalCount: fallbackQuestions.length,
            xpEarned: 0,
            queueComplete: fallbackQuestions.length === 0,
          },
        });
        setIndex(0);
        setRevealed(false);
        setSelectedOptions([]);
      } else {
        const errJson = dueRes ? await dueRes.json().catch(() => null) : null;
        throw new Error(errJson?.error || "Unable to load revision. Please retry.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load revision. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQueue === undefined && !initialError) void load();
  }, [initialQueue, initialError]);

  async function rate(result: "correct" | "wrong") {
    if (busy.current || !queue || !revealed || !queue.questions[index]) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/srs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          questionId: queue.questions[index].question.id,
          result,
          reviewDate: queue.reviewDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save review.");

      setQueue((previous) =>
        previous && {
          ...previous,
          summary: {
            ...previous.summary,
            completedCount: previous.summary.completedCount + 1,
            dueCount: Math.max(0, previous.summary.dueCount - 1),
            xpEarned: data.xpEarned,
            queueComplete: data.queueComplete,
          },
        }
      );

      setNotice(
        data.alreadySaved
          ? "This review was already saved in another tab."
          : data.mastered
          ? "Mastered! This question has graduated from revision."
          : `Saved · Stage ${data.stage} · Review in ${
              REVISION_INTERVALS[data.stage - 1]
            } days · +${data.xpAwarded} XP`
      );

      setIndex((value) => value + 1);
      setRevealed(false);
      setSelectedOptions([]);
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => heading.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save review. Please retry.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  async function handleImportMistakes() {
    setImporting(true);
    try {
      const res = await fetch("/api/srs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll-all-mistakes" }),
      });
      if (res.ok) {
        setNotice(
          "All test mistakes and bookmarks have been synchronized into your Spaced Repetition deck!"
        );
        await load();
      } else {
        setError("Unable to import mistakes. Please try again.");
      }
    } catch {
      setError("Unable to import mistakes right now.");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.workspace} role="status" aria-label="Loading revision">
        <div className={styles.loading}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} style={{ height: 110 }} />
        </div>
        <p className="text-sm text-muted-foreground">Preparing your revision workspace…</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 py-6">
        <PageHeading
          title="Revision"
          icon={<BookOpen />}
          description="Bring past mistakes back into focus, one question at a time."
        />
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardContent className="space-y-4 p-6">
            <p role="alert" className="text-sm text-muted-foreground">
              {error}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={load}>Retry loading revision</Button>
              <Button asChild variant="outline">
                <Link href="/practice">Try a 5-Q Sprint</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const current = queue.questions[index];
  const summary = queue.summary;
  const complete = !current && summary.queueComplete;
  const q = current?.question;

  const deckQuestions = deck?.questions || [];
  const activeDeckQ = deckQuestions[deckIndex]?.question;
  const progress = summary.totalCount
    ? Math.min(100, Math.round((summary.completedCount / summary.totalCount) * 100))
    : 0;

  const stageTotal = Object.values(deck?.stageCounts || {}).reduce((sum, count) => sum + count, 0);
  const reviewDateLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(queue.reviewDate + "T12:00:00+05:30"));

  // Filtered deck for the deck explorer tab
  const filteredDeck = deckQuestions.filter((item) => {
    if (stageFilter !== "all" && item.stage !== stageFilter) return false;
    if (deckSearchQuery.trim()) {
      const query = deckSearchQuery.toLowerCase();
      const textMatch = item.question.question_text?.toLowerCase().includes(query);
      const typeMatch = item.question.question_type?.toLowerCase().includes(query);
      return textMatch || typeMatch;
    }
    return true;
  });

  return (
    <section className={styles.workspace}>
      {/* Top Breadcrumb & Day indicator */}
      <div className={styles.topline}>
        <Link href="/dashboard" className={styles.back}>
          <ArrowLeft size={15} /> Your workspace
        </Link>
        <span className={styles.day}>
          <CalendarDays size={14} /> {reviewDateLabel} <span aria-hidden="true">·</span> India time
        </span>
      </div>

      {/* Modern Compact Header with Stats & Top Navigation */}
      <div className={styles.headerCard} ref={heading} tabIndex={-1}>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>
              <BookOpen size={15} /> Revision studio
            </span>
            <h1 className={styles.headerTitle}>
              {complete ? "Today’s effort. Lasting recall." : "Make what you learn stay with you."}
            </h1>
            <p className={styles.headerSubtitle}>
              From first recall to second nature · {reviewDateLabel} (IST)
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statChips} aria-label="Revision summary stats">
              <div className={styles.statChip}>
                <span className={styles.statChipLabel}>
                  <Clock size={12} /> Due Today
                </span>
                <strong className={styles.statChipVal}>{summary.dueCount}</strong>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statChipLabel}>
                  <Layers size={12} /> In Deck
                </span>
                <strong className={styles.statChipVal}>{deck?.totalCount ?? summary.totalCount}</strong>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statChipLabel}>
                  <Trophy size={12} /> Mastered
                </span>
                <strong className={styles.statChipVal}>
                  {deck?.srsSelectFailed ? "—" : deck?.masteredCount ?? 0}
                </strong>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statChipLabel}>
                  <Sparkles size={12} /> XP
                </span>
                <strong className={styles.statChipVal}>+{summary.xpEarned}</strong>
              </div>
            </div>

            {summary.dueCount > 0 ? (
              <Button
                type="button"
                className={styles.continueRevisionBtn}
                onClick={() => {
                  setActiveTab("queue");
                  reviewPanel.current?.scrollIntoView({
                    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                      ? "instant"
                      : "smooth",
                    block: "start",
                  });
                  reviewPanel.current?.focus({ preventScroll: true });
                }}
              >
                Continue revision <ArrowUpRight size={15} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className={styles.continueRevisionBtn}
                onClick={() => setActiveTab("deck")}
              >
                Browse Deck <Layers size={15} />
              </Button>
            )}
          </div>
        </div>

        {/* Prominent Top Tabs Navigation */}
        <nav className={styles.topTabs} role="tablist" aria-label="Revision views">
          <button
            type="button"
            id={tabIdQueue}
            role="tab"
            aria-selected={activeTab === "queue"}
            aria-controls={`panel-${tabIdQueue}`}
            onClick={() => setActiveTab("queue")}
            className={styles.topTabBtn}
          >
            <BookOpen size={16} />
            <span>Daily Queue</span>
            <span className={styles.tabBadge}>{summary.dueCount} Due</span>
          </button>
          <button
            type="button"
            id={tabIdAnalytics}
            role="tab"
            aria-selected={activeTab === "analytics"}
            aria-controls={`panel-${tabIdAnalytics}`}
            onClick={() => setActiveTab("analytics")}
            className={styles.topTabBtn}
          >
            <Brain size={16} />
            <span>Spaced Repetition Analytics &amp; Science</span>
          </button>
          <button
            type="button"
            id={tabIdDeck}
            role="tab"
            aria-selected={activeTab === "deck"}
            aria-controls={`panel-${tabIdDeck}`}
            onClick={() => setActiveTab("deck")}
            className={styles.topTabBtn}
          >
            <Layers size={16} />
            <span>Complete Deck Explorer</span>
            <span className={styles.tabBadgeMuted}>{deck?.totalCount ?? 0}</span>
          </button>
        </nav>
      </div>

      {/* Notifications and Alerts */}
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm font-medium text-emerald-900 dark:text-emerald-200 shadow-sm"
        >
          {notice}
        </p>
      )}

      {srsUnavailable && (
        <div
          role="status"
          className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm font-medium text-amber-900 dark:text-amber-200 shadow-sm"
        >
          Your wrong answers are still in your revision queue. Spaced-repetition deck items are temporarily hidden while we fix a data permission issue.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 space-y-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3.5 text-sm"
        >
          <p>{error}</p>
          <Button variant="outline" size="sm" disabled={saving} onClick={load}>
            Reload queue
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DAILY QUEUE ACTIVE PLAYER (FRONT & CENTER AT THE TOP)              */}
      {/* ========================================================================= */}
      <div
        id={`panel-${tabIdQueue}`}
        role="tabpanel"
        aria-labelledby={tabIdQueue}
        hidden={activeTab !== "queue"}
        tabIndex={activeTab === "queue" ? 0 : -1}
      >
        {/* Daily Session Progress Ribbon */}
        {summary.totalCount > 0 && (
          <div className={styles.sessionRibbon}>
            <div className={styles.sessionRibbonInfo}>
              <span className={styles.sessionCardCounter}>
                Card {current ? index + 1 : summary.completedCount} of {summary.totalCount}
              </span>
              <span className={styles.sessionReviewedText}>
                {summary.completedCount} of {summary.totalCount} reviewed
              </span>
              <span className={styles.sessionXpBadge}>
                <Sparkles size={13} /> {summary.xpEarned} XP earned
              </span>
              {current && (
                <Badge variant="outline" className="text-xs font-semibold">
                  Stage {current.stage} · {STAGE_NAMES[current.stage - 1]}
                </Badge>
              )}
            </div>
            <div className={styles.sessionRibbonControls}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium"
                onClick={() => setCalculator((v) => !v)}
              >
                <Calculator size={13} />
                <span>Calculator</span>
              </Button>
            </div>
            <div
              role="progressbar"
              aria-label="Daily revision progress"
              aria-valuenow={summary.completedCount}
              aria-valuemin={0}
              aria-valuemax={summary.totalCount}
              className={styles.progressBarTrack}
            >
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty / All Completed View */}
        {!current && (
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:p-8 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {complete
                      ? "Your reviews are in. Take a breath."
                      : summary.deferredCount
                      ? "Daily limit reached"
                      : "Nothing due today"}
                  </h2>
                  {complete && (
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Session complete · {summary.completedCount} questions reviewed · {summary.xpEarned} XP saved
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {summary.deferredCount > 0
                      ? `${summary.deferredCount} other due questions will carry forward. Keep today manageable.`
                      : "We’ll bring back the right questions at the right time based on your spaced repetition schedule."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button asChild className="rounded-xl bg-primary shadow-md shadow-primary/25">
                    <Link href="/test/select">Continue practicing</Link>
                  </Button>
                  {deck && deck.questions.length > 0 && (
                    <Button
                      variant="outline"
                      className="rounded-xl border border-border bg-card"
                      aria-expanded={studyAhead}
                      aria-controls="deck-practice"
                      onClick={() => setStudyAhead((v) => !v)}
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      {studyAhead ? "Hide Flashcard Practice" : `Practice Deck Flashcards (${deck.questions.length})`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Self-Paced Flashcard Practice Mode for when queue is done */}
            {studyAhead && activeDeckQ && (
              <Card id="deck-practice" className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border bg-card pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-semibold">{activeDeckQ.question_type}</Badge>
                      {activeDeckQ.year && <Badge variant="outline">GATE {activeDeckQ.year}</Badge>}
                      <Badge variant="outline">Card {deckIndex + 1} of {deckQuestions.length}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Previous flashcard"
                        disabled={deckIndex === 0}
                        onClick={() => {
                          setDeckIndex((i) => Math.max(0, i - 1));
                          setDeckRevealed(false);
                          setDeckSelectedOptions([]);
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Next flashcard"
                        disabled={deckIndex >= deckQuestions.length - 1}
                        onClick={() => {
                          setDeckIndex((i) => Math.min(deckQuestions.length - 1, i + 1));
                          setDeckRevealed(false);
                          setDeckSelectedOptions([]);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  {/* Prompt */}
                  {isMatchingQuestion(activeDeckQ.question_text) ? (
                    <>
                      <MatchingQuestion text={activeDeckQ.question_text} />
                      {activeDeckQ.image_url && (
                        <div className="my-3 overflow-hidden rounded-2xl border border-border bg-card p-3">
                          <QuestionFigure image={{ url: activeDeckQ.image_url, width: activeDeckQ.image_width, height: activeDeckQ.image_height }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <QuestionPrompt
                        text={activeDeckQ.question_text}
                        image={activeDeckQ.image_url ? { url: activeDeckQ.image_url, width: activeDeckQ.image_width, height: activeDeckQ.image_height } : undefined}
                      />
                    </div>
                  )}

                  {/* Options */}
                  {activeDeckQ.question_type !== "NAT" && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Options</p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[activeDeckQ.option_1, activeDeckQ.option_2, activeDeckQ.option_3, activeDeckQ.option_4].map((option, i) => {
                          if (!option) return null;
                          const optionLetter = String.fromCharCode(65 + i);
                          const isSelected = deckSelectedOptions.includes(i + 1);
                          const isCorrect = activeDeckQ.correct_option_sets
                            ? activeDeckQ.correct_option_sets.some((set) => set.includes(i + 1))
                            : activeDeckQ.question_type === "MSQ"
                            ? activeDeckQ.correct_options?.includes(i + 1)
                            : activeDeckQ.correct_option === i + 1;
                          const optionImg = activeDeckQ.option_images?.[i];

                          return (
                            <div
                              key={i}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  event.currentTarget.click();
                                }
                              }}
                              onClick={() => {
                                if (deckRevealed) return;
                                if (activeDeckQ.question_type === "MSQ") {
                                  setDeckSelectedOptions((prev) =>
                                    prev.includes(i + 1) ? prev.filter((x) => x !== i + 1) : [...prev, i + 1]
                                  );
                                } else {
                                  setDeckSelectedOptions([i + 1]);
                                }
                              }}
                              className={`group relative flex w-full flex-col rounded-2xl border p-3.5 sm:p-4 text-left transition-all ${
                                deckRevealed
                                  ? isCorrect
                                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                                    : isSelected
                                    ? "border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100"
                                    : "border-border bg-card opacity-70"
                                  : isSelected
                                  ? "border-primary/80 bg-primary/10 text-foreground"
                                  : "border-border bg-card hover:border-primary/40 text-foreground/90"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold border border-border">
                                  {optionLetter}
                                </span>
                                <div className="min-w-0 flex-1 space-y-2">
                                  {isMatchCodeOption(option) ? (
                                    <MatchOption text={option} className="text-sm" />
                                  ) : (
                                    <MathText text={option} className="text-base leading-relaxed" />
                                  )}
                                </div>
                              </div>
                              {optionImg && (
                                <div className="mt-3 overflow-hidden rounded-xl border border-border p-2.5">
                                  <QuestionFigure image={optionImg} inline />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!deckRevealed ? (
                    <Button
                      size="lg"
                      className="min-h-14 w-full rounded-2xl bg-primary text-white font-semibold"
                      onClick={() => setDeckRevealed(true)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Reveal Answer &amp; Derivation
                    </Button>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Derivation &amp; Correct Answer</h3>
                      {activeDeckQ.question_type === "NAT" && (
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5">
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Acceptable Value Range</span>
                          <p className="mt-0.5 text-base font-bold text-emerald-950 dark:text-emerald-100">
                            {numericAnswerLabel(activeDeckQ.answer_min, activeDeckQ.answer_max, activeDeckQ.answer_ranges)}
                          </p>
                        </div>
                      )}
                      {activeDeckQ.correct_option_sets && (
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {multipleAnswerLabel(activeDeckQ.correct_option_sets)}
                        </p>
                      )}
                      {activeDeckQ.explanation ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
                          <QuestionExplanation text={activeDeckQ.explanation} />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">A detailed derivation isn’t available for this question yet.</p>
                      )}
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-muted-foreground">
                          Free practice helps you prepare. Your daily queue is where reviews, stages, and XP are saved.
                        </p>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => {
                              if (deckIndex < deckQuestions.length - 1) {
                                setDeckIndex((i) => i + 1);
                                setDeckRevealed(false);
                                setDeckSelectedOptions([]);
                              } else {
                                setNotice("You reviewed all flashcards in your deck!");
                                setStudyAhead(false);
                              }
                            }}
                          >
                            Next flashcard <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Keep your revision deck growing</CardTitle>
                <CardDescription>
                  Questions you answer incorrectly or bookmark in practice sessions automatically join your deck.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <Button asChild variant="outline" className="h-11 rounded-2xl border border-border">
                    <Link href="/practice">
                      <Play className="mr-2 h-4 w-4 text-primary" />
                      Take a 5-Q Sprint
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-2xl border border-border">
                    <Link href="/test/select">
                      <BookOpen className="mr-2 h-4 w-4 text-primary" />
                      Full Mock Exam
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-2xl border border-border">
                    <Link href="/bookmarks">
                      <Bookmark className="mr-2 h-4 w-4 text-primary" />
                      Review Bookmarks
                    </Link>
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  disabled={importing}
                  onClick={handleImportMistakes}
                  className="w-full rounded-2xl text-xs font-semibold"
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  {importing ? "Scanning test history…" : "Sync mistakes from past tests into revision"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Daily Question Card */}
        {current && q && (
          <div className={styles.review} ref={reviewPanel} tabIndex={-1}>
            <div className={styles.reviewHeading}>
              <h2>Today’s revision queue</h2>
              <span>Question {summary.completedCount + 1} of {summary.totalCount}</span>
            </div>

            {/* Current Question Stages Pill */}
            <ol aria-label="Revision stages" className="grid grid-cols-5 gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-sm mb-4">
              {REVISION_INTERVALS.map((days, i) => {
                const isActive = current.stage === i + 1;
                return (
                  <li
                    key={days}
                    aria-current={isActive ? "step" : undefined}
                    className={`rounded-xl px-2 py-2 text-center transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold scale-[1.02]"
                        : "text-muted-foreground hover:bg-card"
                    }`}
                  >
                    <span className="block text-[10px] sm:text-xs uppercase tracking-wider opacity-85">
                      Stage {i + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold">{days}d</span>
                  </li>
                );
              })}
            </ol>

            {/* Main Daily Question Card */}
            <Card className="rounded-2xl border border-border bg-card shadow-sm transition-all mb-4">
              <CardContent className="space-y-6 p-5 sm:p-7">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex shrink-0 items-center rounded-md border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:border-green-700 dark:bg-green-200 dark:text-green-950">
                      {q.question_type}
                    </span>
                    {q.year && (
                      <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                        GATE {q.year}
                      </Badge>
                    )}
                    <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold">
                      Stage {current.stage} / 5 ({REVISION_INTERVALS[current.stage - 1]}d interval)
                    </Badge>
                    {current.source && (
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase">
                        Source: {current.source === "mistake" ? "Test Mistake" : current.source === "bookmark" ? "Bookmark" : "SRS Deck"}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {q.question_type === "MSQ"
                      ? "Select all correct choices"
                      : q.question_type === "NAT"
                      ? "Numerical answer"
                      : "Select one choice"}
                  </span>
                </div>

                {q.question_type === "MSQ" && (
                  <p className="text-sm font-medium text-primary">
                    Multiple select: choose all correct options. Full marks only for the exact set; no partial credit or negative marking.
                  </p>
                )}

                {/* Prompt */}
                <div className="space-y-4">
                  {isMatchingQuestion(q.question_text) ? (
                    <>
                      <MatchingQuestion text={q.question_text} />
                      {q.image_url && (
                        <div className="my-3 overflow-hidden rounded-2xl border border-border bg-card p-3">
                          <QuestionFigure image={{ url: q.image_url, width: q.image_width, height: q.image_height }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="question-content text-base lg:text-lg leading-relaxed font-medium">
                      <QuestionPrompt
                        text={q.question_text}
                        image={q.image_url ? { url: q.image_url, width: q.image_width, height: q.image_height } : undefined}
                      />
                    </div>
                  )}
                </div>

                {/* Options List */}
                {q.question_type !== "NAT" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Options</p>
                      {!revealed && (
                        <span className="text-[11px] text-muted-foreground">
                          Click option to test your pick before revealing
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[q.option_1, q.option_2, q.option_3, q.option_4].map((option, i) => {
                        if (!option) return null;
                        const optionLetter = String.fromCharCode(65 + i);
                        const isSelected = selectedOptions.includes(i + 1);
                        const isCorrect = q.correct_option_sets
                          ? q.correct_option_sets.some((set) => set.includes(i + 1))
                          : q.question_type === "MSQ"
                          ? q.correct_options?.includes(i + 1)
                          : q.correct_option === i + 1;
                        const optionImg = q.option_images?.[i];

                        return (
                          <div
                            key={i}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.currentTarget.click();
                              }
                            }}
                            onClick={() => {
                              if (revealed) return;
                              if (q.question_type === "MSQ") {
                                setSelectedOptions((prev) =>
                                  prev.includes(i + 1) ? prev.filter((x) => x !== i + 1) : [...prev, i + 1]
                                );
                              } else {
                                setSelectedOptions([i + 1]);
                              }
                            }}
                            className={`group relative flex w-full flex-col rounded-2xl border p-4 sm:p-5 text-left transition-all ${
                              revealed
                                ? isCorrect
                                  ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                                  : isSelected
                                  ? "border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100"
                                  : "border-border bg-card opacity-70"
                                : isSelected
                                ? "border-primary/80 bg-primary/10 ring-1 ring-primary/50 text-foreground"
                                : "border-border bg-card hover:border-primary/40 text-foreground/90 shadow-sm cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all ${
                                revealed
                                  ? isCorrect
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : isSelected
                                    ? "bg-rose-600 text-white"
                                    : "border border-border bg-muted/40 text-muted-foreground"
                                  : isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "border border-border bg-card text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                              }`}>
                                {optionLetter}
                                {revealed && isCorrect && <span className="sr-only"> (correct)</span>}
                              </span>
                              <div className="min-w-0 flex-1 space-y-2">
                                {isMatchCodeOption(option) ? (
                                  <MatchOption text={option} className="text-sm" />
                                ) : (
                                  <MathText text={option} className="text-base leading-relaxed" />
                                )}
                              </div>
                              {revealed && isCorrect && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                                </span>
                              )}
                              {revealed && !isCorrect && isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                                  Your pick
                                </span>
                              )}
                            </div>
                            {optionImg && (
                              <div className="mt-3 overflow-hidden rounded-xl border border-border p-2.5">
                                <QuestionFigure image={optionImg} inline />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Calculator Toggle */}
                <Button
                  variant="outline"
                  className="min-h-11 w-full rounded-2xl border border-border bg-card shadow-sm"
                  onClick={() => setCalculator((v) => !v)}
                  aria-expanded={calculator}
                  aria-controls="revision-calculator"
                >
                  <Calculator className="mr-2 h-4 w-4 text-primary" />
                  {calculator ? "Hide calculator" : "Open virtual calculator"}
                </Button>
                <div
                  id="revision-calculator"
                  hidden={!calculator}
                  className="rounded-2xl border border-border bg-card p-3 shadow-sm"
                >
                  <GateCalculator examMode />
                </div>

                {/* Bottom Actions: Reveal Button OR Answer & Derivation with Rating */}
                {!revealed ? (
                  <Button
                    size="lg"
                    className="min-h-14 w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm shadow-primary/25 transition-all"
                    onClick={() => setRevealed(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Reveal Answer &amp; Derivation
                  </Button>
                ) : (
                  <div className="space-y-5 rounded-2xl border border-border bg-card p-4.5 sm:p-5 shadow-sm">
                    <section aria-label="Answer and derivation" className="space-y-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Answer &amp; Derivation
                      </h2>
                      {q.question_type === "NAT" && (
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5">
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            Official Acceptable Range
                          </span>
                          <p className="mt-0.5 text-base font-bold text-emerald-950 dark:text-emerald-100">
                            {numericAnswerLabel(q.answer_min, q.answer_max, q.answer_ranges)}
                          </p>
                        </div>
                      )}
                      {q.correct_option_sets && (
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {multipleAnswerLabel(q.correct_option_sets)}
                        </p>
                      )}
                      {q.explanation ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
                          <QuestionExplanation text={q.explanation} />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          A detailed derivation isn’t available for this question yet. Use the answer key to check your work.
                        </p>
                      )}
                    </section>

                    {/* Self-Rating Action Buttons */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                      <Button
                        variant="outline"
                        disabled={saving}
                        onClick={() => rate("wrong")}
                        className="min-h-16 flex-col whitespace-normal rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-800 hover:bg-rose-500/20 dark:text-rose-200 transition-all"
                      >
                        <span className="font-semibold">Needs another review</span>
                        <span className="text-xs font-normal opacity-85">Resets to Stage 1 · Returns tomorrow · +5 XP</span>
                      </Button>
                      <Button
                        disabled={saving}
                        onClick={() => rate("correct")}
                        className="min-h-16 flex-col whitespace-normal rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 transition-all"
                      >
                        <span className="font-semibold">Solved it Easily</span>
                        <span className="text-xs font-normal opacity-90">
                          {current.stage === 5
                            ? "Master this question (Graduate!)"
                            : `Stage ${current.stage + 1} · In ${REVISION_INTERVALS[current.stage]} days`} · +10 XP
                        </span>
                      </Button>
                    </div>
                    {saving && (
                      <p role="status" className="text-center text-xs text-muted-foreground">
                        Saving your review…
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <RotateCcw className="h-3 w-3" />
              Mistakes return tomorrow. Progress is saved after every review.
            </p>

            {/* Mini Stage Helper Bar */}
            <div className={styles.miniStagesBar}>
              <span className={styles.miniStagesLabel}>
                <Target size={14} className="text-primary" /> Spaced Repetition Stages:
              </span>
              <div className={styles.miniStagePills}>
                {REVISION_INTERVALS.map((days, i) => (
                  <span
                    key={days}
                    className={styles.miniStagePill}
                    data-active={current?.stage === i + 1}
                  >
                    Stage {i + 1}: {days}d ({STAGE_NAMES[i]})
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setActiveTab("analytics")}
              >
                View full science &amp; roadmap →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: SPACED REPETITION DETAILED ANALYTICS & SCIENCE                     */}
      {/* ========================================================================= */}
      <div
        id={`panel-${tabIdAnalytics}`}
        role="tabpanel"
        aria-labelledby={tabIdAnalytics}
        hidden={activeTab !== "analytics"}
        tabIndex={activeTab === "analytics" ? 0 : -1}
        className="space-y-6"
      >
        {/* Top 4 Key Metric Cards */}
        <div className={styles.metrics} aria-label="Revision overview">
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              <Clock size={15} /> Due today
            </span>
            <strong>{summary.dueCount}</strong>
            <span className={styles.metricSub}>All test mistakes included</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              <Layers size={15} /> In your deck
            </span>
            <strong>{deck?.totalCount ?? summary.totalCount}</strong>
            <span className={styles.metricSub}>Active memory queue</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              <Trophy size={15} /> Mastered
            </span>
            <strong>{deck?.srsSelectFailed ? "—" : deck?.masteredCount ?? 0}</strong>
            <span className={styles.metricSub}>Graduated Stage 5</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>
              <Sparkles size={15} /> Session XP
            </span>
            <strong>{summary.xpEarned}</strong>
            <span className={styles.metricSub}>+10 XP per easy solve</span>
          </div>
        </div>

        {/* Five-Stage Spaced Repetition Progression Roadmap */}
        <section className={styles.path} aria-label="Your recall journey">
          <div className={styles.sectionTitle}>
            <div>
              <h2>From first recall to second nature</h2>
              <p>Five stages. More space between reviews as your memory strengthens.</p>
            </div>
            <span className={styles.pathLegend}>Your recall journey</span>
          </div>
          <ol className={styles.stages}>
            {REVISION_INTERVALS.map((days, i) => {
              const count = deck?.stageCounts?.[i + 1] || 0;
              return (
                <li
                  className={styles.stage}
                  data-active={current?.stage === i + 1}
                  aria-current={current?.stage === i + 1 ? "step" : undefined}
                  key={days}
                >
                  <div className={styles.stageTop}>
                    <span className={styles.stageNumber}>0{i + 1}</span>
                    <span>{STAGE_NAMES[i]}</span>
                  </div>
                  <strong>{days} {days === 1 ? "day" : "days"}</strong>
                  <div className={styles.stageBar}>
                    <span
                      style={{
                        width: stageTotal ? `${(count / stageTotal) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <small>
                    {!deck || deck.srsSelectFailed
                      ? "Count unavailable"
                      : `${count} ${count === 1 ? "question" : "questions"}`}
                  </small>
                </li>
              );
            })}
          </ol>
          <p className={styles.pathFoot}>
            <Target size={15} className="shrink-0" />
            Correct answers advance a stage. Mistakes return tomorrow. New questions become due at midnight IST.
          </p>
        </section>

        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Spaced Repetition Engine Analytics</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                Ebbinghaus Spaced Model
              </Badge>
            </div>
            <CardDescription>
              Real-time audit of your memory retention curve, intervals, and stage progression.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Retention & Memory Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Memory Retention Rate
                </span>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {deck?.retentionRate ?? 0}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Items strengthened past first recall into long-term memory.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Due Today on Day 1
                </span>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {summary.dueCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Zero bottleneck guarantee: 100% of wrong answers queued immediately.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mastery Graduation
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {deck?.masteredCount ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Questions successfully recalled at Stage 5 (30-day retention).
                </p>
              </div>
            </div>

            {/* Stages Detailed Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Stage-by-Stage Interval Schedule
              </h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Target Interval</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Cards In Stage</th>
                      <th className="p-3">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REVISION_INTERVALS.map((days, idx) => {
                      const count = deck?.stageCounts?.[idx + 1] || 0;
                      return (
                        <tr key={days} className="hover:bg-muted/20">
                          <td className="p-3 font-bold text-primary">
                            Stage {idx + 1}
                          </td>
                          <td className="p-3 font-medium">
                            {days} {days === 1 ? "day" : "days"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {idx === 0
                              ? "Day 1 review of new mistakes & bookmarks"
                              : idx === 1
                              ? "Early reinforcement of difficult concepts"
                              : idx === 2
                              ? "Consolidation into medium-term memory"
                              : idx === 3
                              ? "Long-term schema retention"
                              : "Final mastery check before graduation"}
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            {count}
                          </td>
                          <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                            +10 XP (Easy) / +5 XP (Wrong)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scientific Trust Contract Box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Why you can trust this algorithm
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                <li>
                  <strong>• Complete Mistake Enrolment:</strong> Even if you make 100 mistakes in a test session, all 100 enter Day 1 revision immediately. Nothing is hidden or capped.
                </li>
                <li>
                  <strong>• Reset Safety:</strong> Any failure in recall immediately resets the card to Stage 1. This prevents false confidence and guarantees true retention before the actual exam.
                </li>
                <li>
                  <strong>• Atomic Persistence:</strong> Your schedule changes, streak increments, and XP are committed in a single PostgreSQL transaction. No lost progress.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* TAB 3: COMPLETE DECK EXPLORER                                            */}
      {/* ========================================================================= */}
      <div
        id={`panel-${tabIdDeck}`}
        role="tabpanel"
        aria-labelledby={tabIdDeck}
        hidden={activeTab !== "deck"}
        tabIndex={activeTab === "deck" ? 0 : -1}
        className="space-y-4"
      >
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Complete Spaced Repetition Catalog
                </CardTitle>
                <CardDescription>
                  Explore every question in your active memory deck.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={deckSearchQuery}
                    onChange={(e) => setDeckSearchQuery(e.target.value)}
                    placeholder="Search cards…"
                    className="h-9 w-44 sm:w-60 rounded-xl border border-border bg-background pl-8 pr-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <select
                  value={stageFilter}
                  onChange={(e) =>
                    setStageFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="1">Stage 1 (Day 1)</option>
                  <option value="2">Stage 2 (3 Days)</option>
                  <option value="3">Stage 3 (7 Days)</option>
                  <option value="4">Stage 4 (14 Days)</option>
                  <option value="5">Stage 5 (30 Days)</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredDeck.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No cards match your current search or stage filter.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {filteredDeck.slice(0, 50).map((card, i) => (
                  <div
                    key={card.id || i}
                    className="p-3.5 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {card.question.question_type}
                        </Badge>
                        {card.question.year && (
                          <Badge variant="outline" className="text-[10px]">
                            GATE {card.question.year}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5"
                        >
                          Stage {card.stage} ({REVISION_INTERVALS[card.stage - 1]}d)
                        </Badge>
                        {card.nextReviewDate && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Due {card.nextReviewDate}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {card.question.question_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredDeck.length > 50 && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                Showing first 50 of {filteredDeck.length} cards. Refine your search to find specific questions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
