import useSWR, { Fetcher, useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import HeatMap from "@/app/heatmap/heatmap";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon, CheckIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/app/types";

const fetcher: Fetcher<Task[], [string, string]> = ([url, token]) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) =>
    res.json(),
  );

export default function TasksDetails({ habitId }: { habitId: string }) {
  const { mutate: globalMutate } = useSWRConfig();
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "due_on",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {" "}
            Due on
            <ArrowUpDownIcon className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = format(row.getValue("due_on"), "PPP");
        return <>{value}</>;
      },
    },
    {
      id: "action",
      cell: ({ row }) => {
        return (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeState(row.original, "Done")}
            >
              <CheckIcon className="mr-1 size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeState(row.original, "Cancelled")}
              className="ml-2"
            >
              <XIcon className="mr-1 size-4" />
            </Button>
          </>
        );
      },
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 6);

  let endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 6);

  const { data: session } = useSession();

  const {
    data: tasks,
    error,
    isLoading,
    mutate,
  } = useSWR(
    [
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL +
        "/habit/" +
        habitId +
        "/tasks",
      session!.accessToken,
    ],
    fetcher,
  );

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="flex flex-col">
      <HeatMap
        startDate={startDate}
        endDate={endDate}
        tasks={tasks!}
        today={today}
      />
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={tasks!.filter((e) => e.state === "Pending")}
        />
      </div>
    </div>
  );

  function changeState(task: Task, state: "Done" | "Cancelled") {
    task.state = "Done";
    fetch(process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/tasks/" + task.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session!.accessToken,
      },
      body: JSON.stringify({
        state: state,
      }),
    })
      .then((response) => {
        return response.ok
          ? Promise.resolve()
          : response
              .json()
              .then((error) =>
                Promise.reject(
                  error.message ??
                    "Failed to complete task. Please try again later.",
                ),
              );
      })
      .then(() => {
        mutate();
        globalMutate([
          process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit",
          session!.accessToken,
        ]);
      })
      .catch((reason) => {
        alert(`Error: ${reason}`);
      });
  }
}
