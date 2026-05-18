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
  Download, AlertTriangle, CheckCircle2, XCircle, Briefcase, Code2, Award,
  ArrowLeft, Loader2, FileSearch, ShieldCheck, GraduationCap, Link as LinkIcon,
  Target, Lightbulb, Users, Github, TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Resume, ResumeSkill, ParsedData } from "@/lib/types";

const confidenceConfig = {
  verified: { icon: CheckCircle2, label: "Verified", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
  partially_verified: { icon: AlertTriangle, label: "Partial", color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500/20" },
  unverified: { icon: XCircle, label: "Risk", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

function ScoreCard({ label, score, subtitle }: { label: string; score: number | null; subtitle?: string }) {
  const s = score ?? 0;
  const color = s >= 75 ? "text-emerald-600" : s >= 50 ? "text-yellow-600" : "text-red-500";
  return (
    <Card className="premium-card border-border/60">
      <CardContent className="py-5 px-6 text-center">
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-4xl font-display font-bold tabular-nums ${subtitle ? "text-muted-foreground" : color}`}>
          {subtitle ? "—" : s}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { profileId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["resume-report", id],
    queryFn: async () => {
      const { data: resume, error: rErr } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (rErr) throw rErr;
      const { data: skills } = await supabase
        .from("resume_skills")
        .select("*")
        .eq("resume_id", id!)
        .order("score", { ascending: false });
      return { resume, skills: skills || [] };
    },
    enabled: !!id && !!profileId,
  });

  const resume = data?.resume as Resume | null | undefined;
  const skills = (data?.skills || []) as ResumeSkill[];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-6xl mx-auto px-6">
            <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><Skeleton className="h-64 w-full rounded-2xl" /></div>
              <Skeleton className="h-48 w-full rounded-2xl" />
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
        <main className="flex-1 py-12">
          <div className="container max-w-6xl mx-auto px-6 text-center py-20">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Report not found</h1>
            <p className="text-muted-foreground mb-6">This resume report doesn't exist or you don't have access.</p>
            <Link to="/dashboard"><Button variant="outline" className="border-border/60">Back to Dashboard</Button></Link>
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
        <main className="flex-1 flex items-center justify-center py-12">
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
  const atsBreakdown = parsedData.ats_breakdown as any;
  const credBreakdown = parsedData.credibility_breakdown as any;
  const hasJD = !!resume.job_description;
  const rel = resume.relevancy_score || 0;
  const cred = resume.credibility_score || 0;
  const calculatedOverall = rel > 0 ? Math.round((rel * 0.5) + (cred * 0.5)) : cred;
  const verifiedSkills = skills.filter(s => s.confidence === "verified").length;
  const atRiskSkills = skills.filter(s => s.confidence === "unverified").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-6">

          {/* Back link */}
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          {/* ── Candidate Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8"
          >
            <ScoreBadge score={calculatedOverall} size="xl" />
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                {resume.candidate_name || "Unknown Candidate"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {resume.candidate_role || "Unknown Role"}
                {resume.experience_range && <span className="text-muted-foreground/60"> · {resume.experience_range}</span>}
              </p>
              <p className="text-sm text-muted-foreground/50 mt-1">{resume.file_name}</p>
            </div>
            <Button variant="outline" className="gap-2 border-border/60 rounded-xl" disabled>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </motion.div>

          {/* ── Score Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ScoreCard label="Overall" score={calculatedOverall} />
            <ScoreCard label="ATS Score" score={resume.ats_score} />
            <ScoreCard label="Credibility" score={resume.credibility_score} />
            <ScoreCard label="Relevancy" score={hasJD ? resume.relevancy_score : 0} subtitle={!hasJD ? "No JD provided" : undefined} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. JD Relevance — MOVED TO TOP */}
              {hasJD && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-4 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Target className="h-4 w-4 text-accent" />
                      </div>
                      Relevancy Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 px-6 pb-6">
                    <ScoreBar score={resume.relevancy_score} label="Relevance Score" />
                    <Separator />

                    {/* Skills Matched */}
                    {parsedData.matched_skills && parsedData.matched_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">Skills Matched</p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedData.matched_skills.map((s: string, i: number) => (
                            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {parsedData.missing_skills && parsedData.missing_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedData.missing_skills.map((s: string, i: number) => (
                            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500/8 text-red-600 border border-red-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords Matched */}
                    {(parsedData as any).matched_keywords && (parsedData as any).matched_keywords.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2.5">Keywords Matched</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(parsedData as any).matched_keywords.map((k: string, i: number) => (
                            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground border border-border/60">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 2. ATS Breakdown */}
              {atsBreakdown && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-4 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileSearch className="h-4 w-4 text-accent" />
                      </div>
                      ATS Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    <ScoreBar score={atsBreakdown.formatting_score} label="Formatting" />
                    <ScoreBar score={atsBreakdown.keyword_score} label="Keywords" />
                    <ScoreBar score={atsBreakdown.structure_score} label="Structure" />
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2 text-sm">
                      {atsBreakdown.contact_info_present
                        ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-foreground">Contact info detected</span></>
                        : <><XCircle className="h-4 w-4 text-red-500" /><span className="text-foreground">Contact info missing</span></>
                      }
                    </div>
                    {atsBreakdown.missing_sections?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Missing sections:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {atsBreakdown.missing_sections.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs border-border/60">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 3. Skill Verification */}
              <Card className="premium-card border-border/60">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Code2 className="h-4 w-4 text-accent" />
                    </div>
                    Skill Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills extracted yet.</p>}
                  {skills.map((skill, i) => {
                    const config = confidenceConfig[skill.confidence] || confidenceConfig.unverified;
                    return (
                      <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                            <config.icon className="h-3 w-3" />{config.label}
                          </span>
                          <span className="text-xs text-muted-foreground/60 truncate">{skill.evidence}</span>
                        </div>
                        <ScoreBar score={skill.score} label={skill.skill_name} />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 4. Experience */}
              {parsedData.experience_items && parsedData.experience_items.length > 0 && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-4 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-accent" />
                      </div>
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    {parsedData.experience_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors duration-200">
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.role}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.company} · {item.duration}</p>
                        </div>
                        {item.verified
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-6">

              {/* Credibility Breakdown — narrative style like demo */}
              <Card className="premium-card border-border/60">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                    </div>
                    Credibility Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  <ScoreBar score={resume.credibility_score} label="Evidence Score" />
                  <Separator />

                  {/* GitHub */}
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${credBreakdown?.github_linked ? "bg-emerald-500/10" : "bg-secondary"}`}>
                      <Github className={`h-3.5 w-3.5 ${credBreakdown?.github_linked ? "text-emerald-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">GitHub Profile</p>
                        {credBreakdown?.github_linked
                          ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">verified</span>
                          : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">not linked</span>
                        }
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {credBreakdown?.github_linked ? "Profile detected and cross-referenced with skills." : "No GitHub profile found in resume."}
                      </p>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${credBreakdown?.certifications_verified > 0 ? "bg-emerald-500/10" : "bg-secondary"}`}>
                      <Award className={`h-3.5 w-3.5 ${credBreakdown?.certifications_verified > 0 ? "text-emerald-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">Certifications</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          credBreakdown?.certifications_verified > 0
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground border-border/60"
                        }`}>
                          {credBreakdown?.certifications_verified ?? 0}/{(credBreakdown?.certifications_verified ?? 0) + (credBreakdown?.certifications_unverified ?? 0)} verified
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {credBreakdown?.certifications_verified > 0
                          ? `${credBreakdown.certifications_verified} certification(s) have verifiable links.`
                          : "No certification links found in resume."}
                      </p>
                    </div>
                  </div>

                  {/* Project Evidence */}
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${credBreakdown?.projects_with_links > 0 ? "bg-emerald-500/10" : "bg-secondary"}`}>
                      <TrendingUp className={`h-3.5 w-3.5 ${credBreakdown?.projects_with_links > 0 ? "text-emerald-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">Project Evidence</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          credBreakdown?.projects_with_links > 0
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground border-border/60"
                        }`}>
                          {credBreakdown?.projects_with_links ?? 0} linked
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {credBreakdown?.projects_with_links > 0
                          ? `${credBreakdown.projects_with_links} project(s) have verifiable URLs.`
                          : "No project links found in resume."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Summary */}
              <Card className="premium-card border-border/60">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-lg font-display">Trust Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-6 pb-6">
                  <ScoreBar score={calculatedOverall} label="Overall Trust" />
                  <Separator />
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified Skills</span>
                      <span className="font-semibold text-foreground tabular-nums">{verifiedSkills}/{skills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">At Risk</span>
                      <span className="font-semibold text-red-500 tabular-nums">{atRiskSkills}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-accent" />
                      </div>
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    {parsedData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{edu.institution} · {edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {parsedData.certifications && parsedData.certifications.length > 0 && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Award className="h-4 w-4 text-accent" />
                      </div>
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    {parsedData.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        {cert.verified
                          ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                          : <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-foreground">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                          {!cert.verified && <p className="text-[11px] text-yellow-600 mt-0.5">Add credential URL to verify</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {parsedData.links && parsedData.links.length > 0 && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <LinkIcon className="h-4 w-4 text-accent" />
                      </div>
                      Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 px-6 pb-6">
                    {parsedData.links.map((link: any, idx: number) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline transition-colors duration-200">
                        <LinkIcon className="h-3.5 w-3.5" />{link.label || link.url}
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Candidate Summary */}
              {parsedData.strength_summary && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-accent" />
                      </div>
                      Candidate Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{parsedData.strength_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* HR Notes */}
              {parsedData.hr_notes && parsedData.hr_notes.length > 0 && (
                <Card className="premium-card border-border/60">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-accent" />
                      </div>
                      HR Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-3">
                      {parsedData.hr_notes.map((s: string, i: number) => {
                        const isVerdict = s.startsWith("HIRE_RECOMMENDATION:");
                        const verdict = s.replace("HIRE_RECOMMENDATION:", "").trim();
                        const isStrongHire = verdict.includes("Strong Hire");
                        const isHire = verdict.includes("Hire") && !verdict.includes("Strong");
                        const isMaybe = verdict.includes("Maybe");
                        if (isVerdict) {
                          return (
                            <div key={i} className={`p-3 rounded-xl text-center font-bold text-sm ${
                              isStrongHire ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" :
                              isHire ? "bg-emerald-400/10 text-emerald-600 border border-emerald-400/20" :
                              isMaybe ? "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20" :
                              "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}>
                              Hire Recommendation: {verdict}
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-500" />
                            {s.replace("Reason:", "").replace("Concern 1:", "").replace("Concern 2:", "").trim()}
                          </div>
                        );
                      })}
                    </div>
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
