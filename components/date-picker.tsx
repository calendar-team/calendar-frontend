import { Calendar } from "@/components/ui/calendar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function DatePicker({ date }: { date?: Date }) {
  const router = useRouter();

  return (
    <SidebarMenu>
      <Popover>
        <PopoverTrigger
          asChild
          className="px-2 hidden group-data-[collapsible=icon]:block"
        >
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Calendar">
              <CalendarIcon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="p-0 w-[276px]">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              router.push("/dashboard/todos/" + format(newDate!, "dd-MM-yyyy"));
            }}
            showOutsideDays
            fixedWeeks
          />
        </PopoverContent>
      </Popover>
      <Calendar
        className="group-data-[collapsible=icon]:hidden"
        mode="single"
        selected={date}
        onSelect={(newDate) => {
          router.push("/dashboard/todos/" + format(newDate!, "dd-MM-yyyy"));
        }}
        showOutsideDays
        fixedWeeks
      />
    </SidebarMenu>
  );
}
