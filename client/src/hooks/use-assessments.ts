import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type RiskAssessmentItem } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAssessments() {
  return useQuery({
    queryKey: [api.assessments.list.path],
    queryFn: async () => {
      const res = await fetch(api.assessments.list.path);
      if (!res.ok) throw new Error("Failed to fetch assessments");
      return api.assessments.list.responses[200].parse(await res.json());
    },
  });
}

export function useAssessment(id: number) {
  return useQuery({
    queryKey: [api.assessments.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.assessments.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch assessment");
      return api.assessments.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useUploadAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.assessments.upload.path, {
        method: api.assessments.upload.method,
        body: formData, // fetch handles Content-Type for FormData automatically
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid file upload");
        }
        throw new Error("Failed to upload assessment");
      }
      return api.assessments.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assessments.list.path] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAnalyzeAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assessments.analyze.path, { id });
      const res = await fetch(url, {
        method: api.assessments.analyze.method,
      });

      if (!res.ok) throw new Error("Analysis failed");
      return api.assessments.analyze.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.assessments.get.path, id] });
      toast({
        title: "Analysis Complete",
        description: "Risk assessment generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assessments.generateReport.path, { id });
      const res = await fetch(url, {
        method: api.assessments.generateReport.method,
      });

      if (!res.ok) throw new Error("Report generation failed");
      return api.assessments.generateReport.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.assessments.get.path, id] });
      toast({
        title: "Report Generated",
        description: "Full security report is ready",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
