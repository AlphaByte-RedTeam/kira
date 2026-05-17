import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import GithubIcon from "@/components/ui/github-icon";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link
              href="https://github.com/AlphaByte-RedTeam/kira"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="size-5" />
            </Link>
          </Button>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
