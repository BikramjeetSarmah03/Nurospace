import { ClassValidatorPipe } from "@honestjs/class-validator-pipe";
import { Application } from "honestjs";
import "reflect-metadata";

import AppModule from "@/app.module";
import { CorsPlugin } from "@/plugins/cors.plugin";
import env from "@/config/env";
import { LoggerPlugin } from "./plugins/logger.plugin";

const { hono } = await Application.create(AppModule, {
  plugins: [new CorsPlugin([env.CORS_ORIGIN]), new LoggerPlugin()],
  hono: {
    strict: false,
  },
  routing: {
    prefix: "api",
    version: 1,
  },
  components: {
    middleware: [],
    guards: [],
    pipes: [new ClassValidatorPipe()],
    filters: [],
  },
});

export default hono;
