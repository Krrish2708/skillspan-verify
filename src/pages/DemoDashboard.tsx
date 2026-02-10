import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Eye,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";
import { demoCandidates, calculateOverallScore } from "@/lib/demo-data";

export default function DemoDashboard() {
  const [relevancyWeight, setRelevancyWeight] = useState(50);
  const [sortAsc, setSortAsc] = useState(false);

  const candidates = useMemo(() => {
    const withScores = demoCandidates.map((c) => ({
      ...c,
      overallScore: calculateOverallScore(c.relevancyScore, c.credibilityScore, relevancyWeight),
    }));
    return withScores.sort((a, b) => sortAsc ? a.overallScore - b.overallScore : b.overallScore - a.overallScore);
  }, [relevancyWeight, sortAsc]);

  const highCount = candidates.filter((c) => c.overallScore >= 70).length;
  const atRiskCount = candidates.filter((c) => c.overallScore < 50).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-display font-bold text-foreground">Demo Dashboard</h1>
                <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
                  Demo Mode
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Explore sample candidates with AI-verified scores. No login required.
              </p>
            </div>
            <Link to="/auth">
              <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90 transition-opacity">
                Sign Up for Full Access
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Candidates", value: String(candidates.length), icon: Users },
              { label: "High Confidence", value: String(highCount), icon: CheckCircle2 },
              { label: "At Risk", value: String(atRiskCount), icon: AlertTriangle },
              { label: "Reports Available", value: String(candidates.length), icon: FileText },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="h-5 w-5 text-accent" />
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Weight Slider */}
          <Card className="shadow-card mb-6">
            <CardContent className="py-4">
              <p className="text-sm font-semibold text-foreground mb-3">Adjust Score Weighting</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Relevancy: <span className="font-bold text-foreground">{relevancyWeight}%</span></span>
                <span className="text-sm text-muted-foreground">Credibility: <span className="font-bold text-foreground">{100 - relevancyWeight}%</span></span>
              </div>
              <Slider value={[relevancyWeight]} onValueChange={(v) => setRelevancyWeight(v[0])} min={10} max={90} step={5} />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Overall = (Relevancy × {relevancyWeight}%) + (Credibility × {100 - relevancyWeight}%)
              </p>
            </CardContent>
          </Card>

          {/* Candidates Table */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Candidate Rankings</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setSortAsc(!sortAsc)}>
                  <ArrowUpDown className="h-3.5 w-3.5" /> {sortAsc ? "Lowest First" : "Highest First"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_100px_100px_100px_40px] gap-4 px-4 pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                <span>Candidate</span>
                <span className="text-center">Relevancy</span>
                <span className="text-center">Credibility</span>
                <span className="text-center">Overall</span>
                <span />
              </div>

              <div className="space-y-1 mt-1">
                {candidates.map((c, i) => {
                  const level = getScoreLevel(c.overallScore);
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/demo/${c.id}`}
                        className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_100px_100px_40px] items-center gap-2 sm:gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <ScoreBadge score={c.overallScore} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.role} · {c.experience}</p>
                          </div>
                        </div>
                        <div className="flex sm:block gap-4 sm:gap-0 w-full sm:w-auto">
                          <span className="sm:hidden text-xs text-muted-foreground">Relevancy: </span>
                          <Badge variant="secondary" className={`text-xs ${getScoreLevel(c.relevancyScore) === "high" ? "score-high" : getScoreLevel(c.relevancyScore) === "medium" ? "score-medium" : "score-low"}`}>
                            {c.relevancyScore}%
                          </Badge>
                        </div>
                        <div className="flex sm:block gap-4 sm:gap-0 w-full sm:w-auto">
                          <span className="sm:hidden text-xs text-muted-foreground">Credibility: </span>
                          <Badge variant="secondary" className={`text-xs ${getScoreLevel(c.credibilityScore) === "high" ? "score-high" : getScoreLevel(c.credibilityScore) === "medium" ? "score-medium" : "score-low"}`}>
                            {c.credibilityScore}%
                          </Badge>
                        </div>
                        <div className="flex sm:block gap-4 sm:gap-0 w-full sm:w-auto">
                          <span className="sm:hidden text-xs text-muted-foreground">Overall: </span>
                          <Badge variant="secondary" className={`text-xs ${level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low"}`}>
                            {c.overallScore}%
                          </Badge>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
