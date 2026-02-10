import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-28 md:py-36">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="container relative max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground/80 text-sm font-medium mb-8">
            <Shield className="h-4 w-4" />
            AI-Powered Resume Verification
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-primary-foreground mb-6 leading-[1.1] tracking-tight">
            Verify Skills.
            <br />
            <span className="text-accent">Hire Truth.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. Our AI engine cross-validates resume claims against real evidence — projects, repositories, certifications — and delivers trust scores you can act on.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gradient-accent text-accent-foreground border-0 h-12 px-8 text-base font-semibold shadow-heavy hover:opacity-90 transition-opacity">
                Start Verifying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "50K+", label: "Resumes Verified" },
            { value: "98%", label: "Accuracy Rate" },
            { value: "2.5s", label: "Avg. Analysis Time" },
            { value: "500+", label: "Companies Trust Us" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
