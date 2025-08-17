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
import { useId } from "react";

import { resourceService } from "@/features/resource/services/resource.service";

export type ResourceTypes = "pdf" | "youtube" | "image" | "notes";

interface ResourceDialogProps extends DialogProps {
  type?: ResourceTypes;
}

export default function ResourceDialog({
  type,
  _onUpload,
}: ResourceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const fileInputId = useId();

  const isUploadType = type === "pdf" || type === "image";
  const isLinkType = type === "youtube";
  const isNoteType = type === "notes";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleOnSubmit = async () => {
    const formData = new FormData();

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
      const result = await resourceService.uploadResource(formData);

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      toast.success("Resource uploaded");
      props?.onOpenChange?.(false);
      setFile(null);
      setLink("");
      setNote("");
    } catch (error) {
      console.error("Upload error:", error);
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

        <div className="space-y-4 py-2">
          {isUploadType && (
            <label
              htmlFor="file-upload"
              className="flex justify-center items-center gap-3 border-2 border-dashed border-muted p-6 rounded-md cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition"
            >
              <CloudUploadIcon size={24} />
              {file ? file.name : "Click or drag file here to upload"}
              <input
                id={fileInputId}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
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
