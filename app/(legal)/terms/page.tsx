import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, CheckCircle2, Scale, BookOpen, Clock, Ban, Award, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | StudentAce",
  description:
    "Official terms and conditions governing StudentAce mock tests, diagnostic analytics, PYQ fair use, Razorpay challenge passes, and user rights.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "November 18, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - StudentAce",
    "description": "Terms of Service governing the use of StudentAce mock tests, educational question repositories, and diagnostic analytics.",
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

      {/* ── Document Title Header ── */}
      <header className="border-b pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Scale className="h-4 w-4" />
          <span>Legal Agreement &amp; Operating Policies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          Last revised and effective: <time dateTime="2026-11-18" className="font-medium text-foreground">{lastUpdated}</time> · Public document (No account required)
        </p>
      </header>

      {/* ── Key Highlights Callout (Google & User Quick Scan) ── */}
      <section aria-labelledby="summary-heading" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-3">
        <h2 id="summary-heading" className="text-base font-bold flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Essential Points at a Glance
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Independent Entity:</strong> StudentAce is not affiliated with or endorsed by IITs, IISc, NTA, or GATE.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Diagnostic Nature:</strong> Scores, accuracy, and percentile metrics are self-assessment simulations and do not guarantee official exam ranks.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Question Sourcing:</strong> Past examination papers are reproduced under fair dealing for educational research, while solutions are proprietary.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Anti-Scraping:</strong> Automated scraping, bot access, or reselling of question sets is strictly prohibited under Indian law.</span>
          </li>
        </ul>
      </section>

      {/* ── Table of Contents ── */}
      <nav aria-label="Table of Contents" className="rounded-xl border bg-muted/30 p-4 text-xs">
        <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-[11px]">Table of Contents</h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
          <li><a href="#section-1" className="hover:text-primary hover:underline">1. Acceptance &amp; Eligibility</a></li>
          <li><a href="#section-2" className="hover:text-primary hover:underline">2. Non-Affiliation Declaration</a></li>
          <li><a href="#section-3" className="hover:text-primary hover:underline">3. Diagnostic Test Simulations</a></li>
          <li><a href="#section-4" className="hover:text-primary hover:underline">4. Question Copyright &amp; Fair Use</a></li>
          <li><a href="#section-5" className="hover:text-primary hover:underline">5. Notice &amp; Takedown (48h SLA)</a></li>
          <li><a href="#section-6" className="hover:text-primary hover:underline">6. User Accounts &amp; Conduct</a></li>
          <li><a href="#section-7" className="hover:text-primary hover:underline">7. Anti-Scraping &amp; Prohibitions</a></li>
          <li><a href="#section-8" className="hover:text-primary hover:underline">8. Digital Passes &amp; Razorpay</a></li>
          <li><a href="#section-9" className="hover:text-primary hover:underline">9. Warranty Disclaimers</a></li>
          <li><a href="#section-10" className="hover:text-primary hover:underline">10. Limitation of Liability</a></li>
          <li><a href="#section-11" className="hover:text-primary hover:underline">11. Governing Law &amp; Jurisdiction</a></li>
          <li><a href="#section-12" className="hover:text-primary hover:underline">12. Contact Information &amp; Support</a></li>
        </ol>
      </nav>

      {/* ── Body Sections ── */}
      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        
        {/* Section 1 */}
        <section id="section-1" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            1. Acceptance of Terms &amp; Eligibility
          </h2>
          <p>
            Please read these Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) carefully before using the <strong>StudentAce</strong> web platform accessible at{" "}
            <Link href="/" className="text-primary hover:underline font-medium">studentace.in</Link> (the &quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <p>
            By creating an account, browsing, practicing tests, or utilizing our analytics, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and our{" "}
            <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>. If you do not agree to all terms, you must discontinue use immediately.
          </p>
          <p>
            You represent and warrant that you are at least 13 years of age, or if you are between 13 and 18, that you are accessing the Platform under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            2. Platform Purpose &amp; Absolute Non-Affiliation
          </h2>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
            <strong>Trademark &amp; Non-Affiliation Declaration:</strong> &quot;GATE&quot;, &quot;Graduate Aptitude Test in Engineering&quot;, &quot;IIT&quot;, &quot;IISc&quot;, and related test names and acronyms are the statutory intellectual property and trademarks of their respective examination organizing bodies, National Coordination Boards, or Government entities. StudentAce is an entirely independent academic practice and analytics service. We have no affiliation, association, sponsorship, partnership, or endorsement from any Indian Institute of Technology (IIT), the Indian Institute of Science (IISc), the National Testing Agency (NTA), or any Ministry of the Government of India.
          </div>
          <p>
            The Platform provides mock test simulation environments, previous years&apos; question papers (PYQs), self-paced practice sprints, step-by-step explanations, virtual scientific calculator practice, and algorithmic performance diagnostics.
          </p>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            3. Diagnostic Nature of Test Reports, Scores &amp; Analysis
          </h2>
          <p>
            All test reports, Net Marks, Attempt Accuracy, Correct Rates, Pacing Quadrants, Pace Drift metrics, Syllabus Diagnostics, and Subject Breakdowns displayed on the Platform are generated through computer algorithms based exclusively on your input in practice sessions.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
            <li>
              <strong>No Guarantee of Real Exam Marks:</strong> Marks, percentiles, or accuracy metrics on StudentAce do not constitute an official prediction, cutoff projection, or guarantee of qualification, marks, or rank in any actual examination.
            </li>
            <li>
              <strong>Raw Marking vs. Official Normalization:</strong> Competitive examinations (such as GATE multi-session papers) often employ complex mathematical score normalization and qualifying mark formulas. StudentAce reports raw configured question marks and simulated penalties for diagnostic convenience only.
            </li>
            <li>
              <strong>No Liability for Academic Outcomes:</strong> You agree that your ultimate performance in competitive examinations depends on numerous independent variables. StudentAce and its operators bear zero liability for any student&apos;s exam rank, non-selection, cutoff shortfall, or academic decisions.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            4. Question Content, Copyright &amp; Fair Use
          </h2>
          <p>
            Our question repositories combine publicly released past examination papers, user-submitted feedback, and originally authored educational materials:
          </p>
          <div className="space-y-2">
            <div className="rounded-xl border bg-card p-4 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">A. Previous Year Questions (PYQs) &amp; Fair Dealing</h3>
              <p className="text-xs text-muted-foreground">
                Public examination questions from historical competitive tests are hosted on StudentAce strictly for the statutory purposes of educational study, instruction, research, and non-commercial academic evaluation in accordance with <strong>Section 52(1)(a)</strong> and <strong>Section 52(1)(h)</strong> of the Indian Copyright Act, 1957.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">B. Proprietary Solutions &amp; Platform Software</h3>
              <p className="text-xs text-muted-foreground">
                All original step-by-step mathematical solutions, explanatory diagrams, concept tags, software code, user interface designs, formulas, and analytical dashboards are the sole and exclusive intellectual property of StudentAce. Any reproduction, mirroring, or republishing of our proprietary explanations is strictly prohibited.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">C. User Contributions &amp; Correction Reports</h3>
              <p className="text-xs text-muted-foreground">
                When you submit question issue reports, corrections, or feedback via our built-in reporting tools, you grant StudentAce a perpetual, irrevocable, worldwide, royalty-free, transferable license to edit, adapt, and incorporate those corrections into the question bank for the benefit of all learners.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            5. Notice and Takedown Policy (DMCA &amp; Copyright Compliance)
          </h2>
          <p>
            StudentAce respects the intellectual property rights of others. If you believe that any question, diagram, or material hosted on our Platform infringes your copyrighted work, please notify our support team promptly with:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">
            <li>Identification of the copyrighted work claimed to have been infringed;</li>
            <li>Specific URL or Question ID on StudentAce where the material appears;</li>
            <li>Your contact address, telephone number, and official email;</li>
            <li>A statement by you that you have a good-faith belief that the disputed use is not authorized by the copyright owner;</li>
            <li>A signed statement made under penalty of perjury confirming your authority to act.</li>
          </ol>
          <p className="text-xs">
            Notices should be sent to: <a href="mailto:support@studentace.in" className="text-primary font-mono underline">support@studentace.in</a>. We commit to reviewing and taking appropriate corrective action within <strong>48 hours</strong> of receipt of a valid notice.
          </p>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            6. User Accounts, Security &amp; Fair Conduct
          </h2>
          <p>
            To utilize personalized analytics, test tracking, and bookmarks, you must register an account using credentials or supported third-party providers (Google OAuth). You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            <li>Provide accurate and current information;</li>
            <li>Maintain the confidentiality of your login credentials;</li>
            <li>Accept full responsibility for all activities that occur under your account;</li>
            <li>Notify us immediately of any unauthorized access or security breach.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            7. Anti-Scraping, Abuse &amp; Prohibited Actions
          </h2>
          <p>
            You expressly agree that you shall NOT, directly or indirectly:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
            <li>Use automated scrapers, web spiders, bots, crawlers, or data harvesting scripts to download question sets, answer keys, or user data;</li>
            <li>Reverse engineer, decompile, disassemble, or derive the source code or proprietary analytics algorithms of the Platform;</li>
            <li>Share, rent, sublicense, or resell access to your account or any paid challenge pass to multiple individuals;</li>
            <li>Bypass, disable, or tamper with security controls, rate limiters, or test timers;</li>
            <li>Introduce malicious code, viruses, or denial-of-service vectors into the Platform.</li>
          </ul>
          <p className="text-xs">
            Violations of this section will result in immediate and permanent account termination without refund and may subject the offender to civil and criminal liability under the <strong>Information Technology Act, 2000</strong>.
          </p>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            8. Digital Passes, Payments &amp; Razorpay Compliance
          </h2>
          <p>
            Certain sprint challenges, premium test packs, or feature passes may require monetary payment.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            <li>
              <strong>Instant Digital Delivery:</strong> All passes (such as the Challenge Pass) are digital goods delivered electronically and provisioned to your account immediately upon payment capture.
            </li>
            <li>
              <strong>Payment Gateway:</strong> All payments are processed through PCI-DSS compliant third-party payment gateways (e.g., <strong>Razorpay</strong>). StudentAce never receives or stores your credit/debit card numbers or bank CVVs.
            </li>
            <li>
              <strong>Currency &amp; Taxes:</strong> All fees are stated in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise.
            </li>
            <li>
              <strong>Refunds:</strong> Purchases are governed by our <Link href="/refund-policy" className="text-primary hover:underline font-semibold">Cancellation &amp; Refund Policy</Link>. Because test passes grant instantaneous digital access, refunds are limited to verified duplicate payments or technical delivery failures.
            </li>
          </ul>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            9. Disclaimers of Warranties
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            THE PLATFORM, INCLUDING ALL CONTENT, QUESTIONS, EXPLANATIONS, AND ANALYTICS, IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, STUDENTACE DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND UNINTERRUPTED OR ERROR-FREE SERVICE. WHILE WE STRIVE FOR 100% ACCURACY IN SYLLABUS ALIGNMENT AND ANSWER KEYS, INADVERTENT TYPOGRAPHICAL OR MATHEMATICAL DISCREPANCIES MAY OCCUR.
          </p>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            10. Limitation of Liability
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            IN NO EVENT SHALL STUDENTACE, ITS FOUNDERS, DIRECTORS, AFFILIATES, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF EXAM ATTEMPTS, LOSS OF ADMISSION OPPORTUNITIES, OR LOSS OF DATA) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS OR INABILITY TO ACCESS THE PLATFORM. IN ALL CIRCUMSTANCES, OUR AGGREGATE LIABILITY SHALL BE STRICTLY LIMITED TO THE AMOUNT ACTUALLY PAID BY YOU TO STUDENTACE IN THE THREE (3) MONTHS PRECEDING THE CLAIM OR ₹500 (FIVE HUNDRED INDIAN RUPEES), WHICHEVER IS LOWER.
          </p>
        </section>

        {/* Section 11 */}
        <section id="section-11" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            11. Governing Law &amp; Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>, without regard to its conflict of law principles. Any dispute or claim arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts located in India.
          </p>
        </section>

        {/* Section 12 */}
        <section id="section-12" className="space-y-3 border-t pt-6 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            12. Contact Information &amp; Support
          </h2>
          <p>
            For inquiries, terms clarification, or correspondence, please contact:
          </p>
          <div className="rounded-xl border bg-card p-4 space-y-1 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">StudentAce Support Team</p>
            <p>Email: <a href="mailto:support@studentace.in" className="text-primary underline">support@studentace.in</a></p>
            <p>Official Website: <a href="https://studentace.in" className="text-primary underline">https://studentace.in</a></p>
          </div>
        </section>

      </div>
    </article>
  );
}
