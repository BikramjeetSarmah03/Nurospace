import { Loader2Icon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-col justify-center items-center mx-auto mt-8">
      <Loader2Icon className="animate-spin" />
      <p className="mt-2 text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}
