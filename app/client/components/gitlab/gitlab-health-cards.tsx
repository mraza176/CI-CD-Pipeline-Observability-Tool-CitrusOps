"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Heart,
  Server,
  XCircle,
  Zap,
} from "lucide-react";

interface Pipeline {
  id: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface Stats {
  total: number;
  successful: number;
  failed: number;
  running: number;
}

interface GitLabHealthCardsProps {
  pipelines: Pipeline[];
  stats: Stats;
}

export default function GitLabHealthCards({
  pipelines = [],
  stats = { total: 0, successful: 0, failed: 0, running: 0 },
}: GitLabHealthCardsProps) {
  const calculateHealthScore = (): number => {
    if (!pipelines || pipelines.length === 0) return 0;
    const recentPipelines = pipelines.slice(0, 20); // Last 20 pipelines
    const successCount = recentPipelines.filter(
      (p) => p.status === "success"
    ).length;
    return Math.round((successCount / recentPipelines.length) * 100);
  };

  const getSystemStatus = () => {
    const healthScore = calculateHealthScore();
    if (healthScore >= 90)
      return {
        status: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-500",
        badgeVariant: "default" as const,
        icon: CheckCircle,
      };
    if (healthScore >= 75)
      return {
        status: "Good",
        color: "text-blue-600",
        bgColor: "bg-blue-500",
        badgeVariant: "secondary" as const,
        icon: CheckCircle,
      };
    if (healthScore >= 50)
      return {
        status: "Warning",
        color: "text-orange-600",
        bgColor: "bg-orange-500",
        badgeVariant: "outline" as const,
        icon: AlertTriangle,
      };
    return {
      status: "Critical",
      color: "text-red-600",
      bgColor: "bg-red-500",
      badgeVariant: "destructive" as const,
      icon: XCircle,
    };
  };

  const getActiveRunners = (): number => {
    // Simulate active runners based on recent activity
    const recentActivity = pipelines.filter((p) => {
      const createdAt = new Date(p.created_at);
      const now = new Date();
      const diffHours =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return diffHours <= 1; // Pipelines in last hour
    }).length;
    return Math.max(1, Math.min(5, recentActivity)); // Between 1-5 runners
  };

  const healthScore = calculateHealthScore();
  const systemStatus = getSystemStatus();
  const activeRunners = getActiveRunners();
  const StatusIcon = systemStatus.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* GitLab Server Status */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Server className="h-4 w-4 text-orange-600" />
              </div>
              GitLab Server
            </CardTitle>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${systemStatus.bgColor} animate-pulse`}
              />
              <Badge variant={systemStatus.badgeVariant} className="text-xs">
                ONLINE
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${systemStatus.color}`} />
              <div className={`text-2xl font-bold ${systemStatus.color}`}>
                {systemStatus.status}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total} total pipelines
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Health Score */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              Health Score
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Last 20 runs
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-12 h-12">
              <svg
                className="w-12 h-12 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                {/* Background circle */}
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
                {/* Progress circle */}
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke={
                    healthScore >= 75
                      ? "#22c55e"
                      : healthScore >= 50
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  strokeWidth="2"
                  strokeDasharray={`${healthScore}, 100`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">
                  {healthScore}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div
                className={`text-2xl font-bold ${
                  healthScore >= 75
                    ? "text-green-600"
                    : healthScore >= 50
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {healthScore}%
              </div>
              <p className="text-xs text-muted-foreground">Pipeline success</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Runners */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              Active Runners
            </CardTitle>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < activeRunners ? "bg-blue-500 animate-pulse" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              {activeRunners}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.running > 0 ? `${stats.running} running` : "Available"}
            </p>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(activeRunners / 5) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              Recent Activity
            </CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-2xl font-bold text-foreground">
              {pipelines.slice(0, 10).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 10 pipelines</p>

            {/* Activity Bars */}
            <div className="flex space-x-1">
              {pipelines.slice(0, 8).map((pipeline, index) => (
                <div
                  key={pipeline.id}
                  className={`w-2 h-6 rounded-sm transition-all duration-300 ${
                    pipeline.status === "success"
                      ? "bg-green-500"
                      : pipeline.status === "failed"
                      ? "bg-red-500"
                      : pipeline.status === "running"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                  title={`Pipeline ${pipeline.id}: ${pipeline.status}`}
                />
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Success</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">Failed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground">Running</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
