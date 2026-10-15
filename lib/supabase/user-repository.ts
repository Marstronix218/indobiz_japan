import type { User } from "@supabase/supabase-js"
import { getServiceClient } from "@/lib/supabase/client"

export type UserProvider = "line" | "email"

export interface AdminUserSummary {
  id: string
  displayName: string | null
  /** Real address only — LINE users' synthetic `@line.invalid` address is hidden. */
  email: string | null
  provider: UserProvider
  avatarUrl: string | null
  createdAt: string
  lastSignInAt: string | null
  emailConfirmed: boolean
}

const PAGE_SIZE = 1000
// Safety cap so a runaway pagination can't hang the admin request.
const MAX_PAGES = 50

function toSummary(user: User): AdminUserSummary {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const str = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : null
  const isLine =
    meta.provider === "line" || Boolean(user.email?.endsWith("@line.invalid"))

  return {
    id: user.id,
    displayName: str(meta.full_name) ?? str(meta.name),
    email: isLine ? null : (user.email ?? null),
    provider: isLine ? "line" : "email",
    avatarUrl: str(meta.avatar_url) ?? str(meta.picture),
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
  }
}

/** All Supabase Auth users, newest first. Requires the service-role key. */
export async function listAllUsers(): Promise<AdminUserSummary[]> {
  const client = getServiceClient()
  const users: User[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    })
    if (error) throw error
    users.push(...data.users)
    if (data.users.length < PAGE_SIZE) break
  }

  return users
    .map(toSummary)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
