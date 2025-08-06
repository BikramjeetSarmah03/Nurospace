import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="bg-white dark:bg-background py-2.5 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo_dark.svg" alt="" className="size-6 text-primary" />

          <h1 className="font-semibold text-primary text-base">Nurospace</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
