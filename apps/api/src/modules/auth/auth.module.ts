import { Module } from "honestjs";

import AuthController from "./auth.controller";

@Module({
  controllers: [AuthController],
})
export default class AuthModule {}
