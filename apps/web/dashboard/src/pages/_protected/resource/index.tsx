import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/resource/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i.toString()}
          className="bg-white hover:shadow-md p-4 border rounded-md min-h-40 transition-all duration-300"
        >
          Resource: {i + 1}
        </div>
      ))}
    </div>
  );
}
