"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, LayoutDashboard, LogOut, Settings, ChevronRight, UserCircle } from "lucide-react"
import GithubIcon from "@/components/ui/github-icon"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"

export function AppSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [dontAsk, setDontAsk] = React.useState(false)
  const [skipConfirm, setSkipConfirm] = React.useState(false)

  React.useEffect(() => {
    setSkipConfirm(localStorage.getItem("skip-signout-confirm") === "true")
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  const performSignOut = () => {
    if (dontAsk) {
      localStorage.setItem("skip-signout-confirm", "true")
      setSkipConfirm(true)
    }
    handleSignOut()
  }

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Clients", url: "/clients", icon: UserCircle },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center h-12 overflow-hidden">
          <Link href="/dashboard" className="flex items-center justify-center">
            <img src="/kira-logo.svg" alt="Kira Logo" className="size-8 transition-all duration-200" />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                isActive={pathname.startsWith(item.url)}
                className="justify-center md:justify-start"
              >
                <Link href={item.url}>
                  <item.icon className="shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Settings" 
              isActive={pathname === "/settings"}
              className="justify-center md:justify-start"
            >
              <Link href="/settings">
                <Settings className="shrink-0" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {skipConfirm ? (
              <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out" className="justify-center md:justify-start">
                <LogOut className="shrink-0" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton tooltip="Sign Out" className="justify-center md:justify-start">
                    <LogOut className="shrink-0" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to sign out of your account.
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox id="dont-ask" checked={dontAsk} onCheckedChange={(c) => setDontAsk(!!c)} />
                        <label htmlFor="dont-ask" className="text-sm">Don't display this message again</label>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={performSignOut}>Sign Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
