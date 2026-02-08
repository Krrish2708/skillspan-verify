import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

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

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      navigate("/reports/sample");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Upload Resume</h1>
            <p className="text-muted-foreground">Upload a PDF or DOC file to analyze skill authenticity and generate a trust score.</p>
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
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileInput}
            />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">Drag & drop your resume here</p>
            <p className="text-sm text-muted-foreground">or click to browse. Supports PDF, DOC, DOCX</p>
          </motion.div>

          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6"
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

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full mt-4 h-12 gradient-accent text-accent-foreground border-0 font-semibold text-base hover:opacity-90 transition-opacity"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Resume...
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
