import { Shield, FileSearch, BarChart3, Zap, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileSearch,
    title: "AI Resume Parsing",
    description: "Extract skills, experience, projects, and certifications with intelligent NLP analysis.",
  },
  {
    icon: Shield,
    title: "Authenticity Verification",
    description: "Cross-validate claimed skills against evidence from projects, repos, and assessments.",
  },
  {
    icon: BarChart3,
    title: "Trust Scoring",
    description: "Generate skill-wise and overall authenticity scores with transparent reasoning.",
  },
  {
    icon: Zap,
    title: "Risk Detection",
    description: "Identify inflated claims, skill gaps, and inconsistencies automatically.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access, encrypted data handling, and compliance-ready architecture.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share reports, compare candidates, and collaborate on hiring decisions.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-28 bg-background relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="container max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
              Verify Every Claim.
              <br className="hidden md:block" />
              Hire With Confidence.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Our AI-driven verification engine analyzes resumes against real evidence to give you actionable hiring insights.
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group p-7 rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                <feature.icon className="h-5.5 w-5.5 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2.5">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
