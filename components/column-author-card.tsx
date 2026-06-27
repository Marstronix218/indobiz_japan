import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AuthorProfile } from "@/lib/authors"

function authorInitial(name: string) {
  return name.trim().charAt(0) || "・"
}

export function ColumnAuthorCard({ author }: { author: AuthorProfile }) {
  return (
    <section className="mt-8 border-t border-border pt-6">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        この記事の執筆者
      </p>
      <div className="mt-4 flex gap-4 rounded-md border border-border bg-secondary/30 p-4 sm:p-5">
        <Avatar className="size-14 shrink-0 border border-border">
          {author.avatarUrl && (
            <AvatarImage src={author.avatarUrl} alt={author.name} />
          )}
          <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
            {authorInitial(author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-serif text-base font-bold text-foreground">
              {author.name}
            </span>
            {author.nameEn && (
              <span className="text-xs text-muted-foreground">
                {author.nameEn}
              </span>
            )}
          </div>
          {author.title && (
            <p className="text-xs font-medium text-primary">{author.title}</p>
          )}
          {author.bio && (
            <p className="text-sm leading-6 text-foreground">{author.bio}</p>
          )}
        </div>
      </div>
    </section>
  )
}
