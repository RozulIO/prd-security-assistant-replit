import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { UploadZone } from "@/components/upload-zone";
import { useAssessments } from "@/hooks/use-assessments";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Search,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const { data: assessments, isLoading } = useAssessments();

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered Security Analysis
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight text-foreground"
          >
            Automated <span className="text-gradient">STRIDE</span> Threat Modeling
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
          >
            Upload your Product Requirement Documents (PRD) or System Design docs. 
            Our AI agents identify risks, categorize threats, and suggest mitigations in seconds.
          </motion.p>
        </section>

        {/* Upload Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-8"
        >
          <UploadZone />
        </motion.section>

        {/* Recent Assessments */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display">Recent Assessments</h2>
              <p className="text-muted-foreground">Manage and review your security reports</p>
            </div>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search assessments..." 
                className="pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : assessments?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
              <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No assessments yet</h3>
              <p className="text-muted-foreground">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assessments?.map((assessment) => (
                <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
                  <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        {assessment.riskAnalysis ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Analyzed
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Draft
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {assessment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {assessment.originalText.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {assessment.createdAt && format(new Date(assessment.createdAt), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        View Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
