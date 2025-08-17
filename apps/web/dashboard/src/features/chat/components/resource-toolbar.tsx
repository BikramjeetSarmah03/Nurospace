import { useState } from "react";
import {
  type LucideIcon,
  FileText,
  Youtube,
  Image,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResourceDialog, type ResourceTypes } from "./resource-dialog";

const RESOURCE_TYPES: {
  type: ResourceTypes;
  label: string;
  icon: LucideIcon;
}[] = [
  { type: "pdf", label: "PDF", icon: FileText },
  { type: "youtube", label: "YouTube", icon: Youtube },
  { type: "image", label: "Image", icon: Image },
  { type: "notes", label: "Notes", icon: BookOpen },
];

export function ResourceToolbar() {
  const [openDialog, setOpenDialog] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceTypes>("pdf");

  const openResourceDialog = (type: ResourceTypes) => {
    setResourceType(type);
    setOpenDialog(true);
  };

  return (
    <div className="flex gap-2">
      {RESOURCE_TYPES.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-muted text-sm"
          onClick={() => openResourceDialog(type)}
        >
          <Icon size={16} />
          {label}
        </Button>
      ))}

      <ResourceDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        type={resourceType}
      />
    </div>
  );
}
