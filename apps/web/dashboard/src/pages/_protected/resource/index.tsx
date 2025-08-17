import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { resourceService } from "@/features/resource/services/resource.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_protected/resource/")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: resources,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const result = await resourceService.getAllResources();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch resources");
      }
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">
          Error loading resources: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          {resources?.length || 0} resource{resources?.length !== 1 ? "s" : ""}{" "}
          uploaded
        </p>
      </div>

      {!resources || resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources uploaded yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload your first resource from the chat interface.
          </p>
        </div>
      ) : (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium truncate">
                  {resource.name}
                </CardTitle>
                <div className="text-xs text-muted-foreground capitalize">
                  {resource.type}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resource.content && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {resource.content}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {resource.type === "pdf" || resource.type === "image" ? (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    ) : resource.type === "youtube" ? (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Watch
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
