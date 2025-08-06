import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import "@/styles/globals.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { queryClient } from "./lib/query-client";

import Loader from "./components/common/loader";
import { NotFound } from "./components/common/not-found";
import { ErrorComponent } from "./components/common/error-component";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    queryClient,
  },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
  defaultPendingComponent: () => <Loader />,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorComponent,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: <it will be there>
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
