import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
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

interface PipelineHistoryEntry {
  id: number;
  deployStartedAt: string;
  deployedAt: string;
}

interface PipelineDurationDistributionProps {
  history: PipelineHistoryEntry[] | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Duration: ${label}`}</p>
        <p className="text-sm text-muted-foreground">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: data.color }}
          />
          {`Executions: ${data.value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function PipelineDurationDistribution({
  history,
}: PipelineDurationDistributionProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const durations = history.map((entry) => {
      const start = new Date(entry.deployStartedAt);
      const end = new Date(entry.deployedAt);
      return Math.floor((end.getTime() - start.getTime()) / 1000); // duration in seconds
    });

    const buckets = {
      "0–10s": 0,
      "11–30s": 0,
      "31–60s": 0,
      "61–120s": 0,
      ">120s": 0,
    };

    durations.forEach((duration) => {
      if (duration <= 10) buckets["0–10s"]++;
      else if (duration <= 30) buckets["11–30s"]++;
      else if (duration <= 60) buckets["31–60s"]++;
      else if (duration <= 120) buckets["61–120s"]++;
      else buckets[">120s"]++;
    });

    return Object.entries(buckets).map(([bucket, count]) => ({
      bucket,
      count,
      percentage:
        history.length > 0 ? Math.round((count / history.length) * 100) : 0,
    }));
  }, [history]);

  const totalExecutions = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  // Handle empty state
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Duration Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of pipeline execution durations
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No duration data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Duration Distribution
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Distribution of pipeline execution durations
          </p>
          <div className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-foreground">
              {totalExecutions} executions
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="bucket"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                label={{
                  value: "Number of Executions",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "currentColor" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
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
