"use client";

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
import usePost from "@/hooks/usePost";
import { Eye, EyeOff, Hash, Key, MessageSquare } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface SlackConfig {
  channelId: string;
  botToken: string;
}

export default function SlackConfiguration() {
  const [config, setConfig] = useState<SlackConfig>({
    channelId: "",
    botToken: "",
  });
  const [showToken, setShowToken] = useState(false);
  const { postData, loading } = usePost();

  const handleInputChange = (field: keyof SlackConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfiguration = async () => {
    try {
      await postData("/api/slack", {
        token: config.botToken,
        channel: config.channelId,
      });
      toast.success("Slack configuration saved successfully!");
    } catch (error: any) {
      if (error?.response?.data?.error) toast.error(error.response.data.error);
      else toast.error("We are facing some issue. Try Again!");
    }
  };

  const isFormValid = config.channelId && config.botToken;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Slack Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure Slack bot integration for notifications and alerts
        </p>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Slack Integration Settings
          </CardTitle>
          <CardDescription>
            Configure your Slack bot credentials and target channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel ID */}
          <div className="space-y-2">
            <Label htmlFor="channelId" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Channel ID
            </Label>
            <Input
              id="channelId"
              type="text"
              placeholder="C1234567890"
              value={config.channelId}
              onChange={(e) => handleInputChange("channelId", e.target.value)}
              className="w-full font-mono"
            />
            <p className="text-xs text-muted-foreground">
              The Slack channel ID where notifications will be sent (starts with
              'C')
            </p>
          </div>

          {/* Bot Token */}
          <div className="space-y-2">
            <Label htmlFor="botToken" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Bot User OAuth Token
            </Label>
            <div className="relative">
              <Input
                id="botToken"
                type={showToken ? "text" : "password"}
                placeholder="xoxb-your-bot-token-here"
                value={config.botToken}
                onChange={(e) => handleInputChange("botToken", e.target.value)}
                className="w-full pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bot User OAuth Token from your Slack app (starts with 'xoxb-')
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSaveConfiguration}
              disabled={!isFormValid || loading}
              className="w-full"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Save Slack Configuration
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
