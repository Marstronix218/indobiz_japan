export type PublicationBlock =
  | { code: "QUALITY_OVERRIDE_REQUIRED"; error: string }
  | { code: "QUALITY_REJECTED"; error: string }
  | { code: "QUALITY_CHECK_REQUIRED"; error: string }
  | { code: "IMAGE_REQUIRED"; error: string }

interface PublicationPolicyInput {
  isSynthesized: boolean
  qualityVerdict?: string
  imageUrl?: string
  qualityOverrideConfirmed: boolean
}

interface ArticleContentSnapshot {
  title: string
  summary: string
  source: string
  sourceUrl?: string
  publishedAt: string
  category: string
  industryTags: string[]
  implications: string[]
  imageCaption?: string
  backgroundContext?: string
  japanBusinessImpact?: string
  keywords?: unknown[]
}

type ArticleContentUpdate = Partial<
  Omit<
    ArticleContentSnapshot,
    "imageCaption" | "backgroundContext" | "japanBusinessImpact" | "keywords"
  >
> & {
  imageCaption?: string | null
  backgroundContext?: string | null
  japanBusinessImpact?: string | null
  keywords?: unknown[] | null
}

const CONTENT_FIELDS = [
  "title",
  "summary",
  "source",
  "sourceUrl",
  "publishedAt",
  "category",
  "industryTags",
  "implications",
  "imageCaption",
  "backgroundContext",
  "japanBusinessImpact",
  "keywords",
] as const

function comparable(field: (typeof CONTENT_FIELDS)[number], value: unknown): string {
  if (field === "keywords" && Array.isArray(value) && value.length === 0) {
    return "null"
  }
  return JSON.stringify(value ?? null)
}

/** Returns true only when a supplied editorial field actually changed. */
export function hasArticleContentChanges(
  current: ArticleContentSnapshot,
  update: ArticleContentUpdate,
): boolean {
  return CONTENT_FIELDS.some(
    (field) =>
      update[field] !== undefined &&
      comparable(field, update[field]) !== comparable(field, current[field]),
  )
}

/** Publication checks apply to a transition, not to edits that remain published. */
export function isPublicationTransition(
  currentStatus: string,
  requestedStatus: string | undefined,
): boolean {
  return requestedStatus === "published" && currentStatus !== "published"
}

/**
 * Server-side publication policy for the admin's explicit manual action.
 * Automated publication still requires PASS; only an authenticated admin PATCH
 * carrying an explicit confirmation may override a non-PASS editorial verdict.
 */
export function getAdminPublicationBlock(
  input: PublicationPolicyInput,
): PublicationBlock | null {
  if (!input.isSynthesized) return null
  if (!["PASS", "REVISION", "REJECT"].includes(input.qualityVerdict ?? "")) {
    return {
      code: "QUALITY_CHECK_REQUIRED",
      error: "AI生成記事は品質判定後に公開してください",
    }
  }
  if (input.qualityVerdict === "REJECT") {
    return {
      code: "QUALITY_REJECTED",
      error: "AI品質チェックで差戻しとなった記事は、内容を修正して再判定してください",
    }
  }
  if (input.qualityVerdict === "REVISION" && !input.qualityOverrideConfirmed) {
    return {
      code: "QUALITY_OVERRIDE_REQUIRED",
      error: "AI品質チェックの指摘があります。確認後に再度公開してください",
    }
  }
  if (!input.imageUrl) {
    return {
      code: "IMAGE_REQUIRED",
      error: "AI生成記事は画像生成完了後に公開してください",
    }
  }
  return null
}
