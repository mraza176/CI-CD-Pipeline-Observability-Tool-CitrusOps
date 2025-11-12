import GitLabDashboardPicker from "@/components/gitlab/dashboard-picker";
import DefaultLayout from "@/layouts/default";

export default function GitLabHome() {
  return (
    <DefaultLayout>
      <GitLabDashboardPicker />
    </DefaultLayout>
  );
}
