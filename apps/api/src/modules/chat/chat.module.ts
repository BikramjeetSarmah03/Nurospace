import { Module } from "honestjs";

import ChatController from "./chat.controller";
import MessageModule from "./messages/messages.module";

@Module({
  imports: [MessageModule],
  controllers: [ChatController],
})
export default class ChatModule {}
