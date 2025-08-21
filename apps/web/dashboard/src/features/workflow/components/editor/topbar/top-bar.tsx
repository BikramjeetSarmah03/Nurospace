import { ChevronLeftIcon } from "lucide-react";

import { BackButton } from "@/components/common/back-button";

import { SaveBtn } from "./save-btn";
import { ExecuteBtn } from "./execute-btn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "@tanstack/react-router";
import { PublishBtn } from "./publish-btn";

interface TopBarProps {
  title: string;
  subTitle?: string;
  workflowId: string;
  hideButtons?: boolean;
  isPublished?: boolean;
}

export default function TopBar({
  title,
  subTitle,
  workflowId,
  hideButtons,
  isPublished,
}: TopBarProps) {
  const { pathname } = useLocation();

  const currentTab = pathname.includes("/runs") ? "runs" : "editor";

  return (
    <header className="top-0 z-10 sticky flex justify-between items-center bg-background p-2 border-b-2 w-full h-16 border-separate">
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

      <Tabs defaultValue={currentTab} className="w-full max-w-md">
        <TabsList className="w-full">
          <TabsTrigger value="editor" className="w-full" asChild>
            <Link
              to="/w/$workflowId/editor"
              params={{
                workflowId,
              }}
            >
              Editor
            </Link>
          </TabsTrigger>
          <TabsTrigger value="runs" className="w-full" asChild>
            <Link
              to="/w/$workflowId/runs"
              params={{
                workflowId,
              }}
            >
              Runs
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!hideButtons ? (
        <div className="flex justify-end gap-1 w-full max-w-md">
          <ExecuteBtn workflowId={workflowId} />
          {!isPublished && (
            <>
              <SaveBtn workflowId={workflowId} />
              <PublishBtn workflowId={workflowId} />
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md" />
      )}
    </header>
  );
}
