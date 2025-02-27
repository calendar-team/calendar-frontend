import { useSWRConfig } from "swr";
import { useState } from "react";
import { useSession } from "next-auth/react";
import HabitDialog from "./habit-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { HabitDetails } from "@/app/types";

export default function HabitEditor({
  habit,
  onHabitChangeHandler,
}: {
  habit: HabitDetails;
  onHabitChangeHandler(): void;
}) {
  const [open, setOpen] = useState(false);
  const { mutate: globalMutate } = useSWRConfig();

  const { data: session } = useSession();

  return (
    <HabitDialog
      open={open}
      onOpenChange={setOpen}
      onSubmitEventHandler={editHabit}
      defaultHabitName={habit.name}
      defaultHabitDescription={habit.description}
      dialogTitle="Edit habit"
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <SquarePen className="size-4" />
          <div className="ml-1">Edit Habit</div>
        </Button>
      </DialogTrigger>
    </HabitDialog>
  );

  function editHabit(name: string, description: string) {
    fetch(process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit/" + habit.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session!.accessToken,
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    }).then((response) => {
      response.ok
        ? onSuccessHandler()
        : alert("The habit could not be modified");
    });
  }

  function onSuccessHandler() {
    onHabitChangeHandler();
    setOpen(false);
    globalMutate([
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit",
      session!.accessToken,
    ]);
  }
}
