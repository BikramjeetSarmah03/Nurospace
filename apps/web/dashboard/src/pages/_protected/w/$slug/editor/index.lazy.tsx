import { createLazyFileRoute } from "@tanstack/react-router";

import EditorPage from "@/features/workflow/pages/editor/editor-page";

export const Route = createLazyFileRoute("/_protected/w/$slug/editor/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return <EditorPage slug={params.slug} />;
}
