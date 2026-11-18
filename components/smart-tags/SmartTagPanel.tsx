import Link from 'next/link';
import {
  ArrowRight,
  Target,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import type { DiagnosticLoad } from '@/lib/smart-tags-server';
import type { ConceptCounter, SmartDiagnostic } from '@/lib/smart-tags';

const fixLink = (c: ConceptCounter) => `/practice/concept?${new URLSearchParams({ subject: c.subjectId, concept: c.key })}`;

export function SmartTagPanel({ result, variant = 'dashboard' }: { result: DiagnosticLoad; variant?: 'dashboard' | 'result' }) {
  if (variant === 'dashboard' && result.state === 'ready') return <DashboardInsights diagnostic={result.diagnostic} />;
  return <DetailedSmartTagPanel result={result} variant={variant} />;
}

function DetailedSmartTagPanel({ result, variant }: { result: DiagnosticLoad; variant: 'dashboard' | 'result' }) {
  const heading = variant === 'result' ? 'Your concept breakdown' : 'Your next concept to practise';
  if (result.state !== 'ready') return (
    <section aria-label={heading} className="rounded-xl border bg-card p-5 text-sm shadow-sm">
      <div className="flex items-center gap-2 font-semibold">
        <Target className="h-4 w-4 text-primary" />
        <h2>{heading}</h2>
      </div>
      <p className="mt-2 text-muted-foreground">
        {result.state === 'not_enabled'
          ? 'Concept diagnostics are being prepared. Your score and answer review are still available.'
          : 'Concept diagnostics could not load. Refresh this page to retry; your results are saved.'}
      </p>
    </section>
  );

  const d = result.diagnostic;
  const earlySuggestion = variant === 'dashboard' && !d.weakSpots.length;
  const concepts = variant === 'dashboard'
    ? (d.weakSpots.length ? d.weakSpots : d.concepts.filter(c => c.failed > 0).slice(0, 1))
    : d.concepts.slice(0, 6);

  const coveragePercent = d.answered > 0 ? Math.round((d.tagged / d.answered) * 100) : 0;

  return (
    <section aria-label={heading} className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
            <p className="text-xs text-muted-foreground">
              {variant === 'result'
                ? 'Automatically linked to the syllabus concepts in your answered questions. A missed question can involve several concepts.'
                : earlySuggestion
                ? 'Start with this recent mistake. This is an early practice suggestion; a repeated weak spot needs at least 3 attempts and 60% incorrect answers.'
                : `Across your last ${d.sessionCount} completed ${d.sessionCount === 1 ? 'session' : 'sessions'}. Repeated weak spots need at least 3 attempts and 60% incorrect answers.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {d.tagged > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {coveragePercent}% Syllabus Mapped
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Concept Cards */}
        {concepts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {concepts.map((c) => {
              const isStrong = c.failed === 0;
              const isModerate = c.accuracy >= 50 && c.failed > 0;
              return (
                <div
                  key={JSON.stringify([c.subjectId, c.key])}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isStrong
                      ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                      : isModerate
                      ? 'border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="break-words font-semibold text-sm leading-snug sm:text-base">
                        {c.label}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                          isStrong
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isModerate
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {c.accuracy}% accuracy
                      </span>
                    </div>

                    <div className="my-2.5 space-y-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isStrong ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.accuracy}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {c.failed} incorrect · {c.attempts - c.failed} correct · {c.attempts} attempts
                    </p>
                  </div>

                  <div className="mt-3 pt-2">
                    {c.failed > 0 ? (
                      <Link
                        href={fixLink(c)}
                        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Target className="h-3.5 w-3.5" />
                        Practise this concept
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <div className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Solid Performance in Test
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <Target className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            <p className="font-semibold text-sm">
              {d.tagged ? 'No repeated weak concept identified yet.' : 'Build your concept picture with practice.'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {d.tagged
                ? 'Keep practising. We need at least 3 attempts with 60% incorrect answers to suggest a focused fix.'
                : 'Complete a practice session to see concept feedback from its syllabus links. Questions without a usable mapping still count towards your score.'}
            </p>
            <Link
              href="/test/select"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
            >
              Open practice
            </Link>
          </div>
        )}

        {/* Observable Answer Checks */}
        {!!d.answerPatterns?.length && (
          <div className="space-y-3 rounded-xl border border-amber-200/60 bg-amber-50/20 p-4 dark:border-amber-900/40 dark:bg-amber-950/15">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Answer patterns to check</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              These are observable differences in your answers, not assumptions about why you made a mistake.
            </p>
            <div className="space-y-2.5">
              {d.answerPatterns.map((p) => (
                <div key={p.code} className="rounded-lg border bg-background/80 p-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-semibold text-xs text-foreground">{p.label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {p.count} {p.count === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {!!d.improvements?.length && (
          <div className="space-y-3 rounded-xl border border-emerald-200/60 bg-emerald-50/20 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/15">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Your recent progress</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Latest 3 completed sessions compared with the previous 3. Each concept needs at least 3 attempts in both windows.
            </p>
            <ul className="space-y-2">
              {d.improvements.map((p) => (
                <li key={p.label} className="rounded-lg border bg-background/80 p-3 text-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{p.label}</span>
                    <span className="font-bold text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                      {p.before}% → {p.after}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.beforeAttempts} earlier attempts · {p.afterAttempts} recent attempts
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Traps Details */}
        {variant === 'result' && d.possibleTraps.length > 0 && (
          <details className="group rounded-xl border bg-muted/20 p-3.5 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Traps to check in your answer review
              </span>
              <span className="text-xs text-muted-foreground group-open:hidden">+ View pitfalls</span>
              <span className="hidden text-xs text-muted-foreground group-open:inline">− Hide</span>
            </summary>
            <p className="mt-2 text-xs text-muted-foreground">
              These are editor-labelled pitfalls on missed questions, not confirmed reasons for your answers.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {d.possibleTraps.map((t) => (
                <li key={t.label}>
                  <strong className="font-semibold">{t.label}</strong> · {t.questions} missed{' '}
                  {t.questions === 1 ? 'question' : 'questions'}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Coverage footer */}
        <div className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            Concept mappings cover {d.tagged} of {d.answered} answered questions in this{' '}
            {variant === 'result' ? 'session' : 'window'}. Skipped and marks-to-all questions are excluded. Concept counts overlap.
          </p>
          {(d.automaticTagged ?? 0) > 0 && (
            <p className="mt-0.5">
              {d.automaticTagged} auto-mapped from the syllabus
              {d.reviewedTagged ? ` · ${d.reviewedTagged} with editor-reviewed tags` : ''}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardInsights({ diagnostic: d }: { diagnostic: SmartDiagnostic }) {
  const early = !d.weakSpots.length;
  const concepts = d.weakSpots.length ? d.weakSpots : d.concepts.filter(c => c.failed > 0).slice(0, 1);
  const primaryConcept = concepts[0];
  const secondaryConcepts = concepts.slice(1);
  const coverage = d.answered ? Math.round((d.tagged / d.answered) * 100) : 0;

  return (
    <section aria-label="What to practise next" className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:shadow-md">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Target size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">What to practise next</h2>
              {early && concepts.length > 0 && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  Early suggestion
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on your latest {d.sessionCount} completed {d.sessionCount === 1 ? 'session' : 'sessions'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {coverage > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              {coverage}% Syllabus Mapped
            </span>
          )}
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        {concepts.length > 0 ? (
          <>
            {/* Primary Recommendation Card */}
            <article className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.04] via-card to-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/45">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        early
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {early ? <Sparkles className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {early ? 'Review a recent mistake' : 'Repeated difficulty'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {early ? 'Early practice suggestion' : 'Priority Focus'}
                    </span>
                  </div>
                  <h3 className="break-words text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug">
                    {primaryConcept.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You got{' '}
                    <strong className="font-semibold text-foreground">
                      {primaryConcept.failed} of {primaryConcept.attempts}{' '}
                      {primaryConcept.attempts === 1 ? 'answer' : 'answers'} wrong
                    </strong>{' '}
                    for this concept.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-right">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Accuracy</span>
                  <strong
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      primaryConcept.accuracy < 40
                        ? 'text-rose-600 dark:text-rose-400'
                        : primaryConcept.accuracy < 60
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {primaryConcept.accuracy}%
                  </strong>
                </div>
              </div>

              {/* Accuracy Meter & Metrics */}
              <dl className="my-3.5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Your answers for this concept">
                <div className="rounded-lg border bg-background/80 p-2.5 text-center sm:text-left shadow-2xs">
                  <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Answered</dt>
                  <dd className="mt-0.5 text-lg sm:text-xl font-bold tabular-nums text-foreground">
                    {primaryConcept.attempts}
                  </dd>
                </div>
                <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/40 p-2.5 text-center sm:text-left shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <dt className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Correct</dt>
                  <dd className="mt-0.5 text-lg sm:text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {primaryConcept.attempts - primaryConcept.failed}
                  </dd>
                </div>
                <div className="rounded-lg border border-rose-200/60 bg-rose-50/40 p-2.5 text-center sm:text-left shadow-2xs dark:border-rose-900/40 dark:bg-rose-950/20">
                  <dt className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">Incorrect</dt>
                  <dd className="mt-0.5 text-lg sm:text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
                    {primaryConcept.failed}
                  </dd>
                </div>
              </dl>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Correct answers / answered questions</span>
                  <strong className="ml-3 shrink-0 tabular-nums text-foreground">{primaryConcept.accuracy}%</strong>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/80"
                  role="progressbar"
                  aria-label={`${primaryConcept.label} correct rate`}
                  aria-valuenow={primaryConcept.accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    data-concept-meter
                    className={`h-full rounded-full transition-all duration-500 ${
                      primaryConcept.accuracy < 40
                        ? 'bg-rose-500'
                        : primaryConcept.accuracy < 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${primaryConcept.accuracy}%` }}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {early
                  ? `Based on just ${primaryConcept.attempts} ${
                      primaryConcept.attempts === 1 ? 'answer' : 'answers'
                    }. More practice will give a clearer picture.`
                  : 'This pattern has repeated across at least 3 answers. A focused review is a useful next step.'}
              </p>

              {primaryConcept.failed > 0 && (
                <div className="mt-4 flex flex-col gap-2.5 border-t border-border/60 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>10-min focused session · Up to 3 questions</span>
                  </div>
                  <Link
                    href={fixLink(primaryConcept)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span>Practise this concept</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </article>

            {/* Secondary Weak Spots Grid (if more than 1 concept) */}
            {secondaryConcepts.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Other concepts needing attention ({secondaryConcepts.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {secondaryConcepts.map((c) => (
                    <article
                      key={JSON.stringify([c.subjectId, c.key])}
                      className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="break-words font-semibold text-sm leading-snug">{c.label}</h5>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                              c.accuracy >= 60
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : c.accuracy >= 40
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {c.accuracy}%
                          </span>
                        </div>
                        <div className="my-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              c.accuracy >= 60 ? 'bg-emerald-500' : c.accuracy >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${c.accuracy}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {c.failed} incorrect · {c.attempts - c.failed} correct · {c.attempts} attempts
                        </p>
                      </div>

                      {c.failed > 0 && (
                        <div className="mt-3 pt-2">
                          <Link
                            href={fixLink(c)}
                            className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Target className="h-3.5 w-3.5" />
                            <span>Practise this concept</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center sm:p-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {d.tagged ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Target className="h-6 w-6 text-primary" />}
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {d.tagged ? 'No repeated weak spots yet' : 'Discover your concept strengths'}
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {d.tagged
                ? 'Great work! No concept in your latest completed tests meets the repeated difficulty threshold (3+ attempts and 60%+ errors).'
                : 'Take a test to automatically map your answered questions to the syllabus and see focused concept guidance.'}
            </p>
            <div className="mt-5">
              <Link
                href="/test/select"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{d.tagged ? 'Keep practising' : 'Take your first test'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Observable Answer Checks */}
        {!!d.answerPatterns?.length && (
          <div className="space-y-2.5 rounded-xl border border-amber-200/60 bg-amber-50/20 p-4 dark:border-amber-900/40 dark:bg-amber-950/15">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Answer checks</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Open a check for a practical tip before your next attempt.
            </p>
            <div className="space-y-2">
              {d.answerPatterns.map((p) => (
                <details
                  key={p.code}
                  className="group rounded-lg border border-amber-200/50 bg-background/90 px-3.5 py-2.5 shadow-2xs dark:border-amber-900/40"
                >
                  <summary className="flex min-h-7 cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-xs font-medium">
                    <span className="font-semibold text-foreground">{p.label}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                        {p.count} {p.count === 1 ? 'answer' : 'answers'}
                      </span>
                      <span className="text-muted-foreground group-open:hidden">+</span>
                      <span className="hidden text-muted-foreground group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground pb-1">{p.advice}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Recent Improvements */}
        {!!d.improvements?.length && (
          <div className="space-y-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/20 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/15">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Your recent improvement</h3>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {d.improvements.map((p) => (
                <div
                  key={p.label}
                  className="rounded-lg border border-emerald-200/50 bg-background/90 p-3 shadow-2xs dark:border-emerald-900/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-snug">{p.label}</p>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      +{p.after - p.before}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
                    {p.before}% → {p.after}% correct · +{p.after - p.before} percentage points
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {p.beforeAttempts} earlier answers · {p.afterAttempts} recent answers
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methodology Disclosure */}
        <details className="group border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 text-muted-foreground hover:text-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              How this recommendation is made
            </span>
            <span className="text-xs group-open:hidden">+ View criteria</span>
            <span className="hidden text-xs group-open:inline">− Hide</span>
          </summary>
          <div className="space-y-2 pt-2.5 pb-1 leading-relaxed">
            <p>
              Concept mappings cover {d.tagged} of {d.answered} answered questions ({coverage}%) in the latest{' '}
              {d.sessionCount} completed sessions. Skipped and marks-to-all questions are excluded; concept counts overlap.
            </p>
            <p>
              {early
                ? 'This is an early practice suggestion based on a recent mistake.'
                : 'Repeated difficulty means at least 3 answers with 60% or more incorrect.'}{' '}
              More than one concept can be linked to an answer.
            </p>
            <p>Answer checks describe differences in your selections, not the reason for a mistake.</p>
            {(d.automaticTagged ?? 0) > 0 && (
              <p>
                {d.automaticTagged} auto-mapped from the syllabus
                {d.reviewedTagged ? ` · ${d.reviewedTagged} with editor-reviewed tags` : ''}.
              </p>
            )}
            {!!d.improvements?.length && (
              <p>
                Improvements compare the latest 3 completed sessions with the previous 3; each concept needs at least 3
                answers in both windows.
              </p>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}
