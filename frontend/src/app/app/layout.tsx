import type { Metadata } from "next";
import "../globals.css";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { NavigationItems } from "@/components/nav-items";


export const metadata: Metadata = {
  title: "App Page",
  description: "Your crypto dashboard",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <div className="relative flex w-full">
          <Sidebar>
            <SidebarGroupLabel className="pt-8 pb-24 md:flex hidden">
              Trickle
            </SidebarGroupLabel>
            <SidebarContent>
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-3">
                    <NavigationItems />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 h-full p-2 md:p-0 ml-0 md:ml-[16rem]">{children}</main>
          <Toaster />
        </div>
      </SidebarProvider>
    </div>
  );
}
