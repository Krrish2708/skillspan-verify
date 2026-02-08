import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
            <Shield className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">VerifyHire</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link to="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Upload</Link>
          <Link to="/reports" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reports</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-medium">Log in</Button>
          </Link>
          <Link to="/upload">
            <Button size="sm" className="gradient-accent text-accent-foreground border-0 font-medium hover:opacity-90 transition-opacity">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
