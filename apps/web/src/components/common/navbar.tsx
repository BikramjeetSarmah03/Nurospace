import { PanelRightIcon } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { open: openSidebar, toggleSidebar } = useSidebar();
  const currentWorkspace = useWorkspaceStore((state) =>
    state.workspaces.find((w) => w.id === state.activeWorkspaceId),
  );

  return (
    <header className="top-0 z-10 sticky flex justify-between items-center bg-white dark:bg-background/90 shadow-md p-4 w-full">
      <button
        type="button"
        onClick={() => toggleSidebar()}
        className={cn(
          "duration-500 cursor-pointer",
          openSidebar && "rotate-180",
        )}
      >
        <PanelRightIcon />
      </button>

      <h1>{currentWorkspace?.name ?? "Loading..."}</h1>

      <button type="button">Personalities</button>
    </header>
  );
}
