import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Resume } from "@/lib/types";

export default function ReportsPage() {
  const { profileId } = useAuth();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["reports", profileId],
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">Verification Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">All resume authenticity reports</p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Upload a resume to generate your first verification report.</p>
              <Link to="/upload">
                <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90">Upload Resume</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume, i) => {
                const level = resume.status === "completed" ? getScoreLevel(resume.overall_score) : "medium";
                return (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={`/reports/${resume.id}`}>
                      <Card className="shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            {resume.status === "completed" ? (
                              <ScoreBadge score={resume.overall_score} size="md" />
                            ) : (
                              <Badge variant="secondary" className="text-xs capitalize">{resume.status}</Badge>
                            )}
                            <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-display font-semibold text-foreground">
                            {resume.candidate_name || resume.file_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {resume.candidate_role || "Processing..."}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{new Date(resume.created_at).toLocaleDateString()}</span>
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
