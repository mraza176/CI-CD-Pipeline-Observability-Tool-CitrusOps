"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Pipeline {
  id: string;
  created_at: string;
  status: string;
  [key: string]: any;
}

interface GitLabPipelineExecutionsProps {
  pipelines: Pipeline[];
}

export default function GitLabPipelineExecutions({
  pipelines = [],
}: GitLabPipelineExecutionsProps) {
  const chartData = useMemo(() => {
    if (!pipelines || pipelines.length === 0) return [];

    // Group pipelines by hour for the last 24 hours
    const now = new Date();
    const last24Hours = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      last24Hours.push(hour);
    }

    return last24Hours.map((hour) => {
      const hourStart = new Date(hour.getTime());
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const executionsCount = pipelines.filter((pipeline) => {
        const pipelineDate = new Date(pipeline.created_at);
        return pipelineDate >= hourStart && pipelineDate < hourEnd;
      }).length;

      return {
        time: `${String(hour.getHours()).padStart(2, "0")}:00`,
        executions: executionsCount,
        fullTime: hour.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    });
  }, [pipelines]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">Time: {label}</p>
          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            Executions: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxExecutions = Math.max(...chartData.map((d) => d.executions), 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <Activity className="h-4 w-4 text-orange-600" />
          </div>
          Pipeline Executions (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, maxExecutions]}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="executions"
                fill="#FB6107"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {pipelines.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Pipelines</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-orange-600">
              {chartData.reduce((acc, curr) => acc + curr.executions, 0)}
            </p>
            <p className="text-xs text-muted-foreground">24h Executions</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...chartData.map((d) => d.executions), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Peak Hour</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

GitLabPipelineExecutions.displayName = "GitLabPipelineExecutions";
