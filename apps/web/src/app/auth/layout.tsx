import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { serverSession } from "@/lib/auth/server";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const session = await serverSession(headers());

  if (session.data?.user) {
    return redirect(`/u/${session.data.user.name}`);
  }

  return children;
}
