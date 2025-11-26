"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  GitMerge,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GitLabMergeRequestAnalytics = () => {
  const [mrData, setMrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchMRData = async () => {
    try {
      setLoading(true);

      // Fetch merge requests
      const response = await fetch(
        "http://localhost:8001/gitlab/merge-requests"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Merge Request Data:", data);

      // Process the data for analytics
      const processedData = processMRData(data.merge_requests || []);
      setMrData(processedData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching MR data:", err);
      setError(err.message);
      // Set fallback data
      setMrData(processMRData([]));
    } finally {
      setLoading(false);
    }
  };

  const processMRData = (mergeRequests: any) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter MRs from last 30 days
    const recentMRs = mergeRequests.filter(
      (mr: any) => new Date(mr.created_at) >= thirtyDaysAgo
    );

    // Calculate stats
    const totalMRs = recentMRs.length;
    const mergedMRs = recentMRs.filter((mr: any) => mr.state === "merged");
    const openMRs = recentMRs.filter((mr: any) => mr.state === "opened");
    const closedMRs = recentMRs.filter((mr: any) => mr.state === "closed");

    // Calculate merge times (in hours)
    const mergeTimes = mergedMRs
      .filter((mr: any) => mr.merged_at && mr.created_at)
      .map((mr: any) => {
        const created = new Date(mr.created_at).getTime();
        const merged = new Date(mr.merged_at).getTime();
        return (merged - created) / (1000 * 60 * 60); // Convert to hours
      });

    const avgMergeTime =
      mergeTimes.length > 0
        ? mergeTimes.reduce((a: any, b: any) => a + b, 0) / mergeTimes.length
        : 0;

    // Author activity
    const authorActivity: any = {};
    recentMRs.forEach((mr: any) => {
      const author = mr.author?.username || "Unknown";
      if (!authorActivity[author]) {
        authorActivity[author] = {
          created: 0,
          merged: 0,
          avatar: mr.author?.avatar_url,
        };
      }
      authorActivity[author].created++;
      if (mr.state === "merged") {
        authorActivity[author].merged++;
      }
    });

    // Branch patterns
    const targetBranches: any = {};
    recentMRs.forEach((mr: any) => {
      const target = mr.target_branch || "unknown";
      targetBranches[target] = (targetBranches[target] || 0) + 1;
    });

    // Daily activity for last 7 days
    const dailyActivity: any = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dailyActivity[dateStr] = { created: 0, merged: 0 };
    }

    recentMRs.forEach((mr: any) => {
      const createdDate = new Date(mr.created_at).toISOString().split("T")[0];
      if (dailyActivity[createdDate]) {
        dailyActivity[createdDate].created++;
      }

      if (mr.merged_at) {
        const mergedDate = new Date(mr.merged_at).toISOString().split("T")[0];
        if (dailyActivity[mergedDate]) {
          dailyActivity[mergedDate].merged++;
        }
      }
    });

    return {
      totalMRs,
      mergedCount: mergedMRs.length,
      openCount: openMRs.length,
      closedCount: closedMRs.length,
      avgMergeTime,
      mergeTimes,
      authorActivity: Object.entries(authorActivity)
        .map(([author, stats]: [string, any]) => ({ author, ...stats }))
        .sort((a: any, b: any) => b.created - a.created)
        .slice(0, 10),
      targetBranches: Object.entries(targetBranches)
        .map(([branch, count]: [string, any]) => ({ branch, count }))
        .sort((a: any, b: any) => b.count - a.count),
      dailyActivity: Object.entries(dailyActivity).map(
        ([date, stats]: [string, any]) => ({
          date,
          ...stats,
        })
      ),
    };
  };

  useEffect(() => {
    fetchMRData();
    const interval = setInterval(fetchMRData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="h-64">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-600" />
                <div className="text-lg font-semibold text-foreground">
                  Loading MR Analytics...
                </div>
                <div className="text-sm text-muted-foreground">
                  Fetching merge request data from GitLab
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    Error Loading Merge Request Data
                  </h3>
                  <p className="text-muted-foreground">{error}</p>
                  <Button
                    onClick={fetchMRData}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 border-orange-600 border rounded-xl bg-gradient-to-br from-orange-800/20 to-orange-900/20">
              <GitMerge className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                GitLab Merge Request Analytics
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive analysis of merge request activity, velocity, and
            collaboration patterns
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last 30 days
            </Badge>
            <Button
              onClick={fetchMRData}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced MR Velocity Cards */}
        <MRVelocityCards data={mrData} />

        {/* Charts Grid with Better Spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time to Merge Analysis - spans 2 columns */}
          <div className="lg:col-span-2">
            <TimeToMergeChart data={mrData} />
          </div>

          {/* Merge Rate - spans 1 column */}
          <div className="lg:col-span-1">
            <MergeRateChart data={mrData} />
          </div>

          {/* Author Activity - full width */}
          <div className="lg:col-span-3">
            <AuthorActivityChart data={mrData} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced MR Velocity Cards Component
const MRVelocityCards = ({ data }: { data: any }) => {
  const cards = [
    {
      title: "Total MRs",
      subtitle: "Last 30 days",
      value: data?.totalMRs || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      icon: Activity,
      trend: "+12%",
    },
    {
      title: "Merged MRs",
      subtitle: "Successfully merged",
      value: data?.mergedCount || 0,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      icon: CheckCircle,
      trend: "+8%",
    },
    {
      title: "Open MRs",
      subtitle: "Awaiting review",
      value: data?.openCount || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      icon: GitMerge,
      trend: "+3%",
    },
    {
      title: "Avg Merge Time",
      subtitle: "Time to merge",
      value: data?.avgMergeTime ? `${Math.round(data.avgMergeTime)}h` : "0h",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      icon: Clock,
      trend: "-15%",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value.toLocaleString()}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      card.trend.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {card.trend}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Enhanced Time to Merge Chart Component
const TimeToMergeChart = forwardRef<any, { data: any }>(({ data }, ref) => {
  useImperativeHandle(ref, () => ({
    updateChart: (newData: any) => {
      console.log("Updating Time to Merge chart with:", newData);
    },
  }));

  const buckets = [
    {
      label: "<6h",
      min: 0,
      max: 6,
      count: 0,
      color: "#FB6107",
    },
    {
      label: "6-24h",
      min: 6,
      max: 24,
      count: 0,
      color: "#FB6107",
    },
    {
      label: "1-3d",
      min: 24,
      max: 72,
      count: 0,
      color: "#FB6107",
    },
    {
      label: "3-7d",
      min: 72,
      max: 168,
      count: 0,
      color: "#FB6107",
    },
    {
      label: ">7d",
      min: 168,
      max: Infinity,
      count: 0,
      color: "#FB6107",
    },
  ];

  if (data?.mergeTimes) {
    data.mergeTimes.forEach((time: number) => {
      const bucket = buckets.find((b) => time >= b.min && time < b.max);
      if (bucket) bucket.count++;
    });
  }

  const chartData = buckets.map((bucket) => ({
    label: bucket.label,
    count: bucket.count,
    fill: bucket.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Time to Merge Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of merge request completion times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 12 }} stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#FB6107" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data?.mergeTimes?.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <div>No merge time data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Enhanced Merge Rate Chart Component
const MergeRateChart = forwardRef<any, { data: any }>(({ data }, ref) => {
  useImperativeHandle(ref, () => ({
    updateChart: (newData: any) => {
      console.log("Updating Merge Rate chart with:", newData);
    },
  }));

  const mergeRate =
    data?.totalMRs > 0
      ? Math.round((data.mergedCount / data.totalMRs) * 100)
      : 0;

  const getColorClass = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const chartData = [
    { name: "Merged", value: data?.mergedCount || 0, color: "#10b981" },
    { name: "Open", value: data?.openCount || 0, color: "#FB6107" },
    { name: "Closed", value: data?.closedCount || 0, color: "#6b7280" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-[#FB6107]" />
          Merge Success Rate
        </CardTitle>
        <CardDescription>Percentage of successfully merged MRs</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span
                className={`text-3xl font-bold ${getColorClass(mergeRate)}`}
              >
                {mergeRate}%
              </span>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="text-green-600 font-semibold">
              {data?.mergedCount || 0}
            </span>{" "}
            merged of{" "}
            <span className="text-blue-600 font-semibold">
              {data?.totalMRs || 0}
            </span>{" "}
            total
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#FB6107] rounded-full"></div>
              <span className="text-muted-foreground">
                {data?.openCount || 0} Open
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-muted-foreground">
                {data?.closedCount || 0} Closed
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Enhanced Author Activity Chart Component
const AuthorActivityChart = forwardRef<any, { data: any }>(({ data }, ref) => {
  useImperativeHandle(ref, () => ({
    updateChart: (newData: any) => {
      console.log("Updating Author Activity chart with:", newData);
    },
  }));

  const maxActivity = Math.max(
    ...(data?.authorActivity?.map((a: any) => a.created) || [1])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#FB6107]" />
          Top Contributors
        </CardTitle>
        <CardDescription>
          Most active developers in the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {data?.authorActivity?.length > 0 ? (
            data.authorActivity.map((author: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                {/* Avatar */}
                <div className="relative">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.author}
                      className="w-12 h-12 rounded-full ring-2 ring-border group-hover:ring-[#FB6107]/30 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FB6107] to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold ring-2 ring-border group-hover:ring-[#FB6107]/30 transition-all duration-200">
                      {author.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold group-hover:text-[#FB6107] transition-colors duration-200">
                      {author.author}
                    </span>
                    <div className="flex space-x-4 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        {author.created} MRs
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs text-green-600"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {author.merged} merged
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {author.created > 0
                          ? Math.round((author.merged / author.created) * 100)
                          : 0}
                        % rate
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FB6107] to-orange-500 h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${(author.created / maxActivity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium mb-2">
                No contributor data available
              </div>
              <div className="text-sm">
                Create some merge requests to see activity here
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default GitLabMergeRequestAnalytics;
