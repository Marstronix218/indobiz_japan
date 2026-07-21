"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Lock } from "lucide-react"
import { MarketTicker } from "@/components/market-ticker"
import { NewsCardTile } from "@/components/news-card"
import { PortalSidebar } from "@/components/portal-sidebar"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePublicArticles } from "@/lib/article-store"
import { selectRelatedArticles } from "@/lib/home-selection"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  articleDisplayDate,
  formatJstDateTime,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { addJapanesePhraseBreaks } from "@/lib/japanese-line-breaks"

const TEASER_LENGTH = 150

/**
 * Logged-out article page. Mirrors `ArticleView`'s layout (breadcrumb, header
 * block, right-hand `PortalSidebar`, related articles at the bottom) but the
 * article content below the title/category header stays hidden: only a
 * 150-char summary preview and the login/signup CTA are shown.
 */
export function ArticleTeaser({
  article,
  rankedViewIds = [],
  betaGate,
}: {
  article: NewsArticle
  rankedViewIds?: string[]
  betaGate?: {
    readsCount: number
    requiredReads: number
    surveyEligible: boolean
    previewArticles: NewsArticle[]
    lineFriendRequired?: boolean
    lineError?: boolean
  }
}) {
  const articles = usePublicArticles()
  const relatedArticles = selectRelatedArticles(articles, article, 3)
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const teaser = article.summary.slice(0, TEASER_LENGTH).trimEnd()
  const truncated = article.summary.length > TEASER_LENGTH
  const next = encodeURIComponent(`/article/${article.id}`)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <MarketTicker />

      <main className="mx-auto max-w-[1180px] px-5 py-4 sm:px-6">
        <nav
          aria-label="パンくず"
          className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 hover:text-foreground">
            トップ
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link
            href={`/?category=${article.category}`}
            className="shrink-0 hover:text-foreground"
          >
            {CATEGORY_LABELS[article.category]}
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate">{article.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_252px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0 overflow-hidden rounded-md border border-border bg-card">
            {imageSrc && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted md:aspect-[16/6] lg:aspect-[16/5]">
                <Image
                  src={imageSrc}
                  alt={article.title}
                  fill
                  priority
                  loading="eager"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 780px"
                />
              </div>
            )}

            <div className="px-4 pb-6 sm:px-5 sm:pb-7">
              <div
                className={
                  imageSrc ? "mt-3.5 space-y-2.5" : "space-y-2.5 pt-5"
                }
              >
                <h1 className="text-auto-phrase text-balance font-serif text-[25px] font-bold leading-[1.45] tracking-tight text-foreground sm:text-[28px]">
                  {addJapanesePhraseBreaks(article.title)}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                  <span>{formatJstDateTime(articleDisplayDate(article))}</span>
                  <span aria-hidden>｜</span>
                  <span>IndoBiz Japan編集部</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    asChild
                    className={`${CATEGORY_COLORS[article.category]} rounded-sm border-none px-2 py-1 text-[11px]`}
                  >
                    <Link href={`/?category=${article.category}`}>
                      {CATEGORY_LABELS[article.category]}
                    </Link>
                  </Badge>
                </div>
              </div>

              <p className="mt-5 text-[17px] leading-[1.9] text-foreground">
                {teaser}
                {truncated ? "…" : ""}
              </p>

              <section className="mt-6 rounded-md border-2 border-accent/40 bg-background p-6 text-center sm:p-8">
                <Lock className="mx-auto size-6 text-accent" />
                <h2 className="mt-3 font-serif text-xl font-bold text-foreground">
                  {betaGate ? "フルアクセスを開放する" : "続きを読むには登録が必要です"}
                </h2>
                {betaGate ? (
                  <>
                    <p className="mt-2 text-base leading-8 text-muted-foreground">
                      {betaGate.surveyEligible
                        ? "体験記事の閲覧が完了しました。短いアンケートへの回答で、すべての記事をお読みいただけます。"
                        : `体験記事をあと${Math.max(0, betaGate.requiredReads - betaGate.readsCount)}本読むと、アンケートに進めます。`}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {Math.min(betaGate.readsCount, betaGate.requiredReads)} / {betaGate.requiredReads} 記事を閲覧済み
                    </p>
                    {betaGate.lineFriendRequired && (
                      <p className="mt-3 text-sm text-destructive">
                        Go Indiaの友だち追加を確認できませんでした。追加後にもう一度お試しください。
                      </p>
                    )}
                    {betaGate.lineError && (
                      <p className="mt-3 text-sm text-destructive">
                        LINEの確認に失敗しました。時間をおいてもう一度お試しください。
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {betaGate.surveyEligible ? (
                        <Button asChild>
                          <Link href={`/beta/survey?next=${next}`}>90秒アンケートに回答</Link>
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link href="/#beta-preview">体験記事を読む</Link>
                        </Button>
                      )}
                      <Button asChild className="bg-[#06c755] text-white hover:bg-[#05b64e]">
                        <Link
                          href={`/api/auth/line/login?mode=unlock&next=${next}&error_path=${next}`}
                        >
                          Go Indiaを友だち追加して開放
                        </Link>
                      </Button>
                    </div>
                    {betaGate.previewArticles.length > 0 && !betaGate.surveyEligible && (
                      <div id="beta-preview" className="mt-6 border-t border-border pt-5 text-left">
                        <p className="mb-3 text-center text-sm font-semibold">体験版で読める記事</p>
                        <ul className="space-y-2 text-sm">
                          {betaGate.previewArticles.slice(0, 10).map((preview) => (
                            <li key={preview.id}>
                              <Link
                                href={`/article/${preview.id}`}
                                className="text-primary hover:underline"
                              >
                                {preview.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-base leading-8 text-muted-foreground">
                      無料アカウントでβ体験記事をお読みいただけます。5記事閲覧後のアンケート回答で全記事を開放できます。
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <Button asChild>
                        <Link href={`/signup?next=${next}`}>新規登録（無料）</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/login?next=${next}`}>ログイン</Link>
                      </Button>
                    </div>
                  </>
                )}
              </section>

              {relatedArticles.length > 0 && (
                <section className="mt-7 border-t border-border pt-5">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                      <span className="size-2.5 rounded-sm bg-accent" />
                      <h2 className="font-serif text-2xl font-bold tracking-tight">
                        関連記事
                      </h2>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                        // RELATED
                      </span>
                    </div>
                  </div>
                  <div className="topic-rule mb-6" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedArticles.map((related) => (
                      <NewsCardTile key={related.id} article={related} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </article>

          <PortalSidebar rankedViewIds={rankedViewIds} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
