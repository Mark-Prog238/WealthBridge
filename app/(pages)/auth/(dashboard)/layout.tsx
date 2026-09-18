import { cookies } from "next/headers"
import { createClient } from "@/app/utils/supabase/server"
import BalanceInitializer from "@/store/BalanceInitializer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch from your fast cached_balances table
  const { data: balances } = await supabase
    .from("cached_balances")
    .select("account_type, total_value")

  const ibkrValue =
    balances?.find((b) => b.account_type === "ibkr")?.total_value ?? 0
  const ethValue =
    balances?.find((b) => b.account_type === "eth")?.total_value ?? 0

  return (
    <div className="flex min-h-screen">
      {/* 2. Inject the server data into the client memory */}
      <BalanceInitializer ibkr={ibkrValue} eth={ethValue} />

      {/* 3. Render your standard Shadcn Sidebar and page content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
