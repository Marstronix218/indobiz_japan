"use client"

import type { CSSProperties, PointerEvent, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type GlowVars = CSSProperties & {
  "--glow-x"?: string
  "--glow-y"?: string
}

export function GlowCategoryLink({
  href,
  category,
  children,
}: {
  href: string
  category: string | null
  children: ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category")
  const isActive =
    pathname === "/" &&
    (category === null ? activeCategory === null : activeCategory === category)

  function updateGlowPosition(event: PointerEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    event.currentTarget.style.setProperty("--glow-x", `${x}%`)
    event.currentTarget.style.setProperty("--glow-y", `${y}%`)
  }

  return (
    <Link
      href={href}
      onPointerMove={updateGlowPosition}
      className={cn(
        "glow-category-button group shrink-0",
        isActive && "is-active",
      )}
      style={{ "--glow-x": "50%", "--glow-y": "50%" } as GlowVars}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  )
}
