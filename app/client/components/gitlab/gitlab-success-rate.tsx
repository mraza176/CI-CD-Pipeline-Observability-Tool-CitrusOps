"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Pipeline {
  id: string;
  status: string;
  [key: string]: any;
}

interface GitLabSuccessRateProps {
  pipelines?: Pipeline[];
}

const COLORS = {
  success: "#22c55e",
  failed: "#ef4444",
  other: "#6b7280",
};

const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: COLORS.success,
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    color: COLORS.failed,
    icon: XCircle,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-400",
  },
  other: {
    label: "Other",
    color: COLORS.other,
    icon: Clock,
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    textColor: "text-gray-700 dark:text-gray-400",
  },
};

export default function GitLabSuccessRate({
  pipelines = [],
}: GitLabSuccessRateProps) {
  const chartData = useMemo(() => {
    if (!pipelines || pipelines.length === 0) {
      return [
        { name: "Success", value: 0, count: 0 },
        { name: "Failed", value: 0, count: 0 },
        { name: "Other", value: 0, count: 0 },
      ];
    }

    const successful = pipelines.filter((p) => p.status === "success").length;
    const failed = pipelines.filter((p) => p.status === "failed").length;
    const other = pipelines.length - successful - failed;

    return [
      { name: "Success", value: successful, count: successful },
      { name: "Failed", value: failed, count: failed },
      { name: "Other", value: other, count: other },
    ].filter((item) => item.value > 0);
  }, [pipelines]);

  const totalPipelines = pipelines.length;
  const successRate =
    totalPipelines > 0
      ? (
          ((chartData.find((d) => d.name === "Success")?.value || 0) /
            totalPipelines) *
          100
        ).toFixed(1)
      : "0";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage =
        totalPipelines > 0
          ? ((data.value / totalPipelines) * 100).toFixed(1)
          : "0";

      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">Count: {data.value}</p>
          <p className="text-sm text-muted-foreground">
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const statusKey =
            entry.value.toLowerCase() as keyof typeof STATUS_CONFIG;
          const config = STATUS_CONFIG[statusKey];
          const Icon = config?.icon || Clock;

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </div>
            Pipeline Success Rate
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            {successRate}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  const statusKey =
                    entry.name.toLowerCase() as keyof typeof COLORS;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[statusKey] || COLORS.other}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const dataItem = chartData.find(
              (d) => d.name.toLowerCase() === key
            );
            const count = dataItem?.count || 0;
            const percentage =
              totalPipelines > 0
                ? ((count / totalPipelines) * 100).toFixed(1)
                : "0";
            const Icon = config.icon;

            return (
              <div key={key} className={`rounded-lg p-3 ${config.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                  <Badge variant="secondary" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${config.textColor}`}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Pipeline Count */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total Pipelines:{" "}
            <span className="font-semibold text-foreground">
              {totalPipelines}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

GitLabSuccessRate.displayName = "GitLabSuccessRate";
