import { Module } from "honestjs";

import ExecutionModule from "./executions/execution.module";

import WorkflowController from "./workflows.controller";
import WorkflowService from "./workflows.service";

@Module({
  imports: [ExecutionModule],
  controllers: [WorkflowController],
  services: [WorkflowService],
})
class WorkflowsModule {}

export default WorkflowsModule;
