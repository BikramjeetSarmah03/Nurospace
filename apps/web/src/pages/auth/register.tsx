import { createFileRoute } from "@tanstack/react-router";

import AuthWrapper from "./_components/auth-wrapper";

import RegisterForm from "./_components/form/register-form";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthWrapper>
      <RegisterForm />
    </AuthWrapper>
  );
}
