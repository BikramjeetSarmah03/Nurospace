import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";

import { queryClient } from "@/lib/query-client";

import { workflowService } from "../../services/workflow.service";
import { WORKFLOW_KEYS } from "../../lib/query-keys";
import type { IWorkflow } from "../../types/workflow";

const WorkflowForm = z.object({
  name: z.string({ error: "Name is required" }),
  description: z.string().optional(),
});

type IWorkflowForm = z.infer<typeof WorkflowForm>;

export default function CreateWorkflowForm({
  afterSubmit,
}: {
  afterSubmit: () => void;
}) {
  const form = useForm<IWorkflowForm>({
    resolver: zodResolver(WorkflowForm),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (values: IWorkflowForm) => {
      const data = await workflowService.createWorkflow(values);

      if (!data.success) throw Error(data.message);

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [WORKFLOW_KEYS.ALL_WORKFLOW],
        (old: IWorkflow[] | undefined) => {
          if (!old) return [data.data]; // if there's no data, initialize with new item
          return [...old, data.data]; // append to existing list
        },
      );
      afterSubmit();
      toast.success("Workflow created successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          createWorkflowMutation.mutate(values),
        )}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                <span className="font-semibold">Name</span> (required)
              </FormLabel>

              <FormControl>
                <Input {...field} />
              </FormControl>

              <FormDescription>
                Choose a descriptive and unique name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-normal">
                <span className="font-semibold">Description</span> (optional)
              </FormLabel>

              <FormControl>
                <Textarea {...field} rows={4} className="resize-none" />
              </FormControl>

              <FormDescription>
                Provide a brief description of what your workflow does. <br />
                This is optional but can help you remember the workflow's
                purpose.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          loading={createWorkflowMutation.isPending}
          className="w-full"
          size={"sm"}
        >
          Proceed
        </LoadingButton>
      </form>
    </Form>
  );
}
