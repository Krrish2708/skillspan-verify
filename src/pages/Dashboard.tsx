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
  FileText, Users, AlertTriangle, CheckCircle2, Upload, TrendingUp, Eye, GitCompareArrows,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Resume } from "@/lib/types";

export default function Dashboard() {
  const { profileId } = useAuth();

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
  const verifiedCount = completedResumes.filter(r => r.overall_score >= 70).length;
  const atRiskCount = completedResumes.filter(r => r.overall_score < 50).length;

  const stats = [
    { label: "Total Resumes", value: String(resumes.length), icon: FileText, change: `${completedResumes.length} analyzed`, color: "text-accent" },
    { label: "Verified", value: String(verifiedCount), icon: CheckCircle2, change: completedResumes.length > 0 ? `${((verifiedCount / completedResumes.length) * 100).toFixed(0)}% rate` : "0% rate", color: "score-high" },
    { label: "At Risk", value: String(atRiskCount), icon: AlertTriangle, change: completedResumes.length > 0 ? `${((atRiskCount / completedResumes.length) * 100).toFixed(0)}% flagged` : "0% flagged", color: "score-low" },
    { label: "Candidates", value: String(completedResumes.length), icon: Users, change: "analyzed", color: "text-accent" },
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
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

          {/* Recent Candidates */}
          <Card className="premium-card border-border/60">
            <CardHeader className="pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-display">Recent Verifications</CardTitle>
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
              ) : resumes.length === 0 ? (
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
                <div className="space-y-1">
                  {resumes.slice(0, 10).map((resume, i) => {
                    const level = resume.status === "completed" ? getScoreLevel(resume.overall_score) : "medium";
                    return (
                      <motion.div key={resume.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link to={`/reports/${resume.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 group">
                          <ScoreBadge score={resume.status === "completed" ? resume.overall_score : 0} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{resume.candidate_name || resume.file_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{resume.candidate_role || resume.status}</p>
                          </div>
                          <span className="text-xs text-muted-foreground/60 hidden sm:block tabular-nums">{new Date(resume.created_at).toLocaleDateString()}</span>
                          {resume.status === "completed" ? (
                            <Badge variant="secondary" className={`text-xs font-semibold tabular-nums ${level === "high" ? "score-high bg-[hsl(152,60%,42%)]/10" : level === "medium" ? "score-medium bg-[hsl(38,92%,50%)]/10" : "score-low bg-[hsl(0,72%,51%)]/10"}`}>{resume.overall_score}%</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs capitalize">{resume.status}</Badge>
                          )}
                          <Eye className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </Link>
                      </motion.div>
                    );
                  })}
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
