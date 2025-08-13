import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/w/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  return (
    <div className="mt-4 p-4">
      <Link
        to="/w/$slug/editor"
        params={params}
        className="bg-white p-4 border"
      >
        EDITOR / DEV Mode
      </Link>
    </div>
  );
}
