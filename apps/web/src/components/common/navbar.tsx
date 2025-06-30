import { Link } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";

import { ModeToggle } from "../mode-toggle";
import LogoutButton from "../buttons/logout-button";

const links = [{ to: "/", label: "Home" }];

export default function Navbar() {
  return (
    <header className="top-0 z-10 sticky flex flex-row justify-between items-center bg-background px-4 py-2 border-b">
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
        <ModeToggle />

        <LogoutButton variant={"outline"}>
          <LogOutIcon />
          Logout
        </LogoutButton>
      </div>
    </header>
  );
}
