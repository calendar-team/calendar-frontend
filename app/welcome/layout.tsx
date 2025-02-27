import { Providers } from "@/app/providers";
import ThemeSwitcher from "../theme-switcher";
import { SparklesCore } from "components/ui/sparkles";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-row">
          <div className="basis-6">
            <h1 className="text-xl flex h-7 font-bold leading-9 tracking-tight ml-2 pl-0">
              Calendar
            </h1>
          </div>
          <div className="grow"></div>
          <div className="flex flex-row">
            <div className="m-2 px-1 rounded-md hover:bg-accent hover:text-accent-foreground">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        <div className="size-full absolute overflow-hidden -z-20">
          <SparklesCore
            background="black"
            minSize={0.6}
            maxSize={1.9}
            particleDensity={110}
            className="size-full"
            particleColor="#14b8a6"
          />
        </div>
        {children}
      </div>
    </Providers>
  );
}
