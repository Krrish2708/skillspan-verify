import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ScoreDisplay";
import { Separator } from "@/components/ui/separator";
import {
  Upload, FileText, X, ArrowRight, Loader2, ShieldCheck, AlertTriangle,
  Lightbulb, Clock, CheckCircle2, FileSearch, Award, XCircle, GraduationCap,
  Briefcase, Link as LinkIcon, Zap, TrendingUp, Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { ParsedData, ResumeSkill } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type AnalysisResult = {
  overall_score: number;
  ats_score: number;
  credibility_score: number;
  parsed_data: ParsedData;
  skills: ResumeSkill[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s: number) =>
  s >= 75 ? "hsl(var(--score-high))" : s >= 50 ? "hsl(var(--score-medium))" : "hsl(var(--score-low))";

const scoreLevel = (s: number): { label: string; color: string; bg: string } => {
  if (s >= 85) return { label: "Excellent", color: "text-[hsl(var(--score-high))]", bg: "bg-[hsl(152,60%,42%)]/10" };
  if (s >= 70) return { label: "Strong", color: "text-[hsl(var(--score-high))]", bg: "bg-[hsl(152,60%,42%)]/10" };
  if (s >= 50) return { label: "Average", color: "text-[hsl(var(--score-medium))]", bg: "bg-yellow-500/10" };
  return { label: "Needs Work", color: "text-[hsl(var(--score-low))]", bg: "bg-red-500/10" };
};

const timelineLabel = {
  consistent: { text: "Consistent", color: "text-[hsl(var(--score-high))]", icon: CheckCircle2 },
  minor_gaps: { text: "Minor Gaps", color: "text-[hsl(var(--score-medium))]", icon: Clock },
  inconsistent: { text: "Inconsistent", color: "text-[hsl(var(--score-low))]", icon: AlertTriangle },
};

const confidenceConfig = {
  verified: { label: "Verified", icon: CheckCircle2 },
  partially_verified: { label: "Partial", icon: AlertTriangle },
  unverified: { label: "Risk", icon: XCircle },
};

// ─── Quick Wins generator ─────────────────────────────────────────────────────
function buildQuickWins(parsed: ParsedData, skills: ResumeSkill[]): string[] {
  const wins: string[] = [];

  const cred = parsed.credibility_breakdown as any;
  if (cred && !cred.github_linked)
    wins.push("Add your GitHub profile URL — this alone can boost your credibility score by ~10–15 pts.");
  if (cred && cred.projects_with_links === 0)
    wins.push("Add live links or GitHub links to your projects so they can be automatically verified.");
  if (cred && cred.certifications_unverified > 0)
    wins.push(`Add credential URLs to ${cred.certifications_unverified} unverified certification(s) to get them verified.`);

  const unverified = skills.filter(s => s.confidence === "unverified");
  if (unverified.length > 0)
    wins.push(`Mention ${unverified.slice(0, 3).map(s => s.skill_name).join(", ")} in a project or role description to verify these skills.`);

  const ats = parsed.ats_breakdown as any;
  if (ats && !ats.contact_info_present)
    wins.push("Add your email and phone number — contact info is missing and hurts your ATS score.");
  if (ats && ats.missing_sections?.length > 0)
    wins.push(`Add these missing resume sections: ${ats.missing_sections.join(", ")}.`);

  if (parsed.timeline_consistency === "inconsistent")
    wins.push("Fix employment date gaps or overlaps — inconsistent timelines reduce credibility.");

  return wins.slice(0, 4);
}

// ─── Candidate-safe suggestions (strip HR-only lines) ─────────────────────────
function filterCandidateSuggestions(suggestions: string[]): string[] {
  const hrPrefixes = [
    "HIRE_RECOMMENDATION", "Reason:", "Concern 1:", "Concern 2:",
    "Concern 3:", "hire", "recruiter", "not recommended",
  ];
  return suggestions.filter(s =>
    !hrPrefixes.some(prefix => s.toLowerCase().includes(prefix.toLowerCase()))
  );
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <Card className="shadow-card">
      <CardContent className="py-4 text-center">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-3xl font-display font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { user, profileId, getToken } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file || !user || !profileId) return;
    setAnalyzing(true);
    setStatusText("Uploading file...");
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resume-files")
        .upload(filePath, file, { contentType: file.type || "application/octet-stream" });
      if (uploadError) throw uploadError;

      setStatusText("Creating record...");
      const { data: resume, error: insertError } = await supabase
        .from("resumes")
        .insert({ profile_id: profileId, file_name: file.name, file_url: filePath, status: "pending" })
        .select("id")
        .single();
      if (insertError) throw insertError;

      setStatusText("Extracting text...");
      const resumeText = await file.text();

      setStatusText("AI is analyzing your resume...");
      const fnData = await invokeEdgeFunction("parse-resume", { resumeId: resume.id, resumeText }, token);
      if (fnData?.error) throw new Error(fnData.error);

      const { data: resumeData } = await supabase.from("resumes").select("*").eq("id", resume.id).single();
      const { data: skills } = await supabase.from("resume_skills").select("*").eq("resume_id", resume.id).order("score", { ascending: false });

      setResult({
        overall_score: resumeData?.overall_score || 0,
        ats_score: resumeData?.ats_score || 0,
        credibility_score: resumeData?.credibility_score || 0,
        parsed_data: (resumeData?.parsed_data || {}) as ParsedData,
        skills: (skills || []) as ResumeSkill[],
      });
      toast({ title: "Analysis complete!", description: "Your resume health check is ready." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
      setStatusText("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className={`container mx-auto px-4 ${result ? "max-w-6xl" : "max-w-2xl"}`}>

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Resume Health Check</h1>
            <p className="text-muted-foreground">Upload your resume to get a credibility analysis with actionable improvement suggestions.</p>
          </div>

          {/* ══════════════════ UPLOAD STATE ══════════════════ */}
          {!result ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-card"}`}
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => document.getElementById("candidate-file-input")?.click()}>
                <input id="candidate-file-input" type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileInput} />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium mb-1">Drag & drop your resume here</p>
                <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, TXT</p>
              </motion.div>

              {file && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-card">
                    <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <Button onClick={handleAnalyze} disabled={analyzing}
                    className="w-full mt-4 h-12 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-90 transition-opacity">
                    {analyzing
                      ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{statusText || "Analyzing your resume…"}</>)
                      : (<>Check My Resume <ArrowRight className="ml-2 h-4 w-4" /></>)}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (

            /* ══════════════════ RESULTS STATE ══════════════════ */
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <ScoreCard label="Credibility" score={result.credibility_score} />
                <ScoreCard label="ATS Score" score={result.ats_score} />
                <ScoreCard label="Overall" score={result.overall_score} />
              </div>

              {/* Resume Strength Meter */}
              {(() => {
                const level = scoreLevel(result.overall_score);
                return (
                  <Card className="shadow-card mb-6">
                    <CardContent className="py-4 px-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Resume Strength</p>
                          <p className="text-xs text-muted-foreground">Based on your overall score</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${level.bg} ${level.color}`}>
                        {level.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* 2-Column Layout */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN (main content) ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Strength Summary */}
                  {result.parsed_data.strength_summary && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-accent" />
                          </div>
                          Your Profile Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">{result.parsed_data.strength_summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* ATS Breakdown */}
                  {result.parsed_data.ats_breakdown && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <FileSearch className="h-4 w-4 text-accent" />
                          </div>
                          ATS Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-6 pb-6">
                        <ScoreBar score={(result.parsed_data.ats_breakdown as any).formatting_score} label="Formatting" />
                        <ScoreBar score={(result.parsed_data.ats_breakdown as any).keyword_score} label="Keywords" />
                        <ScoreBar score={(result.parsed_data.ats_breakdown as any).structure_score} label="Structure" />
                        <Separator className="my-3" />
                        <div className="flex items-center gap-2 text-sm">
                          {(result.parsed_data.ats_breakdown as any).contact_info_present
                            ? <><CheckCircle2 className="h-4 w-4 text-[hsl(var(--score-high))]" /><span>Contact info detected</span></>
                            : <><XCircle className="h-4 w-4 text-[hsl(var(--score-low))]" /><span>Contact info missing</span></>}
                        </div>
                        {(result.parsed_data.ats_breakdown as any).missing_sections?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1.5">Missing sections:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(result.parsed_data.ats_breakdown as any).missing_sections.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs border-border/60">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Skill Confidence */}
                  {result.skills.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Target className="h-4 w-4 text-accent" />
                          </div>
                          Skill Confidence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 px-6 pb-6">
                        {result.skills.map((skill, i) => {
                          const conf = confidenceConfig[skill.confidence] || confidenceConfig.unverified;
                          return (
                            <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  <conf.icon className="h-3 w-3 mr-1" />{conf.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground/60">{skill.evidence}</span>
                              </div>
                              <ScoreBar score={skill.score} label={skill.skill_name} />
                            </motion.div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Missing Evidence */}
                  {result.parsed_data.missing_evidence && result.parsed_data.missing_evidence.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-[hsl(var(--score-medium))]" />
                          </div>
                          Skills Lacking Evidence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <p className="text-xs text-muted-foreground mb-3">These skills are listed on your resume but have no supporting project or work evidence. Add them to your experience bullet points to increase your score.</p>
                        <div className="flex flex-wrap gap-2">
                          {result.parsed_data.missing_evidence.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-yellow-500/30 text-yellow-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />{item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Experience */}
                  {(result.parsed_data as any).experience_items && (result.parsed_data as any).experience_items.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-accent" />
                          </div>
                          Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-6 pb-6">
                        {(result.parsed_data as any).experience_items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors duration-200">
                            <div>
                              <p className="font-medium text-foreground text-sm">{item.role}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.company} · {item.duration}</p>
                            </div>
                            {item.verified
                              ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--score-high))]" />
                              : <AlertTriangle className="h-4 w-4 text-[hsl(var(--score-medium))]" />}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Improvement Suggestions (candidate-safe) */}
                  {result.parsed_data.improvement_suggestions && filterCandidateSuggestions(result.parsed_data.improvement_suggestions).length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Lightbulb className="h-4 w-4 text-accent" />
                          </div>
                          Improvement Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <ul className="space-y-3">
                          {result.parsed_data.improvement_suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-accent" />{s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="space-y-6">

                  {/* Trust Snapshot */}
                  <Card className="shadow-card">
                    <CardHeader className="pb-3 px-6 pt-6">
                      <CardTitle className="text-lg font-display">Trust Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-6 pb-6">
                      <ScoreBar score={result.credibility_score} label="Evidence Score" />
                      <Separator />
                      <div className="text-sm space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verified Skills</span>
                          <span className="font-medium text-foreground tabular-nums">
                            {result.skills.filter(s => s.confidence === "verified").length}/{result.skills.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">At Risk</span>
                          <span className="font-medium text-[hsl(var(--score-low))] tabular-nums">
                            {result.skills.filter(s => s.confidence === "unverified").length}
                          </span>
                        </div>
                        {(result.parsed_data as any).credibility_breakdown && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">GitHub Linked</span>
                              <span className="font-medium">
                                {(result.parsed_data as any).credibility_breakdown.github_linked ? "Yes ✓" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Certs Verified</span>
                              <span className="font-medium tabular-nums">
                                {(result.parsed_data as any).credibility_breakdown.certifications_verified}/
                                {(result.parsed_data as any).credibility_breakdown.certifications_verified +
                                  (result.parsed_data as any).credibility_breakdown.certifications_unverified}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Projects w/ Links</span>
                              <span className="font-medium tabular-nums">
                                {(result.parsed_data as any).credibility_breakdown.projects_with_links}/
                                {(result.parsed_data as any).credibility_breakdown.projects_with_links +
                                  (result.parsed_data as any).credibility_breakdown.projects_without_links}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 🚀 Boost Your Score — Quick Wins */}
                  {(() => {
                    const wins = buildQuickWins(result.parsed_data, result.skills);
                    if (wins.length === 0) return null;
                    return (
                      <Card className="shadow-card border-accent/20">
                        <CardHeader className="pb-3 px-6 pt-6">
                          <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Zap className="h-4 w-4 text-accent" />
                            </div>
                            Quick Wins
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">Fix these to boost your score fast</p>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-3">
                          {wins.map((win, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-accent/5 border border-accent/10">
                              <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                              <p className="text-xs text-foreground leading-relaxed">{win}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Timeline Consistency */}
                  {result.parsed_data.timeline_consistency && (
                    <Card className="shadow-card">
                      <CardContent className="py-5 px-6 flex items-center gap-3">
                        {(() => {
                          const t = timelineLabel[result.parsed_data.timeline_consistency!];
                          const Icon = t.icon;
                          return (
                            <>
                              <Icon className={`h-5 w-5 ${t.color}`} />
                              <div>
                                <p className="text-sm font-medium text-foreground">Timeline Consistency</p>
                                <p className={`text-sm font-semibold ${t.color}`}>{t.text}</p>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Education */}
                  {(result.parsed_data as any).education && (result.parsed_data as any).education.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-accent" />
                          </div>
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-6 pb-6">
                        {(result.parsed_data as any).education.map((edu: any, idx: number) => (
                          <div key={idx}>
                            <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{edu.institution} · {edu.year}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Certifications */}
                  {(result.parsed_data as any).certifications && (result.parsed_data as any).certifications.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Award className="h-4 w-4 text-accent" />
                          </div>
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-6 pb-6">
                        {(result.parsed_data as any).certifications.map((cert: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            {cert.verified
                              ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-[hsl(var(--score-high))] flex-shrink-0" />
                              : <XCircle className="h-4 w-4 mt-0.5 text-[hsl(var(--score-low))] flex-shrink-0" />}
                            <div>
                              <p className="text-sm font-medium text-foreground">{cert.name}</p>
                              <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                              {!cert.verified && (
                                <p className="text-xs text-yellow-600 mt-0.5">Add a credential URL to verify</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Links */}
                  {(result.parsed_data as any).links && (result.parsed_data as any).links.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3 px-6 pt-6">
                        <CardTitle className="flex items-center gap-2.5 text-lg font-display">
                          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <LinkIcon className="h-4 w-4 text-accent" />
                          </div>
                          Detected Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2.5 px-6 pb-6">
                        {(result.parsed_data as any).links.map((link: any, idx: number) => (
                          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-accent hover:underline transition-colors duration-200">
                            <LinkIcon className="h-3.5 w-3.5" />{link.label || link.url}
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full mt-6" onClick={() => { setResult(null); setFile(null); }}>
                Upload Another Resume
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
