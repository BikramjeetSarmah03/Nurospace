import { authClient } from "@/lib/auth-client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export default function LogoutButton({ children, ...props }: ButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authClient.signOut().then(() => {
      navigate({ to: "/auth/login", replace: true });
    });
  };

  return (
    <Button onClick={handleLogout} type="button" {...props}>
      {children || "Logout"}
    </Button>
  );
}
