import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, ScoreBar, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Resume, ResumeSkill } from "@/lib/types";

interface CandidateWithSkills {
  id: string;
  name: string;
  role: string;
  overallScore: number;
  skills: { name: string; score: number; confidence: "verified" | "partially_verified" | "unverified" }[];
}

const confidenceIcon = {
  verified: CheckCircle2,
  partially_verified: AlertTriangle,
  unverified: XCircle,
};

const confidenceLabel = {
  verified: "Verified",
  partially_verified: "Partial",
  unverified: "Risk",
};

export default function ComparePage() {
  const { profileId } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["compare-candidates", profileId],
    queryFn: async () => {
      // Fetch completed resumes
      const { data: resumes, error: rErr } = await supabase
        .from("resumes")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      if (rErr) throw rErr;

      if (!resumes || resumes.length === 0) return [];

      // Fetch all skills for these resumes
      const resumeIds = resumes.map((r: any) => r.id);
      const { data: skills, error: sErr } = await supabase
        .from("resume_skills")
        .select("*")
        .in("resume_id", resumeIds);
      if (sErr) throw sErr;

      const skillsByResume = new Map<string, ResumeSkill[]>();
      (skills || []).forEach((s: ResumeSkill) => {
        if (!skillsByResume.has(s.resume_id)) skillsByResume.set(s.resume_id, []);
        skillsByResume.get(s.resume_id)!.push(s);
      });

      return resumes.map((r: any): CandidateWithSkills => ({
        id: r.id,
        name: r.candidate_name || r.file_name,
        role: r.candidate_role || "Unknown",
        overallScore: r.overall_score,
        skills: (skillsByResume.get(r.id) || []).map(s => ({
          name: s.skill_name,
          score: s.score,
          confidence: s.confidence,
        })),
      }));
    },
    enabled: !!profileId,
  });

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selected = candidates.filter((c) => selectedIds.includes(c.id));

  const allSkills = Array.from(
    new Set(selected.flatMap((c) => c.skills.map((s) => s.name)))
  );

  const getSkill = (candidate: CandidateWithSkills, skillName: string) =>
    candidate.skills.find((s) => s.name === skillName);

  const getBestForSkill = (skillName: string) => {
    let best = -1;
    let bestId = "";
    selected.forEach((c) => {
      const skill = getSkill(c, skillName);
      if (skill && skill.score > best) {
        best = skill.score;
        bestId = c.id;
      }
    });
    return bestId;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" /> Compare Candidates
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select 2–3 candidates to compare their verified skill scores side by side.
            </p>
          </div>

          {/* Candidate Selector */}
          <Card className="shadow-card mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Select Candidates ({selectedIds.length}/3)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No completed reports to compare.</p>
                  <Link to="/upload">
                    <Button variant="outline" className="mt-3" size="sm">Upload resumes first</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {candidates.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    const isDisabled = !isSelected && selectedIds.length >= 3;
                    return (
                      <button
                        key={c.id}
                        onClick={() => !isDisabled && toggleCandidate(c.id)}
                        disabled={isDisabled}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200
                          ${isSelected
                            ? "border-accent bg-accent/5 shadow-elevated"
                            : isDisabled
                            ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                            : "border-border bg-card hover:border-accent/40 hover:shadow-card cursor-pointer"
                          }
                        `}
                      >
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                        <ScoreBadge score={c.overallScore} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison View */}
          <AnimatePresence mode="wait">
            {selected.length >= 2 ? (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Candidate Headers */}
                <Card className="shadow-card mb-6">
                  <CardContent className="p-0">
                    <div className={`grid ${selected.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {selected.map((c, i) => (
                        <div
                          key={c.id}
                          className={`p-6 text-center ${i > 0 ? "border-l border-border" : ""}`}
                        >
                          <ScoreBadge score={c.overallScore} size="lg" className="mx-auto mb-3" />
                          <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                          <p className="text-sm text-muted-foreground">{c.role}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skill-by-skill comparison */}
                <Card className="shadow-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-accent" /> Skill-by-Skill Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {allSkills.map((skillName, si) => {
                      const bestId = getBestForSkill(skillName);
                      return (
                        <div key={skillName}>
                          <div className="py-3">
                            <p className="text-sm font-semibold text-foreground mb-3">{skillName}</p>
                            <div className={`grid ${selected.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
                              {selected.map((c) => {
                                const skill = getSkill(c, skillName);
                                if (!skill) {
                                  return (
                                    <div key={c.id} className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                      Not listed
                                    </div>
                                  );
                                }
                                const level = getScoreLevel(skill.score);
                                const Icon = confidenceIcon[skill.confidence];
                                const isBest = c.id === bestId;
                                return (
                                  <div key={c.id} className={`rounded-lg p-2.5 ${isBest ? "bg-accent/5 ring-1 ring-accent/20" : "bg-secondary/30"}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <Badge variant="secondary" className="text-xs gap-1">
                                        <Icon className="h-3 w-3" />
                                        {confidenceLabel[skill.confidence]}
                                      </Badge>
                                      <span
                                        className={`text-sm font-bold ${
                                          level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low"
                                        }`}
                                      >
                                        {skill.score}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-secondary">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                          level === "high" ? "bg-score-high" : level === "medium" ? "bg-score-medium" : "bg-score-low"
                                        }`}
                                        style={{ width: `${skill.score}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {si < allSkills.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="shadow-card mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">Quick Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${selected.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
                      {selected.map((c) => {
                        const verified = c.skills.filter((s) => s.confidence === "verified").length;
                        const atRisk = c.skills.filter((s) => s.confidence === "unverified").length;
                        const avg = c.skills.length > 0
                          ? Math.round(c.skills.reduce((sum, s) => sum + s.score, 0) / c.skills.length)
                          : 0;
                        return (
                          <div key={c.id} className="space-y-2 text-sm">
                            <p className="font-display font-semibold text-foreground">{c.name}</p>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Verified Skills</span>
                              <span className="font-medium score-high">{verified}/{c.skills.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">At Risk</span>
                              <span className="font-medium score-low">{atRisk}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg. Score</span>
                              <span className="font-medium text-foreground">{avg}%</span>
                            </div>
                            <Link to={`/reports/${c.id}`}>
                              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                                View Full Report
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-muted-foreground"
              >
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Select at least 2 candidates to compare</p>
                <p className="text-sm mt-1">Click the checkboxes above to start comparing</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
