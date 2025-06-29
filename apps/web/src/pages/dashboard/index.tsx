import { createFileRoute } from "@tanstack/react-router";

import AddProjectCard from "@/components/cards/add-project-card";
import ProjectCard, {
  ProjectCardSkeleton,
} from "@/components/cards/project-card";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // simulate 2 seconds loading

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="p-4">
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 6 }).map(() => (
            <ProjectCardSkeleton key={Math.random() * 9} />
          ))
        ) : (
          <>
            {Array.from({ length: 5 }).map(() => (
              <ProjectCard key={Math.random() * 10} />
            ))}
            <AddProjectCard />
          </>
        )}
      </div>
    </div>
  );
}
