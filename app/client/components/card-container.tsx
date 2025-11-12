import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Database,
  Globe,
  Layers,
  Server,
  XCircle,
} from "lucide-react";

type DataType = {
  Deployment: string;
  Pod: string;
  ReplicaSet: string;
  Service: string;
};

interface StatusCardProps {
  title: string;
  status: string;
  icon: React.ReactNode;
  iconColor: string;
}

function StatusCard({ title, status, icon, iconColor }: StatusCardProps) {
  const isHealthy = status === "Healthy";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={iconColor}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CardContainer({ data }: { data: DataType }) {
  const statusItems = [
    {
      title: "Service",
      status: data?.Service,
      icon: <Globe className="h-4 w-4" />,
      iconColor: "text-blue-600",
    },
    {
      title: "Pod",
      status: data?.Pod,
      icon: <Database className="h-4 w-4" />,
      iconColor: "text-green-600",
    },
    {
      title: "Deployment",
      status: data?.Deployment,
      icon: <Server className="h-4 w-4" />,
      iconColor: "text-purple-600",
    },
    {
      title: "ReplicaSet",
      status: data?.ReplicaSet,
      icon: <Layers className="h-4 w-4" />,
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusItems.map((item, index) => (
        <StatusCard
          key={index}
          title={item.title}
          status={item.status}
          icon={item.icon}
          iconColor={item.iconColor}
        />
      ))}
    </div>
  );
}
