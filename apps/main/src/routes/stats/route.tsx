import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

/**
 * Stats route - conditionally renders SubpageLayout for main stats pages
 * but bypasses it for asset detail pages (which have their own layout)
 */
const StatsLayoutComponent = () => {
  // Check if we're on asset detail route - if so, render directly without SubpageLayout
  const assetMatch = useMatch({
    from: "/stats/asset/$asset",
    shouldThrow: false,
  })

  // Asset detail pages render their own layout without the tab navigation
  if (assetMatch) {
    return <Outlet />
  }

  // All other stats pages use SubpageLayout with tab navigation
  return <SubpageLayout />
}

export const Route = createFileRoute("/stats")({
  component: StatsLayoutComponent,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("stats", i18n.t),
  }),
})
