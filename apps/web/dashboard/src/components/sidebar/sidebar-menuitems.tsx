import { Link } from "@tanstack/react-router";

import {
  BotIcon,
  CheckSquareIcon,
  ChevronRightIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SquareTerminalIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function SidebarMenuItems() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <LayoutDashboardIcon />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={"Chats"} asChild>
                  <div>
                    <Link
                      to="/c/new"
                      className="flex items-center gap-2 w-full"
                    >
                      <SquareTerminalIcon className="size-4" />
                      Chats
                    </Link>
                    <ChevronRightIcon className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform duration-200" />
                  </div>
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={"/"}>
                        <span>{"New Chat"}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/r">
                <FileTextIcon />
                Resources
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <CheckSquareIcon />
                Tasks
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <BotIcon />
                Agents
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
