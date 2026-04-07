import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText, Users, AlertTriangle, CheckCircle2, Upload, TrendingUp,
  GitCompareArrows, ArrowUpDown, SlidersHorizontal, ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Resume } from "@/lib/types";

export default function Dashboard() {
  const { profileId } = useAuth();
  const [relevancyWeight, setRelevancyWeight] = useState(50);
  const [sortHighest, setSortHighest] = useState(true);
  const credibilityWeight = 100 - relevancyWeight;

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes", profileId],
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

  const completedResumes = resumes.filter(r => r.status === "completed");

  const getWeightedScore = (resume: Resume) => {
    const rel = resume.relevancy_score || 0;
    const cred = resume.credibility_score || 0;
    if (rel === 0) return cred;
    return Math.round((rel * relevancyWeight / 100) + (cred * credibilityWeight / 100));
  };

  const sortedResumes = [...completedResumes].sort((a, b) =>
    sortHighest ? getWeightedScore(b) - getWeightedScore(a) : getWeightedScore(a) - getWeightedScore(b)
  );

  const highConfidenceCount = completedResumes.filter(r => r.credibility_score >= 70).length;
  const atRiskCount = completedResumes.filter(r => r.overall_score < 50).length;

  const stats = [
    {
      label: "Total Candidates",
      value: completedResumes.length,
      sub: `${resumes.length} uploaded`,
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "High Confidence",
      value: highConfidenceCount,
      sub: completedResumes.length > 0 ? `${((highConfidenceCount / completedResumes.length) * 100).toFixed(0)}% rate` : "0% rate",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "At Risk",
      value: atRiskCount,
      sub: completedResumes.length > 0 ? `${((atRiskCount / completedResumes.length) * 100).toFixed(0)}% flagged` : "0% flagged",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
    },
    {
      label: "Reports Available",
      value: completedResumes.length,
      sub: "fully analyzed",
      icon: FileText,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-7xl mx-auto px-6">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">HR Dashboard</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Resume Verification</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Overview of all candidate analysis activity</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link to="/compare">
                <Button variant="outline" size="sm" className="font-medium gap-2 border-border/60 hover:bg-secondary/60 rounded-xl h-9">
                  <GitCompareArrows className="h-3.5 w-3.5" /> Compare
                </Button>
              </Link>
              <Link to="/bulk-upload">
                <Button variant="outline" size="sm" className="font-medium gap-2 border-border/60 hover:bg-secondary/60 rounded-xl h-9">
                  <Upload className="h-3.5 w-3.5" /> Bulk Upload
                </Button>
              </Link>
              <Link to="/upload">
                <Button size="sm" className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-95 transition-all duration-300 shadow-sm hover:shadow-glow gap-2 rounded-xl h-9">
                  <Upload className="h-3.5 w-3.5" /> Upload Resume
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ── Stats Grid ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <Card className="premium-card border-border/60 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-9 w-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                      </div>
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/30" />
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground tabular-nums mb-0.5">
                      {isLoading ? "—" : stat.value}
                    </p>
                    <p className="text-sm font-medium text-foreground/70">{stat.label}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className={`text-xs font-semibold ${stat.iconColor}`}>{stat.sub}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Score Weighting Slider ── */}
          {completedResumes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="premium-card border-border/60 mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Score Weighting</p>
                      <p className="text-xs text-muted-foreground">Adjust how overall scores are calculated</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      Overall = (Relevancy × {relevancyWeight}%) + (Credibility × {credibilityWeight}%)
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right w-28">
                      <p className="text-xs text-muted-foreground">Relevancy</p>
                      <p className="text-lg font-display font-bold text-blue-500 tabular-nums">{relevancyWeight}%</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-accent rounded-full transition-all duration-150"
                          style={{ width: `${relevancyWeight}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={relevancyWeight}
                        onChange={(e) => setRelevancyWeight(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                      />
                    </div>
                    <div className="w-28">
                      <p className="text-xs text-muted-foreground">Credibility</p>
                      <p className="text-lg font-display font-bold text-accent tabular-nums">{credibilityWeight}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── Candidate Rankings ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="premium-card border-border/60">
              <CardHeader className="pb-0 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-display tracking-tight">Candidate Rankings</CardTitle>
                    {completedResumes.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{completedResumes.length} candidates analyzed</p>
                    )}
                  </div>
                  {completedResumes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs border-border/60 rounded-xl h-8"
                      onClick={() => setSortHighest(!sortHighest)}
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      {sortHighest ? "Highest First" : "Lowest First"}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : completedResumes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-14 w-14 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium text-sm mb-1">No resumes analyzed yet</p>
                    <p className="text-xs text-muted-foreground mb-5">Upload your first resume to get started</p>
                    <Link to="/upload">
                      <Button size="sm" className="gradient-accent text-accent-foreground border-0 font-semibold rounded-xl">
                        Upload your first resume
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border/40 mb-1">
                      <div className="col-span-5">Candidate</div>
                      <div className="col-span-2 text-center">ATS</div>
                      <div className="col-span-2 text-center">Relevancy</div>
                      <div className="col-span-2 text-center">Credibility</div>
                      <div className="col-span-1 text-center">Overall</div>
                    </div>

                    {/* Table rows */}
                    <div className="space-y-0.5 mt-1">
                      {sortedResumes.map((resume, i) => {
                        const weightedScore = getWeightedScore(resume);
                        const level = getScoreLevel(weightedScore);
                        return (
                          <motion.div
                            key={resume.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <Link
                              to={`/reports/${resume.id}`}
                              className="grid grid-cols-12 gap-4 items-center px-4 py-3.5 rounded-xl hover:bg-secondary/40 transition-all duration-200 group border border-transparent hover:border-border/40"
                            >
                              {/* Candidate info */}
                              <div className="col-span-5 flex items-center gap-3">
                                <ScoreBadge score={weightedScore} size="sm" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground text-sm truncate group-hover:text-accent transition-colors duration-200">
                                    {resume.candidate_name || resume.file_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{resume.candidate_role || "—"}</p>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                              </div>

                              {/* ATS */}
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                                  (resume.ats_score || 0) >= 75 ? "bg-emerald-500/10 text-emerald-600" :
                                  (resume.ats_score || 0) >= 50 ? "bg-yellow-500/10 text-yellow-600" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {resume.ats_score || 0}
                                </span>
                              </div>

                              {/* Relevancy */}
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                                  (resume.relevancy_score || 0) >= 75 ? "bg-blue-500/10 text-blue-600" :
                                  (resume.relevancy_score || 0) >= 50 ? "bg-blue-500/10 text-blue-500" :
                                  (resume.relevancy_score || 0) === 0 ? "bg-secondary text-muted-foreground" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {resume.relevancy_score || 0}
                                </span>
                              </div>

                              {/* Credibility */}
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                                  (resume.credibility_score || 0) >= 75 ? "bg-purple-500/10 text-purple-600" :
                                  (resume.credibility_score || 0) >= 50 ? "bg-purple-500/10 text-purple-500" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {resume.credibility_score || 0}
                                </span>
                              </div>

                              {/* Overall */}
                              <div className="col-span-1 flex justify-center">
                                <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                                  level === "high" ? "bg-emerald-500/10 text-emerald-600" :
                                  level === "medium" ? "bg-yellow-500/10 text-yellow-600" :
                                  "bg-red-500/10 text-red-500"
                                }`}>
                                  {weightedScore}
                                </span>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
