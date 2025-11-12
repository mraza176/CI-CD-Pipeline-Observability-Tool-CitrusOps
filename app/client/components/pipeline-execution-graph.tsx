import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  deployStartedAt: string;
};

export default function PipelineExecutionGraph({
  historyData,
}: {
  historyData: HistoryDataType[];
}) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    return historyData.map((item, index) => {
      const date = new Date(item.deployStartedAt);
      const timeLabel = `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;

      return {
        time: timeLabel,
        fullTime: date.toLocaleString(),
        executions: 1,
        index: index + 1,
      };
    });
  }, [historyData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="text-sm font-medium">{data.fullTime}</p>
          <p className="text-sm text-[#FB6107]">
            Executions: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!historyData || historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Executions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Execution timeline over time
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
        <CardTitle>Pipeline Executions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Execution timeline over time
        </p>
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
                dataKey="time"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                domain={[0, 1.2]}
                ticks={[0, 1, 2]}
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="executions"
                fill="#FB6107"
                radius={[2, 2, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
