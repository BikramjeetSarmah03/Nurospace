import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "honestjs";

import { AuthGuard } from "@/modules/auth/auth.guard";
import { AuthContext, type IAuthContext } from "@/modules/auth/auth.decorator";

import WorkflowService from "./workflows.service";

import type { CreateWorkflowDto } from "./dto/create-workflow";
import type { UpdateWorkflowDto } from "./dto/update-workflow";
import type { RunWorkflowDto } from "./executions/dto/run-workflow";

@Controller("workflow")
@UseGuards(AuthGuard)
class WorkflowController {
  private readonly workflowService = new WorkflowService();

  @Get()
  async getAllWorkflows(@AuthContext() authContext: IAuthContext) {
    return await this.workflowService.getAllWorkflows(authContext.user.id);
  }

  @Get(":id")
  async getWorkflowDetails(
    @Param("id") workflowId: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.getWorkflowDetails(
      workflowId,
      authContext.user.id,
    );
  }

  @Post()
  async createNewWorkflow(
    @Body() body: CreateWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.createWorkflow(body, authContext.user.id);
  }

  @Patch(":id")
  async updateWokflow(
    @Param("id") workflowId: string,
    @Body() body: UpdateWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.updateWorkflow(
      workflowId,
      body,
      authContext.user.id,
    );
  }

  @Patch("execution/publish")
  async publishWokflow(
    @Body() body: RunWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.publishWorkflow(
      body.workflowId ?? "",
      body,
      authContext.user.id,
    );
  }

  @Delete(":id")
  async deleteWorkflow(
    @Param("id") id: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.deleteWorkflow(id, authContext.user.id);
  }
}

export default WorkflowController;
