import { hc } from "hono/client";

import env from "@/config/env";

import type { AppRouter } from "../../../server/src/routers/index";

export const apiClient = hc<AppRouter>(env.VITE_SERVER_URL);
