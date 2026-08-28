import Link from "next/link"
import Image from "next/image"
import {
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  articleDisplayDate,
  deriveImageTone,
  formatArticleDate,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import { articlePath } from "@/lib/article-slug"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { cn } from "@/lib/utils"
import { addJapanesePhraseBreaks } from "@/lib/japanese-line-breaks"

const TONE_TO_STRIPE: Record<ImagePlaceholderTone, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function PlaceholderImg({
  tone,
  label,
}: {
  tone: ImagePlaceholderTone
  label: string
}) {
  return (
    <div
      className={`absolute inset-0 ${TONE_TO_STRIPE[tone]} grid place-items-center`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        {label}
      </span>
    </div>
  )
}

function CardBadges({
  article,
  position = "top-left",
}: {
  article: NewsArticle
  position?: "top-left" | "top-left-tight"
}) {
  const industry = article.industryTags[0]
  const offset = position === "top-left-tight" ? "left-2 top-2" : "left-3 top-3"
  return (
    <div className={`absolute ${offset} z-10 flex flex-wrap gap-1`}>
      <Link
        href={`/category/${article.category}`}
        className="bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground transition-opacity hover:opacity-80"
      >
        {CATEGORY_LABELS[article.category]}
      </Link>
      {industry && article.category !== "column" && (
        <Link
          href={`/category/economy?tag=${industry}`}
          className="bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground transition-opacity hover:opacity-80"
        >
          {INDUSTRY_LABELS[industry]}
        </Link>
      )}
    </div>
  )
}

export function NewsCardHero({
  article,
  className,
}: {
  article: NewsArticle
  className?: string
}) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <article
      className={cn(
        "card-hover group relative block aspect-[16/10] overflow-hidden rounded-md bg-muted",
        className,
      )}
    >
      {/* Stretched article link — covers full card below badges */}
      <Link
        href={articlePath(article)}
        className="absolute inset-0 z-[1]"
        aria-label={article.title}
      />
      <CardBadges article={article} />
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          priority
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      ) : (
        <PlaceholderImg tone={tone} label="hero photo · 1600×1000" />
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6">
        <p className="font-mono text-xs text-white/80">
          {formatArticleDate(articleDisplayDate(article))}
        </p>
        <h2 className="text-auto-phrase mt-2 text-balance font-serif text-2xl font-bold leading-[1.3] text-white md:text-[28px]">
          {addJapanesePhraseBreaks(article.title)}
        </h2>
      </div>
    </article>
  )
}

export function NewsCardMosaic({
  article,
  className,
  priority = false,
}: {
  article: NewsArticle
  className?: string
  stacked?: boolean
  priority?: boolean
}) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <article
      className={cn(
        "card-hover group relative h-full min-h-[8rem] overflow-hidden rounded-md bg-muted",
        className,
      )}
    >
      {/* Stretched article link — covers full card below badges */}
      <Link
        href={articlePath(article)}
        className="absolute inset-0 z-[1]"
        aria-label={article.title}
      />
      <CardBadges article={article} position="top-left-tight" />
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          priority={priority}
          loading="eager"
          className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      ) : (
        <PlaceholderImg tone={tone} label="photo" />
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
        <p className="font-mono text-[10px] text-white/80">
          {formatArticleDate(articleDisplayDate(article))}
        </p>
        <h3 className="text-auto-phrase mt-1 line-clamp-3 text-[15px] font-semibold leading-snug text-white md:text-base">
          {addJapanesePhraseBreaks(article.title)}
        </h3>
      </div>
    </article>
  )
}

export function NewsCardTile({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <article className="card-hover group relative block">
      {/* Stretched article link — covers full card below badges */}
      <Link
        href={articlePath(article)}
        className="absolute inset-0 z-[1]"
        aria-label={article.title}
      />
      {/* Fixed height (not aspect-ratio) so every tile in a row starts its
          title at exactly the same y-position regardless of column width. */}
      <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-muted">
        <CardBadges article={article} position="top-left-tight" />
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <PlaceholderImg tone={tone} label="photo" />
        )}
      </div>
      <div className="pointer-events-none pt-3">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {formatArticleDate(articleDisplayDate(article))}
        </p>
        <h3 className="text-auto-phrase mt-1.5 line-clamp-3 font-serif text-[17px] font-bold leading-normal text-foreground transition-colors group-hover:text-accent">
          {addJapanesePhraseBreaks(article.title)}
        </h3>
      </div>
    </article>
  )
}

export function NewsCardFeature({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)
  const industry = article.industryTags[0]

  return (
    <article className="card-hover group relative h-full">
      {/* Stretched article link — covers full card below badges */}
      <Link
        href={articlePath(article)}
        className="absolute inset-0 z-[1]"
        aria-label={article.title}
      />
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <PlaceholderImg tone={tone} label="feature" />
        )}
        <div className="absolute left-3 top-3 z-10 flex gap-1">
          <Link
            href={`/category/${article.category}`}
            className="bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white transition-opacity hover:opacity-80"
          >
            {CATEGORY_LABELS[article.category]}
          </Link>
          {industry && article.category !== "column" && (
            <Link
              href={`/category/economy?tag=${industry}`}
              className="bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white transition-opacity hover:opacity-80"
            >
              {INDUSTRY_LABELS[industry]}
            </Link>
          )}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-wider text-foreground/40">
          FEATURE
        </div>
      </div>
      <div className="pointer-events-none pt-4">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {formatArticleDate(articleDisplayDate(article))}
        </p>
        <h3 className="text-auto-phrase mt-2 text-balance font-serif text-2xl font-bold leading-normal transition-colors group-hover:text-accent">
          {addJapanesePhraseBreaks(article.title)}
        </h3>
      </div>
    </article>
  )
}
