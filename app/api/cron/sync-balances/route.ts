import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  refreshIBKRholdingsForUser,
  totalCryptoValueForUser,
} from "@/app/utils/sync-helpers"
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // fetching all users who have ibkr accounts
  const { data: users } = await supabaseAdmin
    .from("user_ibkr_queries")
    .select("user_id")

  if (!users || users.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  const results = await Promise.allSettled(
    users.map(async ({ user_id }) => {
      const [ibkrData, ethTotal] = await Promise.all([
        refreshIBKRholdingsForUser(supabaseAdmin, user_id),
        totalCryptoValueForUser(supabaseAdmin, user_id),
      ])

      await supabaseAdmin.from("cached_balances").upsert(
        [
          {
            user_id,
            account_type: "ibkr",
            total_value: ibkrData?.totalValue ?? 0,
            base_currency: ibkrData?.baseCurrency ?? "EUR",
            updated_at: new Date().toISOString(),
          },
          {
            user_id,
            account_type: "eth",
            total_value: ethTotal ?? 0,
            base_currency: "ETH",
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id, account_type" }
      )
    })
  )

  return NextResponse.json({
    status: "completed",
    totalProcessed: results.length,
  })
}
