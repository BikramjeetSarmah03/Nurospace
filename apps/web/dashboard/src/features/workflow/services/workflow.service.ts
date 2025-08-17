import type { ErrorResponse, SuccessResponse } from "@/config/types";

import { API } from "@/lib/api-client";

import { workflowUrls } from "../lib/api";
import type { IWorkflow } from "../types/workflow";

class WorkflowService {
  async getAllWorkflow(): Promise<
    SuccessResponse<IWorkflow[]> | ErrorResponse
  > {
    return (await API.get(workflowUrls.get)).data;
  }

  async getSingleWorkflow(
    slug: string,
  ): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.get(`${workflowUrls.get}/${slug}`)).data;
  }

  async createWorkflow(data: {
    name: string;
    description?: string;
  }): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.post(workflowUrls.create, data)).data;
  }

  async updateWorkflow(data: {
    id: string;
    defination: string;
  }): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.patch(`${workflowUrls.update}/${data.id}`, data)).data;
  }

  async deleteWorkflow(
    id: string,
  ): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.delete(`${workflowUrls.delete}/${id}`)).data;
  }
}

export const workflowService = new WorkflowService();
