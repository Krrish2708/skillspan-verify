import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 border-t border-border">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-accent flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-primary-foreground">VerifyHire</span>
          </div>
          <p className="text-sm text-primary-foreground/50">
            © 2026 VerifyHire. AI-powered resume verification for modern hiring teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
