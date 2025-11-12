import Pipelines from "@/components/pipelines";
import DefaultLayout from "@/layouts/default";

export default function ArgoCDDashboard() {
  return (
    <DefaultLayout>
      <Pipelines />
    </DefaultLayout>
  );
}
