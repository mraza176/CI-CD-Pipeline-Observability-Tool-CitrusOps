import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
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

type HistoryDataType = {
  id: number;
  deployStartedAt: string;
  deployedAt: string;
};

export default function PipelineDurationChart({
  history,
}: {
  history: HistoryDataType[];
}) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    return history.map((entry) => {
      const start = new Date(entry.deployStartedAt);
      const end = new Date(entry.deployedAt);
      const duration = (end.getTime() - start.getTime()) / 1000; // duration in seconds

      const label = `#${entry.id + 1} - ${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      return {
        label,
        shortLabel: `#${entry.id + 1}`,
        time: start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: Math.round(duration),
        startTime: start.toLocaleString(),
        endTime: end.toLocaleString(),
        durationFormatted: `${Math.floor(duration / 60)}m ${Math.round(
          duration % 60
        )}s`,
      };
    });
  }, [history]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Duration:</span>{" "}
              <span className="font-medium text-[#FB6107]">
                {data.durationFormatted} ({data.duration}s)
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Started: {data.startTime}
            </p>
            <p className="text-xs text-muted-foreground">
              Finished: {data.endTime}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate average duration for display
  const avgDuration = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, item) => sum + item.duration, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pipeline Duration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Execution duration for each pipeline run
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
          <Clock className="h-5 w-5" />
          Pipeline Duration
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Execution duration for each pipeline run
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
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
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
