import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/logout-button";

import type { IUser } from "@/config/types";

interface HeaderProps {
  user: IUser;
}

export default function Header({ user }: HeaderProps) {
  const links = [{ to: "/", label: "Home" }];

  return (
    <div>
      <div className="flex flex-row justify-between items-center px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
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
      <hr />
    </div>
  );
}
