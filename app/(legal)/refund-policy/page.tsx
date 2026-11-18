import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, CreditCard, ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | StudentAce",
  description:
    "Official Razorpay-compliant cancellation and refund policy for digital challenge passes, test credits, and subscriptions on StudentAce.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = "November 18, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cancellation & Refund Policy - StudentAce",
    "description": "Razorpay-compliant refund and cancellation policy governing digital mock test challenge passes on StudentAce.",
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Payment Compliance &amp; Consumer Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: <time dateTime="2026-11-18" className="font-medium text-foreground">{lastUpdated}</time> · Governed under the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </header>

      {/* ── Overview Alert ── */}
      <section aria-label="Digital Goods Overview" className="rounded-xl border bg-card p-5 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <CreditCard className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-foreground">
              Digital Goods &amp; Immediate Provisioning Notice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              StudentAce provides digital educational services, including simulated test series, AI-assisted performance analytics, and competitive Peer Challenge passes (e.g., ₹199 Challenge Pass processed securely via Razorpay). Because digital test credits and analytical compute are unlocked immediately upon payment verification, transactions are subject to the terms outlined below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Table of Contents ── */}
      <nav aria-label="Table of Contents" className="rounded-xl border bg-muted/30 p-4 text-xs">
        <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-[11px]">Table of Contents</h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
          <li><a href="#section-1" className="hover:text-primary hover:underline">1. Order Cancellation Policy</a></li>
          <li><a href="#section-2" className="hover:text-primary hover:underline">2. Refund Eligibility Matrix (Eligible vs Ineligible)</a></li>
          <li><a href="#section-3" className="hover:text-primary hover:underline">3. Refund Request Process &amp; Crediting Timelines</a></li>
          <li><a href="#section-4" className="hover:text-primary hover:underline">4. Chargebacks &amp; Fraud Prevention</a></li>
          <li><a href="#section-5" className="hover:text-primary hover:underline">5. Billing Desk &amp; Escalation</a></li>
        </ol>
      </nav>

      {/* ── Section 1: Cancellation Policy ── */}
      <section id="section-1" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            1. Order Cancellation Policy
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            Due to the instantaneous automated delivery of our digital content and test engine infrastructure:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Once a payment has been confirmed by our payment gateway (Razorpay) and the corresponding digital pass, mock test credits, or premium feature is unlocked in your StudentAce account, the order cannot be unilaterally cancelled by the user.
            </li>
            <li>
              If you initiated an order in error and have <strong>not yet accessed, previewed, or initiated any test session</strong> associated with the pass, you may submit a cancellation request within <strong>24 hours</strong> of purchase by emailing{" "}
              <a href="mailto:support@studentace.in" className="text-primary underline font-medium">
                support@studentace.in
              </a>.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 2: Eligible vs Non-Eligible Scenarios ── */}
      <section id="section-2" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            2. Refund Eligibility Criteria
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {/* Eligible */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Scenarios Eligible for a Full Refund</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">•</span>
                <span>
                  <strong>Duplicate Charges:</strong> You were charged multiple times for a single challenge pass or test purchase due to a payment gateway timeout or double debit.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">•</span>
                <span>
                  <strong>Technical Non-Delivery:</strong> The amount was debited from your bank/card/UPI account, but the pass or test failed to activate within 24 hours despite raising a support ticket.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">•</span>
                <span>
                  <strong>Platform Infrastructure Outage:</strong> A verified persistent server downtime on StudentAce&rsquo;s primary database that prevented any test attempt during the entire validity period of your purchased pass.
                </span>
              </li>
            </ul>
          </div>

          {/* Ineligible */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <XCircle className="h-5 w-5" />
              <span>Scenarios Ineligible for Refund</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">•</span>
                <span>
                  <strong>Consumed Digital Content:</strong> Any pass, test series, or challenge where you have already started or completed one or more questions or viewed the answer solutions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">•</span>
                <span>
                  <strong>Exam Performance &amp; Dissatisfaction:</strong> Dissatisfaction with one&rsquo;s mock test score, percentile, ranking, or perceived difficulty of syllabus questions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">•</span>
                <span>
                  <strong>Client-Side Failures:</strong> Network disconnects, power outages, browser crashes, or operating system issues originating on the user&rsquo;s local device during a live test.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">•</span>
                <span>
                  <strong>Change of Mind:</strong> Requests submitted after 24 hours of purchase or after utilizing promotional discounts/referrals.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 3: Refund Process & Timeline ── */}
      <section id="section-3" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <RefreshCw className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            3. Refund Request Process &amp; Crediting Timelines
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            If your situation meets the eligibility criteria described above, please follow this procedure:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Send an email to{" "}
              <a href="mailto:support@studentace.in" className="text-primary font-medium underline">
                support@studentace.in
              </a>{" "}
              with the subject line: <code>[Refund Request] - Razorpay Payment ID / Order ID</code>.
            </li>
            <li>
              Include your registered StudentAce account email address, bank transaction reference (UTR) or Razorpay payment ID, and a clear screenshot or explanation of the billing discrepancy.
            </li>
            <li>
              Our support team will review your application against our telemetry logs within <strong>24 to 48 business hours</strong>.
            </li>
            <li>
              <strong>Credit Turnaround Time:</strong> Once approved, the refund is processed directly via our payment aggregator (Razorpay) to the original source payment method (credit card, debit card, UPI VPA, or net banking account). As per banking settlement standards, the credited funds typically reflect in your account within <strong>5 to 7 business days</strong>.
            </li>
          </ol>
        </div>
      </section>

      {/* ── Section 4: Chargebacks & Fraud Prevention ── */}
      <section id="section-4" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <AlertCircle className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            4. Chargebacks &amp; Account Suspensions
          </h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1 sm:pl-7">
          <p>
            We take fraudulent transactions and illegitimate chargeback claims seriously:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              If a chargeback or payment dispute is initiated with a card issuer or bank without first contacting our support desk, StudentAce reserves the right to immediately suspend access to the associated user account and preserve server audit logs for resolution with our banking partners.
            </li>
            <li>
              Accounts found exploiting repeated duplicate-payment claims or abusing challenge rewards will be permanently terminated without eligibility for reinstatement.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 5: Helpdesk Footer Box ── */}
      <section id="section-5" className="rounded-xl border bg-card p-6 space-y-3 scroll-mt-20">
        <h3 className="font-bold text-base text-foreground">
          Need Assistance with a Recent Payment?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our support desk is available Monday through Saturday, 10:00 AM to 6:00 PM IST. Reach out to{" "}
          <a href="mailto:support@studentace.in" className="text-primary font-medium hover:underline">
            support@studentace.in
          </a>{" "}
          or visit our{" "}
          <Link href="/contact" className="text-primary font-medium hover:underline">
            Contact Us page
          </Link>.
        </p>
      </section>
    </article>
  );
}
