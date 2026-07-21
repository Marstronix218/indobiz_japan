import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { BetaSurveyForm } from "@/components/beta-survey-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import {
  getBetaAccessStatus,
  listBetaPreviewArticleIds,
  recordBetaAccessEvent,
} from "@/lib/beta-access"
import { listPublishedArticles } from "@/lib/supabase/article-repository"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

export const metadata = { title: "β版アンケート | IndoBiz Japan" }
export const revalidate = 0

export default async function BetaSurveyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!isBetaAccessEnabled()) redirect("/")
  const query = await searchParams
  const rawNext = typeof query.next === "string" ? query.next : null
  const nextPath = getSafeAuthRedirectPath(rawNext)
  const user = await getSessionUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/beta/survey?next=${encodeURIComponent(nextPath)}`)}`)
  }

  const access = await getBetaAccessStatus(user.id)
  await recordBetaAccessEvent(user.id, "survey_view")

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 space-y-2">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // BETA FEEDBACK
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight">IndoBiz β版アンケート</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            回答時間の目安は60〜90秒です。送信後、すべての記事がすぐに開放されます。
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {access.surveyCompleted && access.hasFullAccess ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-9 text-primary" />
              <h2 className="mt-4 font-serif text-2xl font-bold">ご回答ありがとうございました</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                フルアクセスが有効になっています。
              </p>
              <Button asChild className="mt-6">
                <Link href={nextPath}>記事に戻る</Link>
              </Button>
            </div>
          ) : access.surveyCompleted ? (
            <div className="text-center">
              <h2 className="font-serif text-xl font-bold">アクセス状態を確認できません</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                回答は保存されています。アクセス再開について運営へお問い合わせください。
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/contact">お問い合わせ</Link>
              </Button>
            </div>
          ) : access.surveyEligible ? (
            <BetaSurveyForm nextPath={nextPath} />
          ) : (
            <SurveyLocked
              readsCount={access.readsCount}
              requiredReads={access.requiredReads}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

async function SurveyLocked({
  readsCount,
  requiredReads,
}: {
  readsCount: number
  requiredReads: number
}) {
  const [articles, previewIds] = await Promise.all([
    listPublishedArticles(),
    listBetaPreviewArticleIds(),
  ])
  const previewArticles = previewIds
    .map((id) => articles.find((article) => article.id === id))
    .filter((article) => Boolean(article))

  return (
    <div>
      <h2 className="font-serif text-xl font-bold">先に体験記事をお読みください</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        現在 {readsCount} / {requiredReads} 記事です。各記事を15秒以上読むと閲覧済みになります。
      </p>
      <ul className="mt-5 space-y-3">
        {previewArticles.map((article) => (
          <li key={article!.id}>
            <Link href={`/article/${article!.id}`} className="text-sm font-semibold text-primary hover:underline">
              {article!.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
