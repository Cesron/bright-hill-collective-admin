"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

function isActive(pathname: string, url: string): boolean {
  const cleanPathname = pathname.replace(/\/(create|update\/[^/]+)$/, "");
  const cleanUrl = url.replace(/\/(create|update\/[^/]+)$/, "");
  return cleanPathname === cleanUrl;
}

interface Props {
  children: React.ReactNode;
  url: string;
  title: string;
}

export const ActiveSidebarMenuItem = ({ children, url, title }: Props) => {
  const pathname = usePathname();

  return (
    <SidebarMenuButton
      asChild
      className="group/menu-button group-data-[collapsible=icon]:px-[5px]! font-medium gap-3 h-9 [&>svg]:size-auto"
      tooltip={title}
      isActive={isActive(pathname, url)}
    >
      {children}
    </SidebarMenuButton>
  );
};
