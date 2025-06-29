import { useState } from "react";
import { FolderPlusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddProjectCard() {
  const [projectName, setProjectName] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="place-items-center grid bg-white dark:bg-gray-900 hover:shadow-xl p-4 border rounded-md h-40 text-gray-400 hover:text-gray-600 transition-all duration-300 cursor-pointer">
          <PlusIcon size={52} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex justify-center items-center border rounded-full size-12 shrink-0"
            aria-hidden="true"
          >
            <FolderPlusIcon className="opacity-80" size={24} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Create A New Project
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Create a new project to start boosting your time
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="*:not-first:mt-2">
            <Label>Project name</Label>
            <Input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" className="flex-1">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
