import Link from "next/link"
import Image from "next/image"
import {
  articleDisplayDate,
  deriveImageTone,
  formatArticleShortDate,
  type CategorySection,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { addJapanesePhraseBreaks } from "@/lib/japanese-line-breaks"

const TONE_TO_STRIPE: Record<ImagePlaceholderTone, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function ArticleThumb({
  article,
  sizes,
  className,
}: {
  article: NewsArticle
  sizes: string
  className: string
}) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <div className={`relative overflow-hidden rounded bg-muted ${className}`}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={sizes}
        />
      ) : (
        <div className={`absolute inset-0 ${TONE_TO_STRIPE[tone]}`} />
      )}
    </div>
  )
}

export function CategoryLinkBlock({
  section,
  articles,
}: {
  section: CategorySection
  articles: NewsArticle[]
}) {
  if (articles.length === 0) return null
  const [lead, ...rest] = articles.slice(0, 4)

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-2 border-b-2 border-primary pb-1.5">
        <span
          className="size-2.5 shrink-0 rounded-sm"
          style={{ background: section.accent }}
        />
        <h3 className="font-serif text-base font-bold">{section.label}</h3>
      </div>

      {/* Lead article with a large thumbnail */}
      <Link href={`/article/${lead.id}`} className="group block">
        <ArticleThumb
          article={lead}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/9]"
        />
        <p className="mt-2 font-mono text-[10px] font-semibold text-accent">
          {formatArticleShortDate(articleDisplayDate(lead))}
        </p>
        <p className="text-auto-phrase mt-1 line-clamp-2 text-sm font-bold leading-normal group-hover:text-accent">
          {addJapanesePhraseBreaks(lead.title)}
        </p>
      </Link>

      {rest.length > 0 && (
        <ul className="mt-3 divide-y divide-border border-t border-border">
          {rest.map((article) => (
            <li key={article.id} className="py-2.5">
              <Link
                href={`/article/${article.id}`}
                className="group flex items-center gap-3"
              >
                <ArticleThumb
                  article={article}
                  sizes="80px"
                  className="w-20 shrink-0 self-start aspect-[4/3]"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold text-accent">
                    {formatArticleShortDate(articleDisplayDate(article))}
                  </p>
                  <p className="text-auto-phrase mt-0.5 line-clamp-2 text-[13px] leading-normal group-hover:text-accent">
                    {addJapanesePhraseBreaks(article.title)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/?category=${section.key}`}
        className="mt-2.5 inline-block text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る →
      </Link>
    </section>
  )
}
