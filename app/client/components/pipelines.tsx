"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { BarChart3, History, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Pipelines() {
  const [pipelines, setPipelines] = useState<string[]>([]);
  const [filteredPipelines, setFilteredPipelines] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);

  const {
    data: pipelineData,
    error,
    loading,
    fetchData,
  } = useFetch("/all_pipelines");

  useEffect(() => {
    if (!loading) {
      setLoading(false);
      if (pipelineData) {
        console.log("Pipeline Data:", pipelineData);

        setPipelines(pipelineData.available_pipeline);
        setFilteredPipelines(pipelineData.available_pipeline);
      }
      if (error) toast.error("Error fetching Pipelines!");
    }
  }, [pipelineData, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value.toLowerCase();
    if (search === "") {
      setFilteredPipelines(pipelines);
    } else {
      const filtered = pipelines.filter((pipeline) =>
        pipeline.toLowerCase().includes(search)
      );
      setFilteredPipelines(filtered);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading pipelines...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Available Pipelines
        </h2>
        <p className="text-muted-foreground">
          Manage and monitor your CI/CD pipelines
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pipelines..."
          onChange={handleChange}
          className="pl-10"
        />
      </div>

      {/* Pipeline Grid */}
      {filteredPipelines.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {pipelines.length === 0
              ? "No pipelines found"
              : "No pipelines match your search"}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPipelines.map((pipeline, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-card-foreground">
                  {pipeline}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/argocd/pipeline?pipeline=${encodeURIComponent(
                      pipeline
                    )}`}
                    className="flex-1"
                  >
                    <Button variant="default" size="sm" className="w-full">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/argocd/pipelineHistory?pipeline=${encodeURIComponent(
                      pipeline
                    )}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
