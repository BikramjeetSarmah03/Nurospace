import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { Button, type ButtonProps } from "@/components/ui/button";

export default function LogoutButton({ children, ...props }: ButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await authClient.signOut();

      if (res.error) throw new Error(res.error.message);

      toast.success("Logged Out Successfully");

      router.replace("/");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Button type="button" onClick={handleLogout} {...props}>
      {children}
    </Button>
  );
}
