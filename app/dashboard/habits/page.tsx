import { HabitSidebar } from "@/components/habit-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <HabitSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/habits">Habits</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex size-full justify-center">
          <div className="flex flex-col w-[920px]">
            <div className="h-full flex flex-col">
              <div className="grow border rounded-md mt-2 mr-2 mb-2 shadow-md">
                <h1 className="text-xl ml-1">
                  Select a habit to see the details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
