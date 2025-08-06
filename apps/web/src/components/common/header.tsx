"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/logout-button";

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
  const pathname = usePathname();

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
          {pathname === "/" ? (
            <Button variant={"outline"} size={"sm"} asChild>
              <Link href={`/u/${user?.name}`}>Go to Dashboard</Link>
            </Button>
          ) : user ? (
            <LogoutButton>
              <span>Logout</span>
            </LogoutButton>
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
