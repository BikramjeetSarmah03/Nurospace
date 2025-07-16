import {
  FileText,
  Youtube,
  Image,
  BookOpen,
  ExternalLinkIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import dayjs from "dayjs";

import type { DialogProps } from "@radix-ui/react-dialog";

import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { RESOURCES_KEYS } from "@/config/querykeys";

import { apiClient } from "@/lib/api-client";

export default function ResourcesSidebar({ ...props }: DialogProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: [RESOURCES_KEYS.ALL_RESOURCES],
    queryFn: async () => {
      const res = await apiClient.resources.$get();
      const json = await res.json();

      if (!res.ok) throw new Error("Failed to fetch resources");

      return json.data; // assuming this contains the array of resources
    },
  });

  return (
    <Sheet {...props}>
      <SheetContent className="bg-sidebar overflow-y-auto">
        <SheetHeader className="top-0 sticky flex flex-row justify-between items-center bg-sidebar shadow border-b">
          <SheetTitle className="dark:text-white text-lg">
            Project Resources
          </SheetTitle>

          <SheetClose>
            <XIcon size={20} />
          </SheetClose>
        </SheetHeader>

        {isLoading ? (
          <div className="place-items-center grid h-80">
            <Loader2Icon className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="place-items-center grid h-80">
            <h1>Failed to load resources</h1>
          </div>
        ) : (
          <div className="gap-4 grid grid-cols-2 p-4 pt-0">
            {data?.length === 0 && (
              <Card className="flex justify-center items-center bg-white dark:bg-background/40 shadow-sm hover:shadow-xl p-4 border rounded-lg h-40 overflow-hidden text-center transition-shadow duration-200 cursor-pointer">
                <h1 className="text-sm">No Resource Added Yet</h1>
              </Card>
            )}
            {data?.map((res, i: number) => {
              const Icon = getIconForType(res.type); // You need to define this helper
              return (
                <Card
                  key={res.id || i}
                  className="bg-white dark:bg-background/40 shadow-sm hover:shadow-xl border rounded-lg overflow-hidden transition-shadow duration-200 cursor-pointer"
                >
                  <h1 className="p-2 text-xs">{res.name.slice(0, 25)}</h1>
                  <div className="flex justify-center items-center bg-gray-200/70 dark:bg-gray-900 p-4 h-24">
                    <Icon size={32} />
                  </div>

                  <div className="flex justify-between items-center p-2 w-full">
                    <p className="text-xs">
                      {dayjs(res.createdAt).format("DD MMM YYYY")}
                    </p>

                    <p>
                      <ExternalLinkIcon size={14} />
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case "pdf":
      return FileText;
    case "youtube":
      return Youtube;
    case "image":
      return Image;
    case "notes":
      return BookOpen;
    default:
      return FileText;
  }
}
