"use client";

import { Bell, House, LayoutPanelTop, Network, Settings2 } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/store/userContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { user: authUser } = useUser();
  const pathname = usePathname();

  const data = {
    user: {
      name: authUser?.name as string,
      email: authUser?.email as string,
      avatar: "/icon.png",
    },
    navMain: [
      {
        title: "Home",
        url: "/home",
        icon: House,
        isActive: pathname === "/home",
      },
      {
        title: "Dashboards",
        url: "/dashboard",
        icon: LayoutPanelTop,
        isActive: pathname.includes("/dashboard"),
        items: [
          {
            title: "Overview",
            url: "/dashboard",
            isActive: pathname === "/dashboard",
          },
          {
            title: "ArgoCD Dashboard",
            url: "/dashboard/argocd",
            isActive: pathname.includes("/dashboard/argocd"),
          },
          {
            title: "GitLab CI/CD Dashboard",
            url: "/dashboard/gitlab",
            isActive: pathname.includes("/dashboard/gitlab"),
          },
        ],
      },
      {
        title: "Integrations",
        url: "/integrations",
        icon: Network,
        isActive: pathname.includes("/integrations"),
        items: [
          {
            title: "Overview",
            url: "/integrations",
            isActive: pathname === "/integrations",
          },
          {
            title: "ArgoCD",
            url: "/integrations/argocd",
            isActive: pathname === "/integrations/argocd",
          },
          {
            title: "GitLab CI/CD",
            url: "#",
          },
        ],
      },
      {
        title: "Notifications",
        url: "#",
        icon: Bell,
        isActive: pathname.includes("/notifications"),
        items: [
          {
            title: "Email",
            url: "/notifications/email",
            isActive: pathname === "/notifications/email",
          },
          {
            title: "Slack",
            url: "/notifications/slack",
            isActive: pathname === "/notifications/slack",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: pathname.includes("/settings"),
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <div className="flex flex-row items-center gap-3">
                <Image src="/icon.png" alt="icon" width="65" height="65" />
                {open && (
                  <span className="text-2xl">
                    Citrus<span className="text-orange-600">Ops</span>
                  </span>
                )}
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
