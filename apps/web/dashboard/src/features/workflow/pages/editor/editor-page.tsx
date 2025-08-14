import { ReactFlowProvider } from "@xyflow/react";

import FlowEditor from "./components/flow-editor";
import TopBar from "./components/topbar/top-bar";
import { useParams } from "@tanstack/react-router";

export default function EditorPage() {
  const params = useParams({
    from: "/_protected/w/$slug/editor/",
  });

  return (
    <ReactFlowProvider>
      <div className="flex flex-col size-full overflow-hidden">
        <TopBar
          title="Workflow Editor"
          subTitle="Really long name for workflow..."
          workflowId={params.slug}
        />

        <section className="flex h-full overflow-auto">
          <FlowEditor />
        </section>
      </div>
    </ReactFlowProvider>
  );
}
