import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { listAllUsers } from "@/lib/supabase/user-repository"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Admin dashboard: registered reader accounts (Supabase Auth). Server-only
 * because listing auth users needs the Supabase service key.
 */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  try {
    const users = await listAllUsers()
    return NextResponse.json({ ok: true, total: users.length, users })
  } catch (err) {
    console.error("[admin/users] list users failed:", err)
    const message = err instanceof Error ? err.message : "unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
