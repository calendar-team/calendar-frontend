import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import HabitDialog from "./habit-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/ui/animated-button";
import { SidebarMenuAction } from "@/components/ui/sidebar";

export default function HabitCreator({
  onHabitCreatedHandler,
}: {
  onHabitCreatedHandler: () => void;
}) {
  const [openHabitDialog, setOpenHabitDialog] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <HabitDialog
      onSubmitEventHandler={createHabit}
      open={openHabitDialog}
      onOpenChange={setOpenHabitDialog}
      dialogTitle="New habit"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <SidebarMenuAction>
                <PlusIcon />
              </SidebarMenuAction>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>New habit</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </HabitDialog>
  );

  function createHabit(name: string, description: string) {
    fetch(process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session!.accessToken,
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject("The habit could not be created");
      })
      .then((body) => habitCreated(body.name, body.id))
      .catch((error) => alert(error));
  }

  function habitCreated(habitName: string, habitId: string) {
    setOpenHabitDialog(false);
    onHabitCreatedHandler();
    toast.custom(
      (t) => (
        <div className="border rounded-md p-4 w-[356px] flex flex-row">
          <div className="grow flex flex-col">
            <p className="font-bold">Habit created successfully</p>
            <p className="font-light line-clamp-1">{habitName}</p>
          </div>
          <AnimatedButton
            onClick={() => {
              router.push(`/dashboard/habits/${habitId}`);
              toast.dismiss(t);
            }}
          >
            View
          </AnimatedButton>
        </div>
      ),
      { duration: 10000 },
    );
  }
}
