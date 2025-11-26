import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DataType = {
  Pod: string;
  Service: string;
  Deployment: string;
  ReplicaSet: string;
  timestamp: string;
};

export default function TimeSeriesGraph({ data }: { data: DataType[] }) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const time = new Date(item.timestamp);
      return {
        index: index + 1,
        time: time.toLocaleTimeString(),
        fullTime: time.toLocaleString(),
        Pod: item.Pod === "Healthy" ? 1 : 0,
        Service: item.Service === "Healthy" ? 1 : 0,
        Deployment: item.Deployment === "Healthy" ? 1 : 0,
        ReplicaSet: item.ReplicaSet === "Healthy" ? 1 : 0,
      };
    });
  }, [data]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="text-sm font-medium mb-2">{data.fullTime}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">
                  {entry.dataKey}: {entry.value === 1 ? "Healthy" : "Unhealthy"}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time status monitoring for all components
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Status Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time status monitoring for all components (1 = Healthy, 0 =
          Unhealthy)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                tickFormatter={(value) =>
                  value === 1 ? "Healthy" : "Unhealthy"
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingBottom: "20px" }}
                iconType="line"
                verticalAlign="top"
              />

              {/* Pod Status Line */}
              <Line
                type="monotone"
                dataKey="Pod"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4, fill: "#22c55e" }}
                activeDot={{ r: 6, fill: "#22c55e" }}
                name="Pod"
              />

              {/* Service Status Line */}
              <Line
                type="monotone"
                dataKey="Service"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
                name="Service"
              />

              {/* Deployment Status Line */}
              <Line
                type="monotone"
                dataKey="Deployment"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#8b5cf6" }}
                activeDot={{ r: 6, fill: "#8b5cf6" }}
                name="Deployment"
              />

              {/* ReplicaSet Status Line */}
              <Line
                type="monotone"
                dataKey="ReplicaSet"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4, fill: "#f59e0b" }}
                activeDot={{ r: 6, fill: "#f59e0b" }}
                name="ReplicaSet"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
