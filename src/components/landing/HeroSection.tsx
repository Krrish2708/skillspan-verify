import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Brain, Target, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-32 md:py-48">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }} />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-emerald-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-semibold mb-10 backdrop-blur-md tracking-widest uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-Powered Resume Verification
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl lg:text-[5.5rem] font-display font-extrabold text-white mb-6 leading-[1.04] tracking-tight"
          >
            Verify Skills.
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Hire Truth.
              </span>
              {/* Underline accent */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-accent/60 via-emerald-400/60 to-transparent rounded-full origin-left"
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-white/55 max-w-xl mx-auto mb-12 leading-relaxed font-light"
          >
            Stop guessing. Our AI engine cross-validates resume claims against real evidence —
            projects, repositories, certifications — and delivers trust scores you can act on.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link to="/dashboard">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="relative h-12 px-9 text-sm font-semibold border-0 text-white overflow-hidden rounded-xl
                    bg-gradient-to-r from-accent via-emerald-500 to-teal-500
                    shadow-[0_8px_32px_rgba(16,185,129,0.4)]
                    hover:shadow-[0_8px_40px_rgba(16,185,129,0.6)]
                    transition-all duration-300"
                >
                  Start Verifying
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>

            <Link to="/demo">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="flex flex-col items-center gap-1.5">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-9 text-sm font-semibold rounded-xl border-white/10 text-white/80 bg-white/[0.04]
                      hover:bg-white/[0.08] hover:text-white hover:border-white/20 backdrop-blur-md transition-all duration-300"
                  >
                    Continue as Guest
                  </Button>
                  <span className="text-[11px] text-white/35 tracking-wide">Explore live demo instantly</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Social proof bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-20"
          >
            {[
              { value: "500+", label: "Resumes Verified" },
              { value: "3 AI", label: "Verification Layers" },
              { value: "< 30s", label: "Analysis Time" },
              { value: "GitHub", label: "Cross-Referenced" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {i > 0 && <span className="w-px h-4 bg-white/10" />}
                <span className="text-white/90 font-bold text-sm">{stat.value}</span>
                <span className="text-white/35 text-xs">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Capability Cards */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mx-auto"
          >
            {[
              { icon: Brain, title: "AI Resume Scoring", desc: "Evaluates skills, experience, and evidence dimensions." },
              { icon: Target, title: "JD Relevance Modeling", desc: "Semantic similarity between resume and job requirements." },
              { icon: ShieldCheck, title: "Evidence Validation", desc: "Verifies certifications, repositories, and project links." },
              { icon: SlidersHorizontal, title: "Weighted Scoring", desc: "Dynamic adjustment of relevance vs credibility weights." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                className="group text-left p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md
                  hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 cursor-default"
              >
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center mb-3 group-hover:bg-accent/25 transition-colors duration-300">
                  <item.icon className="h-4 w-4 text-accent" />
                </div>
                <div className="text-[13px] font-semibold text-white/85 mb-1.5 leading-snug">{item.title}</div>
                <div className="text-[11px] text-white/40 leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
