import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { refreshIBKRholdings } from "@/app/utils/actions"
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // fetching all users who have ibkr accounts
  const { data: users } = await supabaseAdmin
    .from("user_ibkr_queries")
    .select("user_id, query_id, secret_id")

  if (!users || users.length === 0) {
    return NextResponse.json({ synced: 0 })
  }
}
