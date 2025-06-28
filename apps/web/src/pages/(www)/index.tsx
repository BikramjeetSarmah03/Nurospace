import WaitlistPage from "@/components/mvpblocks/waitlist";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(www)/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <WaitlistPage />;
}
