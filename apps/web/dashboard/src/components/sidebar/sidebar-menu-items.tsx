import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  BotIcon,
  CheckSquareIcon,
  ChevronRightIcon,
  EditIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  SquareTerminalIcon,
  TrashIcon,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { chatService } from "@/services/chat/chat.service";

import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/query-client";
import { CHAT_QUERY } from "@/config/query-keys/chat";

export default function SidebarMenuItems() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { isLoading: isChatsLoading, data: chatsData } = useQuery({
    queryKey: [CHAT_QUERY.CHATS],
    queryFn: chatService.getAllChats,
  });

  const chats = chatsData?.success ? chatsData.data : [];

  const isActive = (slug: string) => {
    return pathname.split("/c/")[1] === slug;
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await chatService.deleteChat(chatId);

      if (!res.success) throw Error(res.message);

      queryClient.invalidateQueries({
        queryKey: [CHAT_QUERY.CHATS],
      });
      toast.success("Chat Deleted Successfully");

      if (pathname !== "/c/new") {
        navigate({ to: "/c/new" });
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

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
                  <div
                    className={cn(
                      pathname === "/c/new"
                        ? "bg-sidebar-accent rounded-md"
                        : "",
                    )}
                  >
                    <Link className="flex items-center gap-2" to="/c/new">
                      <SquareTerminalIcon className="size-4" />
                      <span className="mt-0.5">Chats</span>
                    </Link>
                    {isChatsLoading ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : chats.length > 0 ? (
                      <ChevronRightIcon className="ml-auto group-data-[state=open]/collapsible:rotate-90 transition-transform duration-200 cursor-pointer" />
                    ) : null}
                  </div>
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {isChatsLoading ? (
                    <Loader2Icon className="ml-2 size-4 animate-spin" />
                  ) : chats.length > 0 ? (
                    chats.map((chat) => (
                      <SidebarMenuSubItem key={chat.id}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to={"/c/$slug"}
                            params={{
                              slug: chat.slug,
                            }}
                            className={cn(
                              "flex justify-between items-center pr-2",
                              isActive(chat.slug)
                                ? "bg-sidebar-accent rounded-md"
                                : "",
                            )}
                          >
                            <span>{chat.title}</span>
                            <ChatDropdown
                              onDelete={() => handleDeleteChat(chat.id)}
                            />
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))
                  ) : null}
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

function ChatDropdown({ onDelete }: { onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <EllipsisVerticalIcon size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-20 min-w-fit">
        <DropdownMenuItem className="text-xs cursor-pointer">
          <EditIcon className="size-3" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <TrashIcon className="size-3" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
