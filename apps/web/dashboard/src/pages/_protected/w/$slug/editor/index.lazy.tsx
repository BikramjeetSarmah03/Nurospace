import { createLazyFileRoute } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";

import FlowEditor from "./_components/flow-editor";

export const Route = createLazyFileRoute("/_protected/w/$slug/editor/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col size-full overflow-hidden">
        <section className="flex h-full overflow-auto">
          <FlowEditor />
        </section>
      </div>
    </ReactFlowProvider>
  );
}
