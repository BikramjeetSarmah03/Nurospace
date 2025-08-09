import { Module } from "honestjs";

import AuthModule from "./modules/auth/auth.module";
import ChatModule from "./modules/chat/chat.module";

@Module({
  imports: [AuthModule, ChatModule],
})
class AppModule {}

export default AppModule;
