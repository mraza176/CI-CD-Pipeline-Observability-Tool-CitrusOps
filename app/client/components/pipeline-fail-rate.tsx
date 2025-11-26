import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, XCircle } from "lucide-react";
import { useMemo } from "react";

export default function PipelineFailRate({ history }: any) {
  const { successCount, failureCount, total, failureRate, rateLevel } =
    useMemo(() => {
      if (!history || history.length === 0) {
        return {
          successCount: 0,
          failureCount: 0,
          total: 0,
          failureRate: 0,
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
      const failureRate =
        total === 0 ? 0 : parseFloat(((failureCount / total) * 100).toFixed(1));

      // Determine failure rate level (inverse of success rate)
      let rateLevel = "excellent";
      if (failureRate >= 30) rateLevel = "critical";
      else if (failureRate >= 15) rateLevel = "high";
      else if (failureRate >= 5) rateLevel = "moderate";

      return { successCount, failureCount, total, failureRate, rateLevel };
    }, [history]);

  // const getRateLevelConfig = (level: string) => {
  //   switch (level) {
  //     case "critical":
  //       return { color: "bg-red-600", textColor: "text-red-600" };
  //     case "high":
  //       return { color: "bg-red-500", textColor: "text-red-500" };
  //     case "moderate":
  //       return { color: "bg-orange-500", textColor: "text-orange-500" };
  //     case "excellent":
  //       return { color: "bg-red-400", textColor: "text-red-400" };
  //     default:
  //       return { color: "bg-gray-500", textColor: "text-gray-600" };
  //   }
  // };

  // const levelConfig = getRateLevelConfig(rateLevel);

  // Handle empty state
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Pipeline Failure Rate
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overall pipeline deployment failure rate
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
          <TrendingDown className="h-5 w-5" />
          Pipeline Failure Rate
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Overall pipeline deployment failure rate
          </p>
          <Badge className="bg-red-500 text-white">
            {rateLevel.charAt(0).toUpperCase() + rateLevel.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Main Failure Rate Display */}
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="text-center">
              <div className="text-6xl font-bold text-red-600">
                {failureRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Failure Rate</p>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">
                Failed:{" "}
                <span className="font-medium text-foreground">
                  {failureCount}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">
                Success:{" "}
                <span className="font-medium text-foreground">
                  {successCount}
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
