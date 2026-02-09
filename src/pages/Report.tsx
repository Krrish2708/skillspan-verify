import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, ScoreBar, getScoreLevel } from "@/components/ScoreDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Briefcase,
  Code2,
  Award,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Resume, ResumeSkill, ParsedData } from "@/lib/types";

const confidenceConfig = {
  verified: { icon: CheckCircle2, label: "Verified", class: "bg-score-high" },
  partially_verified: { icon: AlertTriangle, label: "Partial", class: "bg-score-medium" },
  unverified: { icon: XCircle, label: "Risk", class: "bg-score-low" },
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();

  const { data: resume, isLoading: loadingResume } = useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as Resume | null;
    },
    enabled: !!id,
  });

  const { data: skills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ["resume-skills", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_skills")
        .select("*")
        .eq("resume_id", id!)
        .order("score", { ascending: false });
      if (error) throw error;
      return data as ResumeSkill[];
    },
    enabled: !!id,
  });

  const isLoading = loadingResume || loadingSkills;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container max-w-5xl mx-auto px-4">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Report not found</h1>
            <p className="text-muted-foreground mb-6">This resume report doesn't exist or you don't have access.</p>
            <Link to="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (resume.status === "parsing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-10">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Analyzing Resume</h2>
            <p className="text-muted-foreground">AI is verifying skill claims. This may take a moment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const parsedData = (resume.parsed_data || {}) as ParsedData;
  const overallLevel = getScoreLevel(resume.overall_score);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <ScoreBadge score={resume.overall_score} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">{resume.candidate_name || "Unknown Candidate"}</h1>
              <p className="text-muted-foreground">{resume.candidate_role || "Unknown Role"}</p>
              <p className="text-sm text-muted-foreground mt-1">{resume.file_name}</p>
            </div>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Code2 className="h-5 w-5 text-accent" /> Skill Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills extracted yet.</p>
                  )}
                  {skills.map((skill, i) => {
                    const config = confidenceConfig[skill.confidence] || confidenceConfig.unverified;
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{skill.evidence}</span>
                        </div>
                        <ScoreBar score={skill.score} label={skill.skill_name} />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Experience */}
              {parsedData.experience_items && parsedData.experience_items.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Briefcase className="h-5 w-5 text-accent" /> Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.experience_items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.role}</p>
                          <p className="text-xs text-muted-foreground">{item.company} · {item.duration}</p>
                        </div>
                        {item.verified ? (
                          <CheckCircle2 className="h-4 w-4 score-high" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 score-medium" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Trust Summary */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display">Trust Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScoreBar score={resume.overall_score} label="Overall Trust" />
                  <Separator />
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified Skills</span>
                      <span className="font-medium text-foreground">
                        {skills.filter(s => s.confidence === "verified").length}/{skills.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">At Risk</span>
                      <span className="font-medium score-low">
                        {skills.filter(s => s.confidence === "unverified").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {parsedData.certifications && parsedData.certifications.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Award className="h-5 w-5 text-accent" /> Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {cert.verified ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 score-high flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5 score-low flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Risk Flags */}
              {parsedData.risk_flags && parsedData.risk_flags.length > 0 && (
                <Card className="shadow-card border-destructive/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Risk Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedData.risk_flags.map((flag, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
