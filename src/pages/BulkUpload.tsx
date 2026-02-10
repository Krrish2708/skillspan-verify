import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge, getScoreLevel } from "@/components/ScoreDisplay";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  FileText,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "analyzing" | "completed" | "failed";
  resumeId?: string;
  error?: string;
}

export default function BulkUploadPage() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [experienceRange, setExperienceRange] = useState("");
  const [processing, setProcessing] = useState(false);
  const [relevancyWeight, setRelevancyWeight] = useState(50);
  const navigate = useNavigate();
  const { user, profileId } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const addFiles = (newFiles: FileList) => {
    const fileArr = Array.from(newFiles).map((f) => ({
      file: f,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...fileArr]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const processAll = async () => {
    if (!user || !profileId || files.length === 0) return;
    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.status === "completed") continue;

      try {
        // Upload
        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: "uploading" } : item));
        const filePath = `${user.id}/${Date.now()}-${f.file.name}`;
        const { error: uploadError } = await supabase.storage.from("resume-files").upload(filePath, f.file);
        if (uploadError) throw new Error(uploadError.message);

        // Create record
        const { data: resume, error: insertError } = await supabase
          .from("resumes")
          .insert({
            profile_id: profileId,
            file_name: f.file.name,
            file_url: filePath,
            status: "pending",
          })
          .select("id")
          .single();
        if (insertError) throw new Error(insertError.message);

        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: "analyzing", resumeId: resume.id } : item));

        // Extract text
        const resumeText = await f.file.text();

        // Call AI
        const { data: fnData, error: fnError } = await supabase.functions.invoke("parse-resume", {
          body: {
            resumeId: resume.id,
            resumeText,
            jobDescription: jobDescription || undefined,
            roleTitle: roleTitle || undefined,
            experienceRange: experienceRange || undefined,
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (fnData?.error) throw new Error(fnData.error);

        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: "completed", resumeId: resume.id } : item));
      } catch (err: any) {
        console.error(`Error processing ${f.file.name}:`, err);
        setFiles((prev) => prev.map((item, idx) => idx === i ? { ...item, status: "failed", error: err.message } : item));
      }
    }

    setProcessing(false);
    const completed = files.filter((f) => f.status !== "failed").length;
    if (completed > 0) {
      toast({ title: "Processing complete", description: `${completed} resume(s) analyzed successfully.` });
    }
  };

  const completedFiles = files.filter((f) => f.status === "completed");
  const pendingCount = files.filter((f) => f.status === "pending").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Bulk Resume Upload</h1>
            <p className="text-muted-foreground">
              Upload multiple resumes, optionally add a job description, and rank candidates by AI-verified scores.
            </p>
          </div>

          {/* Job Description */}
          <Card className="shadow-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Job Description (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-title" className="text-sm">Role Title</Label>
                  <Input
                    id="role-title"
                    placeholder="e.g. Senior React Developer"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="exp-range" className="text-sm">Experience Range</Label>
                  <Input
                    id="exp-range"
                    placeholder="e.g. 3-5 years"
                    value={experienceRange}
                    onChange={(e) => setExperienceRange(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="jd" className="text-sm">Full Job Description</Label>
                <Textarea
                  id="jd"
                  placeholder="Paste the full job description here to enable relevancy scoring..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Drop zone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer mb-6
              ${dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 bg-card"}
            `}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("bulk-file-input")?.click()}
          >
            <input
              id="bulk-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              multiple
              onChange={handleFileInput}
            />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">Drag & drop multiple resumes here</p>
            <p className="text-sm text-muted-foreground">or click to browse. Supports PDF, DOC, DOCX, TXT</p>
          </motion.div>

          {/* File list */}
          {files.length > 0 && (
            <Card className="shadow-card mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Uploaded Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {f.status === "pending" && (
                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                    )}
                    {f.status === "uploading" && (
                      <Badge variant="secondary" className="text-xs"><Loader2 className="h-3 w-3 animate-spin mr-1" />Uploading</Badge>
                    )}
                    {f.status === "analyzing" && (
                      <Badge variant="secondary" className="text-xs"><Loader2 className="h-3 w-3 animate-spin mr-1" />Analyzing</Badge>
                    )}
                    {f.status === "completed" && (
                      <Badge className="text-xs bg-score-high/10 text-foreground border-0"><CheckCircle2 className="h-3 w-3 mr-1 score-high" />Done</Badge>
                    )}
                    {f.status === "failed" && (
                      <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
                    )}
                    {f.status === "pending" && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                <Button
                  onClick={processAll}
                  disabled={processing || pendingCount === 0}
                  className="w-full mt-4 h-12 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-90 transition-opacity"
                >
                  {processing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Resumes...</>
                  ) : (
                    <>Analyze All Resumes <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results after completion */}
          {completedFiles.length > 0 && !processing && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {completedFiles.length} resume(s) analyzed. View individual reports from your{" "}
                <Link to="/dashboard" className="text-accent underline">Dashboard</Link>.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
