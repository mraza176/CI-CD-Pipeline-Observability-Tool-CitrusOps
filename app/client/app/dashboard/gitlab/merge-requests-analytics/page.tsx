import GitLabMergeRequestAnalytics from "@/components/gitlab/gitlab-merge-requests-analytics";
import DefaultLayout from "@/layouts/default";

export default function MergeRequestsAnalyticsPage() {
  return (
    <DefaultLayout>
      <GitLabMergeRequestAnalytics />
    </DefaultLayout>
  );
}
