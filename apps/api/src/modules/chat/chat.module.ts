import { Module } from "honestjs";

import ChatController from "./chat.controller";

@Module({
  controllers: [ChatController],
})
export default class ChatModule {}
