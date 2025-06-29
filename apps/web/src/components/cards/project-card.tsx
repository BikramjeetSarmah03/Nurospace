import { Link } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";

interface ProjectCardProps {
  project: {
    id: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to="/$projectId"
      params={{
        projectId: project.id.toString(),
      }}
      className="bg-white dark:bg-gray-900 hover:shadow-md p-4 border rounded-md h-40 transition-all duration-300"
    >
      ProjectCard
    </Link>
  );
}

export const ProjectCardSkeleton = () => {
  return (
    <Skeleton className="bg-gray-100 dark:bg-gray-800 p-4 border h-40">
      <Skeleton className="bg-gray-300 dark:bg-gray-700 mb-2 rounded-full size-12" />
    </Skeleton>
  );
};
