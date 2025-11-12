"use client";

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

interface GitLabStats {
  total: number;
  successful: number;
  failed: number;
  running: number;
}

interface GitLabStatsCardsProps {
  stats: GitLabStats;
}

const STAT_CONFIGS = [
  {
    key: "total",
    title: "Total Pipelines",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    description: "All time",
    showPercentage: false,
  },
  {
    key: "successful",
    title: "Successful",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    description: "success rate",
    showPercentage: true,
  },
  {
    key: "failed",
    title: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    description: "failure rate",
    showPercentage: true,
  },
  {
    key: "running",
    title: "Running",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    description: "Currently active",
    showPercentage: false,
  },
];

export default function GitLabStatsCards({
  stats = { total: 0, successful: 0, failed: 0, running: 0 },
}: GitLabStatsCardsProps) {
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getPercentageChange = (
    current: number,
    total: number
  ): { value: number; isPositive: boolean } => {
    const percentage = calculatePercentage(current, total);
    // For demo purposes, showing trend. In real app, you'd compare with previous period
    const isPositive = current > 0;
    return { value: percentage, isPositive };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STAT_CONFIGS.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key as keyof GitLabStats];
        const percentage = config.showPercentage
          ? calculatePercentage(value, stats.total)
          : null;
        const trend = config.showPercentage
          ? getPercentageChange(value, stats.total)
          : null;

        return (
          <Card
            key={config.key}
            className="group hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {config.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${config.iconBg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${config.color}`}>
                    {value.toLocaleString()}
                  </div>
                  {trend && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        trend.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trend.isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {trend.value}%
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {percentage !== null
                      ? `${percentage}% ${config.description}`
                      : config.description}
                  </p>
                  {config.key === "total" && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>

                {/* Progress bar for success/failure rates */}
                {config.showPercentage && stats.total > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        config.key === "successful"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
