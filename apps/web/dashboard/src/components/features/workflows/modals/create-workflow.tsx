import type { PropsWithChildren } from "react";
import { Layers3Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

import CreateWorkflowForm from "@/components/features/workflows/form/create-workflow";

interface CreateWorkflowProps extends PropsWithChildren {
  className?: string;
}

export default function CreateWorkflow({
  children,
  className,
}: CreateWorkflowProps) {
  return (
    <Dialog>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="p-0 max-h-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader className="border-b">
          <DialogTitle className="place-items-center gap-2.5 grid px-4 pt-8">
            <div className="bg-primary/10 hover:bg-primary/20 p-2 rounded-full w-fit transition-all duration-300">
              <Layers3Icon />
            </div>
          </DialogTitle>
          <DialogDescription className="px-4 pb-8">
            <div className="text-center">
              <h1 className="font-semibold text-primary text-base">
                Create Workflow
              </h1>
              <p className="text-muted-foreground text-xs">
                Start building your workflow
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-8">
          <CreateWorkflowForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
