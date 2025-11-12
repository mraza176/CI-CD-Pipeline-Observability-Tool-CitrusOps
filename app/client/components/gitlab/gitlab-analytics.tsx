"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GitLabDeploymentFrequency from "./gitlab-deployment-frequency";
import GitLabHealthCards from "./gitlab-health-cards";
import GitLabPipelineExecutions from "./gitlab-pipeline-executions";
import GitLabStatsCards from "./gitlab-stats-cards";
import GitLabSuccessRate from "./gitlab-success-rate";

export default function GitLabAnalytics() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    running: 0,
  });

  const fetchGitLabData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }

    try {
      // Fetch GitLab pipelines data
      const response = await axios.get(
        "http://localhost:8001/gitlab/pipelines"
      );
      const pipelineData = response.data.pipelines || [];
      setPipelines(pipelineData);

      // Calculate stats
      const stats = {
        total: pipelineData.length,
        successful: pipelineData.filter((p: any) => p.status === "success")
          .length,
        failed: pipelineData.filter((p: any) => p.status === "failed").length,
        running: pipelineData.filter((p: any) => p.status === "running").length,
      };
      setStats(stats);

      setError(null);
    } catch (err) {
      console.error("Error fetching GitLab data:", err);
      setError("Failed to load GitLab analytics data");
      if (isInitial) {
        toast.error("Error loading GitLab analytics");
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGitLabData(true);

    // Refresh data every 30 seconds - only updates chart data, not entire page
    const interval = setInterval(() => fetchGitLabData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            GitLab Analytics Dashboard
          </h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            GitLab Analytics Dashboard
          </h1>

          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GitLab Analytics Dashboard</h1>

        {/* GitLab Health Cards */}
        <GitLabHealthCards pipelines={pipelines} stats={stats} />

        {/* Stats Cards */}
        <GitLabStatsCards stats={stats} />

        {/* Charts Grid */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="col-span-2">
            <GitLabPipelineExecutions pipelines={pipelines} />
          </div>
          <div>
            <GitLabSuccessRate pipelines={pipelines} />
          </div>
          <div className="col-span-3">
            <GitLabDeploymentFrequency pipelines={pipelines} />
          </div>
        </div>
      </div>
    </div>
  );
}
