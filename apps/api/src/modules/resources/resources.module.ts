import { Module } from "honestjs";
import ResourcesController from "./resources.controller";
import ResourcesService from "./resources.service";

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
class ResourcesModule {}

export default ResourcesModule;
