import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { EmptyFunction, Task } from "../../types";
import { useSession } from "next-auth/react";
import { CircleX, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";

const tickVariants = {
  pressed: (taskState: "Done" | "Cancelled" | "Pending") => ({
    pathLength: taskState === "Pending" ? 0.2 : 0.85,
  }),
  Done: { pathLength: 1, color: "var(--done-tick-color)" },
  Cancelled: { pathLength: 1, color: "var(--cancelled-tick-color)" },
  Pending: { pathLength: 0, color: "var(--pending-tick-color)" },
};

const boxVariants = {
  Done: { fill: "var(--done-fill-color)" },
  Cancelled: { fill: "var(--cancelled-fill-color)" },
  Pending: { fill: "var(--pending-fill-color)" },
};

const labelVariants = {
  Done: {
    color: "var(--done-label-color)",
    x: [1, 5, 1],
  },
  Cancelled: {
    color: "var(--cancelled-label-color)",
    x: [1, 5, 1],
  },
  Pending: {
    color: "var(--pending-label-color)",
    x: [1, -3, 1],
  },
};

const lineVariants = {
  Done: {
    width: "100%",
    x: [1, 5, 1],
    background: "var(--done-label-color)",
  },
  Cancelled: {
    width: "100%",
    x: [1, 5, 1],
    background: "var(--cancelled-label-color)",
  },
  Pending: {
    width: "0%",
    x: [1, -3, 1],
    background: "var(--pending-label-color)",
  },
};

export default function TaskWithCheckbox({
  task,
  onTaskStateChange,
}: {
  task: Task;
  onTaskStateChange: EmptyFunction;
}) {
  const { data: session } = useSession();
  const [taskState, setTaskState] = useState(task.state);
  const pathLength = useMotionValue(taskState === "Pending" ? 0 : 1);
  const opacity = useTransform(pathLength, [0.05, 0.15], [0, 1]);

  return (
    <Link
      href={`/dashboard/todos/${format(task.due_on, "dd-MM-yyyy")}/tasks/${task.id}`}
      className="flex flex-row w-full border rounded-md p-2 hover:bg-secondary hover:cursor-pointer"
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group cursor-pointer w-[30px]"
        onClick={(e) => {
          const newState = taskState === "Pending" ? "Done" : "Pending";
          setTaskState(newState);
          changeState(task, newState);
          e.preventDefault();
        }}
        initial={false}
        animate={taskState}
        whileHover="hover"
        whileTap="pressed"
      >
        <motion.rect
          width="18"
          height="18"
          x="3"
          y="3"
          rx="2"
          variants={boxVariants}
          initial={false}
          className="[--done-fill-color:hsl(var(--input))] [--cancelled-fill-color:hsl(var(--input))] [--pending-fill-color:#00000000] group-hover:fill-background"
        />
        <motion.path
          d="M 6.66666 12.6667 L 9.99999 16 L 17.3333 8.66669"
          className="fill-transparent [--done-tick-color:#22c55e] [--pending-tick-color:#00000000] [--cancelled-tick-color:#00000000] stroke-[2px]"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={tickVariants}
          style={{ pathLength, opacity }}
          custom={taskState}
          initial={false}
        />
        <motion.path
          d="M 8 8 L 16 16"
          className="fill-transparent [--done-tick-color:#00000000] [--pending-tick-color:#00000000] [--cancelled-tick-color:#ef4444] stroke-[2px]"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={tickVariants}
          style={{ pathLength, opacity }}
          custom={taskState}
          initial={false}
        />
        <motion.path
          d="M 8 16 L 16 8"
          className="fill-transparent [--done-tick-color:#00000000] [--pending-tick-color:#00000000] [--cancelled-tick-color:#ef4444] stroke-[2px]"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={tickVariants}
          style={{ pathLength, opacity }}
          custom={taskState}
          initial={false}
        />
      </motion.svg>
      <div className="flex grow truncate">
        <div className="flex truncate relative [--done-label-color:hsl(var(--primary))] [--cancelled-label-color:hsl(var(--primary))] [--pending-label-color:hsl(var(--foreground))]">
          <motion.label
            className="flex mx-1 text-2xl"
            variants={labelVariants}
            animate={taskState}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            initial={false}
          >
            <p className="truncate hover:cursor-pointer">{task.name}</p>
          </motion.label>
          <motion.div
            className="absolute top-1/2 h-0.5"
            variants={lineVariants}
            animate={taskState}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            initial={false}
          />
        </div>
      </div>
      <div className="flex flex-row items-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={(e) => e.preventDefault()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={taskState !== "Pending"}
              onClick={() => {
                setTaskState("Cancelled");
                changeState(task, "Cancelled");
              }}
            >
              <CircleX />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );

  function changeState(task: Task, state: "Done" | "Pending" | "Cancelled") {
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
        onTaskStateChange();
      })
      .catch((reason) => {
        alert(`Error: ${reason}`);
      });
  }
}
