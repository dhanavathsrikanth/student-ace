import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";
import {
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Bookmark,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
  ShieldAlert,
  Calculator,
  Mail,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: general } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "general")
    .maybeSingle();
  const maintenanceMode = ((general?.value as any)?.maintenanceMode) === true;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MaintenanceBanner isMaintenanceMode={maintenanceMode} isAdmin={false} />
      {/* Nav */}
      <header className="border-b bg-card/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>StudentAce</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" asChild className="text-xs font-medium">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-medium">
              <Link href="/auth/sign-up">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center flex-1">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1 text-xs sm:text-sm text-muted-foreground mb-6 shadow-xs">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Preparation built around your exam</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight sm:leading-tight">
          Prepare for your exam with{" "}
          <span className="text-primary">Real PYQs</span>
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground mt-4 max-w-xl mx-auto px-2 leading-relaxed">
          Practice with previous year questions, track your performance, and ace
          the exam with confidence.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8 w-full max-w-xs sm:max-w-none mx-auto">
          <Button size="lg" asChild className="w-full sm:w-auto font-semibold">
            <Link href="/auth/sign-up">
              Start Practicing Free
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto font-medium">
            <Link href="/auth/login">
              Sign in
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-xl border bg-card p-5 sm:p-6 text-center shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3.5">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-1.5 text-foreground">Mock Tests</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Full-length and subject-wise tests with real exam timers and PYQs
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 sm:p-6 text-center shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3.5">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-1.5 text-foreground">Detailed Analytics</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track scores, subject-wise performance, and study streaks over time
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 sm:p-6 text-center shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3.5">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-1.5 text-foreground">Bookmark &amp; Review</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Save tough questions, review answers with explanations, and track weak topics
            </p>
          </div>
        </div>
      </section>

      {/* Mobile-Friendly Modern Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm text-muted-foreground text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:gap-10">
            {/* Col 1: Brand & Status (Spans 2 cols on mobile, 1 col on desktop) */}
            <div className="col-span-2 md:col-span-1 space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold text-base text-foreground tracking-tight">StudentAce</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  GATE
                </Badge>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground max-w-sm">
                Empowering engineering aspirants to master competitive examinations through realistic exam simulations, precise diagnostic telemetry, and structured PYQ practice.
              </p>

              {/* Live Status indicator */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>All test engines operational</span>
              </div>

              <p className="text-[11px] text-muted-foreground/75 pt-1">
                © {new Date().getFullYear()} StudentAce Educational Technologies.
              </p>
            </div>

            {/* Col 2: Preparation (1 col on mobile, bold text) */}
            <div className="col-span-1 space-y-3">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Preparation</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/tests" className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group py-0.5">
                    <span>Full Mock Tests</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary hidden sm:inline" />
                  </Link>
                </li>
                <li>
                  <Link href="/practice" className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group py-0.5">
                    <span>Subject Practice</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary hidden sm:inline" />
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group py-0.5">
                    <span>Analytics</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary hidden sm:inline" />
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group py-0.5">
                    <span>Peer Challenges</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary hidden sm:inline" />
                  </Link>
                </li>
                <li>
                  <Link href="/bookmarks" className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group py-0.5">
                    <span>Bookmarks</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary hidden sm:inline" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal & Policies (1 col on mobile, clean links) */}
            <div className="col-span-1 space-y-3">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Legal &amp; Policies</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  Public
                </span>
              </div>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors block py-0.5">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors block py-0.5">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="hover:text-foreground transition-colors block py-0.5">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-foreground transition-colors block py-0.5">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors block py-0.5">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust & Direct Disclaimer Card (Spans 2 cols on mobile, 1 col on desktop) */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Trust &amp; Governance</h4>
              
              {/* Direct interactive card linking directly to Disclaimer */}
              <Link
                href="/disclaimer"
                className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-background/60 p-3.5 transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      Examination Disclaimer
                    </span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary shrink-0" />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  Direct link to our statutory non-affiliation declaration &amp; PYQ fair-dealing notice.
                </p>
              </Link>

              {/* Direct Shortcuts */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <Link
                  href="/calculator"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <Calculator className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Virtual Scientific Calculator</span>
                </Link>
                <a
                  href="mailto:support@studentace.in"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>support@studentace.in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
