import React from "react";
import Image from "next/image";
import img1 from "./sport.svg";
import img2 from "./calendar.svg";
import img3 from "./coding.svg";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WelcomePage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col xl:flex-row h-full">
      <div className="flex flex-col mb-16 md:mb-0 md:basis-1/2 xl:basis-full">
        <div className="grow"></div>
        <div className="grid grid-rows-4 items-center justify-items-center">
          <div>
            <p className="font-medium text-3xl md:text-5xl xl:text-6xl text-[#77AD86]">
              Welcome
            </p>
          </div>
          <div>
            <p className="font-medium md:text-1xl md:text-2xl xl:text-3xl">
              This is a calendar for your habits
            </p>
          </div>
          <div>
            <Link
              href="https://calendar-team.github.io/calendar-docs/"
              className="font-medium text-sm md:text-1xl xl:text-2xl underline"
            >
              Feel free to learn more about this app
            </Link>
          </div>
          <div className="flex justify-center space-x-4 relative">
            <Button variant="outline" className="px-0">
              <Link
                className="font-semibold text-xs md:text-xs xl:text-sm px-1 md:px-5 py-1 md:py-1.5 xl:py-2.5"
                href={
                  searchParams.callbackUrl
                    ? "/auth/signup?callbackUrl=" +
                      encodeURIComponent(searchParams.callbackUrl)
                    : "/auth/signup"
                }
              >
                Get Started
              </Link>
            </Button>
            <Button variant="outline" className="px-0">
              <Link
                className="font-semibold text-xs md:text-xs xl:text-sm px-3 md:px-5 py-1 md:py-1.5 xl:py-2.5"
                href={
                  searchParams.callbackUrl
                    ? "/auth/signin?callbackUrl=" +
                      encodeURIComponent(searchParams.callbackUrl)
                    : "/auth/signin"
                }
              >
                Sign in
              </Link>
            </Button>
          </div>
        </div>
        <div className="grow"></div>
      </div>

      <div className="grid grid-rows-1 grid-cols-3 md:basis-1/2 xl:grid-cols-8 xl:basis-full relative">
        <div className="col-start-1 col-span-1 xl:col-start-4 xl:col-span-4 xl:row-start-1 xl:top-[5%] absolute">
          <Image
            className="dark:brightness-75"
            src={img1}
            alt=""
            priority={true}
            width="2048"
            height="2048"
          />
        </div>
        <div className="col-start-2 col-span-1 xl:col-start-1 xl:col-span-4 xl:row-start-1 xl:top-[25%] absolute">
          <Image
            className="dark:brightness-75"
            src={img2}
            alt=""
            priority={true}
            width="2048"
            height="2048"
          />
        </div>
        <div className="col-start-3 col-span-1 xl:col-start-4 xl:col-span-4 xl:row-start-1 xl:top-[45%] absolute">
          <Image
            className="dark:brightness-75"
            src={img3}
            alt=""
            priority={true}
            width="2048"
            height="2048"
          />
        </div>
      </div>
    </div>
  );
}
