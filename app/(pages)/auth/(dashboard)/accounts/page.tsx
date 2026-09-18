import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getUser } from "@/app/utils/queries"
import AccountsPage from "@/components/accounts-table"
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
        <SiteHeader header="Accounts" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <AccountsPage />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
