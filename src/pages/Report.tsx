import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, ScoreBar, getScoreLevel } from "@/components/ScoreDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const report = {
  name: "Aarav Mehta",
  email: "aarav.mehta@email.com",
  title: "Full Stack Developer",
  experience: "4 years",
  overallScore: 78,
  skills: [
    { name: "React", score: 92, status: "verified" as const, evidence: "12 repos, 3 deployed projects" },
    { name: "Node.js", score: 85, status: "verified" as const, evidence: "REST API projects, Express expertise" },
    { name: "Python", score: 45, status: "partial" as const, evidence: "1 script repo, no project evidence" },
    { name: "AWS", score: 30, status: "risk" as const, evidence: "Mentioned in resume, no certifications found" },
    { name: "TypeScript", score: 88, status: "verified" as const, evidence: "Type-safe codebases, TS config files" },
    { name: "Docker", score: 62, status: "partial" as const, evidence: "Dockerfiles found, basic usage only" },
    { name: "MongoDB", score: 70, status: "verified" as const, evidence: "Used in 2 full-stack projects" },
    { name: "GraphQL", score: 22, status: "risk" as const, evidence: "No repositories or projects found" },
  ],
  experience_items: [
    { company: "TechCorp India", role: "Senior Developer", duration: "2023–Present", verified: true },
    { company: "StartupXYZ", role: "Frontend Developer", duration: "2021–2023", verified: true },
    { company: "FreelanceHub", role: "Freelancer", duration: "2020–2021", verified: false },
  ],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon", verified: false },
    { name: "Meta React Professional", issuer: "Coursera", verified: true },
  ],
  riskFlags: [
    "AWS claimed but no certification evidence found",
    "GraphQL listed as a skill with zero project evidence",
    "Freelance experience unverifiable",
  ],
};

const statusConfig = {
  verified: { icon: CheckCircle2, label: "Verified", class: "bg-score-high" },
  partial: { icon: AlertTriangle, label: "Partial", class: "bg-score-medium" },
  risk: { icon: XCircle, label: "Risk", class: "bg-score-low" },
};

export default function ReportPage() {
  const overallLevel = getScoreLevel(report.overallScore);

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
            <ScoreBadge score={report.overallScore} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">{report.name}</h1>
              <p className="text-muted-foreground">{report.title} · {report.experience}</p>
              <p className="text-sm text-muted-foreground mt-1">{report.email}</p>
            </div>
            <Button variant="outline" className="gap-2">
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
                  {report.skills.map((skill, i) => {
                    const config = statusConfig[skill.status];
                    return (
                      <motion.div
                        key={skill.name}
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
                  {report.experience_items.map((item) => (
                    <div key={item.company} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
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
              {/* Trust Summary */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display">Trust Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScoreBar score={report.overallScore} label="Overall Trust" />
                  <Separator />
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified Skills</span>
                      <span className="font-medium text-foreground">{report.skills.filter(s => s.status === "verified").length}/{report.skills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">At Risk</span>
                      <span className="font-medium score-low">{report.skills.filter(s => s.status === "risk").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Award className="h-5 w-5 text-accent" /> Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.certifications.map((cert) => (
                    <div key={cert.name} className="flex items-start gap-2">
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

              {/* Risk Flags */}
              <Card className="shadow-card border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Risk Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.riskFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
