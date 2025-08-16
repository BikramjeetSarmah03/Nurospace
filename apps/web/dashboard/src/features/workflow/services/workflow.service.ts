import type {
  IWorkflow,
  IWorkflowExecution,
} from "@packages/workflow/types/workflow.ts";

import type { ErrorResponse, SuccessResponse } from "@/config/types";

import { API } from "@/lib/api-client";

import { workflowUrls } from "../lib/api";

class WorkflowService {
  async getAllWorkflow(): Promise<
    SuccessResponse<IWorkflow[]> | ErrorResponse
  > {
    return (await API.get(workflowUrls.get)).data;
  }

  async getSingleWorkflow(
    workflowId: string,
  ): Promise<SuccessResponse<IWorkflow> | ErrorResponse> {
    return (await API.get(`${workflowUrls.get_single_workflow}/${workflowId}`))
      .data;
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

  async runWorkflow(body: {
    workflowId: string;
    flowDefination: string;
  }): Promise<
    SuccessResponse<{ workflowId: string; executionId: string }> | ErrorResponse
  > {
    return (
      await API.post(`${workflowUrls.run_workflow}/${body.workflowId}`, body)
    ).data;
  }

  async getExecutionDetailsWithPhases(
    executionId: string,
  ): Promise<IWorkflowExecution> {
    return (
      await API.get(
        `${workflowUrls.get_exection_details_with_phases}/${executionId}`,
      )
    ).data;
  }

  async getPhaseDetails(phaseId: string): Promise<IWorkflowExecution> {
    return (await API.get(`${workflowUrls.get_phase_details}/${phaseId}`)).data;
  }
}

export const workflowService = new WorkflowService();
