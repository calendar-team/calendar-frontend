"use client";

import useSWR, { Fetcher } from "swr";
import { Task, TaskArraySchema } from "@/app/types";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import TaskWithCheckbox from "../task-with-checkbox";

const fetcher: Fetcher<Task[], [string, string]> = ([url, token]) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) =>
    res.json().then((t) => {
      return TaskArraySchema.parse(t);
    }),
  );

export default function PendignTasksList({ today }: { today: Date }) {
  const { data: session } = useSession();
  const {
    data: tasks,
    error,
    isLoading,
    mutate,
  } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL}/tasks`,
      session!.accessToken,
    ],
    fetcher,
  );
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  const tasksByDate = new Map<number, Task[]>();
  tasks?.forEach((t) => {
    const key = t.due_on.getTime();
    const bucket = tasksByDate.get(key) ?? [];
    bucket.push(t);
    tasksByDate.set(key, bucket);
  });

  const values = [...tasksByDate.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="size-full flex mb-8">
      <div className="w-full flex flex-col space-y-4">
        {values.map((v, index) => (
          <div className="w-full" key={index}>
            <div className="w-full text-center mb-8">
              <h1 className="text-2xl">
                {v[0] === today.getTime() ? "Today" : format(v[0], "PP")}
              </h1>
            </div>
            <div className="w-full flex flex-col space-y-4">
              {v[1].map((task: Task) => (
                <TaskWithCheckbox
                  task={task}
                  key={task.id}
                  onTaskStateChange={() => mutate()}
                  pauseAfter={1000}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
