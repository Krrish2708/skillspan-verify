import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [experienceRange, setExperienceRange] = useState("");
  const navigate = useNavigate();
  const { user, profileId, getToken } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file || !user || !profileId) {
      if (!user) {
        toast({ title: "Please sign in", description: "You need to be logged in to analyze resumes.", variant: "destructive" });
        navigate("/auth");
      }
      return;
    }

    setAnalyzing(true);
    setStatusText("Uploading file...");

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("resume-files")
        .upload(filePath, file, { contentType: file.type || "application/octet-stream" });
      if (uploadError) throw uploadError;

      setStatusText("Creating record...");
      const { data: resume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          profile_id: profileId,
          file_name: file.name,
          file_url: filePath,
          status: "pending",
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      const resumeId = resume.id;

      setStatusText("Extracting text...");
      const resumeText = await file.text();

      setStatusText("AI is analyzing your resume...");
      const fnData = await invokeEdgeFunction("parse-resume", {
        resumeId,
        resumeText,
        ...(showJD && jobDescription ? { jobDescription, roleTitle, experienceRange } : {}),
      }, token);

      if (fnData?.error) throw new Error(fnData.error);

      toast({ title: "Analysis complete!", description: "Your resume has been verified." });
      navigate(`/reports/${resumeId}`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setStatusText("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-3">Upload</p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 tracking-tight">Upload Resume</h1>
            <p className="text-muted-foreground leading-relaxed">Upload a PDF or text file to analyze skill authenticity and generate a trust score.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              relative border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-300 cursor-pointer
              ${dragActive
                ? "border-accent bg-accent/5 shadow-glow"
                : "border-border/60 hover:border-accent/40 bg-card hover:shadow-elevated"
              }
            `}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="h-14 w-14 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-5">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1.5">Drag & drop your resume here</p>
            <p className="text-sm text-muted-foreground">or click to browse. Supports PDF, DOC, DOCX, TXT</p>
          </motion.div>

          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-4"
            >
              <div className="flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60 shadow-card">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground/60 tabular-nums">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowJD(!showJD)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-full"
              >
                {showJD ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>Add Job Description for relevance matching (optional)</span>
              </button>

              <AnimatePresence>
                {showJD && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 p-5 rounded-2xl bg-card border border-border/60"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="role-title" className="text-xs font-medium">Role Title</Label>
                        <Input id="role-title" placeholder="e.g. Senior Backend Engineer" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="exp-range" className="text-xs font-medium">Experience Range</Label>
                        <Input id="exp-range" placeholder="e.g. 3-5 years" value={experienceRange} onChange={(e) => setExperienceRange(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="jd-text" className="text-xs font-medium">Job Description</Label>
                      <Textarea id="jd-text" placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={5} className="rounded-xl" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full h-13 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-95 transition-all duration-300 rounded-xl shadow-sm hover:shadow-glow"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {statusText || "Analyzing Resume..."}
                  </>
                ) : (
                  <>
                    Analyze Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
