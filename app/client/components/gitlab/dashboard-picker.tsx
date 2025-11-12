import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, GitMerge, Workflow } from "lucide-react";
import Link from "next/link";

export default function GitLabDashboardPicker() {
  const dashboards = [
    {
      id: "analytics",
      name: "GitLab Analytics",
      description: "Comprehensive analytics for your GitLab projects",
      route: "/dashboard/gitlab/analytics",
      color: "text-blue-500",
      bgcolor:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
      icon: BarChart3,
      features: [
        "Project Statistics",
        "Pipeline Execution Metrics",
        "Deployment Insights",
      ],
    },
    {
      id: "merge-requests",
      name: "GitLab Merge Requests Analytics",
      description: "Track and analyze your GitLab merge requests",
      route: "/dashboard/gitlab/merge-requests-analytics",
      color: "text-green-500",
      bgcolor:
        "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
      icon: GitMerge,
      features: [
        "MR Status Overview",
        "Time to Merge Metrics",
        "Merge Success Rate",
      ],
    },
    {
      id: "gitlab-pipelines",
      name: "GitLab Pipelines Analytics",
      description: "Analyze and control your GitLab CI/CD pipelines",
      route: "/dashboard/gitlab/pipelines",
      color: "text-orange-500",
      bgcolor:
        "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
      icon: Workflow,
      features: [
        "Pipeline Status Tracking",
        "Job Performance Metrics",
        "Test Coverage Analysis",
      ],
    },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            GitLab Dashboards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your GitLab analytics experience, Each dashboard provides
            specialized insights and metrics tailored to different aspects of
            your Development workflow.
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <Link
                key={dashboard.id}
                href={dashboard.route}
                className="block transition-transform hover:scale-105"
              >
                <Card
                  className={`${dashboard.bgcolor} h-full cursor-pointer hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-20 h-20 rounded-full bg-white dark:bg-gray-800 p-3 shadow-md items-center justify-center flex">
                        {
                          <dashboard.icon
                            size={40}
                            className={`${dashboard.color}`}
                          />
                        }
                      </div>
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Icon className="h-6 w-6" />
                      {dashboard.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {dashboard.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        Key Features:
                      </h4>
                      <ul className="space-y-1">
                        {dashboard.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-center justify-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Call to Action */}
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-background/80 dark:bg-background/60 rounded-lg font-medium text-foreground group">
                        Open Dashboard
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
