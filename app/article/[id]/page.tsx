import type { Metadata } from "next"

import {
  ArticlePageView,
  buildArticleMetadata,
} from "./article-page-view"

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return buildArticleMetadata(id)
}

/**
 * 旧来のUUIDのみのURL。記事が見つかればスラッグ付きURLへ308で送る
 * （スラッグを作れない記事はここでそのまま描画される）。
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ArticlePageView id={id} />
}
