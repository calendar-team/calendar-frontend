"use client";

import {
  CheckCircleIcon,
  CircleDashed,
  CircleIcon,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import HabitCreator from "@/app/dashboard/habits/creator";

export function NavMain({
  items: item,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    itemsChangeHandler: () => void;
    items?: {
      title: string;
      url: string;
      isActive: boolean;
      state: string;
    }[];
  };
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={item.title}>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <HabitCreator onHabitCreatedHandler={item.itemsChangeHandler} />
          {item.items?.length ? (
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.url}>
                  <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                    <Link href={subItem.url}>
                      <div className="flex flex-col justify-center">
                        <HabitState
                          state={subItem.state}
                          className="mr-2 size-3 shrink-0"
                        />
                      </div>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          ) : null}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function HabitState({
  state,
  className = "",
}: {
  state: string;
  className?: string;
}) {
  switch (state) {
    case "Pending": {
      return <CircleIcon size={12} className={className} />;
    }
    case "Done": {
      return <CheckCircleIcon size={12} className={className} />;
    }
    case "None": {
      return <CircleDashed size={12} className={className} />;
    }
  }
}
