import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { authProxy } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function OnboardPage() {
  const { user, userRole, loading, getToken, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (userRole) {
      navigate(userRole === "candidate" ? "/candidate" : "/dashboard", {
        replace: true,
      });
    }
  }, [user, userRole, loading, navigate]);

  const handleSelectRole = async (role: "hr" | "candidate") => {
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await authProxy("set-role", { role }, token);
      await refreshProfile();
      navigate(role === "candidate" ? "/candidate" : "/dashboard", {
        replace: true,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to set role",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4"
        >
          <Card className="shadow-elevated">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-display">
                Welcome to VerifyHire
              </CardTitle>
              <CardDescription>
                How will you be using the platform?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelectRole("hr")}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-card text-left text-sm font-medium transition-all hover:border-accent/40 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Users className="h-5 w-5 text-accent shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      HR / Recruiter
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload and verify candidate resumes
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelectRole("candidate")}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-card text-left text-sm font-medium transition-all hover:border-accent/40 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <UserCheck className="h-5 w-5 text-accent shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Candidate</p>
                    <p className="text-xs text-muted-foreground">
                      Check your resume health and credibility
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
