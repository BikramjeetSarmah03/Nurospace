import Header from "@/components/header";
import { authClient } from "@/lib/auth-client";

export default async function Dashboard() {
  const session = await authClient.getSession();

  console.log({ session });
  return (
    <div>
      <Header user={session.data?.user} />
      Dashboard
    </div>
  );
}
