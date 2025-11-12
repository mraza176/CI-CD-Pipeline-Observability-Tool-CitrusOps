import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import {
  Activity,
  Archive,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Hash,
  Package,
  ScrollText,
  Server,
  Settings,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function JobDetails({
  jobId,
  projectId,
  open = true,
  onClose,
}: {
  jobId: string;
  projectId?: string;
  open?: boolean;
  onClose: () => void;
}) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [formattedTrace, setFormattedTrace] = useState("");
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to get badge variant for job status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "passed":
        return "default";
      case "failed":
      case "error":
        return "destructive";
      case "running":
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "passed":
        return <CheckCircle className="h-3 w-3" />;
      case "failed":
      case "error":
        return <XCircle className="h-3 w-3" />;
      case "running":
      case "pending":
        return <Clock className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const handleViewInGitLab = () => {
    let gitlabUrl;

    if (projectId) {
      gitlabUrl = `https://gitlab.com/projects/${projectId}/jobs/${jobId}`;
    } else {
      gitlabUrl = `https://gitlab.com/project/-/jobs/${jobId}`;
    }

    window.open(gitlabUrl, "_blank");
  };

  const onDownload = () => {
    if (job?.trace) {
      const element = document.createElement("a");
      const file = new Blob([job.trace], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `job-${job.id}-logs.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        console.log(
          `Fetching job details for job ID: ${jobId}, project ID: ${
            projectId || "not provided"
          }`
        );
        const queryParams = projectId ? `?project_id=${projectId}` : "";
        const url = `http://localhost:8001/gitlab/job/${jobId}${queryParams}`;
        console.log(`Request URL: ${url}`);

        const response = await axios.get(url);
        console.log("Job details response:", response.data);

        if (response.data.job) {
          // Check if this is example data with a note
          if (response.data.note && response.data.job.id === 0) {
            setError(response.data.note);
            setDebugInfo(JSON.stringify(response.data.job, null, 2));
          } else {
            setJob(response.data.job);
            setError(null);
            // Format trace if available
            if (response.data.job.trace) {
              setFormattedTrace(response.data.job.trace);
            }
          }
        } else {
          setError("Job data not found in response");
          setDebugInfo(JSON.stringify(response.data, null, 2));
        }
      } catch (err: any) {
        console.error("Error fetching job data:", err);
        setError(`Failed to load job details: ${err.message}`);
        setDebugInfo(
          err.response
            ? JSON.stringify(err.response.data, null, 2)
            : "No response data"
        );
        toast.error("Error loading job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId, projectId]);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FB6107]" />
              Loading Job Details...
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FB6107] border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FB6107]" />
              Job Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              </CardContent>
            </Card>

            {debugInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#FB6107]" />
                    Debug Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[30vh] bg-muted p-4 rounded-lg">
                    {debugInfo}
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleViewInGitLab}
                className="flex items-center gap-2 bg-[#FB6107] hover:bg-[#FB6107]/90"
              >
                <ExternalLink className="h-4 w-4" />
                View in GitLab Instead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-start space-y-0">
          <div className="space-y-2">
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FB6107]" />
              {job.name}
              <Badge variant="outline" className="font-mono">
                #{job.id}
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge
                variant={getStatusBadgeVariant(job.status)}
                className="inline-flex items-center gap-1"
              >
                {getStatusIcon(job.status)}
                {job.status}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                Stage: {job.stage}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-6">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <a href={job.web_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                GitLab
              </a>
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList
            className={`grid w-full ${
              job.artifacts && job.artifacts.length > 0
                ? "grid-cols-3"
                : "grid-cols-2"
            }`}
          >
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            {job.artifacts && job.artifacts.length > 0 && (
              <TabsTrigger
                value="artifacts"
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Artifacts
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-[#FB6107]" />
                    Job Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <Badge variant="secondary">{job.duration || 0}s</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-sm">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="text-sm">
                      {job.started_at
                        ? new Date(job.started_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finished:</span>
                    <span className="text-sm">
                      {job.finished_at
                        ? new Date(job.finished_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-[#FB6107]" />
                    Runner Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.runner ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runner:</span>
                        <span className="font-medium">
                          {job.runner.description || job.runner.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {job.runner.runner_type || "Unknown"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary">
                          {job.runner.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Server className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No runner information available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#FB6107]" />
                    Job Logs
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      onClick={onDownload}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setAutoScroll(!autoScroll)}
                      variant={autoScroll ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                    >
                      <ScrollText className="h-4 w-4" />
                      Auto Scroll
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={logContainerRef}
                  className="bg-black rounded-lg p-4 h-96 overflow-y-auto border font-mono text-sm"
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: formattedTrace }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#FB6107]" />
                  Job Artifacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.artifacts && job.artifacts.length > 0 ? (
                  <div className="space-y-3">
                    {job.artifacts.map((artifact: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-[#FB6107]" />
                          <div>
                            <p className="font-medium">{artifact.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {artifact.file_type} ·{" "}
                              {(artifact.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <a
                            href={`${job.web_url}/artifacts/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No artifacts available for this job
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
