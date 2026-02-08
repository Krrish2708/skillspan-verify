import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, FileText } from "lucide-react";

const allReports = [
  { id: "sample", name: "Aarav Mehta", role: "Full Stack Developer", score: 78, date: "Feb 7, 2026", skills: 8 },
  { id: "2", name: "Priya Sharma", role: "Data Scientist", score: 91, date: "Feb 6, 2026", skills: 6 },
  { id: "3", name: "Rahul Patel", role: "DevOps Engineer", score: 42, date: "Feb 5, 2026", skills: 7 },
  { id: "4", name: "Sneha Iyer", role: "UI/UX Designer", score: 65, date: "Feb 4, 2026", skills: 5 },
  { id: "5", name: "Vikram Singh", role: "Backend Developer", score: 85, date: "Feb 3, 2026", skills: 9 },
  { id: "6", name: "Ananya Das", role: "ML Engineer", score: 73, date: "Feb 2, 2026", skills: 7 },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">Verification Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">All resume authenticity reports</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allReports.map((report, i) => {
              const level = getScoreLevel(report.score);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/reports/${report.id}`}>
                    <Card className="shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <ScoreBadge score={report.score} size="md" />
                          <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-display font-semibold text-foreground">{report.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{report.role}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{report.skills} skills analyzed</span>
                          <span>·</span>
                          <span>{report.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
