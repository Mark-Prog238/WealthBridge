import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

import { SectionCards } from "@/components/section-cards"
import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getUser } from "@/app/utils/queries"

export default async function Page() {
  const user = await getUser()
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar userdata={user} variant="inset" />
      <SidebarInset>
        <SiteHeader header="test" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Suspense
                fallback={
                  <div className="px-6 py-4 text-muted-foreground">
                    Loading balances...
                  </div>
                }
              >
                <SectionCards />
              </Suspense>
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/*     <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
