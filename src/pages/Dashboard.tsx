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
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Upload,
  TrendingUp,
  Eye,
  GitCompareArrows,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Resume } from "@/lib/types";

export default function Dashboard() {
  const { profileId } = useAuth();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Resume[];
    },
    enabled: !!profileId,
  });

  const completedResumes = resumes.filter(r => r.status === "completed");
  const verifiedCount = completedResumes.filter(r => r.overall_score >= 70).length;
  const atRiskCount = completedResumes.filter(r => r.overall_score < 50).length;

  const stats = [
    { label: "Total Resumes", value: String(resumes.length), icon: FileText, change: `${completedResumes.length} analyzed` },
    { label: "Verified", value: String(verifiedCount), icon: CheckCircle2, change: completedResumes.length > 0 ? `${((verifiedCount / completedResumes.length) * 100).toFixed(0)}% rate` : "0% rate" },
    { label: "At Risk", value: String(atRiskCount), icon: AlertTriangle, change: completedResumes.length > 0 ? `${((atRiskCount / completedResumes.length) * 100).toFixed(0)}% flagged` : "0% flagged" },
    { label: "Candidates", value: String(completedResumes.length), icon: Users, change: "analyzed" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Recruiter Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Overview of resume verification activity</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/compare">
                <Button variant="outline" className="font-semibold gap-2">
                  <GitCompareArrows className="h-4 w-4" /> Compare
                </Button>
              </Link>
              <Link to="/upload">
                <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90 transition-opacity gap-2">
                  <Upload className="h-4 w-4" /> Upload Resume
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="h-5 w-5 text-accent" />
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{isLoading ? "—" : stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    <p className="text-xs text-accent mt-0.5 font-medium">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Candidates */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display">Recent Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No resumes analyzed yet.</p>
                  <Link to="/upload">
                    <Button variant="outline" className="mt-3" size="sm">Upload your first resume</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.slice(0, 10).map((resume, i) => {
                    const level = resume.status === "completed" ? getScoreLevel(resume.overall_score) : "medium";
                    return (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link
                          to={`/reports/${resume.id}`}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
                        >
                          <ScoreBadge score={resume.status === "completed" ? resume.overall_score : 0} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">
                              {resume.candidate_name || resume.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {resume.candidate_role || resume.status}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                          {resume.status === "completed" ? (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low"}`}
                            >
                              {resume.overall_score}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {resume.status}
                            </Badge>
                          )}
                          <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
