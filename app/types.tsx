import { z } from "zod";

export interface Event {
  date_time: Date;
}

export interface Habit {
  id: string;
  name: string;
  state: string;
}

export interface EmptyFunction {
  (): void;
}

export const EMPTY_DESCRIPTION =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const RecurrenceTypeSchema = z.union([
  z.literal("Days"),
  z.literal("Weeks"),
  z.literal("Months"),
  z.literal("Years"),
]);
export type RecurrenceType = z.infer<typeof RecurrenceTypeSchema>;

const WeekDaysSchema = z.union([
  z.literal("Mon"),
  z.literal("Tue"),
  z.literal("Wed"),
  z.literal("Thu"),
  z.literal("Fri"),
  z.literal("Sat"),
  z.literal("Sun"),
]);
export type WeekDays = z.infer<typeof WeekDaysSchema>;
export const WeekDaysValues: WeekDays[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const DaysRecurrenceSchema = z.object({
  every: z.coerce.number().int().positive() as z.ZodNumber,
  from: z.coerce.date() as z.ZodDate,
});

export type DaysRecurrence = z.infer<typeof DaysRecurrenceSchema>;

const WeeksRecurrenceSchema = z.object({
  every: z.coerce.number().int().positive() as z.ZodNumber,
  from: z.coerce.date() as z.ZodDate,
  on: z.object({
    days: z.array(WeekDaysSchema),
  }),
});

export type WeeksRecurrence = z.infer<typeof WeeksRecurrenceSchema>;

const MonthsRecurrenceSchema = z.object({
  every: z.coerce.number().int().positive() as z.ZodNumber,
  from: z.coerce.date() as z.ZodDate,
  on: z.object({
    days: z.array(z.coerce.number().int().min(1).max(31) as z.ZodNumber),
  }),
});

export type MonthsRecurrence = z.infer<typeof WeeksRecurrenceSchema>;

const YearsRecurrenceSchema = z.object({
  every: z.coerce.number().int().positive() as z.ZodNumber,
  from: z.coerce.date() as z.ZodDate,
});

export type YearsRecurrence = z.infer<typeof WeeksRecurrenceSchema>;

const RecurrenceSchema = z.object({
  rec_type: RecurrenceTypeSchema,
  days: DaysRecurrenceSchema,
  weeks: WeeksRecurrenceSchema,
  months: MonthsRecurrenceSchema,
  years: YearsRecurrenceSchema,
});

export type Recurrence = z.infer<typeof RecurrenceSchema>;

const RecurrenceApiSchema = z.object({
  rec_type: RecurrenceTypeSchema,
  every: z.number().int().positive() as z.ZodNumber,
  from: z.coerce.date() as z.ZodDate,
  on_week_days: z.optional(
    z.nullable(
      z.object({
        days: z.array(WeekDaysSchema),
      }),
    ),
  ),
  on_month_days: z.optional(
    z.object({
      days: z.array(z.number().int().min(1).max(31)),
    }),
  ),
});

export type RecurrenceApiType = z.infer<typeof RecurrenceApiSchema>;

const EndVariantsEnum = z.enum(["Never", "After"]);
export const EndVariants = EndVariantsEnum.enum;

const EndsSchema = z.union([
  z.object({ type: z.literal(EndVariants.Never) }),
  z.object({
    type: z.literal(EndVariants.After),
    value: z.object({
      after: z.coerce.number().int().positive() as z.ZodNumber,
    }),
  }),
]);

export const TaskDefSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  recurrence: RecurrenceSchema,
  ends_on: EndsSchema,
});

export type TaskDef = z.infer<typeof TaskDefSchema>;

export const TaskDefApiSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  recurrence: RecurrenceApiSchema,
});
export type TaskDefApi = z.infer<typeof TaskDefApiSchema>;

export const HabitDetailsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
});

export type HabitDetails = z.infer<typeof HabitDetailsSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  state: z.enum(["Pending", "Done", "Cancelled"]),
  due_on: z.coerce.date() as z.ZodDate,
  done_on: z.coerce.date() as z.ZodDate,
  is_future: z.boolean(),
});

export const TaskArraySchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;

export const TaskDetailsSchema = TaskSchema.extend({ description: z.string() });

export type TaskDetails = z.infer<typeof TaskDetailsSchema>;
