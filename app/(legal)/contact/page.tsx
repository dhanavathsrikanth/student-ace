import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Shield, AlertCircle, FileText, Send, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | StudentAce",
  description:
    "Official contact information and support helpdesk for StudentAce. Reach out for test queries, billing questions, or feedback.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLegalPage() {
  const lastUpdated = "November 18, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - StudentAce",
    "description": "Official contact channels and support helpdesk for StudentAce Educational Technologies.",
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
          <Mail className="h-3.5 w-3.5" />
          <span>Support &amp; Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-muted-foreground">
          Last revised: <time dateTime="2026-11-18" className="font-medium text-foreground">{lastUpdated}</time> · We typically respond within 24 to 48 business hours.
        </p>
      </header>

      {/* ── Unified Contact Callout Box ── */}
      <section aria-label="Primary Contact Email" className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Official Support Desk</span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              support@studentace.in
            </h2>
            <p className="text-xs text-muted-foreground">
              All inquiries (technical support, billing, test feedback, and general questions) are handled directly through this single address.
            </p>
          </div>
          <a
            href="mailto:support@studentace.in"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity shrink-0"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </a>
        </div>
      </section>

      {/* ── Support Categories Grid ── */}
      <section aria-label="Support Topics" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">
          How Can We Help You?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Technical & Account Support */}
          <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Account &amp; Test Issues</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Login trouble, test timer freezes, question display glitches, or general app feedback.
              </p>
            </div>
            <div className="pt-2 border-t">
              <a
                href="mailto:support@studentace.in?subject=[Account%20Support]"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                support@studentace.in
                <Send className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Billing & Payments */}
          <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Billing &amp; Challenge Passes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Razorpay transaction checks, duplicate debits, invoice requests, or pass activation queries.
              </p>
            </div>
            <div className="pt-2 border-t">
              <a
                href="mailto:support@studentace.in?subject=[Billing%20Support]"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                support@studentace.in
                <Send className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Academic & Question Errata */}
          <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Question Feedback &amp; Errata</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Report ambiguous questions, disputed answer keys, numerical acceptance ranges, or typographical errors.
              </p>
            </div>
            <div className="pt-2 border-t">
              <a
                href="mailto:support@studentace.in?subject=[Question%20Feedback]"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                support@studentace.in
                <Send className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* General & Legal Notices */}
          <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Copyright &amp; General Inquiries</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notice &amp; takedown submissions, partnership proposals, or institutional inquiries.
              </p>
            </div>
            <div className="pt-2 border-t">
              <a
                href="mailto:support@studentace.in?subject=[General%20Inquiry]"
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                support@studentace.in
                <Send className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Operational Details ── */}
      <section aria-label="Operational Details" className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Operational Information</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>Office Hours</span>
            </div>
            <p>Monday – Saturday</p>
            <p>10:00 AM – 6:00 PM IST</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Response Time</span>
            </div>
            <p>Usually within 24 to 48 hours</p>
            <p>Priority for active exam issues</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Registered Location</span>
            </div>
            <p>Sector 62, Noida</p>
            <p>Uttar Pradesh 201309, India</p>
          </div>
        </div>
      </section>

      {/* ── Policy Navigation Shortcuts ── */}
      <section aria-label="Policies" className="rounded-xl border bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-foreground">Need Our Legal Policies?</h3>
          <p className="text-muted-foreground">Review our terms, privacy standards, and refund guidelines.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/terms"
            className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/disclaimer"
            className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors"
          >
            Disclaimer
          </Link>
          <Link
            href="/refund-policy"
            className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors"
          >
            Refund Policy
          </Link>
        </div>
      </section>
    </article>
  );
}
