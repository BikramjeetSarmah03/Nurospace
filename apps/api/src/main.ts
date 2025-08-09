import { ClassValidatorPipe } from "@honestjs/class-validator-pipe";
import { Application } from "honestjs";
import "reflect-metadata";

import AppModule from "@/app.module";
import env from "@/config/env";

import { CorsPlugin } from "@/plugins/cors.plugin";
import { LoggerPlugin } from "@/plugins/logger.plugin";
import { AuthMiddleware } from "./middleware/auth.middleware";

const { hono, app } = await Application.create(AppModule, {
  plugins: [new CorsPlugin([env.CORS_ORIGIN]), new LoggerPlugin()],
  hono: {
    strict: false,
  },
  routing: {
    prefix: "api",
    version: 1,
  },
  components: {
    middleware: [new AuthMiddleware()],
    guards: [],
    pipes: [new ClassValidatorPipe()],
    filters: [],
  },
});

const routes = app.getRoutes();
console.log(
  "Registered routes:",
  routes.map((r) => r.fullPath),
);

export default hono;
