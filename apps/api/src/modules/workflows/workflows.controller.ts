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

@Controller("workflow")
@UseGuards(AuthGuard)
class WorkflowController {
  private readonly workflowService = new WorkflowService();

  @Get()
  async getAllWorkflows(@AuthContext() authContext: IAuthContext) {
    return await this.workflowService.getAllWorkflows(authContext.user.id);
  }

  @Get(":id")
  getWorkflowDetails() {}

  @Post()
  async createNewWorkflow(
    @Body() body: CreateWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.createWorkflow(body, authContext.user.id);
  }

  @Patch(":id")
  updateWokflow() {}

  @Delete(":id")
  async deleteWorkflow(
    @Param("id") id: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.workflowService.deleteWorkflow(id, authContext.user.id);
  }
}

export default WorkflowController;
