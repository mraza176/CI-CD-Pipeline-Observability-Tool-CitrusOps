import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
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

interface ExecutionType {
  id: number;
  deployStartedAt: string;
  deployedAt: string;
}

interface TopSlowPipelinesProps {
  executions: ExecutionType[];
  topN?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Execution #${label}`}</p>
        <p className="text-sm text-muted-foreground">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: data.color }}
          />
          {`Duration: ${data.value}s`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {`${Math.floor(data.value / 60)}m ${data.value % 60}s`}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopSlowPipelines({
  executions,
  topN = 5,
}: TopSlowPipelinesProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!executions || executions.length === 0) return [];

    // Calculate durations and sort descending
    const sortedExecutions = executions
      .map((exec) => {
        const start = new Date(exec.deployStartedAt);
        const end = new Date(exec.deployedAt);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        return {
          revision: exec.id + 1,
          duration,
          executionId: exec.id,
          startTime: start.toLocaleString(),
          endTime: end.toLocaleString(),
          durationFormatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
        };
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, topN);

    return sortedExecutions;
  }, [executions, topN]);

  const avgDuration = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, item) => sum + item.duration, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  // Handle empty state
  if (!executions || executions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Top {topN} Slowest Executions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Longest running pipeline executions
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No execution data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Top {topN} Slowest Executions
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Longest running pipeline executions
          </p>
          <div className="text-sm text-muted-foreground">
            Avg:{" "}
            <span className="font-medium text-foreground">{avgDuration}s</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="revision"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) => `#${value}`}
                label={{
                  value: "Execution Number",
                  position: "bottom",
                  style: { textAnchor: "middle", fill: "currentColor" },
                }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                label={{
                  value: "Duration (seconds)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "currentColor" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="duration"
                fill="#FB6107"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
