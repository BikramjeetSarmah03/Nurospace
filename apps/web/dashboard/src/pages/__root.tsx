import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Suspense } from "react";

import { ThemeProvider } from "@/components/common/theme-provider";
import Loader from "@/components/common/loader";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <Suspense fallback={<Loader />}>
      <ThemeProvider>
        <Outlet />

        <Toaster richColors />

        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </Suspense>
  );
}
