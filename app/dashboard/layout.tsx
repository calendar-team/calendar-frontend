import { Providers } from "@/app/providers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import Session from "./todos/session";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Providers>
        <Session>{children}</Session>
      </Providers>
    </SidebarProvider>
  );
}
