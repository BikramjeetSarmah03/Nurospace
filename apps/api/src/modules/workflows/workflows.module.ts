import { Module } from "honestjs";

import WorkflowController from "./workflows.controller";
import WorkflowService from "./workflows.service";

@Module({
  controllers: [WorkflowController],
  services: [WorkflowService],
})
class WorkflowsModule {}

export default WorkflowsModule;
