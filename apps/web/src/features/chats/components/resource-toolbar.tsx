import {
  FileText,
  Youtube,
  Image,
  BookOpen,
  PanelRightOpen,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useState } from "react";
import ResourcesSidebar from "./context-sidebar";
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
  const [openMenu, setOpenMenu] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceTypes | null>(null);

  const openResourceDialog = (type: ResourceTypes) => {
    setResourceType(type);
    setOpenDialog(true);
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-sidebar shadow-sm px-3 py-2 border rounded-lg w-full">
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
      </div>

      {/* Context Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenMenu(!openMenu)}
        className="text-muted-foreground"
      >
        <PanelRightOpen size={20} />
      </Button>

      <ResourcesSidebar open={openMenu} onOpenChange={setOpenMenu} />

      <ResourceDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        type={resourceType ?? "pdf"}
      />
    </div>
  );
}
