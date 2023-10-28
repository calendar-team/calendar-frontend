"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type SignInErrorTypes = "CredentialsSignin" | "default";

const errors: Record<SignInErrorTypes, string> = {
  CredentialsSignin: "Sign up failed.",
  default: "Unable to sign up. Please try again later.",
};

export default function Signin() {
  const { status: sessionStatus } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorType, setErrorType] = useState(null);
  const [status, setStatus] = useState({ signedIn: false, redirectUrl: "" });

  if (sessionStatus === "loading") {
    return <div>loading</div>;
  }

  if (sessionStatus === "authenticated") {
    redirect("/");
  }

  if (status.signedIn) {
    redirect(status.redirectUrl);
  }

  const error = errorType && (errors[errorType] ?? errors.default);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign up
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div>
            <p>{error}</p>
          </div>
        )}
        <form className="space-y-6" autoComplete="off">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={username}
                onChange={(e) => {
                  setUsername(e.currentTarget.value);
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={validateInput}
            >
              Sign up
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already a member?{" "}
          <Link
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            href="/auth/signin"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  function validateInput() {
    let valid = true;
    let errstyle = "2px solid red";
    let initstyle = "1px solid grey";

    if (username.length === 0) {
      const el = document.getElementById("username");
      el.style.border = errstyle;
      valid = false;
      el.onchange = () => {
        (el.style.border = initstyle),
          (username: string) => setUsername(username);
      };
    }

    if (password.length === 0) {
      const el = document.getElementById("password");
      el.style.border = errstyle;
      valid = false;
      el.onchange = () => {
        (el.style.border = initstyle),
          (password: string) => setPassword(password);
      };
    }
    if (valid) {
      handleClick();
    }
  }

  function handleClick() {
    signIn("signup", {
      redirect: false,
      username: username,
      password: password,
      callbackUrl: "/",
    }).then((response) => {
      if (response.error) {
        setErrorType(response.error);
        return;
      }

      if (response.ok) {
        setStatus({ signedIn: true, redirectUrl: response.url });
      }
    });
  }
}
