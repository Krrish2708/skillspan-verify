import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AnalysisResult {
  credibilityScore: number;
  strengthSummary: string;
  missingEvidence: string[];
  suggestions: string[];
  timelineConsistency: "consistent" | "minor_gaps" | "inconsistent";
}

// Simulated analysis result for now
const simulateAnalysis = (): AnalysisResult => ({
  credibilityScore: 72,
  strengthSummary:
    "Your resume demonstrates solid technical skills with 4+ years of relevant experience. Education credentials are verifiable and role progression is logical. However, several claims lack supporting evidence.",
  missingEvidence: [
    "AWS Solutions Architect certification — no credential link or ID provided",
    "Open-source contributions mentioned but no GitHub profile linked",
    "Leadership of a 12-person team — no LinkedIn endorsements or references",
  ],
  suggestions: [
    "Add direct links to project repositories or live demos to strengthen technical credibility",
    "Include certification verification URLs (e.g., Credly badges) for all listed certifications",
    "Link your GitHub profile to validate open-source contribution claims",
    "Add measurable impact metrics (e.g., 'reduced latency by 40%') with context",
  ],
  timelineConsistency: "minor_gaps",
});

export default function CandidateDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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

    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      await supabase.storage.from("resume-files").upload(filePath, file);

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

      const resumeText = await file.text();
      await supabase.functions.invoke("parse-resume", {
        body: { resumeId: resume.id, resumeText },
      });

      // For now, simulate the candidate-specific analysis
      setResult(simulateAnalysis());
      toast({ title: "Analysis complete!", description: "Your resume health check is ready." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const timelineLabel = {
    consistent: { text: "Consistent", color: "text-[hsl(var(--score-high))]", icon: CheckCircle2 },
    minor_gaps: { text: "Minor Gaps", color: "text-[hsl(var(--score-medium))]", icon: Clock },
    inconsistent: { text: "Inconsistent", color: "text-[hsl(var(--score-low))]", icon: AlertTriangle },
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "hsl(var(--score-high))" : s >= 50 ? "hsl(var(--score-medium))" : "hsl(var(--score-low))";

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
                        Analyzing your resume…
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
              {/* Credibility Score */}
              <Card className="shadow-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    Credibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-5xl font-display font-bold" style={{ color: scoreColor(result.credibilityScore) }}>
                      {result.credibilityScore}%
                    </span>
                  </div>
                  <Progress value={result.credibilityScore} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{result.strengthSummary}</p>
                </CardContent>
              </Card>

              {/* Timeline Consistency */}
              <Card className="shadow-card">
                <CardContent className="py-5 flex items-center gap-3">
                  {(() => {
                    const t = timelineLabel[result.timelineConsistency];
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

              {/* Missing Evidence */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-[hsl(var(--score-medium))]" />
                    Missing Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.missingEvidence.map((item, i) => (
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

              {/* Suggestions */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

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
