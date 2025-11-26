import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { AlertTriangle, Bell, Eye, GitBranch, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PipelineSettings {
  observabilityEnabled?: boolean;
  deviationValue?: number;
  customNotificationMessage?: string;
}

export default function PipelineSettings() {
  const [pipelineSettings, setPipelineSettings] = useState<PipelineSettings>({
    observabilityEnabled: false,
    deviationValue: 0,
    customNotificationMessage: "",
  });
  const [request, setRequest] = useState("/api/cronjob/status");
  const { postData, loading: postRequestLoading } = usePost();
  const { data, loading, fetchData } = useFetch(request);
  const {
    data: deviationData,
    error: deviationError,
    loading: deviationLoading,
    fetchData: fetchDeviationValue,
  } = useFetch("/api/deviation-value");
  const {
    data: messageData,
    error: messageError,
    loading: messageLoading,
    fetchData: fetchMessageData,
  } = useFetch("/api/custom-message");

  useEffect(() => {
    fetchData();
  }, [request]);

  useEffect(() => {
    fetchDeviationValue();
    fetchMessageData();
  }, []);

  useEffect(() => {
    if (deviationData) {
      setPipelineSettings((prev) => ({
        ...prev,
        deviationValue: deviationData.deviationValue,
      }));
    } else if (deviationError) {
      toast.error(deviationError);
    }
  }, [deviationData, deviationError]);

  useEffect(() => {
    if (messageData) {
      setPipelineSettings((prev) => ({
        ...prev,
        customNotificationMessage: messageData.customMessage,
      }));
    } else if (messageError) {
      toast.error(messageError);
    }
  }, [messageData, messageError]);

  useEffect(() => {
    if (data) {
      if (data.message === "Cronjob Stopped") {
        setPipelineSettings((prev) => ({
          ...prev,
          observabilityEnabled: false,
        }));
      } else if (data.message === "Cronjob started") {
        setPipelineSettings((prev) => ({
          ...prev,
          observabilityEnabled: true,
        }));
      } else if (data?.message) {
        setPipelineSettings((prev) => ({
          ...prev,
          observabilityEnabled: !!data.message,
        }));
      }
    }
  }, [data]);

  const handlePipelineSettingChange = (
    key: keyof PipelineSettings,
    value: boolean | number | string
  ) => {
    setPipelineSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePipelineSettings = async () => {
    try {
      if (pipelineSettings.observabilityEnabled) {
        setRequest("/api/runcronjob");
      } else {
        setRequest("/api/stopcronjob");
      }
      await postData("/api/deviation-value", {
        deviation_value: pipelineSettings.deviationValue?.toString(),
      });
      await postData("/api/custom-message", {
        custom_message: pipelineSettings.customNotificationMessage,
      });
      toast.success("Pipeline settings updated successfully!");
    } catch {
      toast.error("Failed to update pipeline settings.");
    }
  };

  const isPipelineSettingsValid =
    pipelineSettings.deviationValue &&
    pipelineSettings.customNotificationMessage;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-600" />
            Pipeline Settings
          </CardTitle>
          <CardDescription>
            Configure pipeline monitoring and observability options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pipeline Observability Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Pipeline Observability
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable comprehensive monitoring and tracking of pipeline metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={pipelineSettings.observabilityEnabled}
                onCheckedChange={(checked) =>
                  handlePipelineSettingChange("observabilityEnabled", checked)
                }
              />
              <Badge
                variant={
                  pipelineSettings.observabilityEnabled
                    ? "default"
                    : "secondary"
                }
              >
                {pipelineSettings.observabilityEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Deviation Value */}
          <div className="space-y-3">
            <Label
              htmlFor="deviationValue"
              className="text-base font-medium flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Deviation Threshold (%)
            </Label>
            <div className="space-y-2">
              <Input
                id="deviationValue"
                type="number"
                min="0"
                max="100"
                value={pipelineSettings.deviationValue}
                onChange={(e) =>
                  handlePipelineSettingChange(
                    "deviationValue",
                    parseInt(e.target.value) || 0
                  )
                }
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Trigger alerts when pipeline metrics deviate by this percentage
                (0-100%)
              </p>
            </div>
          </div>

          {/* Custom Notification Message */}
          <div className="space-y-3">
            <Label
              htmlFor="notificationMessage"
              className="text-base font-medium flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Custom Notification Message
            </Label>
            <div className="space-y-3">
              <Textarea
                id="notificationMessage"
                placeholder="Enter your custom notification message..."
                value={pipelineSettings.customNotificationMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handlePipelineSettingChange(
                    "customNotificationMessage",
                    e.target.value
                  )
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Pipeline Settings Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSavePipelineSettings}
          disabled={
            !isPipelineSettingsValid ||
            loading ||
            deviationLoading ||
            postRequestLoading ||
            messageLoading
          }
          size="lg"
          className="min-w-[140px]"
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Pipeline Settings
          </div>
        </Button>
      </div>
    </>
  );
}
