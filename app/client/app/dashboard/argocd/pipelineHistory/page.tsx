import PipelineHistory from "@/components/pipelineHistory";
import DefaultLayout from "@/layouts/default";
import { Suspense } from "react";

export default function PipelineHistoryPage() {
  return (
    <DefaultLayout>
      <Suspense>
        <PipelineHistory />
      </Suspense>
    </DefaultLayout>
  );
}
