import { Module } from "honestjs";

import MessageService from "./messages.service";

@Module({
  services: [MessageService],
})
export default class MessageModule {}
