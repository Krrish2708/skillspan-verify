import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-4">Get Started</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
              Ready to verify your next hire?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Upload a resume and get an AI-powered authenticity report in seconds.
            </p>
            <Link to="/upload">
              <Button size="lg" className="gradient-accent text-accent-foreground border-0 h-13 px-10 text-base font-semibold hover:opacity-95 transition-all duration-300 shadow-heavy hover:shadow-glow">
                Upload Resume Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
