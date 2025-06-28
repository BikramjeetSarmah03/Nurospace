import WaitlistPage from "@/components/mvpblocks/waitlist";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_www/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <WaitlistPage />;
}
