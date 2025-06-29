import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import AddProjectCard from "@/components/cards/add-project-card";
import ProjectCard, {
  ProjectCardSkeleton,
} from "@/components/cards/project-card";

import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    isLoading,
    data: projects,
    refetch,
  } = useQuery({
    queryKey: ["PROJECTS"],
    queryFn: async () => {
      return (await apiClient.projects.$get()).json();
    },
  });

  return (
    <div className="p-4">
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map(() => (
            <ProjectCardSkeleton key={Math.random() * 9} />
          ))
        ) : projects?.success ? (
          projects.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="place-items-center grid bg-gray-900 p-4 rounded-md h-40">
            <h1 className="font-medium text-red-500 text-xl">
              Error While Fetching Projects
            </h1>
            <button
              className="bg-gray-800 px-10 py-2 rounded-md text-sm cursor-pointer"
              type="button"
              onClick={() => refetch()}
            >
              {isLoading ? "Refetching..." : "Retry"}
            </button>
          </div>
        )}
        <AddProjectCard />
      </div>
    </div>
  );
}
