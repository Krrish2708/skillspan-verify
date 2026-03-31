import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, userRole, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-heavy border-b border-border/40">
      <div className="container max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl gradient-accent flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Shield className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">VerifyHire</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/demo", label: "Demo" },
          ].map(link => (
            <Link key={link.to} to={link.to} className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-all duration-200">
              {link.label}
            </Link>
          ))}
          {user && userRole === "hr" && (
            <>
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/upload", label: "Upload" },
                { to: "/reports", label: "Reports" },
                { to: "/compare", label: "Compare" },
              ].map(link => (
                <Link key={link.to} to={link.to} className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-all duration-200">
                  {link.label}
                </Link>
              ))}
            </>
          )}
          {user && userRole === "candidate" && (
            <Link to="/candidate" className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-all duration-200">
              My Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {userRole && (
                <Badge variant="outline" className="hidden sm:flex text-xs capitalize border-border/60 bg-secondary/50">
                  {userRole === "hr" ? "HR / Recruiter" : "Candidate"}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="font-medium gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gradient-accent text-accent-foreground border-0 font-semibold hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-glow">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
