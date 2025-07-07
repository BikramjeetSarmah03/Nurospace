import { useWorkspaceModal } from "@/hooks/use-workspace-modal";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  ProjectSchema,
  type ProjectSchemaType,
} from "@productify/shared/schemas/project";

import { WORKSPACE_KEYS } from "@/config/querykeys";

import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

import { useWorkspaceStore } from "@/hooks/use-workspace";

export default function CreateWorkspaceModal() {
  const workspaceModal = useWorkspaceModal();
  const workspace = useWorkspaceStore();

  const form = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: ProjectSchemaType) => {
    try {
      const res = await apiClient.projects.$post({
        json: {
          name: values.name,
          description: values.description,
        },
      });

      const project = await res.json();

      if (project.success) {
        toast.success("Project Created Successfully");

        workspace.setActiveWorkspace(project.data.id);

        queryClient
          .invalidateQueries({
            queryKey: [WORKSPACE_KEYS.ALL],
          })
          .then(() => {
            workspaceModal.onClose();
            form.reset();
          });
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      title="Create Your First Workspace"
      description="Organize your projects, resources, and AI conversations in one smart space. Let’s get started!"
      isOpen={workspaceModal.isOpen}
      onClose={workspaceModal.onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Project Name" {...field} />
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
                    rows={2}
                    placeholder="Short Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
