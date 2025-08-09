// import AnimatedAIChat from "@/components/mvpblocks/animated-ai-chat";
import VercelV0Chat from "@/components/mvpblocks/v0-chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/c/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full">
      {/* <AnimatedAIChat /> */}
      <VercelV0Chat />
    </div>
  );
}
