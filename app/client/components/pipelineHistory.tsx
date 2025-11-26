"use client";

import instance from "@/axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HistoryItem {
  pipeline_name: string;
  summary: {
    deployment: string;
    pod: string;
    replicaSet: string;
    service: string;
  };
  time: string;
}

export default function PipelineHistory() {
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pipelineName, setPipelineName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Calculate success/failure metrics
  const metrics = useMemo(() => {
    if (history?.length === 0)
      return {
        successRate: 0,
        failureRate: 0,
        totalDeployments: 0,
        successCount: 0,
        failureCount: 0,
      };

    const successCount = history?.filter((item) =>
      Object.values(item.summary).every((status) => status === "Healthy")
    ).length;

    const failureCount = history?.length - successCount;
    const totalDeployments = history?.length;
    const successRate = (successCount / totalDeployments) * 100;
    const failureRate = 100 - successRate;

    return {
      successRate,
      failureRate,
      totalDeployments,
      successCount,
      failureCount,
    };
  }, [history]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return history
      ?.map((item, index) => {
        const isHealthy = Object.values(item.summary).every(
          (status) => status === "Healthy"
        );
        const date = new Date(item.time);
        return {
          index: index + 1,
          time: date.toLocaleDateString(),
          fullTime: date.toLocaleString(),
          status: isHealthy ? 1 : 0,
          deployment: item.summary.deployment === "Healthy" ? 1 : 0,
          pod: item.summary.pod === "Healthy" ? 1 : 0,
          replicaSet: item.summary.replicaSet === "Healthy" ? 1 : 0,
          service: item.summary.service === "Healthy" ? 1 : 0,
        };
      })
      .reverse(); // Most recent first in chart
  }, [history]);

  useEffect(() => {
    setPipelineName(searchParams.get("pipeline") as string);
    async function fetchPipelineData() {
      setIsLoading(true);
      try {
        const response = await instance.get("/pipeline_history", {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("userData") as string).token
            }`,
          },
          params: {
            pipeline: `${searchParams.get("pipeline")}`,
          },
        });

        setHistory(response.data);
      } catch (error: any) {
        console.error("Error fetching pipeline data:", error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPipelineData();
  }, []);

  // Helper function to get badge variant for status
  const getStatusBadgeVariant = (status: string) => {
    return status === "Healthy" ? "default" : "destructive";
  };

  const getStatusIcon = (status: string) => {
    return status === "Healthy" ? (
      <CheckCircle className="h-3 w-3" />
    ) : (
      <XCircle className="h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading pipeline history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Pipeline History</h2>
        <p className="text-muted-foreground">
          History and metrics for{" "}
          <span className="font-medium">{pipelineName}</span>
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.successCount} successful deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.failureRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.failureCount} failed deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deployments
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDeployments}</div>
            <p className="text-xs text-muted-foreground">
              All time deployments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      {history?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Timeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Health status over time (1 = Healthy, 0 = Unhealthy)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Time:</div>
                              <div className="text-sm">{data.fullTime}</div>
                              <div className="font-medium">Overall:</div>
                              <div
                                className={`text-sm ${
                                  data.status
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {data.status ? "Healthy" : "Unhealthy"}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deployment"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Deployment"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pod"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Pod"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="service"
                    stroke="#ffc658"
                    strokeWidth={2}
                    name="Service"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="replicaSet"
                    stroke="#ff7300"
                    strokeWidth={2}
                    name="ReplicaSet"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed status for each deployment
          </p>
        </CardHeader>
        <CardContent>
          {history?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deployment history found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Time</th>
                    <th className="text-left p-2 font-medium">Deployment</th>
                    <th className="text-left p-2 font-medium">Service</th>
                    <th className="text-left p-2 font-medium">Pod</th>
                    <th className="text-left p-2 font-medium">ReplicaSet</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(item.time).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            getStatusBadgeVariant(item.summary.deployment) as
                              | "default"
                              | "destructive"
                          }
                          className="inline-flex items-center gap-1"
                        >
                          {getStatusIcon(item.summary.deployment)}
                          {item.summary.deployment}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            getStatusBadgeVariant(item.summary.service) as
                              | "default"
                              | "destructive"
                          }
                          className="inline-flex items-center gap-1"
                        >
                          {getStatusIcon(item.summary.service)}
                          {item.summary.service}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            getStatusBadgeVariant(item.summary.pod) as
                              | "default"
                              | "destructive"
                          }
                          className="inline-flex items-center gap-1"
                        >
                          {getStatusIcon(item.summary.pod)}
                          {item.summary.pod}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            getStatusBadgeVariant(item.summary.replicaSet) as
                              | "default"
                              | "destructive"
                          }
                          className="inline-flex items-center gap-1"
                        >
                          {getStatusIcon(item.summary.replicaSet)}
                          {item.summary.replicaSet}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
