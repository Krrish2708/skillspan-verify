import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Brain, Target, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-32 md:py-44">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container relative max-w-7xl mx-auto px-6 text-center">
       <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  className="relative"
>
  {/* Glow behind content */}
  <div className="absolute inset-0 -z-10 flex justify-center">
    <div className="w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full opacity-60"></div>
  </div>

  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm font-medium mb-10 backdrop-blur-md shadow-inner">
    <Shield className="h-4 w-4 text-accent" />
    AI-Powered Resume Verification
  </div>

  {/* Heading */}
  <h1 className="text-5xl md:text-6xl lg:text-[5.2rem] font-display font-extrabold text-white mb-8 leading-[1.05] tracking-tight">
    Verify Skills.
    <br />
    <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
      Hire Truth.
    </span>
  </h1>

  {/* Description */}
  <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
    Stop guessing. Our AI engine cross-validates resume claims against real evidence — projects, repositories, certifications — and delivers trust scores you can act on.
  </p>

  {/* Buttons */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
    
    {/* Primary Button */}
    <Link to="/dashboard">
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
        <Button
          size="lg"
          className="relative h-13 px-10 text-base font-semibold border-0 text-white overflow-hidden
          bg-gradient-to-r from-accent via-emerald-500 to-teal-500
          shadow-[0_10px_40px_rgba(16,185,129,0.35)]
          hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]
          transition-all duration-300"
        >
          <span className="relative z-10 flex items-center">
            Start Verifying
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>

          {/* Shine effect */}
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-500 bg-white/10 blur-xl"></span>
        </Button>
      </motion.div>
    </Link>

    {/* Secondary Button */}
    <Link to="/demo">
      <div className="flex flex-col items-center">
        <motion.div whileHover={{ scale: 1.03 }}>
          <Button
            size="lg"
            variant="outline"
            className="h-13 px-10 text-base font-semibold border-white/10 text-white bg-white/5
            hover:bg-white/10 backdrop-blur-md transition-all duration-300"
          >
            Continue as Guest
          </Button>
        </motion.div>
        <span className="text-xs text-white/40 mt-2.5">
          Explore a live demo dashboard instantly
        </span>
      </div>
    </Link>
  </div>
</motion.div>

        {/* Technical Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto"
        >
          {[
            { icon: Brain, title: "AI Resume Scoring Engine", desc: "Evaluates resumes across structured skill, experience, and evidence dimensions." },
            { icon: Target, title: "JD Relevance Modeling", desc: "Computes semantic similarity between resume content and job requirements." },
            { icon: ShieldCheck, title: "Credibility & Evidence Validation", desc: "Analyzes external proof such as certifications, repositories, and project links." },
            { icon: SlidersHorizontal, title: "Weighted Scoring Framework", desc: "Allows dynamic adjustment of relevance vs credibility weights (e.g., 60/40, 50/50)." },
          ].map((item) => (
            <div key={item.title} className="text-left p-5 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] backdrop-blur-md hover:bg-primary-foreground/[0.08] transition-all duration-300 group">
              <item.icon className="h-5 w-5 text-accent mb-3 transition-transform duration-300 group-hover:scale-110" />
              <div className="text-sm font-semibold text-primary-foreground mb-2">{item.title}</div>
              <div className="text-xs text-primary-foreground/45 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
