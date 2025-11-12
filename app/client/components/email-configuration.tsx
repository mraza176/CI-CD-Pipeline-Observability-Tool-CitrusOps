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
import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { Eye, EyeOff, Key, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface EmailConfig {
  senderEmail: string;
  senderAppPassword: string;
  receiverEmail: string;
}

export default function EmailConfiguration() {
  const [config, setConfig] = useState<EmailConfig>({
    senderEmail: "",
    senderAppPassword: "",
    receiverEmail: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { data: senderData, fetchData: fetchSenderData } = useFetch(
    "/api/notifier-email"
  );
  const { data: receiverData, fetchData: fetchReceiverData } =
    useFetch("/api/email");
  const { postData, loading } = usePost();

  useEffect(() => {
    fetchSenderData();
    fetchReceiverData();
  }, []);

  useEffect(() => {
    if (senderData) {
      setConfig((prev) => ({
        ...prev,
        senderEmail: senderData.email,
        senderAppPassword: senderData.password,
      }));
    }
  }, [senderData]);

  useEffect(() => {
    if (receiverData) {
      setConfig((prev) => ({
        ...prev,
        receiverEmail: receiverData.email,
      }));
    }
  }, [receiverData]);

  const handleInputChange = (field: keyof EmailConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfiguration = async () => {
    try {
      if (!/\S+@\S+\.\S+/.test(config.senderEmail)) {
        toast.error("Invalid Email Address");
      } else if (!/\S+@\S+\.\S+/.test(config.receiverEmail)) {
        toast.error("Invalid Receiver Email Address");
      } else if (config.senderAppPassword.length < 8) {
        toast.error("Password must be 8 characters long.");
      } else {
        await postData("/api/notifier-email", {
          email: config.senderEmail,
          password: config.senderAppPassword,
        });
        await postData("/api/email", { email: config.receiverEmail });
      }
      toast.success("Email Configuration Saved Successfully!");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error updating Email and Password!");
      }
    }
  };

  const isFormValid =
    config.senderEmail && config.senderAppPassword && config.receiverEmail;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Email Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure Gmail settings for email notifications and alerts
        </p>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Configuration
          </CardTitle>
          <CardDescription>
            Enter your Gmail credentials and notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender Email */}
          <div className="space-y-2">
            <Label htmlFor="senderEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Sender Email
            </Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="your-email@gmail.com"
              value={config.senderEmail}
              onChange={(e) => handleInputChange("senderEmail", e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Gmail address that will send notifications
            </p>
          </div>

          {/* Sender App Password */}
          <div className="space-y-2">
            <Label
              htmlFor="senderAppPassword"
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              App Password
            </Label>
            <div className="relative">
              <Input
                id="senderAppPassword"
                type={showPassword ? "text" : "password"}
                placeholder="16-character app password"
                value={config.senderAppPassword}
                onChange={(e) =>
                  handleInputChange("senderAppPassword", e.target.value)
                }
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Generated App Password from Google Account settings
            </p>
          </div>

          {/* Receiver Email */}
          <div className="space-y-2">
            <Label htmlFor="receiverEmail" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Receiver Email
            </Label>
            <Input
              id="receiverEmail"
              type="email"
              placeholder="notifications@company.com"
              value={config.receiverEmail}
              onChange={(e) =>
                handleInputChange("receiverEmail", e.target.value)
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Email address that will receive notifications
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
                <Mail className="h-4 w-4" />
                Save Email Configuration
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
