import Link from "next/link"
import {
  articleDisplayDate,
  formatArticleShortDate,
  type CategorySection,
  type NewsArticle,
} from "@/lib/news-data"

export function CategoryLinkBlock({
  section,
  articles,
}: {
  section: CategorySection
  articles: NewsArticle[]
}) {
  if (articles.length === 0) return null
  const items = articles.slice(0, 4)

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2 border-b-2 border-primary pb-1.5">
        <span
          className="size-2.5 shrink-0 rounded-sm"
          style={{ background: section.accent }}
        />
        <h3 className="font-serif text-base font-bold">{section.label}</h3>
      </div>
      <ul className="divide-y divide-border">
        {items.map((article) => (
          <li key={article.id} className="py-2">
            <Link
              href={`/article/${article.id}`}
              className="group flex gap-2"
            >
              <span className="shrink-0 font-mono text-[10px] font-semibold text-accent">
                {formatArticleShortDate(articleDisplayDate(article))}
              </span>
              <span className="line-clamp-2 text-[13px] leading-snug group-hover:text-accent">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/?category=${section.key}`}
        className="mt-2 inline-block text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る →
      </Link>
    </section>
  )
}
