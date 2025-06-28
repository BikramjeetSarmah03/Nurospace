import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";

import { queryClient } from "./lib/query-client";

import { routeTree } from "./routeTree.gen";

import Loader from "@/components/loader";
import { NotFound } from "@/components/common/not-found";
import { ErrorComponent } from "@/components/common/error-component";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: { queryClient },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
  defaultPendingComponent: () => <Loader />,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
