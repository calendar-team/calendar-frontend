"use client";

import * as React from "react";
import { DatePicker } from "@/components/date-picker";
import { AppSidebar } from "./app-sidebar";
import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { LayoutList } from "lucide-react";
import { usePathname } from "next/navigation";

export function TodoSidebar({ date }: { date?: Date }) {
  const pathname = usePathname();

  return (
    <AppSidebar projectIndex={0}>
      <DatePicker date={date} />
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center justify-center">
          <SidebarMenuButton
            tooltip="All pending tasks"
            className="hidden group-data-[collapsible=icon]:block"
            isActive={pathname === "/dashboard/todos/all"}
          >
            <Link href="/dashboard/todos/all">
              <LayoutList size={16} />
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="mx-3 group-data-[collapsible=icon]:hidden"
            isActive={pathname === "/dashboard/todos/all"}
          >
            <Link
              href="/dashboard/todos/all"
              className="w-full flex flex-row gap-2 items-center justify-center"
            >
              <LayoutList size={16} /> All pending tasks
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </AppSidebar>
  );
}
