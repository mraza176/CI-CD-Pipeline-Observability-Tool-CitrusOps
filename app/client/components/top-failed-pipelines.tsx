import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

interface FailedExecution {
  timestamp?: string;
  time?: string;
  createdAt?: string;
}

interface MostRecentFailed {
  pipeline: string;
  failedExecution?: FailedExecution;
}

interface TopFailedPipeline {
  pipeline: string;
  count: number;
}

interface TopFailedPipelinesProps {
  topFailedPipeline: TopFailedPipeline | null;
  mostRecentFailed: MostRecentFailed | null;
  pipelineName: string;
}

export default function TopFailedPipelines({
  topFailedPipeline,
  mostRecentFailed,
  pipelineName,
}: TopFailedPipelinesProps) {
  const formatTimestamp = (execution?: FailedExecution) => {
    if (!execution) return null;

    const timestamp =
      execution.timestamp || execution.time || execution.createdAt;
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="mb-6">
      {/* Pipeline Name */}
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Pipeline: {pipelineName}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Recent Failed Pipeline Card */}
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Recent Failed Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostRecentFailed && mostRecentFailed.failedExecution ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-300">
                    {mostRecentFailed.pipeline}
                  </h3>
                  <Badge variant="destructive" className="mt-2">
                    Failed
                  </Badge>
                </div>

                <div className="space-y-2">
                  {formatTimestamp(mostRecentFailed.failedExecution) && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Failed at:</span>
                      <span>
                        {formatTimestamp(mostRecentFailed.failedExecution)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <XCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  No recent failures
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  All pipelines are running successfully
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Failed Pipeline Card */}
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Most Failed Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topFailedPipeline ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">
                    {topFailedPipeline.pipeline}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                  >
                    High Failure Rate
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Total Failures:</span>
                  <span className="font-bold text-lg text-orange-800 dark:text-orange-300">
                    {topFailedPipeline.count}
                  </span>
                </div>

                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 mt-3">
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    This pipeline requires attention to improve reliability
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  No repeated failures
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  All pipelines are performing well
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
