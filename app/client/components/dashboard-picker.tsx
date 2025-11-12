import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GitBranch, Workflow } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPicker() {
  const dashboards = [
    {
      id: "argocd",
      name: "ArgoCD",
      description: "GitOps continuous delivery tool for Kubernetes",
      image: "/argocd.png",
      route: "/dashboard/argocd",
      color:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
      icon: GitBranch,
      features: [
        "Kubernetes Deployments",
        "Git Repository Sync",
        "Application Health",
      ],
    },
    {
      id: "gitlab",
      name: "GitLab",
      description: "Complete DevOps platform with CI/CD pipelines",
      image: "/gitlab.png",
      route: "/dashboard/gitlab",
      color:
        "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
      icon: Workflow,
      features: ["Pipeline Management", "Code Repository", "Issue Tracking"],
    },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the platform you want to monitor and manage. Each dashboard
            provides comprehensive insights and controls for your specific
            workflow.
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
                  className={`${dashboard.color} h-full cursor-pointer hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-20 h-20 rounded-full bg-white dark:bg-gray-800 p-3 shadow-md">
                        <Image
                          src={dashboard.image}
                          alt={`${dashboard.name} logo`}
                          fill
                          className="object-contain p-2"
                        />
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
