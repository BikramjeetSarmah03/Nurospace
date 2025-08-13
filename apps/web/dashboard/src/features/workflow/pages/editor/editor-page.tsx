import { ReactFlowProvider } from "@xyflow/react";

import FlowEditor from "./components/flow-editor";

export default function EditorPage() {
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
