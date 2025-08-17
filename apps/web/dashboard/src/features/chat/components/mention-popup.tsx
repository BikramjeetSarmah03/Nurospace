import { useEffect, useRef, useState } from "react";
import { SearchIcon, FileTextIcon, ImageIcon, VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MentionableDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "video" | "text";
  content?: string;
}

interface MentionPopupProps {
  isOpen: boolean;
  query: string;
  documents: MentionableDocument[];
  onSelect: (doc: MentionableDocument) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function MentionPopup({
  isOpen,
  query,
  documents,
  onSelect,
  onClose,
  position,
}: MentionPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredDocs.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredDocs.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredDocs[selectedIndex]) {
            onSelect(filteredDocs[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredDocs, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || filteredDocs.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "text":
        return <FileTextIcon className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <VideoIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute z-50 w-80 max-h-64 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border p-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Mention document
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredDocs.length} documents
        </span>
      </div>

      {/* Document List */}
      <div className="max-h-48 overflow-y-auto">
        {filteredDocs.map((doc, index) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc)}
            className={cn(
              "flex w-full items-center gap-2 px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
              index === selectedIndex && "bg-accent text-accent-foreground",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {getIcon(doc.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {doc.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {doc.type} document
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-2 text-xs text-muted-foreground text-center">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  );
}
