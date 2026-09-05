import { type NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/middleware"; // Make sure this path points to where your helper file lives

export async function middleware(request: NextRequest) {
  return await createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files, images, and favicons
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
