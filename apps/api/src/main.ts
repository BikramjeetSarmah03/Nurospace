import { ClassValidatorPipe } from "@honestjs/class-validator-pipe";
import { Application } from "honestjs";
import "reflect-metadata";

import env from "@packages/env/server";

import AppModule from "@/app.module";

import { CorsPlugin } from "@/plugins/cors.plugin";
import { LoggerPlugin } from "@/plugins/logger.plugin";

import { AuthMiddleware } from "./middleware/auth.middleware";

import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { NotFound } from "./common/filters/not-found";

const { hono, app } = await Application.create(AppModule, {
  plugins: [new CorsPlugin([env.CORS_ORIGIN]), new LoggerPlugin()],
  hono: {
    strict: true,
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
  onError: (error, context) =>
    new GlobalExceptionFilter().catch(error, context),
  notFound: (context) => NotFound(context),
});

const routes = app.getRoutes();
console.log(
  "Registered routes:",
  routes.map((r) => r.fullPath),
);

export type AppType = typeof hono;

export default hono;
