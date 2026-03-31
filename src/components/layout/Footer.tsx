import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 border-t border-border/10">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl gradient-accent flex items-center justify-center">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-primary-foreground tracking-tight">VerifyHire</span>
          </div>
          <p className="text-sm text-primary-foreground/40">
            © 2026 VerifyHire. AI-powered resume verification for modern hiring teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
