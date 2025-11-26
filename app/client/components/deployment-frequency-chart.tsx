import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
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

interface HistoryType {
  id: number;
  timestamp?: string;
  deployedAt?: string;
  createdAt?: string;
}

interface DeploymentFrequencyChartProps {
  history: HistoryType[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Date: ${label}`}</p>
        <p className="text-sm text-muted-foreground">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: data.color }}
          />
          {`${data.value} deployments`}
        </p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          DORA Metric: Deployment Frequency
        </p>
      </div>
    );
  }
  return null;
};

export default function DeploymentFrequencyChart({
  history,
}: DeploymentFrequencyChartProps) {
  // Transform data for Recharts
  const { chartData, avgDeployments } = useMemo(() => {
    if (!history || history.length === 0)
      return { chartData: [], avgDeployments: 0, totalDeployments: 0 };

    // Group deployments by day
    const deploymentsByDay: Record<string, number> = {};

    history.forEach((entry) => {
      // Use the timestamp or deployedAt field to get the deployment date
      const date = new Date(
        entry.timestamp || entry.deployedAt || entry.createdAt || Date.now()
      );
      const dayKey = date.toDateString(); // Format: "Mon Dec 25 2023"

      if (!deploymentsByDay[dayKey]) {
        deploymentsByDay[dayKey] = 0;
      }
      deploymentsByDay[dayKey]++;
    });

    // Sort dates and get last 14 days of data
    const sortedDates = Object.keys(deploymentsByDay)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-14); // Last 14 days

    const chartData = sortedDates.map((date) => {
      const d = new Date(date);
      const formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        date: formattedDate,
        fullDate: d.toLocaleDateString(),
        deployments: deploymentsByDay[date],
      };
    });

    // Calculate metrics
    const deploymentCounts = sortedDates.map((date) => deploymentsByDay[date]);
    const totalDeployments = deploymentCounts.reduce(
      (sum, count) => sum + count,
      0
    );
    const avgDeployments =
      deploymentCounts.length > 0
        ? parseFloat((totalDeployments / deploymentCounts.length).toFixed(1))
        : 0;

    return { chartData, avgDeployments, totalDeployments };
  }, [history]);

  // DORA metric classification
  const getFrequencyLevel = (avg: number) => {
    if (avg >= 1) return { level: "Elite", color: "bg-green-500" };
    if (avg >= 0.5) return { level: "High", color: "bg-blue-500" };
    if (avg >= 0.1) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-red-500" };
  };

  const frequencyMetric = getFrequencyLevel(avgDeployments);

  // Handle empty state
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deployment Frequency
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            DORA Metric: Daily deployment frequency over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              No deployment data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Deployment Frequency
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            DORA Metric: Daily deployment frequency over time
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-muted-foreground">
              Avg:{" "}
              <span className="font-medium text-foreground">
                {avgDeployments}/day
              </span>
            </div>
            <Badge className={`${frequencyMetric.color} text-white`}>
              {frequencyMetric.level}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor" }}
                label={{
                  value: "Date",
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
                  value: "Deployments",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "currentColor" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="deployments"
                stroke="#FB6107"
                strokeWidth={3}
                fill="#FB6107"
                fillOpacity={0.2}
                dot={{ fill: "#FB6107", strokeWidth: 2, stroke: "#fff", r: 6 }}
                activeDot={{
                  r: 8,
                  fill: "#FB6107",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
