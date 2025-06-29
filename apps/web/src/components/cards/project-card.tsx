import { Link } from "@tanstack/react-router";
import { TrashIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import type { IProject } from "@productify/shared/types";

interface ProjectCardProps {
  project: IProject;
  handleDeleteProject?: () => void;
}

export default function ProjectCard({
  project,
  handleDeleteProject,
}: ProjectCardProps) {
  return (
    <div className="group relative">
      <Link
        to="/$projectId"
        params={{ projectId: project.id.toString() }}
        className="flex flex-col gap-4 bg-white dark:bg-gray-900 hover:shadow-md p-4 border rounded-md h-40 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-full size-12" />
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
              {project.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {project.description || "No description available"}
            </p>
          </div>
        </div>
      </Link>

      {/* Delete button outside of <Link> to avoid navigation */}
      <div className="top-2 right-2 absolute">
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteProject?.();
          }}
          size="icon"
          variant="destructive"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export const ProjectCardSkeleton = () => {
  return (
    <Skeleton className="bg-gray-100 dark:bg-gray-800 p-4 border h-40">
      <Skeleton className="bg-gray-300 dark:bg-gray-700 mb-2 rounded-full size-12" />
    </Skeleton>
  );
};
