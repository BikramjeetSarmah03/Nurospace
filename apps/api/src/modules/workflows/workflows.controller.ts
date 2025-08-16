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
import type { RunWorkflowDto } from "./dto/run-workflow";

@Controller("workflow")
@UseGuards(AuthGuard)
class WorkflowController {
  private readonly workflowService = new WorkflowService();

  @Get()
  async getAllWorkflows(@AuthContext() authContext: IAuthContext) {
    return await this.workflowService.getAllWorkflows(authContext.user.id);
  }

  @Get(":slug")
  async getWorkflowDetails(
    @Param("slug") workflowSlug: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.getWorkflowDetails(
      workflowSlug,
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

  @Patch(":slug")
  async updateWokflow(
    @Param("slug") workflowSlug: string,
    @Body() body: UpdateWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.updateWorkflow(
      workflowSlug,
      body,
      authContext.user.id,
    );
  }

  @Delete(":slug")
  async deleteWorkflow(
    @Param("slug") id: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.deleteWorkflow(id, authContext.user.id);
  }

  @Post("run/:slug")
  async runWorkflow(
    @Param("slug") workflowSlug: string,
    @Body() body: RunWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.runWorkflow(
      workflowSlug,
      body,
      authContext.user,
    );
  }
}

export default WorkflowController;
