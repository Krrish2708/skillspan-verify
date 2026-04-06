import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Github, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

const mockSkills = [
  { name: "React", score: 88, verified: true },
  { name: "Node.js", score: 82, verified: true },
  { name: "AWS", score: 24, verified: false },
  { name: "Docker", score: 20, verified: false },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#080c10]">
      {/* Layered mesh gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(16,185,129,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_80%,rgba(20,184,166,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_0%_60%,rgba(6,78,59,0.15),transparent)]" />

      {/* Fine grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="container max-w-7xl mx-auto px-6 pt-28 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-7rem)]">

          {/* ── LEFT ── */}
          <div className="flex flex-col justify-center">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 w-fit mb-10"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400/80 text-xs font-semibold tracking-[0.15em] uppercase">
                AI-Powered Resume Verification
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display font-black text-white leading-[1.02] tracking-tight mb-7">
                <span className="block text-[3.8rem] md:text-[4.8rem] lg:text-[5rem]">Stop Hiring</span>
                <span className="block text-[3.8rem] md:text-[4.8rem] lg:text-[5rem]">
                  on{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                      Guesswork.
                    </span>
                    <span className="absolute -inset-2 bg-emerald-500/10 blur-2xl rounded-xl" />
                  </span>
                </span>
              </h1>
              <p className="text-white/45 text-lg leading-relaxed max-w-md mb-10 font-light">
                Our AI engine cross-validates every resume claim against real evidence —
                GitHub repos, project links, certifications — and delivers a trust score you can act on.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-14"
            >
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="h-12 px-8 text-sm font-bold rounded-xl border-0 text-white
                    bg-gradient-to-r from-emerald-500 to-teal-500
                    shadow-[0_0_24px_rgba(16,185,129,0.4)]
                    hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]
                    transition-all duration-300">
                    Start Verifying Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/demo">
                <Button variant="ghost" className="h-12 px-6 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
                  View live demo →
                </Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              {[
                "GitHub cross-referencing included for free",
                "Full analysis in under 30 seconds",
                "No credit card required to start",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-white/40 text-sm">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Product mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-3xl" />

              <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Alex Chen</p>
                      <p className="text-white/40 text-xs">Full Stack Developer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-400">82</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Trust Score</p>
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-1 mb-5">
                  {[
                    { label: "ATS Score", value: 78, color: "bg-blue-400" },
                    { label: "Credibility", value: 82, color: "bg-emerald-400" },
                    { label: "Relevancy", value: 86, color: "bg-teal-400" },
                  ].map((bar, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <span className="text-white/40 text-xs w-20 flex-shrink-0">{bar.label}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.value}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          className={`h-full ${bar.color} rounded-full`}
                        />
                      </div>
                      <span className="text-white/60 text-xs w-8 text-right">{bar.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/5 mb-5" />

                {/* Skills */}
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Skill Verification</p>
                <div className="space-y-2.5">
                  {mockSkills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${skill.verified ? 'bg-emerald-400' : 'bg-red-400/70'}`} />
                      <span className="text-white/70 text-sm flex-1">{skill.name}</span>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.score}%` }}
                          transition={{ delay: 1.1 + i * 0.08, duration: 0.6 }}
                          className={`h-full rounded-full ${skill.verified ? 'bg-emerald-400' : 'bg-red-400/70'}`}
                        />
                      </div>
                      <span className={`text-xs w-8 text-right ${skill.verified ? 'text-emerald-400' : 'text-red-400/70'}`}>{skill.score}%</span>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px bg-white/5 my-5" />

                {/* GitHub row */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Github className="h-4 w-4 text-white/50" />
                  <span className="text-white/40 text-xs flex-1">github.com/alexchen</span>
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
              >
                <Star className="h-3 w-3 fill-white" /> Strong Hire
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -bottom-4 -left-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white/70 text-xs font-medium px-4 py-2 rounded-full"
              >
                ⚡ Analyzed in 18s
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
