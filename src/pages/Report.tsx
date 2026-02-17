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
  FileSearch,
  ShieldCheck,
  GraduationCap,
  Link as LinkIcon,
  Target,
  Lightbulb,
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
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><Skeleton className="h-64 w-full rounded-xl" /></div>
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
            <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
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
  const atsBreakdown = parsedData.ats_breakdown;
  const credBreakdown = parsedData.credibility_breakdown;
  const hasJD = !!resume.job_description;

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

          {/* Score Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ScoreCard label="Overall" score={resume.overall_score} />
            <ScoreCard label="ATS Score" score={resume.ats_score} />
            <ScoreCard label="Credibility" score={resume.credibility_score} />
            <ScoreCard label="Relevancy" score={hasJD ? resume.relevancy_score : 0} subtitle={!hasJD ? "No JD provided" : undefined} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* ATS Breakdown */}
              {atsBreakdown && (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <FileSearch className="h-5 w-5 text-accent" /> ATS Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScoreBar score={atsBreakdown.formatting_score} label="Formatting" />
                    <ScoreBar score={atsBreakdown.keyword_score} label="Keywords" />
                    <ScoreBar score={atsBreakdown.structure_score} label="Structure" />
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2 text-sm">
                      {atsBreakdown.contact_info_present ? (
                        <><CheckCircle2 className="h-4 w-4 score-high" /><span className="text-foreground">Contact info detected</span></>
                      ) : (
                        <><XCircle className="h-4 w-4 score-low" /><span className="text-foreground">Contact info missing</span></>
                      )}
                    </div>
                    {atsBreakdown.missing_sections?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Missing sections:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {atsBreakdown.missing_sections.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Code2 className="h-5 w-5 text-accent" /> Skill Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills extracted yet.</p>}
                  {skills.map((skill, i) => {
                    const config = confidenceConfig[skill.confidence] || confidenceConfig.unverified;
                    return (
                      <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            <config.icon className="h-3 w-3 mr-1" />{config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{skill.evidence}</span>
                        </div>
                        <ScoreBar score={skill.score} label={skill.skill_name} />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* JD Relevancy */}
              {hasJD && (parsedData.matched_skills?.length || parsedData.missing_skills?.length) ? (
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Target className="h-5 w-5 text-accent" /> JD Relevance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScoreBar score={resume.relevancy_score} label="Relevance Score" />
                    {parsedData.matched_skills && parsedData.matched_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedData.matched_skills.map((s, i) => (
                            <Badge key={i} className="bg-score-high/10 text-score-high border-score-high/20 text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {parsedData.missing_skills && parsedData.missing_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedData.missing_skills.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-score-low/30 text-score-low">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

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
                        {item.verified ? <CheckCircle2 className="h-4 w-4 score-high" /> : <AlertTriangle className="h-4 w-4 score-medium" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Credibility Breakdown */}
              {credBreakdown && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <ShieldCheck className="h-5 w-5 text-accent" /> Credibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScoreBar score={resume.credibility_score} label="Evidence Score" />
                    <Separator />
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GitHub Linked</span>
                        <span className="font-medium">{credBreakdown.github_linked ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certs Verified</span>
                        <span className="font-medium text-foreground">{credBreakdown.certifications_verified}/{credBreakdown.certifications_verified + credBreakdown.certifications_unverified}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projects w/ Links</span>
                        <span className="font-medium text-foreground">{credBreakdown.projects_with_links}/{credBreakdown.projects_with_links + credBreakdown.projects_without_links}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <span className="font-medium text-foreground">{skills.filter(s => s.confidence === "verified").length}/{skills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">At Risk</span>
                      <span className="font-medium score-low">{skills.filter(s => s.confidence === "unverified").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <GraduationCap className="h-5 w-5 text-accent" /> Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.education.map((edu, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution} · {edu.year}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
                        {cert.verified ? <CheckCircle2 className="h-4 w-4 mt-0.5 score-high flex-shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 score-low flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {parsedData.links && parsedData.links.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <LinkIcon className="h-5 w-5 text-accent" /> Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parsedData.links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="text-xs">{link.type}</Badge>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate">{link.url}</a>
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

              {/* Improvement Suggestions */}
              {parsedData.improvement_suggestions && parsedData.improvement_suggestions.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Lightbulb className="h-5 w-5 text-accent" /> Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedData.improvement_suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-accent" />{s}
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

function ScoreCard({ label, score, subtitle }: { label: string; score: number; subtitle?: string }) {
  const level = getScoreLevel(score);
  const colorClass = level === "high" ? "text-[hsl(var(--score-high))]" : level === "medium" ? "text-[hsl(var(--score-medium))]" : "text-[hsl(var(--score-low))]";

  return (
    <Card className="shadow-card">
      <CardContent className="py-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-display font-bold ${subtitle ? "text-muted-foreground" : colorClass}`}>
          {subtitle ? "—" : score}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
