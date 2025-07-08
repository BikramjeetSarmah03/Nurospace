import {
  SquareTerminal,
  FileText,
  CheckSquare,
  Bot,
  UserCog,
  Plug,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { ProjectSwitcher } from "@/components/sidebar/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import type { LinkProps } from "@tanstack/react-router";

export interface NavItem {
  title: string;
  url: LinkProps["to"];
  icon: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Chats",
    url: "/c",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Feature Q&A", url: "/c/feature-qa" },
      { title: "Market Research", url: "/c/market-research" },
      { title: "User Interview", url: "/c/user-interview" },
    ],
  },
  {
    title: "Resources",
    url: "/resources",
    icon: FileText,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
    items: [
      { title: "Summarize Feedback", url: "/tasks/summarize-feedback" },
      { title: "Draft One-Pager", url: "/tasks/draft-onepager" },
      { title: "Extract Action Items", url: "/tasks/action-items" },
    ],
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
    items: [
      { title: "Summarizer Bot", url: "/agents/summarizer" },
      { title: "Market Researcher", url: "/agents/market-researcher" },
      { title: "Insight Extractor", url: "/agents/insight-extractor" },
    ],
  },
  {
    title: "Personalities",
    url: "/personalities",
    icon: UserCog,
    items: [
      { title: "CTO Copilot", url: "/personalities/cto" },
      { title: "PM Assistant", url: "/personalities/pm" },
      { title: "Legal Advisor", url: "/personalities/legal" },
    ],
  },
];

const navSecondary = [
  {
    title: "Integrations",
    url: "/integrations",
    icon: Plug,
    // items: [
    //   { title: "Notion", url: "/integrations/notion" },
    //   { title: "Slack", url: "/integrations/slack" },
    //   { title: "GitHub", url: "/integrations/github" },
    // ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    // items: [
    //   { title: "Project Settings", url: "/settings/project" },
    //   { title: "LLM Choice", url: "/settings/model" },
    //   { title: "Permissions", url: "/settings/permissions" },
    // ],
  },
];

const user = {
  name: "Bikramjeet",
  email: "you@example.com",
  avatar: "/avatars/default.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />

        <Separator />

        <NavMain items={navSecondary} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
