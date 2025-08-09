import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/logout-button";

import type { IUser } from "@/config/types";

interface HeaderProps {
  user: IUser;
}

export default function Header({ user }: HeaderProps) {
  return (
    <div className="z-50 flex flex-row justify-between items-center px-2 py-1 border-b">
      <div className="flex items-center gap-2">
        <img src="/logo_dark.svg" alt="" className="size-8 text-primary" />

        <h1 className="font-semibold text-primary text-lg">Nurospace</h1>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <LogoutButton>
            <span>Logout</span>
          </LogoutButton>
        ) : (
          <Button asChild>
            <Link to="/auth/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
