import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function PipelineSuccessRate({ history }: any) {
  const { successCount, failureCount, total, successRate, rateLevel } =
    useMemo(() => {
      if (!history || history.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          total: 0,
          successRate: 0,
          rateLevel: "unknown",
        };
      }

      let successCount = 0;
      let failureCount = 0;

      history.forEach((data: any) => {
        const { deployment, service, pod, replicaSet } = data.summary;
        if (
          deployment === "Healthy" &&
          service === "Healthy" &&
          pod === "Healthy" &&
          replicaSet === "Healthy"
        ) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      const total = successCount + failureCount;
      const successRate =
        total === 0 ? 0 : parseFloat(((successCount / total) * 100).toFixed(1));

      // Determine success rate level
      let rateLevel = "low";
      if (successRate >= 95) rateLevel = "excellent";
      else if (successRate >= 85) rateLevel = "good";
      else if (successRate >= 70) rateLevel = "fair";

      return { successCount, failureCount, total, successRate, rateLevel };
    }, [history]);

  // const getRateLevelConfig = (level: string) => {
  //   switch (level) {
  //     case "excellent":
  //       return {
  //         color: "bg-green-500",
  //         textColor: "text-green-600",
  //         icon: CheckCircle,
  //       };
  //     case "good":
  //       return {
  //         color: "bg-blue-500",
  //         textColor: "text-blue-600",
  //         icon: CheckCircle,
  //       };
  //     case "fair":
  //       return {
  //         color: "bg-yellow-500",
  //         textColor: "text-yellow-600",
  //         icon: AlertCircle,
  //       };
  //     case "low":
  //       return {
  //         color: "bg-red-500",
  //         textColor: "text-red-600",
  //         icon: AlertCircle,
  //       };
  //     default:
  //       return {
  //         color: "bg-gray-500",
  //         textColor: "text-gray-600",
  //         icon: AlertCircle,
  //       };
  //   }
  // };

  // const levelConfig = getRateLevelConfig(rateLevel);

  // Handle empty state
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pipeline Success Rate
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overall pipeline deployment success rate
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground">No pipeline data available</p>
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
          Pipeline Success Rate
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Overall pipeline deployment success rate
          </p>
          <Badge className="bg-green-500 text-white">
            {rateLevel.charAt(0).toUpperCase() + rateLevel.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Main Success Rate Display */}
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600">
                {successRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">
                Success:{" "}
                <span className="font-medium text-foreground">
                  {successCount}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">
                Failed:{" "}
                <span className="font-medium text-foreground">
                  {failureCount}
                </span>
              </span>
            </div>
            <div className="text-muted-foreground">
              Total:{" "}
              <span className="font-medium text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
