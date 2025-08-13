import { useForm } from "react-hook-form";

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
import { Button } from "@/components/ui/button";

export default function CreateWorkflowForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <form className="space-y-4">
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
          name="name"
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

        <Button className="w-full" size={"sm"}>
          Proceed
        </Button>
      </form>
    </Form>
  );
}
