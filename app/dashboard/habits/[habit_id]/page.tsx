"use client";
import { use } from "react";

import { Button } from "@/components/ui/button";
import useSWR, { useSWRConfig, Fetcher } from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HabitEditor from "../editor";
import RichTextViewer from "@/app/rich-text-editor/rich-text-viewer";
import { BookOpenIcon, ListTodoIcon, SettingsIcon, Trash2 } from "lucide-react";
import { HabitDetails } from "@/app/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksDefinitions from "./task-defs";
import TasksDetails from "./tasks-details";
import { HabitSidebar } from "@/components/habit-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const fetcher: Fetcher<HabitDetails, [string, string]> = ([url, token]) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) =>
    res.json(),
  );

export default function Page(props: { params: Promise<{ habit_id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const { data: session } = useSession();

  const {
    data: habit,
    error,
    isLoading,
    mutate,
  } = useSWR(
    [
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL +
        "/habit/" +
        params.habit_id,
      session!.accessToken,
    ],
    fetcher,
  );

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <>
      <HabitSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={"/dashboard/habits/" + habit!.id}>
                      {habit!.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex w-full h-full justify-center">
          <div className="flex flex-col w-[920px]">
            <div className="h-full flex flex-col">
              <div className="grow border rounded-md mt-2 mr-2 mb-2 shadow-md">
                <div className="flex flex-row ml-1">
                  <h1 className="text-xl ml-1">{habit!.name}</h1>
                </div>
                <div>
                  <Tabs defaultValue="overview" className="m-2">
                    <TabsList>
                      <TabsTrigger value="overview">
                        <BookOpenIcon size={16} />
                        <div className="ml-1">Overview</div>
                      </TabsTrigger>
                      <TabsTrigger value="tasks">
                        <ListTodoIcon size={16} />
                        <div className="ml-1">Tasks Definitions</div>
                      </TabsTrigger>
                      <TabsTrigger value="settings">
                        <SettingsIcon size={16} />
                        <div className="ml-1">Settings</div>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <RichTextViewer editorState={habit!.description} />
                      <TasksDetails habitId={params.habit_id} />
                    </TabsContent>
                    <TabsContent value="tasks">
                      <TasksDefinitions habitId={params.habit_id} />
                    </TabsContent>
                    <TabsContent value="settings">
                      <div className="flex flex-col w-[320px]">
                        <HabitEditor
                          habit={habit!}
                          onHabitChangeHandler={() => {
                            mutate();
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={deleteHabit}
                          className="border-red-900 mt-2"
                        >
                          <Trash2 size={16} />
                          <div className="ml-1">Delete habit</div>
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );

  function deleteHabit() {
    fetch(
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL +
        "/habit/" +
        params.habit_id,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session!.accessToken,
        },
      },
    ).then((response) => {
      response.ok ? clean() : alert("The habit could not be deleted");
    });
  }

  function clean() {
    globalMutate([
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit",
      session!.accessToken,
    ]);
    router.push("/dashboard/habits");
  }
}
