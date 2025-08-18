import { Module } from "honestjs";

import AuthModule from "./modules/auth/auth.module";
import ChatModule from "./modules/chat/chat.module";
import WorkflowsModule from "./modules/workflows/workflows.module";
import BillingModule from "./modules/billing/billing.module";

@Module({
  imports: [AuthModule, ChatModule, WorkflowsModule, BillingModule],
})
class AppModule {}

export default AppModule;
