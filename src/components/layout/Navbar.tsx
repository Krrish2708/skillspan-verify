import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isHome
        ? "bg-[#080c10]/80 border-white/[0.06] backdrop-blur-xl"
        : "glass-heavy border-border/40"
    }`}>
      <div className="container max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl gradient-accent flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Shield className="h-4.5 w-4.5 text-accent-foreground" />
          </div>
          <span className={`font-display font-bold text-lg tracking-tight ${isHome ? "text-white" : "text-foreground"}`}>
            VerifyHire
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/demo", label: "Demo" },
          ].map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isHome
                  ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}>
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
                <Link key={link.to} to={link.to}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isHome
                      ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {user && userRole === "candidate" && (
            <Link to="/candidate"
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isHome
                  ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}>
              My Dashboard
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {userRole && (
                <Badge variant="outline" className={`hidden sm:flex text-xs capitalize ${
                  isHome
                    ? "border-white/10 bg-white/5 text-white/60"
                    : "border-border/60 bg-secondary/50"
                }`}>
                  {userRole === "hr" ? "HR / Recruiter" : "Candidate"}
                </Badge>
              )}
              <span className={`text-sm hidden sm:block ${isHome ? "text-white/40" : "text-muted-foreground"}`}>
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className={`font-medium gap-2 ${
                  isHome
                    ? "text-white/40 hover:text-white hover:bg-white/[0.06]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm"
                  className={`font-medium ${
                    isHome
                      ? "text-white/50 hover:text-white hover:bg-white/[0.06]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
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
