"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Hash,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PipelineDetails from "./gitlab-pipeline-details";

export default function GitlabPipelines() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<number | null>(null);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        console.log("Fetching GitLab pipelines...");
        const response = await axios.get(
          "http://localhost:8001/gitlab/pipelines",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        console.log("GitLab pipelines response:", response.data);
        setPipelines(response.data.pipelines || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching GitLab pipelines:", error);
        setError(
          "Failed to fetch GitLab pipelines. Please make sure GitLab is properly configured."
        );
        toast.error("Failed to fetch GitLab pipelines");
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
  }, []);

  const handlePipelineClick = (pipelineId: any) => {
    setSelectedPipeline(pipelineId);
  };

  const handleBackToList = () => {
    setSelectedPipeline(null);
  };

  // Helper function to get badge variant for pipeline status
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

  // Calculate metrics
  const metrics = {
    totalPipelines: pipelines.length,
    successCount: pipelines.filter((p) => p.status === "success").length,
    failedCount: pipelines.filter((p) => p.status === "failed").length,
    runningCount: pipelines.filter((p) => p.status === "running").length,
    successRate:
      pipelines.length > 0
        ? (pipelines.filter((p) => p.status === "success").length /
            pipelines.length) *
          100
        : 0,
  };
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-[#FB6107]" />
            GitLab Pipelines
          </h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FB6107] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {selectedPipeline ? (
        <>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToList}
              className="flex items-center gap-2 text-[#FB6107] hover:text-[#FB6107]/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Pipelines
            </Button>
          </div>
          <PipelineDetails pipelineId={selectedPipeline} />
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="h-8 w-8 text-[#FB6107]" />
                GitLab Pipelines
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor and manage your GitLab CI/CD pipelines
              </p>
            </div>
          </div>

          {error ? (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : pipelines.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No pipelines found. Make sure GitLab is properly configured.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Pipelines
                    </CardTitle>
                    <Activity className="h-4 w-4 text-[#FB6107]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.totalPipelines}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All pipeline executions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Success Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.successRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.successCount} successful pipelines
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Failed
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.failedCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Failed executions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Running
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.runningCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently executing
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Pipelines Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-[#FB6107]" />
                    Pipeline Executions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Latest pipeline runs and their status
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">
                            Pipeline ID
                          </th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">
                            Branch/Ref
                          </th>
                          <th className="text-left p-2 font-medium">
                            Commit SHA
                          </th>
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pipelines.map((pipeline: any) => (
                          <tr
                            key={pipeline.id}
                            className="border-b hover:bg-muted/50 cursor-pointer"
                            onClick={() => handlePipelineClick(pipeline.id)}
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  {pipeline.id}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={getStatusBadgeVariant(pipeline.status)}
                                className="inline-flex items-center gap-1"
                              >
                                {getStatusIcon(pipeline.status)}
                                {pipeline.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {pipeline.ref}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {pipeline.sha?.substring(0, 8)}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePipelineClick(pipeline.id);
                                  }}
                                  className="text-[#FB6107] hover:text-[#FB6107]/80"
                                >
                                  View Details
                                </Button>
                                {pipeline.web_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={pipeline.web_url}
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
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
