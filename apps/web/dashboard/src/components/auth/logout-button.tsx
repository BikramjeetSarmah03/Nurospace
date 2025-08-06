import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { Button, type ButtonProps } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

import { queryClient } from "@/lib/query-client";
import { USER_KEYS } from "@/config/query-keys";

export default function LogoutButton({ children, ...props }: ButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await authClient.signOut();

      if (res.error) throw new Error(res.error.message);

      queryClient
        .refetchQueries({
          queryKey: [USER_KEYS.MY_PROFILE],
        })
        .then(() => {
          navigate({
            to: "/auth/login",
            replace: true,
          }).then(() => {
            toast.success("Logged Out Successfully");
          });
        });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Button type="button" onClick={handleLogout} {...props} asChild>
      {children}
    </Button>
  );
}
