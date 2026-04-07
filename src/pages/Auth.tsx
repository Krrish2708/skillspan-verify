import { useEffect } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const clerkAppearance = {
  layout: {
    logoPlacement: "none" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#10b981",
    colorBackground: "#0f1a14",
    colorInputBackground: "#0a1210",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.45)",
    colorNeutral: "rgba(255,255,255,0.1)",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    card: "bg-transparent shadow-none border-none",
    rootBox: "w-full",
    formButtonPrimary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity text-white font-semibold",
    formFieldInput:
      "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl",
    formFieldLabel: "text-white/60 text-sm",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    dividerLine: "bg-white/10",
    dividerText: "text-white/30",
    footerActionText: "text-white/40",
    footerActionLink: "text-emerald-400 hover:text-emerald-300",
    identityPreviewText: "text-white/70",
    identityPreviewEditButton: "text-emerald-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white transition-all duration-200 rounded-xl",
    socialButtonsBlockButtonText: "text-white/70",
    otpCodeFieldInput: "border-white/10 bg-white/5 text-white",
    footer: "bg-transparent",
    internal_card: "bg-transparent",
  },
};

export default function AuthPage() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (!userRole) navigate("/onboard", { replace: true });
      else navigate(userRole === "candidate" ? "/candidate" : "/dashboard", { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#080c10] flex flex-col relative overflow-hidden">
      {/* Background gradients matching hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_100%_80%,rgba(20,184,166,0.06),transparent)]" />

      {/* Fine grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Minimal navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl gradient-accent flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-white tracking-tight">VerifyHire</span>
        </Link>
        <Link to="/" className="text-white/40 text-sm hover:text-white/70 transition-colors duration-200">
          ← Back to home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Branding above widget */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">
              Welcome to VerifyHire
            </h1>
            <p className="text-white/40 text-sm">
              AI-powered resume verification for modern hiring teams
            </p>
          </div>

          {/* Clerk widget wrapper */}
          <div className="relative">
            {/* Glow behind widget */}
            <div className="absolute inset-0 bg-emerald-500/5 blur-[40px] rounded-3xl" />
            <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl">
              <SignIn
                routing="hash"
                appearance={clerkAppearance}
              />
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-center text-white/20 text-xs mt-6">
            By continuing, you agree to VerifyHire's Terms of Service
          </p>
        </motion.div>
      </main>
    </div>
  );
}
