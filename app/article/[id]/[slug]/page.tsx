import type { Metadata } from "next"

import {
  ArticlePageView,
  buildArticleMetadata,
} from "../article-page-view"

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}): Promise<Metadata> {
  const { id } = await params
  return buildArticleMetadata(id)
}

/** スラッグ付きの正規URL。スラッグが現行の値と違えば正規URLへ308で送る。 */
export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id, slug } = await params
  return <ArticlePageView id={id} requestedSlug={slug} />
}
