import { Shield, FileSearch, BarChart3, Zap, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    icon: FileSearch,
    title: "AI Resume Parsing",
    description: "Extract skills, experience, projects, and certifications with intelligent NLP analysis that understands context, not just keywords.",
    tag: "Core Engine",
  },
  {
    number: "02",
    icon: Shield,
    title: "Authenticity Verification",
    description: "Cross-validate every claimed skill against real evidence — GitHub repositories, deployed projects, and verifiable certifications.",
    tag: "Verification",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Trust Scoring",
    description: "Generate granular skill-wise scores and an overall credibility rating. Every score comes with transparent evidence citations.",
    tag: "Scoring",
  },
  {
    number: "04",
    icon: Zap,
    title: "Risk Detection",
    description: "Automatically surface inflated claims, credential gaps, and timeline inconsistencies before they become costly hiring mistakes.",
    tag: "Risk",
  },
  {
    number: "05",
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access controls, encrypted data pipelines, and compliance-ready architecture built for modern hiring teams.",
    tag: "Security",
  },
  {
    number: "06",
    icon: Users,
    title: "Team Collaboration",
    description: "Compare candidates side-by-side, share reports instantly, and make data-driven hiring decisions as a team.",
    tag: "Collaboration",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Top separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 relative">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px w-8 bg-accent" />
              <span className="text-[11px] font-bold text-accent uppercase tracking-[0.18em]">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-[1.08] tracking-tight">
              Everything you need to{" "}
              <span className="text-accent">hire with confidence.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground text-base leading-relaxed max-w-sm md:text-right"
          >
            Our AI verification engine analyzes resumes against real evidence to give you actionable hiring insights.
          </motion.p>
        </div>

        {/* Feature grid — 2 column on desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-background p-8 hover:bg-secondary/30 transition-colors duration-300 cursor-default"
            >
              {/* Number + tag row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-black text-muted-foreground/30 tabular-nums tracking-wider">
                  {feature.number}
                </span>
                <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/15 bg-accent/5">
                  {feature.tag}
                </span>
              </div>

              {/* Icon */}
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:scale-105 transition-all duration-300">
                <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-base font-display font-semibold text-foreground mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-12"
        >
          {[
            { value: "< 30s", label: "Average analysis time" },
            { value: "GitHub", label: "Cross-verification" },
            { value: "3-Layer", label: "Verification depth" },
            { value: "ATS + AI", label: "Dual scoring engine" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground/60 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
