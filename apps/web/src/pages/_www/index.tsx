import { createFileRoute } from "@tanstack/react-router";

import WaitlistPage from "@/components/landing/waitlist";

export const Route = createFileRoute("/_www/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <WaitlistPage />;
}
