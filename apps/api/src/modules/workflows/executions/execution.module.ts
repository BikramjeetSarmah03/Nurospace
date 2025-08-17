import { Module } from "honestjs";
import ExecutionController from "./execution.controller";
import ExecuctionService from "./execution.service";

@Module({
  controllers: [ExecutionController],
  services: [ExecuctionService],
})
class ExecutionModule {}

export default ExecutionModule;
