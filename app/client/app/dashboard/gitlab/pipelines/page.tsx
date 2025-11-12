import GitlabPipelines from "@/components/gitlab/gitlab-pipelines";
import DefaultLayout from "@/layouts/default";

export default function GitLabPipelinesPage() {
  return (
    <DefaultLayout>
      <GitlabPipelines />
    </DefaultLayout>
  );
}
