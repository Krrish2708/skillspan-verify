import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Eye, FileText, Search, Upload, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Resume } from "@/lib/types";

function getHireVerdict(resume: Resume): { label: string; color: string; bg: string } | null {
  const pd = resume.parsed_data as any;
  const hrNotes = pd?.hr_notes || pd?.improvement_suggestions || [];
  const verdictLine = hrNotes.find((s: string) => s.startsWith("HIRE_RECOMMENDATION:"));
  if (!verdictLine) return null;
  const verdict = verdictLine.replace("HIRE_RECOMMENDATION:", "").trim();
  if (verdict.includes("Strong Hire")) return { label: "Strong Hire", color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (verdict.includes("Hire")) return { label: "Hire", color: "text-emerald-600", bg: "bg-emerald-500/8 border-emerald-500/15" };
  if (verdict.includes("Maybe")) return { label: "Maybe", color: "text-yellow-700", bg: "bg-yellow-500/10 border-yellow-500/20" };
  if (verdict.includes("Pass")) return { label: "Pass", color: "text-red-600", bg: "bg-red-500/10 border-red-500/20" };
  return null;
}

export default function ReportsPage() {
  const { profileId } = useAuth();
  const [search, setSearch] = useState("");

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["reports", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("profile_id", profileId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Resume[];
    },
    enabled: !!profileId,
  });

  const filtered = resumes.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.candidate_name || "").toLowerCase().includes(q) ||
      (r.candidate_role || "").toLowerCase().includes(q) ||
      r.file_name.toLowerCase().includes(q)
    );
  });

  const completedCount = resumes.filter(r => r.status === "completed").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-7xl mx-auto px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">Reports</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Verification Reports</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {completedCount > 0 ? `${completedCount} reports analyzed` : "All resume authenticity reports"}
              </p>
            </div>
            <Link to="/upload">
              <Button size="sm" className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-95 transition-all duration-300 shadow-sm hover:shadow-glow gap-2 rounded-xl h-9">
                <Upload className="h-3.5 w-3.5" /> Upload Resume
              </Button>
            </Link>
          </motion.div>

          {/* Search bar */}
          {resumes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mb-6 max-w-sm"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search by name or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl border-border/60 bg-card text-sm"
              />
            </motion.div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-52 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 && search ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No results for "<span className="font-medium text-foreground">{search}</span>"</p>
              <button onClick={() => setSearch("")} className="text-xs text-accent mt-2 hover:underline">Clear search</button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-5">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-sm mb-5">Upload a resume to generate your first verification report.</p>
              <Link to="/upload">
                <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-95 transition-all duration-300 shadow-sm hover:shadow-glow rounded-xl">
                  Upload Resume
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((resume, i) => {
                const verdict = resume.status === "completed" ? getHireVerdict(resume) : null;
                const level = resume.status === "completed" ? getScoreLevel(resume.overall_score) : "medium";

                return (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/reports/${resume.id}`}>
                      <Card className="premium-card border-border/60 h-full group cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                        <CardContent className="p-5">

                          {/* Top row: score + verdict */}
                          <div className="flex items-start justify-between mb-4">
                            {resume.status === "completed" ? (
                              <ScoreBadge score={resume.overall_score} size="md" />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-muted-foreground text-xs font-medium">
                                <Clock className="h-3.5 w-3.5 animate-spin" />
                                {resume.status === "parsing" ? "Analyzing..." : "Pending"}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {verdict && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verdict.bg} ${verdict.color}`}>
                                  {verdict.label}
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                            </div>
                          </div>

                          {/* Name + role */}
                          <h3 className="font-display font-semibold text-foreground text-sm mb-0.5 group-hover:text-accent transition-colors duration-200 truncate">
                            {resume.candidate_name || resume.file_name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-4 truncate">
                            {resume.candidate_role || (resume.status === "completed" ? "—" : "Processing...")}
                          </p>

                          {/* Score pills row */}
                          {resume.status === "completed" && (
                            <div className="flex items-center gap-1.5 mb-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums ${
                                (resume.ats_score || 0) >= 75 ? "bg-blue-500/10 text-blue-600" :
                                (resume.ats_score || 0) >= 50 ? "bg-yellow-500/10 text-yellow-600" :
                                "bg-red-500/10 text-red-500"
                              }`}>
                                ATS {resume.ats_score || 0}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums ${
                                (resume.credibility_score || 0) >= 75 ? "bg-purple-500/10 text-purple-600" :
                                (resume.credibility_score || 0) >= 50 ? "bg-purple-500/10 text-purple-500" :
                                "bg-red-500/10 text-red-500"
                              }`}>
                                Cred {resume.credibility_score || 0}
                              </span>
                              {(resume.relevancy_score || 0) > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums bg-emerald-500/10 text-emerald-600">
                                  Rel {resume.relevancy_score}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Bottom row: date + verified icon */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                              <FileText className="h-3 w-3" />
                              <span>{new Date(resume.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            {resume.status === "completed" && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                                <ShieldCheck className="h-3 w-3" />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
