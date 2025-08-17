import { Body, Controller, Get, Param, Post, UseGuards } from "honestjs";

import { AuthGuard } from "@/modules/auth/auth.guard";
import { AuthContext, type IAuthContext } from "@/modules/auth/auth.decorator";

import ExecuctionService from "./execution.service";
import type { RunWorkflowDto } from "./dto/run-workflow";

@Controller("workflow/execution")
@UseGuards(AuthGuard)
export default class ExecutionController {
  private readonly exectionService = new ExecuctionService();

  @Post("run/:id")
  async runWorkflow(
    @Param("id") workflowId: string,
    @Body() body: RunWorkflowDto,
    @AuthContext() authContext: IAuthContext,
  ) {
    return await this.exectionService.runWorkflow(
      workflowId,
      body,
      authContext.user,
    );
  }

  @Get(":id")
  async getWorkflowExecutionWithPhases(
    @Param("id") executionId: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return this.exectionService.getWorkflowExecutionWithPhases(
      executionId,
      authContext.user.id,
    );
  }

  @Get("/phase/:id")
  async getPhaseDetails(
    @Param("id") phaseId: string,
    @AuthContext() authContext: IAuthContext,
  ) {
    return this.exectionService.getPhaseDetails(phaseId, authContext.user.id);
  }
}
