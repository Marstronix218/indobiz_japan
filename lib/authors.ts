/**
 * Column / editorial author roster.
 *
 * Authors are referenced from articles via `authorId` (see `NewsArticle`),
 * with an optional per-article `author` override for one-off contributors.
 * The resolved profile feeds the "この記事の執筆者" card in the article view.
 *
 * Currently roster-only / in-memory: columns are seed data and there is no
 * column-creation path through Supabase, so author data is not persisted to
 * the DB. Add an `author_id` column later if columns become DB-backed.
 */
export interface AuthorProfile {
  id: string
  /** 和名（署名・必須） */
  name: string
  /** 英表記（任意） */
  nameEn?: string
  /** 肩書・所属 */
  title?: string
  /** 自己紹介文（1〜2文） */
  bio?: string
  /** 顔写真。無ければイニシャル表示にフォールバック */
  avatarUrl?: string
}

export const AUTHORS: Record<string, AuthorProfile> = {
  editorial: {
    id: "editorial",
    name: "IndoBiz Japan編集部",
    nameEn: "IndoBiz Japan Editorial",
    title: "編集部",
    bio: "インド市場に関心を持つ日本企業向けに、現地の経済・規制・商習慣を実務目線で読み解いています。",
  },
  procurement_lead: {
    id: "procurement_lead",
    name: "寄稿：購買責任者",
    title: "西インド・現地工場 購買責任者（寄稿）",
    bio: "西インドで工場立ち上げと設備調達を担当。現地サプライヤーの選定・保守体制づくりの実務経験を持つ。",
  },
  interview_desk: {
    id: "interview_desk",
    name: "IndoBiz Japan編集部（取材班）",
    nameEn: "IndoBiz Japan Interview Desk",
    title: "編集部・取材担当",
    bio: "進出済み日系企業への現地取材を担当。人事・採用・オペレーションの一次情報をお届けします。",
  },
}

/**
 * Coerce an untrusted request body value into a clean author override.
 * Trims string fields, drops empties, and returns undefined unless a name is
 * present (a profile with no name yields no author card). Shared by the
 * admin create (POST) and update (PATCH) routes.
 */
export function coerceAuthorInput(value: unknown): Partial<AuthorProfile> | undefined {
  if (!value || typeof value !== "object") return undefined
  const raw = value as Record<string, unknown>
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined

  const name = str(raw.name)
  if (!name) return undefined

  return {
    name,
    nameEn: str(raw.nameEn),
    title: str(raw.title),
    bio: str(raw.bio),
    avatarUrl: str(raw.avatarUrl),
  }
}

/** Minimal shape needed to resolve an author — avoids importing NewsArticle (circular). */
interface AuthoredArticle {
  authorId?: string
  author?: Partial<AuthorProfile>
}

/**
 * Resolve an article's author from the roster (`authorId`) and/or a per-article
 * override (`author`), merging field-by-field with the override taking priority.
 * Returns null when neither source yields a name (= no author card shown).
 */
export function resolveArticleAuthor(
  article: AuthoredArticle,
): AuthorProfile | null {
  const base = article.authorId ? AUTHORS[article.authorId] : undefined
  const override = article.author

  if (!base && !override) return null

  const name = override?.name ?? base?.name
  if (!name) return null

  return {
    id: override?.id ?? base?.id ?? "inline",
    name,
    nameEn: override?.nameEn ?? base?.nameEn,
    title: override?.title ?? base?.title,
    bio: override?.bio ?? base?.bio,
    avatarUrl: override?.avatarUrl ?? base?.avatarUrl,
  }
}
