import RichTextEditor from "@/app/rich-text-editor/rich-text-editor";
import {
  EMPTY_DESCRIPTION,
  EmptyFunction,
  EndVariants,
  RecurrenceApiType,
  RecurrenceType,
  TaskDef,
  TaskDefSchema,
  WeekDays,
  WeekDaysValues,
} from "@/app/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { z } from "zod";

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AdhocTaskCreator({
  date,
  onTaskCreatedHandler,
}: {
  date: Date;
  onTaskCreatedHandler: EmptyFunction;
}) {
  const { mutate: globalMutate } = useSWRConfig();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const form = useForm<
    z.infer<typeof TaskDefSchema> & Partial<{ serverError: string }>
  >({
    resolver: zodResolver(TaskDefSchema),
    defaultValues: {
      name: "",
      description: EMPTY_DESCRIPTION,
      recurrence: {
        rec_type: "Days",
        days: {
          every: 1,
          from: date,
        },
        weeks: {
          every: 1,
          from: date,
          on: {
            days: [WeekDaysValues[date.getDay()]],
          },
        },
        months: {
          every: 1,
          from: date,
          on: {
            days: [date.getDate()],
          },
        },
        years: {
          every: 1,
          from: date,
        },
      },
      ends_on: {
        type: EndVariants.After,
        value: { after: 1 },
      },
    },
  });
  const { watch } = form;

  function onSubmit(task: TaskDef) {
    const recurrence: RecurrenceApiType = (() => {
      switch (task.recurrence.rec_type) {
        case "Days":
          return {
            rec_type: "Days",
            every: task.recurrence.days.every,
            from: task.recurrence.days.from,
          };
        case "Weeks":
          return {
            rec_type: "Weeks",
            every: task.recurrence.weeks.every,
            from: task.recurrence.weeks.from,
            on_week_days: task.recurrence.weeks.on,
          };
        case "Months":
          return {
            rec_type: "Months",
            every: task.recurrence.months.every,
            from: task.recurrence.months.from,
            on_month_days: task.recurrence.months.on,
          };
        case "Years":
          return {
            rec_type: "Years",
            every: task.recurrence.years.every,
            from: task.recurrence.years.from,
          };
      }
    })();

    fetch(
      process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit/adhoc/tasks_defs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session!.accessToken,
        },
        body: JSON.stringify({
          name: task.name,
          description: task.description,
          recurrence: recurrence,
          ends_on: task.ends_on,
        }),
      },
    )
      .then((response) => {
        return response.ok
          ? Promise.resolve()
          : response
              .json()
              .then((error) =>
                Promise.reject(
                  error.message ??
                    "Failed to create new task. Please try again later.",
                ),
              );
      })
      .then(() => {
        onTaskCreatedHandler();
        setOpen(false);
        form.reset();
        globalMutate([
          process.env.NEXT_PUBLIC_CALENDAR_BACKEND_URL + "/habit",
          session!.accessToken,
        ]);
      })
      .catch((reason) => {
        form.setError("serverError", {
          message: `${reason}`,
        });
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={300} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <Plus size={24} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>New habit</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="overflow-y-scroll max-h-screen"
      >
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <RichTextEditor
                        defaultEditorState={field.value}
                        onStateChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence</FormLabel>
                  <FormControl>
                    <Tabs
                      value={field.value.rec_type}
                      className="w-full"
                      onValueChange={(newType) => {
                        field.onChange({
                          ...field.value,
                          rec_type: newType as RecurrenceType,
                        });
                      }}
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="Days">Days</TabsTrigger>
                        <TabsTrigger value="Weeks">Weeks</TabsTrigger>
                        <TabsTrigger value="Months">Months</TabsTrigger>
                        <TabsTrigger value="Years">Years</TabsTrigger>
                      </TabsList>
                      <TabsContent value="Days">
                        <div className="flex flex-row items-center">
                          <Label className="w-9">Every</Label>
                          <FormField
                            control={form.control}
                            name="recurrence.days.every"
                            render={({ field: _ }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    value={field.value.days.every}
                                    type="number"
                                    className="ml-2 max-w-24"
                                    onChange={(e) =>
                                      field.onChange({
                                        ...field.value,
                                        days: {
                                          ...field.value.days,
                                          every: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Label className="ml-2">days</Label>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal ml-2",
                                  "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {field.value.days.from ? (
                                  format(field.value.days.from, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                required={true}
                                mode="single"
                                selected={field.value.days.from}
                                onSelect={(newFrom) => {
                                  field.onChange({
                                    ...field.value,
                                    days: {
                                      ...field.value.days,
                                      from: newFrom as Date,
                                    },
                                  });
                                }}
                                className="rounded-md border"
                                showOutsideDays
                                fixedWeeks
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TabsContent>
                      <TabsContent value="Weeks">
                        <div className="flex flex-row items-center">
                          <Label className="w-9">Every</Label>
                          <FormField
                            control={form.control}
                            name="recurrence.weeks.every"
                            render={({ field: _ }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    value={field.value.weeks.every}
                                    type="number"
                                    className="ml-2 max-w-24"
                                    onChange={(e) =>
                                      field.onChange({
                                        ...field.value,
                                        weeks: {
                                          ...field.value.weeks,
                                          every: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Label className="ml-2">weeks</Label>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal ml-2",
                                  !field.value.weeks.from &&
                                    "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {field.value.weeks.from ? (
                                  format(field.value.weeks.from, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                required={true}
                                mode="single"
                                selected={field.value.weeks.from}
                                onSelect={(newFrom) => {
                                  field.onChange({
                                    ...field.value,
                                    weeks: {
                                      ...field.value.weeks,
                                      from: newFrom as Date,
                                    },
                                  });
                                }}
                                className="rounded-md border"
                                showOutsideDays
                                fixedWeeks
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">On</Label>
                          <ToggleGroup
                            type="multiple"
                            variant="outline"
                            className="ml-2"
                            onValueChange={(value: WeekDays[]) => {
                              field.onChange({
                                ...field.value,
                                weeks: {
                                  ...field.value.weeks,
                                  on: { days: value },
                                },
                              });
                            }}
                            value={field.value.weeks.on.days}
                          >
                            <ToggleGroupItem
                              value="Mon"
                              aria-label="Toggle monday"
                            >
                              Mon
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Tue"
                              aria-label="Toggle tuesday"
                            >
                              Tue
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Wed"
                              aria-label="Toggle wednesday"
                            >
                              Wed
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Thu"
                              aria-label="Toggle thursday"
                            >
                              Thu
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Fri"
                              aria-label="Toggle friday"
                            >
                              Fri
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Sat"
                              aria-label="Toggle saturday"
                            >
                              Sat
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="Sun"
                              aria-label="Toggle sunday"
                            >
                              Sun
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </TabsContent>
                      <TabsContent value="Months">
                        <div className="flex flex-row items-center">
                          <Label className="w-9">Every</Label>
                          <FormField
                            control={form.control}
                            name="recurrence.months.every"
                            render={({ field: _ }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    value={field.value.months.every}
                                    type="number"
                                    className="ml-2 max-w-24"
                                    onChange={(e) =>
                                      field.onChange({
                                        ...field.value,
                                        months: {
                                          ...field.value.months,
                                          every: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Label className="ml-2">months</Label>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal ml-2",
                                  "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {field.value.months.from ? (
                                  format(field.value.months.from, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                required={true}
                                mode="single"
                                selected={field.value.months.from}
                                onSelect={(newFrom) => {
                                  field.onChange({
                                    ...field.value,
                                    months: {
                                      ...field.value.months,
                                      from: newFrom as Date,
                                    },
                                  });
                                }}
                                className="rounded-md border"
                                showOutsideDays
                                fixedWeeks
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">On</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal ml-2",
                                  !field.value.weeks.from &&
                                    "text-muted-foreground",
                                )}
                              >
                                <div className="truncate max-w-24">
                                  {field.value.months.on &&
                                  field.value.months.on.days.length > 0 ? (
                                    field.value.months.on.days
                                      .sort((a, b) => a - b)
                                      .join(", ")
                                  ) : (
                                    <span>Select days</span>
                                  )}
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <ToggleGroup
                                className="grid grid-cols-7 m-1"
                                type="multiple"
                                onValueChange={(value: string[]) => {
                                  field.onChange({
                                    ...field.value,
                                    months: {
                                      ...field.value.months,
                                      on: { days: value.map(Number) },
                                    },
                                  });
                                }}
                                value={field.value.months.on.days.map(String)}
                              >
                                {monthDays.map((day) => (
                                  <ToggleGroupItem
                                    key={day}
                                    value={day.toString()}
                                  >
                                    {day}
                                  </ToggleGroupItem>
                                ))}
                              </ToggleGroup>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TabsContent>
                      <TabsContent value="Years">
                        <div className="flex flex-row items-center">
                          <Label className="w-9">Every</Label>
                          <FormField
                            control={form.control}
                            name="recurrence.years.every"
                            render={({ field: _ }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    value={field.value.years.every}
                                    type="number"
                                    className="ml-2 max-w-24"
                                    onChange={(e) =>
                                      field.onChange({
                                        ...field.value,
                                        years: {
                                          ...field.value.years,
                                          every: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Label className="ml-2">years</Label>
                        </div>
                        <div className="flex flex-row items-center mt-2">
                          <Label className="w-9">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "justify-start text-left font-normal ml-2",
                                  "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 size-4" />
                                {field.value.years.from ? (
                                  format(field.value.years.from, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                required={true}
                                mode="single"
                                selected={field.value.years.from}
                                onSelect={(newFrom) => {
                                  field.onChange({
                                    ...field.value,
                                    years: {
                                      ...field.value.years,
                                      from: newFrom as Date,
                                    },
                                  });
                                }}
                                className="rounded-md border"
                                showOutsideDays
                                fixedWeeks
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ends_on"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends</FormLabel>
                  <FormControl>
                    <div className="flex flex-row items-top mt-2">
                      <RadioGroup
                        defaultValue={EndVariants.After}
                        onValueChange={(v) =>
                          field.onChange(
                            v === EndVariants.Never
                              ? { type: v }
                              : { type: v, value: { after: 1 } },
                          )
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={EndVariants.Never}
                            id={EndVariants.Never}
                          />
                          <Label>Never</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={EndVariants.After}
                            id={EndVariants.After}
                          />
                          <Label>After</Label>
                          <FormField
                            control={form.control}
                            name="ends_on.value.after"
                            render={({ field: _ }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    value={
                                      field.value.type === EndVariants.After
                                        ? field.value.value.after
                                        : 1
                                    }
                                    type="number"
                                    className="ml-2 max-w-24"
                                    disabled={
                                      watch("ends_on.type") !==
                                      EndVariants.After
                                    }
                                    onChange={(e) =>
                                      field.onChange({
                                        ...field.value,
                                        value: {
                                          after: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Label className="ml-2">times</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" variant="outline" className="w-full">
              Done
            </Button>
            {form.formState.errors.serverError && (
              <div className="grid place-items-center">
                <FormMessage>
                  {form.formState.errors.serverError.message}
                </FormMessage>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
