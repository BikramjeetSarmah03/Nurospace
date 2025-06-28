import { createFileRoute } from "@tanstack/react-router";

import LoginForm from "./_components/form/login-form";
import AuthWrapper from "./_components/auth-wrapper";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthWrapper>
      <LoginForm />
    </AuthWrapper>
  );
}
