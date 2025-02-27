import { Button } from "./button";
import { MouseEventHandler } from "react";

export default function AnimatedButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <div className="relative z-10 rounded-md overflow-hidden p-1 shrink-0 before:absolute before:-z-30 before:w-[200%] before:h-[200%] before:bg-transparent before:-left-1/2 before:-top-1/2 before:[background-image:conic-gradient(transparent,var(--beam),transparent_30%)] before:animate-rotate after:absolute after:-z-20 after:left-1 after:top-1 after:w-[calc(100%-8px)] after:h-[calc(100%-8px)] after:bg-background after:rounded-md">
      <Button variant="outline" className="border" onClick={onClick}>
        {children}
      </Button>
    </div>
  );
}
