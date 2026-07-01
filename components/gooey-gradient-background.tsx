"use client"

import { useEffect, useId, useRef } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type GooeyGradientBackgroundProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  interactive?: boolean
}

export function GooeyGradientBackground({
  children,
  className,
  contentClassName,
  interactive = true,
}: GooeyGradientBackgroundProps) {
  const interactiveRef = useRef<HTMLDivElement>(null)
  const filterId = `gooey-${useId().replace(/:/g, "")}`

  useEffect(() => {
    if (!interactive) return

    let frame = 0
    let curX = 0
    let curY = 0
    let targetX = 0
    let targetY = 0

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
    }

    const animate = () => {
      curX += (targetX - curX) / 20
      curY += (targetY - curY) / 20

      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(
          curX,
        )}px, ${Math.round(curY)}px)`
      }

      frame = requestAnimationFrame(animate)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    frame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      cancelAnimationFrame(frame)
    }
  }, [interactive])

  return (
    <div className={cn("gooey-wrapper", className)}>
      <div className="gooey-gradient-bg" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" focusable="false">
          <defs>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div
          className="gooey-gradients-container"
          style={{ filter: "blur(24px) saturate(1.45) contrast(1.12)" }}
        >
          <div className="gooey-blob gooey-blob-1" />
          <div className="gooey-blob gooey-blob-2" />
          <div className="gooey-blob gooey-blob-3" />
          <div className="gooey-blob gooey-blob-4" />
          <div className="gooey-blob gooey-blob-5" />
          {interactive && (
            <div ref={interactiveRef} className="gooey-blob gooey-interactive" />
          )}
        </div>
      </div>
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  )
}
