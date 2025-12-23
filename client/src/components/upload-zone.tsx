import { useCallback, useState } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { useUploadAssessment } from "@/hooks/use-assessments";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadAssessment();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert("Please upload a .docx, .txt, or .md file");
      return;
    }
    uploadMutation.mutate(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-out",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          uploadMutation.isPending && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept=".docx,.txt,.md"
          onChange={handleFileInput}
          disabled={uploadMutation.isPending}
        />
        
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <AnimatePresence mode="wait">
            {uploadMutation.isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-4 bg-primary/10 rounded-full text-primary"
              >
                <Loader2 className="w-10 h-10 animate-spin" />
              </motion.div>
            ) : uploadMutation.isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-4 bg-destructive/10 rounded-full text-destructive"
              >
                <AlertCircle className="w-10 h-10" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
              >
                <UploadCloud className="w-10 h-10" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-display">
              {uploadMutation.isPending ? "Analyzing Document..." : "Upload PRD or Design Doc"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {uploadMutation.isError 
                ? "Failed to upload. Please try again."
                : "Drag & drop your .docx file here, or click to browse files."
              }
            </p>
          </div>
          
          {!uploadMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              <FileText className="w-3 h-3" />
              <span>Supports .docx, .txt, .md</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
