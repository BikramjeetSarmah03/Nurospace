import type { ErrorResponse, SuccessResponse } from "@/config/types";
import type { IWorkflow } from "../types/workflow";

import { API } from "@/lib/api-client";

import { workflowUrls } from "../lib/api";

class WorkflowService {
  async getAllWorkflow(): Promise<
    SuccessResponse<IWorkflow[]> | ErrorResponse
  > {
    return (await API.get(workflowUrls.getAll)).data;
  }

  async createWorkflow(data: {
    name: string;
    description?: string;
  }): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.post(workflowUrls.create, data)).data;
  }

  async deleteWorkflow(
    id: string,
  ): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.delete(`${workflowUrls.delete}/${id}`)).data;
  }
}

export const workflowService = new WorkflowService();
