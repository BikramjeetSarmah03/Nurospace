import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="flex justify-center items-center p-2 h-screen size-full text-2xl">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-bold text-4xl">404</h1>
        <p className="text-lg">Page Not Found</p>

        <p className="text-muted-foreground text-sm">
          Don't worry, even the best data sometimes gets lost in the internet...
        </p>

        <Button asChild className="my-4">
          <Link to="/">
            <ArrowLeftIcon />
            Back to dashboard
          </Link>
        </Button>

        <p className="text-muted-foreground text-sm">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
};
