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
  FileText, Users, AlertTriangle, CheckCircle2, Upload, TrendingUp, Eye, GitCompareArrows, ArrowUpDown,
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

  const verifiedCount = completedResumes.filter(r => r.overall_score >= 70).length;
  const atRiskCount = completedResumes.filter(r => r.overall_score < 50).length;
  const highConfidenceCount = completedResumes.filter(r => r.credibility_score >= 70).length;

  const stats = [
    { label: "Total Candidates", value: String(completedResumes.length), icon: Users, change: `${resumes.length} uploaded`, color: "text-accent" },
    { label: "High Confidence", value: String(highConfidenceCount), icon: CheckCircle2, change: completedResumes.length > 0 ? `${((highConfidenceCount / completedResumes.length) * 100).toFixed(0)}% rate` : "0% rate", color: "text-green-500" },
    { label: "At Risk", value: String(atRiskCount), icon: AlertTriangle, change: completedResumes.length > 0 ? `${((atRiskCount / completedResumes.length) * 100).toFixed(0)}% flagged` : "0% flagged", color: "text-red-500" },
    { label: "Reports Available", value: String(completedResumes.length), icon: FileText, change: "analyzed", color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1.5">Overview of resume verification activity</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/compare">
                <Button variant="outline" className="font-semibold gap-2 border-border/60 hover:bg-secondary/60">
                  <GitCompareArrows className="h-4 w-4" /> Compare
                </Button>
              </Link>
              <Link to="/bulk-upload">
                <Button variant="outline" className="font-semibold gap-2 border-border/60 hover:bg-secondary/60">
                  <Upload className="h-4 w-4" /> Bulk Upload
                </Button>
              </Link>
              <Link to="/upload">
                <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-95 transition-all duration-300 shadow-sm hover:shadow-glow gap-2">
                  <Upload className="h-4 w-4" /> Upload Resume
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="premium-card border-border/60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground tabular-nums">{isLoading ? "—" : stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    <p className="text-xs text-accent mt-1 font-medium">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Slider */}
          {completedResumes.length > 0 && (
            <Card className="premium-card border-border/60 mb-8">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-foreground mb-4">Adjust Score Weighting</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-32">Relevancy: <span className="font-semibold text-foreground">{relevancyWeight}%</span></span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={relevancyWeight}
                    onChange={(e) => setRelevancyWeight(Number(e.target.value))}
                    className="flex-1 h-2 accent-green-500 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground w-32 text-right">Credibility: <span className="font-semibold text-foreground">{credibilityWeight}%</span></span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Overall = (Relevancy × {relevancyWeight}%) + (Credibility × {credibilityWeight}%)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Candidate Rankings */}
          <Card className="premium-card border-border/60">
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Candidate Rankings</CardTitle>
                {completedResumes.length > 0 && (
                  <Button variant="outline" size="sm" className="gap-2 text-xs border-border/60" onClick={() => setSortHighest(!sortHighest)}>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {sortHighest ? "Highest First" : "Lowest First"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
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
                <div className="text-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">No resumes analyzed yet.</p>
                  <p className="text-xs text-muted-foreground/60 mb-4">Upload your first resume to get started</p>
                  <Link to="/upload">
                    <Button variant="outline" size="sm" className="border-border/60">Upload your first resume</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-2">
                    <div className="col-span-5">Candidate</div>
                    <div className="col-span-2 text-center">ATS</div>
                    <div className="col-span-2 text-center">Relevancy</div>
                    <div className="col-span-2 text-center">Credibility</div>
                    <div className="col-span-1 text-center">Overall</div>
                  </div>
                  {/* Table Rows */}
                  <div className="space-y-1">
                    {sortedResumes.map((resume, i) => {
                      const weightedScore = getWeightedScore(resume);
                      const level = getScoreLevel(weightedScore);
                      return (
                        <motion.div key={resume.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                          <Link to={`/reports/${resume.id}`} className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 group">
                            <div className="col-span-5 flex items-center gap-3">
                              <ScoreBadge score={weightedScore} size="sm" />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">{resume.candidate_name || resume.file_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{resume.candidate_role || "—"}</p>
                              </div>
                            </div>
                            <div className="col-span-2 text-center">
                              <Badge variant="secondary" className="text-xs font-semibold">{resume.ats_score || 0}%</Badge>
                            </div>
                            <div className="col-span-2 text-center">
                              <Badge variant="secondary" className="text-xs font-semibold text-blue-500">{resume.relevancy_score || 0}%</Badge>
                            </div>
                            <div className="col-span-2 text-center">
                              <Badge variant="secondary" className="text-xs font-semibold text-purple-500">{resume.credibility_score || 0}%</Badge>
                            </div>
                            <div className="col-span-1 text-center">
                              <Badge variant="secondary" className={`text-xs font-semibold ${level === "high" ? "text-green-500" : level === "medium" ? "text-yellow-500" : "text-red-500"}`}>
                                {weightedScore}%
                              </Badge>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
