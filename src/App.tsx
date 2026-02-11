import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import BulkUploadPage from "./pages/BulkUpload";
import ReportPage from "./pages/Report";
import ReportsPage from "./pages/Reports";
import ComparePage from "./pages/Compare";
import AuthPage from "./pages/Auth";
import DemoDashboard from "./pages/DemoDashboard";
import DemoReport from "./pages/DemoReport";
import CandidateDashboard from "./pages/CandidateDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: "hr" | "candidate" }) {
  const { user, userRole, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRole && userRole && userRole !== allowedRole) {
    return <Navigate to={userRole === "candidate" ? "/candidate" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/demo" element={<DemoDashboard />} />
    <Route path="/demo/:id" element={<DemoReport />} />
    <Route path="/candidate" element={<ProtectedRoute allowedRole="candidate"><CandidateDashboard /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute allowedRole="hr"><Dashboard /></ProtectedRoute>} />
    <Route path="/upload" element={<ProtectedRoute allowedRole="hr"><UploadPage /></ProtectedRoute>} />
    <Route path="/bulk-upload" element={<ProtectedRoute allowedRole="hr"><BulkUploadPage /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute allowedRole="hr"><ReportsPage /></ProtectedRoute>} />
    <Route path="/reports/:id" element={<ProtectedRoute allowedRole="hr"><ReportPage /></ProtectedRoute>} />
    <Route path="/compare" element={<ProtectedRoute allowedRole="hr"><ComparePage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
