import { useQuery } from "@tanstack/react-query";
import type { SuccessResponse } from "@productify/shared/types";

import AddProjectCard from "@/features/dashboard/components/cards/add-project-card";
import ProjectCard, {
  ProjectCardSkeleton,
} from "@/features/dashboard/components/cards/project-card";

import { apiClient } from "@/lib/api-client";

export default function DashboardPage() {
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

  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await apiClient.projects[":projectId"].$delete({
        param: {
          projectId,
        },
      });
      const data = (await res.json()) as SuccessResponse;

      if (!data.success)
        throw new Error(data.message || "Failed to delete project");

      refetch();
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error instanceof Error
        ? error
        : new Error("An error occurred while deleting the project");
    }
  };

  return (
    <div className="p-4">
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map(() => (
            <ProjectCardSkeleton key={Math.random() * 9} />
          ))
        ) : projects?.success ? (
          projects.data.length === 0 ? (
            <div className="flex flex-col justify-center items-center bg-white dark:bg-gray-900 p-4 border rounded-md h-40 text-center">
              <h1 className="font-semibold text-xl"> No Projects Yet.</h1>
              <h2 className="text-muted-foreground">
                Create a new project to get started.
              </h2>
            </div>
          ) : (
            projects.data.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                handleDeleteProject={() => handleDeleteProject(project.id)}
              />
            ))
          )
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
