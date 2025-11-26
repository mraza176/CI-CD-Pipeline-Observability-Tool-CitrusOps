import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import {
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  GitBranch,
  Hash,
  Play,
  Settings,
  Square,
  Target,
  TestTube,
  Timer,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import JobDetails from "./gitlab-pipeline-job-detail";

export default function PipelineDetails({ pipelineId }: any) {
  const [details, setDetails] = useState<any>(null);
  const [jobs, setJobs] = useState([]);
  const [testSummary, setTestSummary] = useState<any>(null);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const fetchPipelineData = async () => {
      setLoading(true);
      try {
        // Fetch pipeline details
        const detailsResponse = await axios.get(
          `http://localhost:8001/gitlab/pipeline/${pipelineId}/details`
        );
        setDetails(detailsResponse.data.pipeline);

        // Extract project ID from web_url if available
        if (
          detailsResponse.data.pipeline &&
          detailsResponse.data.pipeline.web_url
        ) {
          const url = detailsResponse.data.pipeline.web_url;
          const projectIdMatch = url.match(/projects\/(\d+)/);
          if (projectIdMatch && projectIdMatch[1]) {
            setProjectId(projectIdMatch[1]);
          }
        }

        // Fetch pipeline jobs
        const jobsResponse = await axios.get(
          `http://localhost:8001/gitlab/pipeline/${pipelineId}/jobs`
        );
        setJobs(jobsResponse.data.jobs);

        // Fetch test summary
        const testSummaryResponse = await axios.get(
          `http://localhost:8001/gitlab/pipeline/${pipelineId}/test-report-summary`
        );
        setTestSummary(testSummaryResponse.data);

        // Fetch variables
        const variablesResponse = await axios.get(
          `http://localhost:8001/gitlab/pipeline/${pipelineId}/variables`
        );
        setVariables(variablesResponse.data.variables);

        setError(null);
      } catch (err) {
        console.error("Error fetching pipeline data:", err);
        setError("Failed to load pipeline details. Please try again later.");
        toast.error("Error loading pipeline details");
      } finally {
        setLoading(false);
      }
    };

    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId]);

  const handleRetry = async () => {
    try {
      await axios.post(
        `http://localhost:8001/gitlab/pipeline/${pipelineId}/retry`
      );
      toast.success("Pipeline retry initiated");
    } catch (err) {
      console.error("Error retrying pipeline:", err);
      toast.error("Failed to retry pipeline");
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(
        `http://localhost:8001/gitlab/pipeline/${pipelineId}/cancel`
      );
      toast.success("Pipeline cancellation initiated");
    } catch (err) {
      console.error("Error canceling pipeline:", err);
      toast.error("Failed to cancel pipeline");
    }
  };

  const handleViewJob = (jobId: any) => {
    setSelectedJob(jobId);
  };

  const handleCloseJobDetails = () => {
    setSelectedJob(null);
  };

  // Helper function to get badge variant for status
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FB6107] border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-[#FB6107]" />
                Pipeline #{pipelineId}
              </CardTitle>
              {details && (
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge
                    variant={getStatusBadgeVariant(details.status)}
                    className="inline-flex items-center gap-1"
                  >
                    {getStatusIcon(details.status)}
                    {details.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <GitBranch className="h-4 w-4" />
                    {details.ref}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    {details.sha?.substring(0, 8)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={handleCancel}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <Square className="h-4 w-4" />
                Cancel
              </Button>
              {details && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <a
                    href={details.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitLab
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pipeline Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Variables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-[#FB6107]" />
                    Pipeline Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{details.duration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-sm">
                      {new Date(details.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="text-sm">
                      {details.started_at
                        ? new Date(details.started_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finished:</span>
                    <span className="text-sm">
                      {details.finished_at
                        ? new Date(details.finished_at).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage:</span>
                    <Badge variant="secondary">{details.coverage || 0}%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#FB6107]" />
                    Triggered By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {details.user ? (
                    <div className="flex items-center space-x-3">
                      {details.user.avatar_url && (
                        <Image
                          src={details.user.avatar_url}
                          alt={details.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{details.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{details.user.username}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No user information available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#FB6107]" />
                Pipeline Jobs
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                All jobs in this pipeline execution
              </p>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs found for this pipeline
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-left p-2 font-medium">Stage</th>
                        <th className="text-left p-2 font-medium">Status</th>
                        <th className="text-left p-2 font-medium">Duration</th>
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job: any) => (
                        <tr key={job.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <span className="font-medium">{job.name}</span>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{job.stage}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={getStatusBadgeVariant(job.status)}
                              className="inline-flex items-center gap-1"
                            >
                              {getStatusIcon(job.status)}
                              {job.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{job.duration}s</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleViewJob(job.id)}
                                variant="ghost"
                                size="sm"
                                className="text-[#FB6107] hover:text-[#FB6107]/80"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {job.web_url && (
                                <Button asChild variant="ghost" size="sm">
                                  <a
                                    href={job.web_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    GitLab
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          {testSummary ? (
            <>
              {/* Test Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">
                      {testSummary.total.count}
                    </div>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testSummary.total.success}
                    </div>
                    <p className="text-sm text-green-600">Passed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testSummary.total.failed}
                    </div>
                    <p className="text-sm text-red-600">Failed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {testSummary.total.skipped}
                    </div>
                    <p className="text-sm text-yellow-600">Skipped</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">
                      {testSummary.total.time}s
                    </div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </CardContent>
                </Card>
              </div>

              {/* Test Suites */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-[#FB6107]" />
                    Test Suites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testSummary.test_suites &&
                  testSummary.test_suites.length > 0 ? (
                    <div className="space-y-4">
                      {testSummary.test_suites.map(
                        (suite: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">{suite.name}</h4>
                              <div className="flex gap-4 text-sm">
                                <Badge
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  {suite.success_count || suite.success || 0}{" "}
                                  passed
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  {suite.failed_count || suite.failed || 0}{" "}
                                  failed
                                </Badge>
                                <span className="text-muted-foreground">
                                  {suite.total_time || suite.duration || 0}s
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    ((suite.success_count ||
                                      suite.success ||
                                      0) /
                                      (suite.total_count || suite.count || 1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No test suites available for this pipeline</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No test data available for this pipeline</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="variables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FB6107]" />
                Pipeline Variables
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Environment variables and configuration for this pipeline
              </p>
            </CardHeader>
            <CardContent>
              {variables && variables.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Key</th>
                        <th className="text-left p-2 font-medium">Value</th>
                        <th className="text-left p-2 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variables.map((variable: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Badge variant="outline" className="font-mono">
                              {variable.key}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span className="font-mono text-sm break-all">
                              {variable.value}
                            </span>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">
                              {variable.variable_type}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No variables available for this pipeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetails
          jobId={selectedJob}
          projectId={projectId || undefined}
          open={!!selectedJob}
          onClose={handleCloseJobDetails}
        />
      )}
    </div>
  );
}
