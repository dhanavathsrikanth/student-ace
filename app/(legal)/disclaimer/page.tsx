import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ShieldAlert, Award, FileSpreadsheet, Compass, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer & Non-Affiliation Notice | StudentAce",
  description:
    "Official educational disclaimer, examination body non-affiliation declaration, question sourcing context, and diagnostic simulation boundaries for StudentAce.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  const lastUpdated = "November 18, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Educational Disclaimer & Non-Affiliation - StudentAce",
    "description": "Statutory non-affiliation notice, diagnostic score limitations, and question sourcing fair use statement for StudentAce.",
    "publisher": {
      "@type": "Organization",
      "name": "StudentAce Educational Technologies",
      "url": "https://studentace.in"
    },
    "dateModified": "2026-11-18"
  };

  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Page Header ── */}
      <header className="space-y-3 border-b pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Statutory Notice &amp; Legal Limitations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Educational Disclaimer
        </h1>
        <p className="text-sm text-muted-foreground">
          Last revised: <time dateTime="2026-11-18" className="font-medium text-foreground">{lastUpdated}</time> · Public document (No account required)
        </p>
      </header>

      {/* ── Prominent Non-Affiliation Alert Box (Primary Safeguard) ── */}
      <section aria-label="Non-Affiliation Declaration" className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-foreground">
              Official Examination Non-Affiliation Declaration
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>StudentAce is an independent educational technology platform.</strong> StudentAce is NOT affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with the <strong>Graduate Aptitude Test in Engineering (GATE)</strong>, the <strong>Indian Institute of Science (IISc Bangalore)</strong>, any <strong>Indian Institute of Technology (IIT Bombay, Delhi, Madras, Kharagpur, Kanpur, Roorkee, Guwahati, etc.)</strong>, the <strong>National Testing Agency (NTA)</strong>, the Ministry of Education, Government of India, or any other government or statutory body conducting public competitive examinations.
            </p>
            <p className="text-xs text-muted-foreground">
              All trademarks, examination names, logos, and acronyms (e.g., &ldquo;GATE&rdquo;, &ldquo;IIT&rdquo;, &ldquo;IISc&rdquo;) are registered or statutory trademarks of their respective owners. Their mention on StudentAce is strictly for nominative descriptive reference to denote subject matter and syllabus orientation under Indian trademark jurisprudence.
            </p>
          </div>
        </div>
      </section>

      {/* ── Table of Contents ── */}
      <nav aria-label="Table of Contents" className="rounded-xl border bg-muted/30 p-4 text-xs">
        <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-[11px]">Table of Contents</h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
          <li><a href="#section-1" className="hover:text-primary hover:underline">1. Diagnostic Simulations &amp; Score Limits</a></li>
          <li><a href="#section-2" className="hover:text-primary hover:underline">2. Question Sourcing &amp; Copyright Notice</a></li>
          <li><a href="#section-3" className="hover:text-primary hover:underline">3. Errata Reporting &amp; Numerical Ranges</a></li>
          <li><a href="#section-4" className="hover:text-primary hover:underline">4. Hardware &amp; Calculator Discrepancies</a></li>
          <li><a href="#section-5" className="hover:text-primary hover:underline">5. Errata Submission &amp; Contact Desk</a></li>
        </ol>
      </nav>

      {/* ── Section 1: Nature of Test Series & Score Simulations ── */}
      <section id="section-1" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            1. Nature of Test Series, Analytics &amp; Score Simulations
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            StudentAce provides test simulations, mock assessments, performance analytics, speed metrics, accuracy rates, and percentile calculations. You expressly acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Diagnostic Purpose Only:</strong> All scores, rankings, percentiles, speed metrics, accuracy calculations, and syllabus mastery charts provided on our platform are <em>purely indicative diagnostic tools</em> designed to assist self-directed study and benchmark relative test preparedness.
            </li>
            <li>
              <strong>No Guarantee of Exam Results:</strong> Achieving a specific score, accuracy percentage, or leaderboard ranking on StudentAce does <strong>NOT guarantee or predict</strong> that you will qualify, achieve an All India Rank (AIR), secure admission into any M.Tech/Ph.D. program, or receive a job offer or interview call from any Public Sector Undertaking (PSU) or institution in the actual GATE or any other competitive examination.
            </li>
            <li>
              <strong>Variation in Examination Parameters:</strong> Actual examination conditions, test-day psychological factors, normalization algorithms, difficulty variations across multi-session shifts, and candidate demographics differ substantially from mock platform conditions.
            </li>
            <li>
              <strong>No Liability for Educational or Career Decisions:</strong> StudentAce, its creators, developers, and affiliates shall not be liable for any educational, academic, career, financial, or personal decisions taken by users based on the metrics, test reports, or recommendations displayed on this platform.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 2: Question Context, Sourcing & Fair Dealing ── */}
      <section id="section-2" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            2. Question Context, Sourcing &amp; Copyright Notice
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            The question repository on StudentAce is assembled through two distinct channels:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1 pb-2">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Previous Years&rsquo; Questions (PYQs)
              </h3>
              <p className="text-xs text-muted-foreground">
                Publicly released examination papers from past years are reproduced under the doctrine of <strong>Fair Dealing for non-commercial educational study, research, and self-assessment</strong> as recognized under Section 52(1)(a) and Section 52(1)(h) of the Indian Copyright Act, 1957.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Original &amp; Curated Content
              </h3>
              <p className="text-xs text-muted-foreground">
                Original mock questions, diagnostic explanations, pedagogical breakdowns, concept tags, step-by-step solutions, and hints are proprietary works owned by StudentAce and protected under copyright laws.
              </p>
            </div>
          </div>
          <p>
            While StudentAce endeavors to ensure that questions, official answer keys, and marking schemes reflect authoritative past examination disclosures, discrepancies in past keys released by organizing institutes across successive years do exist. StudentAce disclaims responsibility for alternate technical interpretations or shifts in standard syllabus conventions over time.
          </p>
        </div>
      </section>

      {/* ── Section 3: Question Errata & Typographical Ambiguity ── */}
      <section id="section-3" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            3. Question Errata, Numerical Ranges &amp; Reporting Mechanism
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            While rigorous automated and editorial checks are conducted before any question or test session is published:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Typographical &amp; Range Variances:</strong> Engineering mock questions (particularly Numerical Answer Type &ldquo;NAT&rdquo; questions) may occasionally have minor decimal truncation variances, alternate rounding expectations, or typographical slips in problem statements or diagrams.
            </li>
            <li>
              <strong>Editorial Rectification:</strong> StudentAce reserves the right to correct, revise, recalculate, or retire any question, answer key, or numerical acceptance range at any time without prior notice. When an answer key is amended, historical session logs may be recomputed at our sole editorial discretion.
            </li>
            <li>
              <strong>Active Reporting Pipeline:</strong> If you believe an answer key, question stem, or explanation is erroneous or violates any proprietary right, we actively invite you to report it to{" "}
              <a href="mailto:support@studentace.in" className="text-primary underline font-medium">
                support@studentace.in
              </a>{" "}
              or via our in-app reporting tools. Legitimate errata submissions are reviewed by our team within 48 to 72 business hours.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 4: System Availability & Performance Simulation ── */}
      <section id="section-4" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <HelpCircle className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            4. Service Availability, Timers &amp; Hardware Disclaimers
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            The software, in-browser scientific calculator, automated timers, question palette navigation, and real-time syncing mechanisms are provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong> basis:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Local Hardware &amp; Connectivity:</strong> StudentAce cannot guarantee that test timers will match real-world clocks down to the millisecond under conditions of device sleep, browser background tab throttling, unstable mobile networks, or hardware freezing. Users are encouraged to take timed full mock tests under reliable high-speed broadband connections.
            </li>
            <li>
              <strong>Calculator Discrepancies:</strong> The in-app virtual calculator is designed to simulate the functional interface of standard examination software. Slight floating-point rounding nuances inherent to browser JavaScript engines may occur compared to native examination consoles.
            </li>
            <li>
              <strong>Zero Consequential Damages:</strong> In no event shall StudentAce or its licensors be held responsible for loss of session data, disconnected test submissions, or inaccurate timing statistics resulting from power interruptions, local ISP failures, or browser crashes.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 5: Contact & Legal Inquiries Box ── */}
      <section id="section-5" className="rounded-xl border bg-card p-6 space-y-3 scroll-mt-20">
        <h3 className="font-bold text-base text-foreground">
          Questions or Errata Disclosures?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For any clarifications regarding this disclaimer, questions sourcing, or copyright fair-dealing guidelines, please reach our support team at{" "}
          <a href="mailto:support@studentace.in" className="text-primary font-medium hover:underline">
            support@studentace.in
          </a>{" "}
          or review our{" "}
          <Link href="/terms" className="text-primary font-medium hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/contact" className="text-primary font-medium hover:underline">
            Contact Us
          </Link>{" "}
          policies.
        </p>
      </section>
    </article>
  );
}
