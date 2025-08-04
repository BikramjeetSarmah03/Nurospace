"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl container">
      <div className="flex justify-between items-center bg-background shadow px-4 py-2 border-b">
        <div>LOGO</div>

        <div className="flex items-center gap-2">
          <Button asChild variant={"outline"}>
            <Link href={"/auth/login"}>Login</Link>
          </Button>

          <Button asChild>
            <Link href={"/auth/register"}>Register</Link>
          </Button>
        </div>
      </div>

      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="gap-6 grid">
        <section className="p-4 border rounded-lg">
          <h2 className="mb-2 font-medium">API Status</h2>
        </section>
      </div>
    </div>
  );
}
