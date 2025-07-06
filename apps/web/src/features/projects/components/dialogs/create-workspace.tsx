import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import type { PropsWithChildren } from "react";

interface CreateWorkspaceDialogProps extends PropsWithChildren, DialogProps {}

export default function CreateWorkspaceDialog({
  children,
  ...props
}: CreateWorkspaceDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
