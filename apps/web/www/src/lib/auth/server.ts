import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { authClient } from "./client";

export const serverSession = async (
  headers: Promise<ReadonlyHeaders> | Headers,
) =>
  await authClient.getSession({
    fetchOptions: {
      headers: await headers,
    },
  });
