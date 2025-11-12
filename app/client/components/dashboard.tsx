"use client";

import instance from "@/axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardContainer from "./card-container";
import DeploymentFrequencyChart from "./deployment-frequency-chart";
import PipelineDurationChart from "./pipeline-duration-chart";
import PipelineDurationDistribution from "./pipeline-duration-distribution";
import PipelineExecutionGraph from "./pipeline-execution-graph";
import PipelineFailRate from "./pipeline-fail-rate";
import PipelineSuccessRate from "./pipeline-success-rate";
import TimeSeriesGraph from "./time-series-graph";
import TopFailedPipelines from "./top-failed-pipelines";
import TopSlowPipelines from "./top-slow-pipelines";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [pipelineData, setPipelineData] = useState<any>([]);
  const [currentData, setCurrentData] = useState<any>(null);
  const [status, setStatus] = useState<any>({});
  const [pipelineName, setPipelineName] = useState("");
  const [history, setHistory] = useState();
  const [mostRecentFailed, setMostRecentFailed] = useState<any>(null);
  const [topFailedPipeline, setTopFailedPipeline] = useState<any>(null);

  async function fetchPipelineData() {
    try {
      const response = await instance.get("/pipeline_history", {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("userData") as string).token
          }`,
        },
        params: {
          pipeline: `${pipelineName}`,
        },
      });

      console.log("Pipeline rate data: ", response.data);

      setHistory(response.data);
    } catch (error: any) {
      console.log("Error fetching pipeline data:", error.message);
    }
  }

  useEffect(() => {
    setPipelineName(searchParams.get("pipeline") as string);

    fetchPipelineData();
    // Web Socket Connection
    const ws = new WebSocket("ws://localhost:8000/pipeline_state");

    // On connection open sending data(pipeline name)
    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ Name: pipelineName }));
    };

    // Receving data from the server
    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);

      // console.log("Received data:", receivedData.Status);
      setStatus(receivedData.Status);

      const updatedData = {
        Pod: receivedData.Pod,
        Service: receivedData.Service,
        Deployment: receivedData.Deployment,
        ReplicaSet: receivedData.ReplicaSet,
        timestamp: new Date().toISOString(),
      };

      // Update pipelineData in increasing order
      setPipelineData((prevData: any) => [...prevData, updatedData]);
      setCurrentData({
        Pod: receivedData.Pod,
        Service: receivedData.Service,
        Deployment: receivedData.Deployment,
        ReplicaSet: receivedData.ReplicaSet,
      });
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    return () => {
      console.log("Closing WebSocket Connection!");
      ws.close();
    };
  }, [pipelineName]);

  useEffect(() => {
    async function fetchAllPipelineFailures() {
      try {
        // 1. Fetch all pipeline names
        const pipelinesRes = await instance.get("/all_pipelines", {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("userData") as string).token
            }`,
          },
        });
        const pipelines = pipelinesRes.data.available_pipeline;
        // 2. Fetch history for each pipeline
        const histories = await Promise.all(
          pipelines.map(async (pipeline: any) => {
            try {
              const res = await instance.get("/pipeline_history", {
                headers: {
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("userData") as string).token
                  }`,
                },
                params: { pipeline },
              });
              return { pipeline, history: res.data };
            } catch (e) {
              return { pipeline, history: [] };
            }
          })
        );
        // 3. Aggregate failures
        let mostRecent: any = null;
        let topFailed = { pipeline: null, count: 0 };
        // --- work by faissal: Updated failure detection logic to match backend data structure ---
        histories.forEach(({ pipeline, history }) => {
          const failed = history.filter((item: any) => {
            const s = item.summary || {};
            return (
              s.deployment !== "Healthy" ||
              s.pod !== "Healthy" ||
              s.replicaSet !== "Healthy" ||
              s.service !== "Healthy"
            );
          });
          // Top failed pipeline
          if (failed.length > topFailed.count) {
            topFailed = { pipeline, count: failed.length };
          }
          // Most recent failed pipeline
          failed.forEach((f: any) => {
            if (
              !mostRecent ||
              new Date(f.timestamp || f.time || f.createdAt || 0) >
                new Date(
                  mostRecent.failedExecution.timestamp ||
                    mostRecent.failedExecution.time ||
                    mostRecent.failedExecution.createdAt ||
                    0
                )
            ) {
              mostRecent = { pipeline, failedExecution: f };
            }
          });
        });
        setMostRecentFailed(mostRecent);
        setTopFailedPipeline(topFailed.pipeline ? topFailed : null);
      } catch (e) {
        setMostRecentFailed(null);
        setTopFailedPipeline(null);
      }
    }
    fetchAllPipelineFailures();
    const intervalId = setInterval(fetchAllPipelineFailures, 5000); // poll every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full p-5">
      <TopFailedPipelines
        topFailedPipeline={topFailedPipeline}
        mostRecentFailed={mostRecentFailed}
        pipelineName={pipelineName}
      />
      {/* --- Existing Cards and Graphs --- */}
      <CardContainer data={currentData} />
      <div className="grid grid-cols-4 gap-4 mt-5">
        <div className="col-span-2">
          <PipelineSuccessRate history={history} />
        </div>
        <div className="col-span-2">
          <PipelineFailRate history={history} />
        </div>
        <div className="col-span-2">
          <TimeSeriesGraph data={pipelineData} />
        </div>
        <div className="col-span-2">
          <PipelineExecutionGraph historyData={status?.history} />
        </div>
        <div className="col-span-2">
          <PipelineDurationChart history={status?.history} />
        </div>
        <div className="col-span-2">
          <PipelineDurationDistribution history={status?.history} />
        </div>
        <div className="col-span-2">
          <TopSlowPipelines executions={status?.history} />
        </div>
        <div className="col-span-2">
          <DeploymentFrequencyChart history={status?.history} />
        </div>
      </div>
    </div>
  );
}
