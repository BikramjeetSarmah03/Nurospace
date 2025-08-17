import WaitlistPage from "@/components/mvpblocks/waitlist";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const supabase = createClient(cookies());

  // 1. Fetch total count from waitlist
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact" });

  return <WaitlistPage count={count} />;
}
