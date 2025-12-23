import { useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { useAssessment, useAnalyzeAssessment, useGenerateReport } from "@/hooks/use-assessments";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  RefreshCw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AssessmentDetail() {
  const [match, params] = useRoute("/assessments/:id");
  const id = parseInt(params?.id || "0");
  const { data: assessment, isLoading, error } = useAssessment(id);
  
  const analyzeMutation = useAnalyzeAssessment();
  const reportMutation = useGenerateReport();
  const reportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to report when generated
  useEffect(() => {
    if (assessment?.reportContent && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assessment?.reportContent]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium">Loading Assessment...</h2>
        </div>
      </Layout>
    );
  }

  if (error || !assessment) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-6 opacity-20" />
          <h2 className="text-2xl font-bold text-foreground">Assessment Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-8">The assessment you are looking for does not exist or has been deleted.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const hasAnalysis = assessment.riskAnalysis && assessment.riskAnalysis.length > 0;
  const isAnalyzing = analyzeMutation.isPending;
  const isGeneratingReport = reportMutation.isPending;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-3">
              {assessment.title}
              {hasAnalysis && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  Analysis Complete
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex gap-3">
            {!hasAnalysis ? (
              <Button 
                onClick={() => analyzeMutation.mutate(id)} 
                disabled={isAnalyzing}
                className="shadow-lg shadow-primary/25"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Start Analysis
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => analyzeMutation.mutate(id)}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isAnalyzing && "animate-spin")} /> 
                  Re-Analyze
                </Button>
                {!assessment.reportContent && (
                  <Button 
                    onClick={() => reportMutation.mutate(id)}
                    disabled={isGeneratingReport}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" /> Generate Full Report
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Original Content Preview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 h-full border-muted-foreground/10 bg-muted/20 backdrop-blur-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground font-medium">
                <FileText className="w-5 h-5" />
                <h2>Source Document</h2>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {assessment.originalText}
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Analysis & Report */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Empty State */}
            {!hasAnalysis && !isAnalyzing && (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-12 text-center bg-muted/10">
                <ShieldCheck className="w-16 h-16 mx-auto text-primary/20 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2 mb-6">
                  The document has been processed. Click "Start Analysis" to identify threats using the STRIDE methodology.
                </p>
                <Button onClick={() => analyzeMutation.mutate(id)}>
                  <Play className="w-4 h-4 mr-2" /> Run AI Assessment
                </Button>
              </div>
            )}

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <div className="border rounded-2xl p-12 bg-card shadow-sm space-y-6">
                <div className="flex items-center justify-center gap-4 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-lg font-medium">Analyzing document for security risks...</span>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Checking STRIDE categories: Spoofing, Tampering, Repudiation...</p>
                </div>
              </div>
            )}

            {/* Risk Table */}
            {hasAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Risk Assessment Matrix
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {assessment.riskAnalysis?.length} threats identified
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Risk Level</th>
                          <th className="px-6 py-4">Feature / Component</th>
                          <th className="px-6 py-4">Threat Type</th>
                          <th className="px-6 py-4">Description & Mitigation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {assessment.riskAnalysis?.map((item, idx) => (
                          <tr key={idx} className="bg-card hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4 align-top w-32">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                item.riskLevel === "High" && "bg-red-50 text-red-700 border-red-100",
                                item.riskLevel === "Medium" && "bg-orange-50 text-orange-700 border-orange-100",
                                item.riskLevel === "Low" && "bg-blue-50 text-blue-700 border-blue-100",
                              )}>
                                {item.riskLevel}
                              </span>
                            </td>
                            <td className="px-6 py-4 align-top font-medium w-48 text-foreground/90">
                              {item.featureName}
                            </td>
                            <td className="px-6 py-4 align-top text-muted-foreground w-40">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded border font-mono">
                                {item.threatType}
                              </code>
                            </td>
                            <td className="px-6 py-4 align-top space-y-2">
                              <p className="text-foreground/80 leading-relaxed">{item.risk}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground pt-1">
                                <Info className="w-4 h-4 shrink-0 text-primary/60" />
                                <span className="text-primary/80 font-medium">Rec: {item.recommendation}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generated Report */}
            {assessment.reportContent && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                ref={reportRef}
                className="pt-8 border-t"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display">Executive Security Report</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Download className="w-4 h-4 mr-2" /> PDF / Print
                    </Button>
                  </div>
                </div>

                <Card className="p-8 md:p-12 shadow-lg border-muted-foreground/10 bg-white">
                  <article className="markdown-content prose prose-slate max-w-none">
                    <ReactMarkdown>{assessment.reportContent}</ReactMarkdown>
                  </article>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
