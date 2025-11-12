"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Rocket, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Pipeline {
  id: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface GitLabDeploymentFrequencyProps {
  pipelines: Pipeline[];
}

export default function GitLabDeploymentFrequency({
  pipelines = [],
}: GitLabDeploymentFrequencyProps) {
  const chartData = useMemo(() => {
    if (!pipelines || pipelines.length === 0) return [];

    // Get successful deployments from the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const successfulPipelines = pipelines.filter(
      (pipeline) =>
        pipeline.status === "success" &&
        new Date(pipeline.created_at) >= fourteenDaysAgo
    );

    // Group by day
    const dailyDeployments: { [key: string]: number } = {};
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      dailyDeployments[dateKey] = 0;
    }

    successfulPipelines.forEach((pipeline) => {
      const dateKey = new Date(pipeline.created_at).toISOString().split("T")[0];
      if (dailyDeployments.hasOwnProperty(dateKey)) {
        dailyDeployments[dateKey]++;
      }
    });

    return Object.entries(dailyDeployments).map(([date, count]) => ({
      date,
      deployments: count,
      displayDate: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  }, [pipelines]);

  const statistics = useMemo(() => {
    const totalDeployments = chartData.reduce(
      (sum, day) => sum + day.deployments,
      0
    );
    const averagePerDay = totalDeployments / 14;
    const maxDeployments = Math.max(...chartData.map((d) => d.deployments), 0);
    const deploymentDays = chartData.filter((d) => d.deployments > 0).length;

    return {
      total: totalDeployments,
      average: averagePerDay.toFixed(1),
      peak: maxDeployments,
      activeDays: deploymentDays,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">
            {data.fullDate}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Deployments: {data.deployments}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Rocket className="h-4 w-4 text-orange-600" />
            </div>
            Deployment Frequency (14 days)
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {statistics.average}/day
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient
                  id="deploymentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="displayDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="deployments"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#deploymentGradient)"
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-center mb-2">
              <Rocket className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {statistics.total}
            </p>
            <p className="text-xs text-muted-foreground">Total Deployments</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {statistics.average}
            </p>
            <p className="text-xs text-muted-foreground">Daily Average</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center justify-center mb-2">
              <Rocket className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {statistics.peak}
            </p>
            <p className="text-xs text-muted-foreground">Peak Day</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {statistics.activeDays}
            </p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
        </div>

        {/* Deployment Trend */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Showing successful deployments over the last 14 days
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

GitLabDeploymentFrequency.displayName = "GitLabDeploymentFrequency";
