"use client";

import * as React from "react";
import { DatePicker } from "@/components/date-picker";
import { AppSidebar } from "./app-sidebar";
import Link from "next/link";
import { Button } from "./ui/button";

export function TodoSidebar({ date }: { date?: Date }) {
  return (
    <AppSidebar projectIndex={0}>
      <DatePicker date={date} />
      <Button variant="ghost" className="mx-4">
        <Link href="/dashboard/todos/all">See all pending tasks</Link>
      </Button>
    </AppSidebar>
  );
}
