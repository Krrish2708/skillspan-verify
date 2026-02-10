import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, ScoreBar, getScoreLevel } from "@/components/ScoreDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  Code2,
  Award,
  Shield,
  Search,
  FileWarning,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { demoCandidates, calculateOverallScore } from "@/lib/demo-data";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

const confidenceConfig = {
  verified: { icon: CheckCircle2, label: "Verified", class: "bg-score-high" },
  partially_verified: { icon: AlertTriangle, label: "Partial", class: "bg-score-medium" },
  unverified: { icon: XCircle, label: "Risk", class: "bg-score-low" },
};

const statusColor = {
  verified: "score-high",
  partially_verified: "score-medium",
  unverified: "score-low",
};

export default function DemoReport() {
  const { id } = useParams<{ id: string }>();
  const candidate = demoCandidates.find((c) => c.id === id);
  const [relevancyWeight, setRelevancyWeight] = useState(50);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Candidate not found</h1>
            <Link to="/demo">
              <Button variant="outline">Back to Demo Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const overall = calculateOverallScore(candidate.relevancyScore, candidate.credibilityScore, relevancyWeight);
  const cb = candidate.credibilityBreakdown;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/demo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Demo Dashboard
            </Link>
            <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">Demo Mode</Badge>
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <ScoreBadge score={overall} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">{candidate.name}</h1>
              <p className="text-muted-foreground">{candidate.role} · {candidate.experience}</p>
            </div>
          </motion.div>

          {/* Weight Slider */}
          <Card className="shadow-card mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Relevancy: {relevancyWeight}%</span>
                <span className="text-sm font-medium text-foreground">Credibility: {100 - relevancyWeight}%</span>
              </div>
              <Slider value={[relevancyWeight]} onValueChange={(v) => setRelevancyWeight(v[0])} min={10} max={90} step={5} />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Overall Score: <span className="font-bold text-foreground">{overall}%</span>
              </p>
            </CardContent>
          </Card>

          {/* Score Summary Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="shadow-card">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Relevancy</p>
                <p className={`text-2xl font-display font-bold ${getScoreLevel(candidate.relevancyScore) === "high" ? "score-high" : getScoreLevel(candidate.relevancyScore) === "medium" ? "score-medium" : "score-low"}`}>{candidate.relevancyScore}%</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Credibility</p>
                <p className={`text-2xl font-display font-bold ${getScoreLevel(candidate.credibilityScore) === "high" ? "score-high" : getScoreLevel(candidate.credibilityScore) === "medium" ? "score-medium" : "score-low"}`}>{candidate.credibilityScore}%</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Overall</p>
                <p className={`text-2xl font-display font-bold ${getScoreLevel(overall) === "high" ? "score-high" : getScoreLevel(overall) === "medium" ? "score-medium" : "score-low"}`}>{overall}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Relevancy Breakdown */}
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Search className="h-5 w-5 text-accent" /> Relevancy Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Skills Matched</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.relevancyBreakdown.skillsMatched.map((s) => (
                        <Badge key={s} className="bg-score-high/10 text-foreground border-0 text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  {candidate.relevancyBreakdown.missingSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Missing Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.relevancyBreakdown.missingSkills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs border-destructive/30 text-destructive">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Keywords Matched</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.relevancyBreakdown.keywordsMatched.map((k) => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Verification */}
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Code2 className="h-5 w-5 text-accent" /> Skill Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.skills.map((skill, i) => {
                    const config = confidenceConfig[skill.confidence];
                    return (
                      <motion.div key={skill.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{skill.evidence}</span>
                        </div>
                        <ScoreBar score={skill.score} label={skill.name} />
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Briefcase className="h-5 w-5 text-accent" /> Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.experience_items.map((item, idx) => (
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
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Credibility Breakdown */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Shield className="h-5 w-5 text-accent" /> Credibility Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">Education</span>
                      <Badge variant="secondary" className={`text-xs ${statusColor[cb.educationVerification.status as keyof typeof statusColor] || ""}`}>
                        {cb.educationVerification.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cb.educationVerification.detail}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-foreground">Experience Consistency</span>
                    <Badge variant="secondary" className={`text-xs ml-2 ${statusColor[cb.experienceConsistency.status as keyof typeof statusColor] || ""}`}>
                      {cb.experienceConsistency.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{cb.experienceConsistency.detail}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm font-medium text-foreground">Project Evidence</span>
                    <Badge variant="secondary" className={`text-xs ml-2 ${statusColor[cb.projectEvidence.status as keyof typeof statusColor] || ""}`}>
                      {cb.projectEvidence.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{cb.projectEvidence.detail}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {candidate.certifications.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <Award className="h-5 w-5 text-accent" /> Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cb.certifications.map((cert, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-2">
                          {cert.status === "verified" ? (
                            <CheckCircle2 className="h-4 w-4 mt-0.5 score-high flex-shrink-0" />
                          ) : cert.status === "partially_verified" ? (
                            <AlertTriangle className="h-4 w-4 mt-0.5 score-medium flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 mt-0.5 score-low flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{cert.name}</p>
                            <p className="text-xs text-muted-foreground">{cert.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Risk Flags */}
              {candidate.risk_flags.length > 0 && (
                <Card className="shadow-card border-destructive/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                      <FileWarning className="h-5 w-5 text-destructive" /> Risk Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {candidate.risk_flags.map((flag, i) => (
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
