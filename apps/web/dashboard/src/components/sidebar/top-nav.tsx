import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TopNav() {
  return (
    <div className="top-0 z-50 sticky flex justify-between items-center bg-sidebar px-4 py-2 border-b">
      <SidebarTrigger />
    </div>
  );
}
