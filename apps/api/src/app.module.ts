import { Module } from "honestjs";
import UsersModule from "./modules/users/users.module";
import AuthModule from "./modules/auth/auth.module";

@Module({
  imports: [UsersModule, AuthModule],
})
class AppModule {}

export default AppModule;
