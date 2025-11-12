import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface NotificationSettings {
  gmailEnabled: boolean;
  slackEnabled: boolean;
}

export default function NotificationSettings() {
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      gmailEnabled: false,
      slackEnabled: false,
    });
  const { postData, loading } = usePost();
  const {
    data: gmailData,
    loading: gmailLoading,
    fetchData: fetchGmailData,
  } = useFetch("/api/notification/email");
  const {
    data: slackData,
    loading: slackLoading,
    fetchData: fetchSlackData,
  } = useFetch("/api/notification/slack");

  useEffect(() => {
    fetchGmailData();
    fetchSlackData();
  }, []);

  useEffect(() => {
    if (gmailData) {
      setNotificationSettings((prev) => ({
        ...prev,
        gmailEnabled: gmailData.status === "on",
      }));
    }
  }, [gmailData]);

  useEffect(() => {
    if (slackData) {
      setNotificationSettings((prev) => ({
        ...prev,
        slackEnabled: slackData.status === "on",
      }));
    }
  }, [slackData]);

  const handleNotificationSettingChange = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveNotificationSettings = async () => {
    try {
      await postData("/api/notification/email", {
        status: notificationSettings.gmailEnabled ? "on" : "off",
      });
      await postData("/api/notification/slack", {
        status: notificationSettings.slackEnabled ? "on" : "off",
      });
      toast.success("Notification settings updated successfully!");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating status!");
      }
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure email and Slack notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gmail Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Gmail Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive pipeline alerts and updates via email
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={notificationSettings.gmailEnabled}
                onCheckedChange={(checked) =>
                  handleNotificationSettingChange("gmailEnabled", checked)
                }
              />
              <Badge
                variant={
                  notificationSettings.gmailEnabled ? "default" : "secondary"
                }
              >
                {notificationSettings.gmailEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Slack Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Slack Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send pipeline alerts to configured Slack channels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={notificationSettings.slackEnabled}
                onCheckedChange={(checked) =>
                  handleNotificationSettingChange("slackEnabled", checked)
                }
              />
              <Badge
                variant={
                  notificationSettings.slackEnabled ? "default" : "secondary"
                }
              >
                {notificationSettings.slackEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Configuration Links */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground">
              Configuration Required
            </h4>
            <p className="text-sm text-muted-foreground">
              Make sure to configure your notification services before enabling
              them:
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/notifications/email">
                  <Mail className="h-4 w-4 mr-2" />
                  Configure Gmail
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/notifications/slack">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Configure Slack
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Notification Settings Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveNotificationSettings}
          disabled={loading || gmailLoading || slackLoading}
          size="lg"
          className="min-w-[140px]"
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Notification Settings
          </div>
        </Button>
      </div>
    </>
  );
}
