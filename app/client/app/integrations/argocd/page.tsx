import ArgocdForm from "@/components/argocd-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DefaultLayout from "@/layouts/default";
import { ArrowLeft, Info, Key } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ArgoCD() {
  const setupSteps = [
    {
      step: 1,
      title: "Access ArgoCD UI",
      description:
        "Log into your ArgoCD dashboard to get the required credentials",
    },
    {
      step: 2,
      title: "Generate API Token",
      description:
        "Create a new API token from User Info → Generate New (Token)",
    },
    {
      step: 3,
      title: "Get API Endpoint",
      description:
        "Copy your ArgoCD API URL (usually ends with /api/v1/applications)",
    },
    {
      step: 4,
      title: "Configure Integration",
      description: "Enter your credentials in the form below to complete setup",
    },
  ];

  return (
    <DefaultLayout>
      <div className="p-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/integrations"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Integrations
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-sm">
            <Image
              src="/argocd.png"
              alt="ArgoCD logo"
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              ArgoCD Integration
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                GitOps
              </Badge>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect your ArgoCD instance for GitOps continuous delivery
              monitoring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Column - Configuration Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Enter your ArgoCD credentials to establish the connection
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <ArgocdForm />
              </CardContent>
            </Card>
          </div>

          {/* Left Column - Information */}
          <div className="space-y-6">
            {/* Setup Instructions */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Info className="h-5 w-5" />
                  Setup Instructions
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">
                  Follow these steps to integrate your ArgoCD instance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {setupSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                        {step.title}
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
