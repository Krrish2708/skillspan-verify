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
    <section className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Verify Every Claim. Hire With Confidence.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-driven verification engine analyzes resumes against real evidence to give you actionable hiring insights.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-lg gradient-accent flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
