import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DefaultLayout from "@/layouts/default";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  Cloud,
  Eye,
  GitBranch,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: GitBranch,
      title: "Seamless Integrations",
      description:
        "Connect with ArgoCD, GitLab, and other DevOps tools for unified pipeline management",
      color:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
      iconColor: "text-blue-600",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Monitor your applications, services, and infrastructure with live dashboards and metrics",
      color:
        "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
      iconColor: "text-green-600",
    },
    {
      icon: Eye,
      title: "Complete Observability",
      description:
        "Gain insights into system performance, deployment success rates, and failure patterns",
      color:
        "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900",
      iconColor: "text-purple-600",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Get instant alerts via email and Slack when issues occur or deployments complete",
      color:
        "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
      iconColor: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "View Dashboards",
      description: "Access your monitoring dashboards",
      href: "/dashboard",
      icon: BarChart3,
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Pipeline Status",
      description: "Check current pipeline status",
      href: "/dashboard/argocd",
      icon: GitBranch,
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Integrations",
      description: "Manage your integrations",
      href: "/integrations",
      icon: Settings,
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  const integrationStats = [
    { label: "Supported Platforms", value: "4", icon: Cloud },
    { label: "Active Integrations", value: "2", icon: CheckCircle },
    { label: "Notification Services", value: "2", icon: Bell },
    { label: "Uptime", value: "99.9%", icon: TrendingUp },
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-background via-background to-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300">
                  <Zap className="h-3 w-3 mr-1" />
                  DevOps Automation Platform
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                  Welcome to <span className="text-orange-600">CitrusOps</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Streamline your DevOps workflow with comprehensive monitoring,
                  observability, and intelligent notifications. Connect all your
                  tools in one unified platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    View Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/integrations">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Setup Integrations
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {integrationStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center space-y-2">
                    <Icon className="h-8 w-8 mx-auto text-orange-600" />
                    <div className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                Powerful Features for Modern DevOps
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to monitor, manage, and optimize your
                deployment pipeline
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className={`${feature.color} h-full hover:shadow-lg transition-all duration-300`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}
                        >
                          <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                Get Started Quickly
              </h2>
              <p className="text-xl text-muted-foreground">
                Jump into the most popular sections of CitrusOps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-8 text-center space-y-4">
                        <div
                          className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300 mx-auto" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integration Showcase */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                Integrations & Notifications
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Connect with your favorite tools and stay informed with smart
                notifications
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Integrations */}
              <Card className="border-2 border-dashed border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-6 w-6 text-orange-600" />
                    Platform Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">ArgoCD</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium">GitLab</span>
                    </div>
                  </div>
                  <Link href="/integrations" className="mt-3 block">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Integrations
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-2 border-dashed border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-6 w-6 text-green-600" />
                    Smart Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Email Alerts</span>
                      <Badge variant="secondary" className="ml-auto">
                        Gmail
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Slack Messages</span>
                      <Badge variant="secondary" className="ml-auto">
                        Bot
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/notifications/email">
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="h-4 w-4 mr-1" />
                        Email Setup
                      </Button>
                    </Link>
                    <Link href="/notifications/slack">
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Slack Setup
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground">
                  Ready to Optimize Your DevOps?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Start monitoring your pipelines and stay ahead of issues with
                  CitrusOps
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Shield className="h-5 w-5 mr-2" />
                    Start Monitoring
                  </Button>
                </Link>
                <Link href="/dashboard/argocd">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6"
                  >
                    <Activity className="h-5 w-5 mr-2" />
                    View Pipelines
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DefaultLayout>
  );
}
