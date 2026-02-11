import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Loader2, Mail, Users, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type RoleOption = "hr" | "candidate";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleOption>("hr");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        // Fetch role after login to determine redirect
        const { data: { user: authUser } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
        if (authUser) {
          const { data: fetchedRole } = await (await import("@/integrations/supabase/client")).supabase.rpc("get_user_role", { _user_id: authUser.id });
          navigate(fetchedRole === "candidate" ? "/candidate" : "/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } else {
      const { error } = await signUp(email, password, fullName, role);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        setConfirmationSent(true);
      }
    }
    setSubmitting(false);
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="w-full max-w-md shadow-elevated">
              <CardContent className="p-8 text-center">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground mb-2">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl font-display">{isLogin ? "Welcome back" : "Create your account"}</CardTitle>
              <CardDescription>
                {isLogin ? "Sign in to your VerifyHire account" : "Start verifying resumes with AI"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Register as</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole("hr")}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                            role === "hr"
                              ? "border-accent bg-accent/5 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          <Users className="h-4 w-4 shrink-0" />
                          HR / Recruiter
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole("candidate")}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                            role === "candidate"
                              ? "border-accent bg-accent/5 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          <UserCheck className="h-4 w-4 shrink-0" />
                          Candidate
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90 transition-opacity"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
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