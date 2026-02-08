import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Upload,
  TrendingUp,
  Eye,
} from "lucide-react";

const recentCandidates = [
  { id: "sample", name: "Aarav Mehta", role: "Full Stack Developer", score: 78, date: "Feb 7, 2026" },
  { id: "2", name: "Priya Sharma", role: "Data Scientist", score: 91, date: "Feb 6, 2026" },
  { id: "3", name: "Rahul Patel", role: "DevOps Engineer", score: 42, date: "Feb 5, 2026" },
  { id: "4", name: "Sneha Iyer", role: "UI/UX Designer", score: 65, date: "Feb 4, 2026" },
  { id: "5", name: "Vikram Singh", role: "Backend Developer", score: 85, date: "Feb 3, 2026" },
];

const stats = [
  { label: "Total Resumes", value: "247", icon: FileText, change: "+12 this week" },
  { label: "Verified", value: "189", icon: CheckCircle2, change: "76.5% rate" },
  { label: "At Risk", value: "23", icon: AlertTriangle, change: "9.3% flagged" },
  { label: "Candidates", value: "198", icon: Users, change: "+8 new" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Recruiter Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Overview of resume verification activity</p>
            </div>
            <Link to="/upload">
              <Button className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90 transition-opacity gap-2">
                <Upload className="h-4 w-4" /> Upload Resume
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="h-5 w-5 text-accent" />
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    <p className="text-xs text-accent mt-0.5 font-medium">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Candidates */}
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display">Recent Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCandidates.map((candidate, i) => {
                  const level = getScoreLevel(candidate.score);
                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={`/reports/${candidate.id}`}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <ScoreBadge score={candidate.score} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.role}</p>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">{candidate.date}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low"}`}
                        >
                          {candidate.score}%
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
