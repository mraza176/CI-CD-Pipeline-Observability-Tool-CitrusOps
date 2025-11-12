"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, GitBranch, Settings as SettingsIcon } from "lucide-react";
import NotificationSettings from "./notification-settings";
import PipelineSettings from "./pipeline-settings";

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Configure pipeline monitoring and notification preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span>Pipeline Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notification Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Pipeline Settings Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Pipeline Settings */}
          <PipelineSettings />
        </TabsContent>

        {/* Notification Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
