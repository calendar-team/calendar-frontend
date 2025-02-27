"use client";
import { use } from "react";

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
import { format, parse } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR, { Fetcher } from "swr";
import { TaskDetails, TaskDetailsSchema } from "@/app/types";
import RichTextViewer from "@/app/rich-text-editor/rich-text-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher: Fetcher<TaskDetails, [string, string]> = ([url, token]) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) =>
    res.json().then((t) => {
      return TaskDetailsSchema.parse(t);
    }),
  );

export default function Page(props: {
  params: Promise<{ date: string; taskId: string }>;
}) {
  const { data: session } = useSession();
  const params = use(props.params);
  const date = parse(params.date, "dd-MM-yyyy", new Date());

  if (isNaN(date.getTime())) {
    return <div>Error</div>;
  }

  const {
    data: task,
    error,
    isLoading,
  } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL}/tasks/${format(date, "dd-MM-yyyy")}/${params.taskId}`,
      session!.accessToken,
    ],
    fetcher,
  );
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/dashboard/todos/${format(date, "dd-MM-yyyy")}/tasks/${task!.id}`}
                    >
                      {task!.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex w-full h-full justify-center">
          <div className="flex flex-col w-[920px] space-y-4">
            <div className="text-4xl">{task!.name}</div>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextViewer
                  editorState={task!.description}
                  className="border-0"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
