import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { EmptyFunction, Task } from "../../types";
import { useSession } from "next-auth/react";
import {
  AlignVerticalJustifyCenter,
  CircleX,
  EllipsisVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const tickVariants = {
  pressed: (isChecked: boolean) => ({ pathLength: isChecked ? 0.85 : 0.2 }),
  checked: { pathLength: 1 },
  unchecked: { pathLength: 0 },
};

const boxVariants = {
  checked: { fill: "var(--checked-fill-color)" },
  unchecked: { fill: "var(--unchecked-fill-color)" },
};

const labelVariants = {
  checked: {
    color: "var(--checked-label-color)",
    x: [1, 5, 1],
  },
  unchecked: {
    color: "var(--unchecked-label-color)",
    x: [1, -3, 1],
  },
};

const lineVariants = {
  checked: {
    width: "100%",
    x: [1, 5, 1],
    background: "var(--checked-label-color)",
  },
  unchecked: {
    width: "0%",
    x: [1, -3, 1],
    background: "var(--unchecked-label-color)",
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
  const [isChecked, setIsChecked] = useState(task.state !== "Pending");
  const pathLength = useMotionValue(isChecked ? 1 : 0);
  const opacity = useTransform(pathLength, [0.05, 0.15], [0, 1]);

  return (
    <div className="flex flex-row w-full border rounded-md p-2">
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
        className="cursor-pointer w-[30px]"
        onClick={() => {
          setIsChecked(!isChecked);
          changeState(task, !isChecked ? "Done" : "Pending");
        }}
        initial={false}
        animate={isChecked ? "checked" : "unchecked"}
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
          className="[--checked-fill-color:hsl(var(--input))] [--unchecked-fill-color:#00000000]"
        />
        <motion.path
          d="M 6.66666 12.6667 L 9.99999 16 L 17.3333 8.66669"
          className="fill-transparent stroke-green-500 stroke-[2px]"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={tickVariants}
          style={{ pathLength, opacity }}
          custom={isChecked}
          initial={false}
        />
      </motion.svg>
      <div className="flex grow truncate">
        <div className="flex truncate relative [--checked-label-color:hsl(var(--primary))] [--unchecked-label-color:hsl(var(--foreground))]">
          <motion.label
            className="flex mx-1 truncate text-2xl font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor={task.id}
            variants={labelVariants}
            animate={isChecked ? "checked" : "unchecked"}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            initial={false}
          >
            <p className="truncate">{task.name}</p>
          </motion.label>
          <motion.div
            className="absolute top-1/2 h-0.5"
            variants={lineVariants}
            animate={isChecked ? "checked" : "unchecked"}
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
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsChecked(true);
                changeState(task, "Cancelled");
              }}
            >
              <CircleX />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
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
