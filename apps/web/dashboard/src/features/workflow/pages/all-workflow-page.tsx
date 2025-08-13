import { EllipsisVerticalIcon, HardDriveIcon, PlusIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/common/page-heading";

import CreateWorkflow from "@/features/workflow/components/modals/create-workflow";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

const hasWorkflows = true;

export default function AllWorkflowPage() {
  return (
    <div className="space-y-4 p-4 h-full">
      <PageHeader
        title="Workflows"
        subTitle="Manage all your workflows"
        rightActions={
          <CreateWorkflow>
            <Button size={"sm"}>Create Workflow</Button>
          </CreateWorkflow>
        }
      />

      <div className="space-y-2">
        {hasWorkflows ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i.toString()}
              className="relative flex justify-between items-center bg-white hover:shadow-md p-2 border rounded-md cursor-pointer"
            >
              <Link
                to="/w/$slug"
                params={{
                  slug: String(i + 1),
                }}
                className="w-full"
              >
                Workflow {i + 1}
              </Link>

              <ConfirmDialog
                description={
                  <>
                    If you are sure, Enter <b>Workflow Name </b> to confirm
                  </>
                }
                form={<Input />}
                confirmLabel="Delete"
              >
                <EllipsisVerticalIcon />
              </ConfirmDialog>

              {/* Progress bar */}
              <div
                className={cn("bottom-0 left-0 absolute bg-green-500 w-0 h-1")}
                style={{
                  width: (Math.floor(Math.random() * (100 - 20 + 1)) + 20) * 5,
                }}
              />
            </div>
          ))
        ) : (
          <div className="place-items-center gap-2 grid">
            <div className="bg-primary/20 hover:bg-primary/40 p-2.5 rounded-full w-fit h-fit transition-all duration-300">
              <HardDriveIcon size={24} />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="font-semibold text-xl">
                No Workflow created yet!
              </h1>
              <p className="text-sm">
                Click the button below to create your first workflow
              </p>

              <CreateWorkflow className="mt-2">
                <Button size={"sm"} className="w-full">
                  <PlusIcon />
                  Create Workflow
                </Button>
              </CreateWorkflow>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
