"use client";

import { TodoSidebar } from "@/components/todo-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";
import TasksList from "./tasks-list";
import Link from "next/link";

export default function Page() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return (
    <>
      <TodoSidebar date={date} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/todos">To do</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={"/dashboard/todos/" + format(date, "dd-MM-yyyy")}
                    >
                      {format(date, "PP")}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex size-full justify-center">
          <div className="flex flex-col w-[920px]">
            <TasksList date={date} today={date} />
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
