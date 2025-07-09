import {
  FileText,
  Youtube,
  Image,
  BookOpen,
  ExternalLinkIcon,
} from "lucide-react";
import dayjs from "dayjs";

import type { DialogProps } from "@radix-ui/react-dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Card } from "@/components/ui/card";

const dummyResources = [
  {
    type: "pdf",
    title: "AI Research Report",
    description: "PDF document uploaded on July 5",
    icon: FileText,
  },
  {
    type: "youtube",
    title: "LLM Explanation",
    description: "YouTube video link from Andrej Karpathy",
    icon: Youtube,
  },
  {
    type: "image",
    title: "Workflow Diagram",
    description: "PNG uploaded from design folder",
    icon: Image,
  },
  {
    type: "notes",
    title: "Meeting Notes",
    description: "Notes taken from client call on July 7",
    icon: BookOpen,
  },
  {
    type: "pdf",
    title: "AI Research Report",
    description: "PDF document uploaded on July 5",
    icon: FileText,
  },
  {
    type: "youtube",
    title: "LLM Explanation",
    description: "YouTube video link from Andrej Karpathy",
    icon: Youtube,
  },
  {
    type: "image",
    title: "Workflow Diagram",
    description: "PNG uploaded from design folder",
    icon: Image,
  },
  {
    type: "notes",
    title: "Meeting Notes",
    description: "Notes taken from client call on July 7",
    icon: BookOpen,
  },
  {
    type: "pdf",
    title: "AI Research Report",
    description: "PDF document uploaded on July 5",
    icon: FileText,
  },
  {
    type: "youtube",
    title: "LLM Explanation",
    description: "YouTube video link from Andrej Karpathy",
    icon: Youtube,
  },
  {
    type: "image",
    title: "Workflow Diagram",
    description: "PNG uploaded from design folder",
    icon: Image,
  },
];

export default function ResourcesSidebar({ ...props }: DialogProps) {
  return (
    <Sheet {...props}>
      <SheetContent className="bg-sidebar overflow-y-auto">
        <SheetHeader className="top-0 sticky bg-sidebar border-b">
          <SheetTitle className="text-white text-lg">
            Project Resources
          </SheetTitle>
        </SheetHeader>

        <div className="gap-4 space-y-4 grid grid-cols-2 shadow-inner p-4">
          {dummyResources.map((res, i) => {
            const Icon = res.icon;
            return (
              <Card
                key={i.toString()}
                className="bg-white dark:bg-background/40 shadow-sm border rounded-lg overflow-hidden"
              >
                <h1 className="p-2">{res.title}</h1>
                <div className="flex justify-center items-center bg-gray-900 p-4 h-24">
                  <Icon size={32} />
                </div>

                <div className="flex justify-between items-center p-2 w-full">
                  <p className="text-xs">
                    {dayjs(Date.now()).format("DD MMM YYYY")}
                  </p>

                  <p>
                    <ExternalLinkIcon size={14} />
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
