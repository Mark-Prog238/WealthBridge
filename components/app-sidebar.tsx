"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useState } from "react"
import { Config } from "@/app/config"
import { IbkrConnectDialog } from "./ibkr-connect-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  PlusCircleIcon,
  CommandIcon,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Accounts",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Transactions",
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: "Cash Flow",
      url: "#",
      icon: <FolderIcon />,
    },
    {
      title: "Reports",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Budgets",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Recurring",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Goals",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Investments",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Advice",
      url: "#",
      icon: <UsersIcon />,
    },
  ],
  navClouds: [
    // {
    //   title: "Capture",
    //   icon: <CameraIcon />,
    //   isActive: true,
    //   url: "#",
    //   items: [
    //     {
    //       title: "Active Proposals",
    //       url: "#",
    //     },
    //     {
    //       title: "Archived",
    //       url: "#",
    //     },
    //   ],
    // },
    //   {
    //     title: "Proposal",
    //     icon: <FileTextIcon />,
    //     url: "#",
    //     items: [
    //       {
    //         title: "Active Proposals",
    //         url: "#",
    //       },
    //       {
    //         title: "Archived",
    //         url: "#",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Prompts",
    //     icon: <FileTextIcon />,
    //     url: "#",
    //     items: [
    //       {
    //         title: "Active Proposals",
    //         url: "#",
    //       },
    //       {
    //         title: "Archived",
    //         url: "#",
    //       },
    //     ],
    //   },
    // ],
    // navSecondary: [
    //   {
    //     title: "Settings",
    //     url: "#",
    //     icon: <Settings2Icon />,
    //   },
    //   {
    //     title: "Get Help",
    //     url: "#",
    //     icon: <CircleHelpIcon />,
    //   },
    //   {
    //     title: "Search",
    //     url: "#",
    //     icon: <SearchIcon />,
    //   },
    // ],
    // documents: [
    //   {
    //     name: "Data Library",
    //     url: "#",
    //     icon: <DatabaseIcon />,
    //   },
    //   {
    //     name: "Reports",
    //     url: "#",
    //     icon: <FileChartColumnIcon />,
    //   },
    //   {
    //     name: "Word Assistant",
    //     url: "#",
    //     icon: <FileIcon />,
    //   },
  ],
}
export function AppSidebar({
  userdata,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userdata?: any }) {
  const [isIbkrOpen, setIsIbkrOpen] = useState(false)
  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[slot=sidebar-menu-button]:p-1.5!"
                render={<a href="#" />}
              >
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">
                  {Config.APP_NAME}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* <NavMain items={data.navMain} /> 
              <NavDocuments items={data.documents} /> 
              <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsIbkrOpen(true)}>
              <PlusCircleIcon />
              <span>Connect IBKR</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name:
                `${userdata?.user_metadata?.first_name} ${userdata?.user_metadata?.last_name}` ||
                "User",
              email: userdata?.email || "",
              avatar:
                userdata?.user_metadata?.avatar_url || "/avatars/default.png",
            }}
          />
        </SidebarFooter>
        <IbkrConnectDialog open={isIbkrOpen} setOpen={setIsIbkrOpen} />
      </Sidebar>
    </>
  )
}
