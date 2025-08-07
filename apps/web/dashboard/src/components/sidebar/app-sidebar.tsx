import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavUser } from "./nav-user";
import SidebarMenuItems from "./sidebar-menuitems";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="py-2.5 border-b">
        <div className="flex items-center gap-2">
          <img
            src="/logo_light.svg"
            className="dark:hidden block size-6"
            alt="Logo"
          />
          <img
            src="/logo_dark.svg"
            className="hidden dark:block size-6"
            alt="Logo"
          />
          <h1 className="font-semibold text-primary text-base">Nurospace</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenuItems />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
