"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const links = [{ to: "/", label: "Home" }];

  return (
    <div>
      <div className="flex flex-row justify-between items-center px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />

          {user ? (
            <Button>Logout</Button>
          ) : (
            <div>
              <Button asChild>
                <Link href={"/auth/login"}>Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
}
