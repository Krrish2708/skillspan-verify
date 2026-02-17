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
  const { user, profileId } = useAuth();

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
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resume-files")
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

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

      if (insertError) throw new Error(`Record creation failed: ${insertError.message}`);

      setStatusText("Extracting text...");
      const resumeText = await file.text();

      setStatusText("AI is analyzing your resume...");

      const { data: fnData, error: fnError } = await supabase.functions.invoke("parse-resume", {
        body: {
          resumeId: resume.id,
          resumeText,
          ...(showJD && jobDescription ? { jobDescription, roleTitle, experienceRange } : {}),
        },
      });

      if (fnError) throw new Error(fnError.message || "Analysis failed");
      if (fnData?.error) throw new Error(fnData.error);

      toast({ title: "Analysis complete!", description: "Your resume has been verified." });
      navigate(`/reports/${resume.id}`);
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
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Upload Resume</h1>
            <p className="text-muted-foreground">Upload a PDF or text file to analyze skill authenticity and generate a trust score.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
              ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-card"}
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
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">Drag & drop your resume here</p>
            <p className="text-sm text-muted-foreground">or click to browse. Supports PDF, DOC, DOCX, TXT</p>
          </motion.div>

          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-card">
                <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Optional JD Section */}
              <button
                type="button"
                onClick={() => setShowJD(!showJD)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
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
                    className="space-y-3 p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="role-title" className="text-xs">Role Title</Label>
                        <Input
                          id="role-title"
                          placeholder="e.g. Senior Backend Engineer"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="exp-range" className="text-xs">Experience Range</Label>
                        <Input
                          id="exp-range"
                          placeholder="e.g. 3-5 years"
                          value={experienceRange}
                          onChange={(e) => setExperienceRange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="jd-text" className="text-xs">Job Description</Label>
                      <Textarea
                        id="jd-text"
                        placeholder="Paste the full job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={5}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full h-12 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-90 transition-opacity"
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
