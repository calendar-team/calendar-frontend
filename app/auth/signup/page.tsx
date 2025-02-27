"use client";

import { Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LinkWithCallback from "../link-with-callback";

const formSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(120),
  timeZone: z.string(),
});

export default function Signup() {
  const { status: sessionStatus } = useSession();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const form = useForm<
    z.infer<typeof formSchema> & Partial<{ serverError: string }>
  >({
    mode: "all",
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      timeZone: timeZone,
    },
  });

  if (sessionStatus === "loading") {
    return <div>loading</div>;
  }

  if (sessionStatus === "authenticated") {
    return (
      <Suspense>
        <Redirect />
      </Suspense>
    );
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    signIn("signup", {
      redirect: false,
      username: values.username,
      password: values.password,
      timeZone: values.timeZone,
    }).then((response) => {
      if (response === undefined) {
        form.setError("serverError", {
          message: "Unable to sign up. Please try again later.",
        });
        return;
      }

      if (response.ok) {
        form.clearErrors("serverError");
        return;
      }

      if (response.error == "CredentialsSignin") {
        form.setError("serverError", { message: "Sign up failed." });
        return;
      } else {
        form.setError("serverError", {
          message: "Unable to sign in. Please try again later.",
        });
        return;
      }
    });
  }

  return (
    <div className="grid place-items-center h-full">
      <Card className="w-full max-w-[380px] border-0 sm:border shadow-none sm:shadow-xs">
        <CardHeader className="p-0 sm:p-6">
          <CardTitle className="text-center">Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TimeZone</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline" className="w-full">
                Sign up
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
        </CardContent>
        <CardFooter className="grid place-items-center">
          <div>
            Already a member?{" "}
            <LinkWithCallback
              href="/auth/signin"
              className="font-semibold hover:underline"
            >
              Sign in
            </LinkWithCallback>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function Redirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    router.push(
      searchParams.has("callbackUrl") ? searchParams.get("callbackUrl")! : "/",
    );
  }, [searchParams, router]);

  return <></>;
}
