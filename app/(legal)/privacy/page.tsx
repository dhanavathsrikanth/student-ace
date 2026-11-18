import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | StudentAce",
  description:
    "StudentAce Privacy Policy explaining how we collect, use, and protect study telemetry, test data, and user information under the Indian DPDPA 2023.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 18, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - StudentAce",
    "description": "StudentAce Privacy Policy detailing data protection, exam telemetry, non-monetization pledge, and student rights under the Digital Personal Data Protection Act, 2023.",
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
          <Lock className="h-4 w-4" />
          <span>Data Protection &amp; Privacy Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last revised and effective: <time dateTime="2026-11-18" className="font-medium text-foreground">{lastUpdated}</time> · Public document (No account required)
        </p>
      </header>

      {/* ── Core Commitments Callout (Google & User Quick Scan) ── */}
      <section aria-labelledby="principles-heading" className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 sm:p-6 space-y-3">
        <h2 id="principles-heading" className="text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Our Core Privacy Principles
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Zero Data Selling:</strong> We never sell, rent, or trade your personal data, test scores, or study habits to coaching institutes or third-party brokers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Transparent Telemetry:</strong> Question timing tracks foreground solving focus only, purely to calculate your pace quadrants and speed analytics.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>No Financial Storage:</strong> Payments are processed securely by Razorpay. StudentAce never stores credit/debit card numbers or CVVs.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Right to Erasure:</strong> You can request full deletion of your account, scores, and personal records at any time.</span>
          </li>
        </ul>
      </section>

      {/* ── Table of Contents ── */}
      <nav aria-label="Table of Contents" className="rounded-xl border bg-muted/30 p-4 text-xs">
        <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-[11px]">Table of Contents</h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
          <li><a href="#section-1" className="hover:text-primary hover:underline">1. Introduction &amp; DPDPA 2023</a></li>
          <li><a href="#section-2" className="hover:text-primary hover:underline">2. Information We Collect</a></li>
          <li><a href="#section-3" className="hover:text-primary hover:underline">3. How We Use Study Data</a></li>
          <li><a href="#section-4" className="hover:text-primary hover:underline">4. Zero-Sale Commitment</a></li>
          <li><a href="#section-5" className="hover:text-primary hover:underline">5. Third-Party Sub-Processors</a></li>
          <li><a href="#section-6" className="hover:text-primary hover:underline">6. Data Security Safeguards</a></li>
          <li><a href="#section-7" className="hover:text-primary hover:underline">7. Cookies &amp; Local Storage</a></li>
          <li><a href="#section-8" className="hover:text-primary hover:underline">8. Your Rights as Data Principal</a></li>
          <li><a href="#section-9" className="hover:text-primary hover:underline">9. Notification Preferences</a></li>
          <li><a href="#section-10" className="hover:text-primary hover:underline">10. Contact &amp; Privacy Inquiries</a></li>
        </ol>
      </nav>

      {/* ── Body Sections ── */}
      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">

        {/* Section 1 */}
        <section id="section-1" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            1. Introduction &amp; Statutory Compliance
          </h2>
          <p>
            This Privacy Policy describes how <strong>StudentAce</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating via{" "}
            <Link href="/" className="text-primary hover:underline font-medium">studentace.in</Link>, collects, uses, stores, and protects your information when you register, practice mock tests, and utilize our analytics.
          </p>
          <p>
            We adhere strictly to applicable Indian data privacy regulations, including the <strong>Digital Personal Data Protection Act (DPDPA), 2023</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            2. Information We Collect
          </h2>
          <p>
            We collect only the minimum information necessary to deliver high-quality exam practice and personalized study analytics:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">A. Account &amp; Profile Data</h3>
              <p className="text-xs text-muted-foreground">
                When you sign up via email or Google OAuth, we collect your full name, email address, avatar image URL, and hashed password. We also store your target examination (e.g. GATE), engineering stream (e.g. Civil, Mechanical, CS), and test preferences.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">B. Test Attempts &amp; Performance Telemetry</h3>
              <p className="text-xs text-muted-foreground">
                To generate your test scorecards, we record: question responses, correctness, net marks, bookmarked questions, reported issues, and study streak counts. We also calculate foreground active focus seconds per question (excluding backgrounded time) to compute speed vs. accuracy quadrants and pacing drift.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">C. Payment Transaction Data</h3>
              <p className="text-xs text-muted-foreground">
                When you purchase a challenge pass or premium access, transaction identification tokens, payment status, and order timestamps are provided by our payment gateway, <strong>Razorpay</strong>. StudentAce never receives, processes, or stores raw payment card numbers, UPI PINs, or CVVs.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wide text-foreground">D. Technical &amp; Log Information</h3>
              <p className="text-xs text-muted-foreground">
                When you browse our Platform, our servers log standard technical telemetry including IP address, browser type, device category, referring URL, and session security cookies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            3. How We Use Your Information
          </h2>
          <p>
            Your information is processed strictly for legitimate educational, operational, and security purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
            <li><strong>Scorecard &amp; Solutions Generation:</strong> Evaluating answers against validated keys, determining marks, and rendering comprehensive step-by-step explanations;</li>
            <li><strong>Personalized Analytics:</strong> Computing attempt accuracy, time-spent analysis, topic mastery radars, and high-ROI revision recommendations;</li>
            <li><strong>Spaced Repetition Engine:</strong> Automatically scheduling review dates (1d, 3d, 7d, 14d, 30d) for questions answered incorrectly;</li>
            <li><strong>Platform Security:</strong> Preventing automated scraping, denial-of-service, test timer evasion, and multiple simultaneous logins;</li>
            <li><strong>Service Notifications:</strong> Sending essential verification emails, password resets, and optional milestone notifications (which you may disable anytime at <Link href="/unsubscribe" className="text-primary underline">/unsubscribe</Link>).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            4. Absolute Prohibition on Selling Personal Data
          </h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground/90">
            <strong>Our Pledge to Students:</strong> We consider your preparation journey private. StudentAce does not sell, license, rent, monetize, or trade your personal information, test performance, or contact records to commercial coaching centers, recruitment agencies, or data brokers.
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            5. Third-Party Service Providers (Sub-Processors)
          </h2>
          <p>
            We partner exclusively with reputable, security-certified infrastructure providers who process data strictly under our direction:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
            <li><strong>Supabase (PostgreSQL Cloud):</strong> Provides encrypted database hosting, user authentication, and Row-Level Security (RLS) policies;</li>
            <li><strong>Razorpay:</strong> Facilitates secure payment processing under PCI-DSS compliance standards;</li>
            <li><strong>Google Identity Services:</strong> Facilitates optional, one-click OAuth login;</li>
            <li><strong>Cloudflare / Vercel:</strong> Global CDN hosting, edge routing, and DDoS mitigation.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            6. Data Security Measures
          </h2>
          <p>
            We implement industry-standard administrative, physical, and technical safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            <li>All data transmissions are encrypted using Transport Layer Security (TLS 1.3 / HTTPS);</li>
            <li>Database tables enforce Row-Level Security (RLS), ensuring users can only read and mutate their own test sessions;</li>
            <li>Passkeys and passwords are encrypted using secure one-way cryptographic hashing algorithms;</li>
            <li>Access to backend infrastructure is restricted to authorized personnel via multi-factor authentication (MFA).</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            7. Cookies &amp; Local Storage
          </h2>
          <p>
            We use minimal cookies and browser local storage strictly for functional reasons:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            <li><strong>Authentication Cookies:</strong> Storing secure session tokens so you remain signed in across page transitions;</li>
            <li><strong>Preference Storage:</strong> Remembering your UI theme (Light/Dark mode) and active exam stream;</li>
            <li>We do <strong>not</strong> load third-party ad tracking cookies or invasive marketing pixels.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            8. Your Rights as a Data Principal
          </h2>
          <p>
            Under the Digital Personal Data Protection Act, you possess the following rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border bg-card p-3">
              <strong className="text-foreground">Right to Access:</strong> You can view all saved answers, bookmarks, and test history directly from your account dashboard.
            </div>
            <div className="rounded-lg border bg-card p-3">
              <strong className="text-foreground">Right to Correction:</strong> You can update your profile name and target exam anytime in settings.
            </div>
            <div className="rounded-lg border bg-card p-3">
              <strong className="text-foreground">Right to Erasure:</strong> You may request complete deletion of your account and all associated test scores by emailing us.
            </div>
            <div className="rounded-lg border bg-card p-3">
              <strong className="text-foreground">Right to Assistance:</strong> You can address any data privacy questions or requests directly to support@studentace.in.
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            9. Communications &amp; Notification Control
          </h2>
          <p>
            We respect your inbox. You have complete control over communication channels:
          </p>
          <p className="text-xs text-muted-foreground">
            You can configure in-app notification preferences in your dashboard settings or opt out of milestone emails at any time by visiting our dedicated <Link href="/unsubscribe" className="text-primary underline">Unsubscribe Portal</Link>. Transactional account security emails cannot be disabled while your account remains active.
          </p>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="space-y-3 border-t pt-6 scroll-mt-20">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            10. Contact &amp; Privacy Inquiries
          </h2>
          <p>
            For any questions regarding this Privacy Policy, your personal data, or to exercise your rights, please contact our support team:
          </p>
          <div className="rounded-xl border bg-card p-4 space-y-1 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">StudentAce Support Team</p>
            <p>Email: <a href="mailto:support@studentace.in" className="text-primary underline">support@studentace.in</a></p>
            <p>Response Time: Typically within 24 to 48 business hours.</p>
          </div>
        </section>

      </div>
    </article>
  );
}
