import RichTextViewer from "@/app/rich-text-editor/rich-text-viewer";
import { EmptyFunction, TaskDefApi } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSWRConfig } from "swr";

export default function TaskDefinitionDetails({
  task: taskDef,
  habitId,
  onTaskDefDeleteHandler,
}: {
  task: TaskDefApi;
  habitId: string;
  onTaskDefDeleteHandler: EmptyFunction;
}) {
  const { mutate: globalMutate } = useSWRConfig();
  const { data: session } = useSession();

  const recurrence = (() => {
    switch (taskDef.recurrence.rec_type) {
      case "Days": {
        if (taskDef.recurrence.every === 1) {
          return `Daily`;
        }
        return `Every ${taskDef.recurrence.every} days`;
      }
      case "Weeks": {
        if (taskDef.recurrence.every === 1) {
          return `Weekly on ${taskDef.recurrence.on_week_days!.days.toString()}`;
        }
        return `Every ${taskDef.recurrence.every} weeks on ${taskDef.recurrence.on_week_days!.days.toString()}`;
      }
      case "Months": {
        if (taskDef.recurrence.every === 1) {
          return `Monthly on ${taskDef.recurrence.on_month_days!.days.sort((a, b) => a - b).toString()}`;
        }
        return `Every ${taskDef.recurrence.every} months on ${taskDef.recurrence.on_month_days!.days.sort((a, b) => a - b).toString()}`;
      }
      case "Years": {
        if (taskDef.recurrence.every === 1) {
          return `Yearly`;
        }
        return `Every ${taskDef.recurrence.every} years`;
      }
    }
  })();

  function deleteTaskDef() {
    fetch(
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL +
        "/habit/" +
        habitId +
        "/tasks_defs/" +
        taskDef.id,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session!.accessToken,
        },
      },
    )
      .then((response) => {
        return response.ok
          ? Promise.resolve()
          : Promise.reject(
              "Failed to delete task definition. Please try again later.",
            );
      })
      .then(() => {
        onTaskDefDeleteHandler();
        globalMutate([
          process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit",
          session!.accessToken,
        ]);
      })
      .catch((reason) => {
        alert(reason);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row">
            <div className="grow">{taskDef.name}</div>
            <div>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                onClick={deleteTaskDef}
              >
                <Trash2Icon size={16} />
              </Button>
            </div>
          </div>
        </CardTitle>
        <CardDescription>{recurrence}</CardDescription>
        <CardContent className="p-0">
          <div>
            <Label>Description:</Label>
            <RichTextViewer editorState={taskDef.description} />
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
