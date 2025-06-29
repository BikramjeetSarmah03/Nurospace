import { FolderPlusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ProjectSchema,
  type ProjectSchemaType,
} from "@productify/shared/schemas/project";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export default function AddProjectCard() {
  const navigate = useNavigate();
  const form = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: ProjectSchemaType) => {
    try {
      const res = await apiClient.projects.$post({
        json: values,
      });

      const data = await res.json();

      if (!data.success)
        throw new Error(data.message || "Failed to create project");

      toast.success("Project created successfully");
      navigate({
        to: "/$projectId",
        params: {
          projectId: data.data.id.toString(),
        },
      });
      queryClient.invalidateQueries({
        queryKey: ["PROJECTS"],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4 *:not-first:mt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Project Name"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Project Name"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="flex-1">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
