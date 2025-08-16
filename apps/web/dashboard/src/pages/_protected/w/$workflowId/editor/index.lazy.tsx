import { createLazyFileRoute } from "@tanstack/react-router";

import EditorPage from "@/features/workflow/pages/editor/editor-page";

export const Route = createLazyFileRoute("/_protected/w/$workflowId/editor/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return <EditorPage workflowId={params.workflowId} />;
}
