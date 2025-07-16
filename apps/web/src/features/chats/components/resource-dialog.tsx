import { useState } from "react";
import { CloudUploadIcon, LinkIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

import env from "@/config/env";
import { queryClient } from "@/lib/query-client";
import { RESOURCES_KEYS } from "@/config/querykeys";

export type ResourceTypes = "pdf" | "youtube" | "image" | "notes";

interface ResourceDialogProps extends DialogProps {
  type?: ResourceTypes;
}

export function ResourceDialog({ type, ...props }: ResourceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");

  const isUploadType = type === "pdf" || type === "image";
  const isLinkType = type === "youtube";
  const isNoteType = type === "notes";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleOnSubmit = async () => {
    const formData = new FormData();

    // Attach appropriate data based on type
    if (type === "pdf" || type === "image") {
      if (!file) return toast.error("Please select a file.");
      formData.append("file", file);
      formData.append("type", type);
    }

    if (type === "youtube") {
      if (!link.trim()) return toast.error("Please paste a valid link.");
      formData.append("link", link.trim());
      formData.append("type", type);
    }

    if (type === "notes") {
      if (!note.trim()) return toast.error("Please enter a note.");
      formData.append("note", note.trim());
      formData.append("type", type);
    }

    try {
      const res = await fetch(
        `${env.VITE_SERVER_URL}/api/v1/resources/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed");

      toast.success("Resource Uploaded");

      queryClient.invalidateQueries({
        queryKey: [RESOURCES_KEYS.ALL_RESOURCES],
      });

      props?.onOpenChange?.(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "pdf" && "Upload PDF"}
            {type === "image" && "Upload Image"}
            {type === "youtube" && "Paste YouTube Link"}
            {type === "notes" && "Write Notes"}
          </DialogTitle>
        </DialogHeader>

        {/* Upload or Input Section */}
        <div className="space-y-4 py-2">
          {isUploadType && (
            <label
              htmlFor="file-upload"
              className={cn(
                "flex justify-center items-center gap-3 border-2 border-dashed border-muted p-6 rounded-md cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition",
                file && "border-green-400 text-green-700",
              )}
            >
              <CloudUploadIcon size={24} />
              {file ? file.name : "Click or drag file here to upload"}
              <input
                id="file-upload"
                type="file"
                accept={type === "pdf" ? "application/pdf" : "image/*"}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {isLinkType && (
            <div className="flex items-center gap-2">
              <LinkIcon size={18} className="text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste YouTube link here"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          )}

          {isNoteType && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PencilIcon size={18} className="text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  Write Note
                </span>
              </div>
              <Textarea
                rows={10}
                placeholder="Type your notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleOnSubmit}
          type="submit"
          disabled={!file && !link && !note}
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
