import Link from "next/link";
import { GraduationCap, ArrowLeft, Shield, FileText, AlertCircle, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Navigation Header ── */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span>StudentAce</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10">
                Beta
              </span>
            </Link>
            <span className="text-muted-foreground/40 text-sm hidden sm:inline">/</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary hidden sm:inline">
              Legal &amp; Compliance Hub
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild className="text-xs font-medium">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Home
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs font-medium">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-medium">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* ── Secondary Legal Sub-navigation (Swipeable on Mobile) ── */}
        <div className="border-t bg-muted/30 px-3 sm:px-6 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          <nav className="max-w-6xl mx-auto flex gap-1.5 sm:gap-2 py-2 text-xs font-medium min-w-max">
            <Link
              href="/terms"
              className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <FileText className="h-3.5 w-3.5" />
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <Shield className="h-3.5 w-3.5" />
              Privacy Policy
            </Link>
            <Link
              href="/disclaimer"
              className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Disclaimer
            </Link>
            <Link
              href="/refund-policy"
              className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refund Policy
            </Link>
            <Link
              href="/contact"
              className="px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact Us
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main Legal Content Container ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {children}
      </main>

      {/* ── Clean Legal Footer ── */}
      <footer className="border-t bg-card/40 py-6 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} StudentAce Educational Technologies. All rights reserved.</p>
          <p className="text-muted-foreground/80">
            Support:{" "}
            <a href="mailto:support@studentace.in" className="hover:underline text-foreground font-medium">
              support@studentace.in
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
