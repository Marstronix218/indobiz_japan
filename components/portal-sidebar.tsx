import {
  CitySpotlightWidget,
  EditorialColumnWidget,
} from "@/components/sidebar-widgets"
import { ImportantNewsWidget } from "@/components/important-news-widget"
import { AccessRankingWidget } from "@/components/access-ranking-widget"
import { MarketIndicatorPanel } from "@/components/market-indicator-panel"
import { LineCtaBox } from "@/components/line-cta-box"

/**
 * Shared right-hand sidebar used by both the homepage (`news-list.tsx`) and the
 * article page (`article-view.tsx`) so the two stay in sync. Renders the `<aside>`
 * itself; callers place it as the second column of their layout grid.
 * `rankedViewIds` comes from `getTopViewedArticleIds()` (fetched server-side).
 */
export function PortalSidebar({ rankedViewIds }: { rankedViewIds: string[] }) {
  return (
    <aside className="space-y-3 self-start">
      <EditorialColumnWidget />
      <ImportantNewsWidget />
      <AccessRankingWidget rankedIds={rankedViewIds} />
      <MarketIndicatorPanel />
      <LineCtaBox />
      <CitySpotlightWidget />
    </aside>
  )
}
