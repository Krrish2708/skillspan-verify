import { Shield, FileSearch, BarChart3, Zap, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileSearch,
    title: "AI Resume Parsing",
    description: "Extract skills, experience, projects, and certifications with intelligent NLP analysis.",
    accent: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Authenticity Verification",
    description: "Cross-validate claimed skills against evidence from projects, repos, and assessments.",
    accent: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Trust Scoring",
    description: "Generate skill-wise and overall authenticity scores with transparent reasoning.",
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Risk Detection",
    description: "Identify inflated claims, skill gaps, and inconsistencies automatically.",
    accent: "from-yellow-500/20 to-yellow-600/5",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access, encrypted data handling, and compliance-ready architecture.",
    accent: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share reports, compare candidates, and collaborate on hiring decisions.",
    accent: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Glow accent top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="container max-w-7xl mx-auto px-6 relative">

        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/15 mb-6">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
              Verify Every Claim.
              <br className="hidden md:block" />
              <span className="text-muted-foreground/70">Hire With Confidence.</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Our AI-driven verification engine analyzes resumes against real evidence to give you actionable hiring insights.
            </p>
          </motion.div>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="group relative p-7 rounded-2xl bg-card border border-border/50 overflow-hidden
                hover:border-border hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-default"
            >
              {/* Card background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent group-hover:via-accent/20 transition-all duration-500" />

              <div className="relative">
                {/* Icon */}
                <div className={`h-11 w-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-[15px] font-display font-semibold text-foreground mb-2.5 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40"
        >
          {[
            { value: "99%", label: "Parse Accuracy" },
            { value: "< 30s", label: "Analysis Time" },
            { value: "GitHub", label: "Cross-Verified" },
            { value: "3-Layer", label: "Verification" },
          ].map((stat, i) => (
            <div key={i} className="bg-card px-8 py-6 text-center hover:bg-secondary/40 transition-colors duration-200">
              <div className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
