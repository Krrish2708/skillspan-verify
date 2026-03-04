import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (!userRole) navigate("/onboard", { replace: true });
      else
        navigate(userRole === "candidate" ? "/candidate" : "/dashboard", {
          replace: true,
        });
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 flex flex-col items-center"
        >
          {mode === "sign-in" ? (
            <SignIn routing="hash" />
          ) : (
            <SignUp routing="hash" />
          )}
          <div className="text-center mt-4">
            <button
              onClick={() =>
                setMode(mode === "sign-in" ? "sign-up" : "sign-in")
              }
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "sign-in"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
