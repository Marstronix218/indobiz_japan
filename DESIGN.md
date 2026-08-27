# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-27
- Primary product surfaces: Top news portal, article pages, authentication and campaign pages, admin publishing tools.
- Evidence reviewed: `app/globals.css`, `app/layout.tsx`, `components/news-list.tsx`, `components/site-header.tsx`, `components/portal-sidebar.tsx`, `components/line-cta-box.tsx`, `docs/superpowers/specs/2026-07-06-portal-redesign-design.md`, `README_ja.md`.

## Brand
- Personality: Credible, practical, current, and approachable for Japanese readers following India.
- Trust signals: Clear source links, explicit dates where current, restrained visual hierarchy, and consistent IndoBiz green/orange accents.
- Avoid: Sensational language, decorative clutter, unverified event claims, and hard-coded colors that break dark mode.

## Product goals
- Goals: Help Japanese companies and India-interested readers quickly discover useful news, market context, community events, and official sources.
- Non-goals: Reproduce third-party event sites, imply endorsement beyond a link, or become the system of record for an organizer's schedule.
- Success signals: Readers can identify priority content quickly and reach the relevant article, campaign, or official event page without confusion.

## Personas and jobs
- Primary personas: Japanese business decision-makers, employees working with India, and readers interested in India-related culture and community activity.
- User jobs: Scan important updates, find topic-specific articles, discover relevant events, and verify details at the original source.
- Key contexts of use: Short desktop visits during work and mobile reading while commuting or attending events.

## Information architecture
- Primary navigation: Top, six editorial categories, search, authentication, and contact.
- Core routes/screens: Home portal, filtered news lists, article detail, city information, campaign/authentication, and contact.
- Content hierarchy: Site header and market ticker; one compact community preview; lead stories; category and latest-news sections; supporting sidebar widgets.

## Design principles
- Principle 1: Make the next useful action obvious through strong headings, concise summaries, and explicit link labels.
- Principle 2: Reuse the portal's existing tokens and card language so new notices feel editorial rather than promotional noise.
- Tradeoffs: Event notices should be prominent enough to discover but remain compact so readers reach IndoBiz's lead news quickly; keep the event copy and its embedded preview inside one banner instead of stacking separate blocks.

## Visual language
- Color: Use semantic Tailwind tokens from `app/globals.css`, especially `primary`, `accent`, `card`, `border`, and muted text.
- Typography: Noto Sans JP across the site; existing `font-serif` and `font-mono` utility roles remain intentionally mapped to the same family.
- Spacing/layout rhythm: `max-w-7xl` page width, compact card padding, 3/4/6/8/10 spacing rhythm already used by the portal.
- Shape/radius/elevation: Small to medium radii, fine borders, and subtle hover elevation only for actionable cards.
- Motion: Short color/transform transitions; respect reduced-motion behavior.
- Imagery/iconography: Existing logo assets and Lucide icons; third-party images are optional and should not be copied without a clear usage basis.

## Components
- Existing components to reuse: `SiteHeader`, `MarketTicker`, news cards, category blocks, `PortalSidebar`, and token-based CTA patterns.
- New/changed components: `EventNoticeBoard` combines concise event copy and a scaled iframe overview inside one banner, without decorative browser chrome; the preview runs edge to edge against the banner's top, right, and bottom edges on desktop. `NewsList` places it before lead stories in the unfiltered portal view and no longer renders the large top LINE campaign. `ArticleTeaser` uses the short, moderately emphasized access heading 「無料で読む」 and moves qualification details into supporting copy.
- Variants and states: The initial board contains one embedded event preview and remains hidden in filtered/search views to preserve result focus. The existing sidebar `LineCtaBox` retains the LINE registration path without delaying mobile readers from reaching editorial content.
- Token/component ownership: Global tokens stay in `app/globals.css`; notice content and presentation stay in the notice component.

## Accessibility
- Target standard: WCAG 2.2 AA where practicable.
- Keyboard/focus behavior: The event header exposes a keyboard-focusable external link with a visible focus ring; the embedded page retains its own keyboard behavior.
- Contrast/readability: Use semantic foreground/background token pairs and do not rely on color alone to communicate link behavior.
- Screen-reader semantics: Use a labelled section, heading hierarchy, a descriptive iframe title, decorative icons marked `aria-hidden`, and explicit external-link text.
- Reduced motion and sensory considerations: Hover movement is subtle and nonessential; no autoplay or flashing content.

## Responsive behavior
- Supported breakpoints/devices: Mobile-first layout with existing Tailwind `sm` and `lg` breakpoints.
- Layout adaptations: Event copy and the embedded window sit side by side from the `md` breakpoint and stack within the same banner on mobile; the embedded window is 208px high on mobile and fills a minimum 288px banner edge on desktop. Scale the remote page to keep its primary 「INDIA & HAMAMATSU FESTIVAL」 artwork legible without cropping.
- Touch/hover differences: The embedded site remains interactive, while a separate 「別タブで開く」 link provides a predictable escape path.

## Interaction states
- Loading: Use native lazy loading for the third-party iframe so it does not block IndoBiz content.
- Empty: Hide the event board when there are no active notices.
- Error: External-site availability must not affect IndoBiz rendering; the banner copy always retains a direct official-site link.
- Success: Opening the organizer's official page is the terminal action.
- Disabled: Not applicable to static links.
- Offline/slow network, if applicable: IndoBiz renders normally; external navigation follows browser behavior.

## Content voice
- Tone: Concise, factual, inviting, and explicit about the source of detailed information.
- Terminology: Use the organizer's official spelling, 「インドはままつフェスティバル」.
- Microcopy rules: Lead conversion panels with a short benefit statement such as 「無料で読む」, then explain requirements in supporting copy. Label outbound event links explicitly and avoid fixed date claims when the linked official page is stale or awaiting an update.

## Implementation constraints
- Framework/styling system: Next.js App Router, React, TypeScript, Tailwind CSS v4, and existing shadcn-style primitives.
- Design-token constraints: New UI uses semantic tokens; no new hard-coded color values.
- Performance constraints: Prefer HTML/CSS and existing icons over adding image payloads or dependencies; lazy-load third-party frames and keep the preview height bounded.
- Compatibility constraints: Preserve dark mode, responsive navigation, client-side filters, and existing Supabase data flow.
- Test/screenshot expectations: Run TypeScript, lint, and production build checks; visually inspect desktop and mobile when a runnable data-backed environment is available.

## Open questions
- [ ] Confirm whether the organizer will update `https://india-hamamatsu.com` for a future edition; until then the IndoBiz notice must not present the archived 2025 dates as upcoming.
- [ ] Decide whether future notices will remain source-controlled or require admin-managed publishing once the board grows beyond a few items.
- [ ] Recheck the organizer's `X-Frame-Options` and CSP `frame-ancestors` headers before each future event refresh because a third-party policy change can disable the embedded preview.
