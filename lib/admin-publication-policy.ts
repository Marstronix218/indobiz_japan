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
