import { createAuthClient } from "better-auth/react";

import env from "@packages/env/client";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  basePath: "/api/v1/auth",
});
