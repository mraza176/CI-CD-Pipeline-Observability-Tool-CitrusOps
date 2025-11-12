import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefaultLayout from "@/layouts/default";
import {
  ArrowRight,
  CheckCircle,
  GitBranch,
  Settings,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Integrations() {
  const platformIntegrations = [
    {
      id: "argocd",
      name: "ArgoCD",
      description: "GitOps continuous delivery tool for Kubernetes deployments",
      image: "/argocd.png",
      route: "/integrations/argocd",
      color:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
      statusColor:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: GitBranch,
      features: [
        "Kubernetes Application Management",
        "Git Repository Synchronization",
        "Deployment Status Monitoring",
        "Automated Rollbacks",
      ],
    },
    {
      id: "gitlab",
      name: "GitLab",
      description: "Complete DevOps platform with integrated CI/CD pipelines",
      image: "/gitlab.png",
      route: "/integrations/gitlab",
      color:
        "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
      statusColor:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Workflow,
      features: [
        "CI/CD Pipeline Management",
        "Source Code Repository",
        "Issue & Merge Request Tracking",
        "Container Registry",
      ],
    },
  ];

  return (
    <DefaultLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Integrations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Connect and manage your DevOps tools, monitoring platforms, and
            notification services in one centralized location.
          </p>
        </div>

        {/* Platform Integrations */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-semibold text-foreground">
              Platform Integrations
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {platformIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card
                  key={integration.id}
                  className={`${integration.color} hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-sm">
                          <Image
                            src={integration.image}
                            alt={`${integration.name} logo`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-2xl">
                            <Icon className="h-7 w-7" />
                            {integration.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-4">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-3">
                        Key Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {integration.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link href={integration.route} className="flex-1">
                        <Button className="w-full">
                          <Settings className="h-4 w-4" />
                          Configure
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </DefaultLayout>
  );
}
