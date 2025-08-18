import { Module } from "honestjs";
import BillingController from "./billing.controller";
import BillingService from "./billing.service";

@Module({
  controllers: [BillingController],
  services: [BillingService],
})
class BillingModule {}

export default BillingModule;
