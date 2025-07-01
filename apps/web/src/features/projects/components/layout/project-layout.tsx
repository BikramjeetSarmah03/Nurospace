import type { PropsWithChildren } from "react";

import ProjectSidebar from "./project-sidebar";

interface ProjectLayoutProps extends PropsWithChildren {}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="flex h-full">
      <ProjectSidebar />

      {children}
    </div>
  );
}
