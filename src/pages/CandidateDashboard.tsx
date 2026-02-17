import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ScoreDisplay";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  X,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle2,
  FileSearch,
  Award,
  XCircle,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ParsedData, ResumeSkill } from "@/lib/types";

export default function CandidateDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<{
    overall_score: number;
    ats_score: number;
    credibility_score: number;
    parsed_data: ParsedData;
    skills: ResumeSkill[];
  } | null>(null);
  const { user, profileId } = useAuth();

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
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      await supabase.storage.from("resume-files").upload(filePath, file);

      setStatusText("Creating record...");
      const { data: resume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          profile_id: profileId,
          file_name: file.name,
          file_url: filePath,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      setStatusText("Extracting text...");
      const resumeText = await file.text();

      setStatusText("AI is analyzing your resume...");
      const { data: fnData, error: fnError } = await supabase.functions.invoke("parse-resume", {
        body: { resumeId: resume.id, resumeText },
      });

      if (fnError) throw new Error(fnError.message || "Analysis failed");
      if (fnData?.error) throw new Error(fnData.error);

      // Fetch the completed resume and skills
      const [resumeRes, skillsRes] = await Promise.all([
        supabase.from("resumes").select("*").eq("id", resume.id).single(),
        supabase.from("resume_skills").select("*").eq("resume_id", resume.id).order("score", { ascending: false }),
      ]);

      if (resumeRes.error) throw resumeRes.error;

      setResult({
        overall_score: resumeRes.data.overall_score || 0,
        ats_score: resumeRes.data.ats_score || 0,
        credibility_score: resumeRes.data.credibility_score || 0,
        parsed_data: (resumeRes.data.parsed_data || {}) as ParsedData,
        skills: (skillsRes.data || []) as ResumeSkill[],
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

  const scoreColor = (s: number) =>
    s >= 75 ? "hsl(var(--score-high))" : s >= 50 ? "hsl(var(--score-medium))" : "hsl(var(--score-low))";

  const timelineLabel = {
    consistent: { text: "Consistent", color: "text-[hsl(var(--score-high))]", icon: CheckCircle2 },
    minor_gaps: { text: "Minor Gaps", color: "text-[hsl(var(--score-medium))]", icon: Clock },
    inconsistent: { text: "Inconsistent", color: "text-[hsl(var(--score-low))]", icon: AlertTriangle },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Resume Health Check</h1>
            <p className="text-muted-foreground">
              Upload your resume to get a credibility analysis with actionable improvement suggestions.
            </p>
          </div>

          {!result ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
                  ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-card"}
                `}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("candidate-file-input")?.click()}
              >
                <input
                  id="candidate-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
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
                    <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full mt-4 h-12 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-90 transition-opacity"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {statusText || "Analyzing your resume…"}
                      </>
                    ) : (
                      <>
                        Check My Resume
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Credibility", score: result.credibility_score },
                  { label: "ATS Score", score: result.ats_score },
                  { label: "Overall", score: result.overall_score },
                ].map((item) => (
                  <Card key={item.label} className="shadow-card">
                    <CardContent className="py-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-3xl font-display font-bold" style={{ color: scoreColor(item.score) }}>
                        {item.score}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strength Summary */}
              {result.parsed_data.strength_summary && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldCheck className="h-5 w-5 text-accent" /> Strength Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.parsed_data.strength_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* ATS Breakdown */}
              {result.parsed_data.ats_breakdown && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileSearch className="h-5 w-5 text-accent" /> ATS Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScoreBar score={result.parsed_data.ats_breakdown.formatting_score} label="Formatting" />
                    <ScoreBar score={result.parsed_data.ats_breakdown.keyword_score} label="Keywords" />
                    <ScoreBar score={result.parsed_data.ats_breakdown.structure_score} label="Structure" />
                    {result.parsed_data.ats_breakdown.missing_sections?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Missing sections:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.parsed_data.ats_breakdown.missing_sections.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Top Skills */}
              {result.skills.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-accent" /> Skill Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.skills.slice(0, 8).map((skill) => (
                      <div key={skill.id}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {skill.confidence === "verified" ? "✓" : skill.confidence === "partially_verified" ? "~" : "✗"} {skill.confidence.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{skill.evidence}</span>
                        </div>
                        <ScoreBar score={skill.score} label={skill.skill_name} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Timeline Consistency */}
              {result.parsed_data.timeline_consistency && (
                <Card className="shadow-card">
                  <CardContent className="py-5 flex items-center gap-3">
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

              {/* Missing Evidence */}
              {result.parsed_data.missing_evidence && result.parsed_data.missing_evidence.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-[hsl(var(--score-medium))]" /> Missing Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.parsed_data.missing_evidence.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="mt-0.5 shrink-0 text-xs border-[hsl(var(--score-medium))]/30 text-[hsl(var(--score-medium))]">
                            Warning
                          </Badge>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {result.parsed_data.improvement_suggestions && result.parsed_data.improvement_suggestions.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-accent" /> Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.parsed_data.improvement_suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-accent" />{s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
              >
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
