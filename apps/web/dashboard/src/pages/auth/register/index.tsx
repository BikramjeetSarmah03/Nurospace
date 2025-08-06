import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

import { RegisterForm } from "../_components/register-form";

export const Route = createFileRoute("/auth/register/")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="grid lg:grid-cols-2 min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start gap-2">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex justify-center items-center bg-primary rounded-md size-6 text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Nurospace
          </Link>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative bg-muted">
        <img
          src="/placeholder.svg"
          alt="placeholder"
          className="absolute inset-0 dark:brightness-[0.2] dark:grayscale w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
