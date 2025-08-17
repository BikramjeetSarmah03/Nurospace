import type { ErrorResponse, SuccessResponse } from "@/config/types";
import { API } from "@/lib/api-client";

export interface IResource {
  id: string;
  name: string;
  url: string;
  content: string | null;
  type: "pdf" | "youtube" | "image" | "notes";
  projectId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

class ResourceService {
  async getAllResources(): Promise<
    SuccessResponse<IResource[]> | ErrorResponse
  > {
    return (await API.get("resources")).data;
  }

  async uploadResource(
    formData: FormData,
  ): Promise<SuccessResponse<IResource> | ErrorResponse> {
    return (await API.post("resources/upload", formData)).data;
  }
}

export const resourceService = new ResourceService();
