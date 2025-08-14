import { ChevronLeftIcon } from "lucide-react";

import { BackButton } from "@/components/common/back-button";

import { SaveBtn } from "./save-btn";

interface TopBarProps {
  title: string;
  subTitle?: string;
  workflowId: string;
}

export default function TopBar({ title, subTitle, workflowId }: TopBarProps) {
  return (
    <header className="top-0 z-10 sticky flex justify-between bg-background p-2 w-full h-16 border-separate">
      <div className="flex flex-1 gap-4">
        <BackButton size={"sm"} variant={"outline"}>
          <ChevronLeftIcon />
        </BackButton>

        <div>
          <h2 className="font-bold truncate text-ellipsis">{title}</h2>
          {subTitle && (
            <p className="text-muted-foreground text-xs truncate text-ellipsis">
              {subTitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-1">
        <SaveBtn workflowId={workflowId} />
      </div>
    </header>
  );
}
