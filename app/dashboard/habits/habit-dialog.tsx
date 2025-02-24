import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode, useEffect, useState } from "react";
import RichTextEditor from "../../rich-text-editor/rich-text-editor";
import { Dispatch, SetStateAction } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EMPTY_DESCRIPTION } from "../../types";

interface HabitDialogSubmitFunction {
  (habitName: string, habitDescription: string): void;
}

const formSchema = z.object({
  name: z.string().min(1),
});

export default function HabitDialog({
  open,
  onOpenChange,
  onSubmitEventHandler,
  defaultHabitName = "",
  defaultHabitDescription = EMPTY_DESCRIPTION,
  dialogTitle,
  children,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmitEventHandler: HabitDialogSubmitFunction;
  defaultHabitName?: string;
  defaultHabitDescription?: string;
  dialogTitle: string;
  children: ReactNode;
}) {
  const [habitDescription, setHabitDescription] = useState(
    defaultHabitDescription,
  );
  const form = useForm<
    z.infer<typeof formSchema> & Partial<{ serverError: string }>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultHabitName,
    },
  });

  useEffect(() => {
    form.setValue("name", defaultHabitName);
    setHabitDescription(defaultHabitDescription);
  }, [defaultHabitName, defaultHabitDescription]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitEventHandler(values.name, habitDescription);
    setHabitDescription(defaultHabitDescription);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="overflow-y-scroll max-h-screen"
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
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
            <div className="relative">
              <RichTextEditor
                defaultEditorState={habitDescription}
                onStateChange={setHabitDescription}
              />
            </div>
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
