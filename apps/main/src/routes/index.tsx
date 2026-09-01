import { createFileRoute, Navigate } from "@tanstack/react-router"

import { DASHBOARD_PATH, getPageMeta, LINKS } from "@/config/navigation"
import { useAppSettingsStore } from "@/states/appSettings"

const START_PAGE_LINKS = {
  dashboard: DASHBOARD_PATH,
  trade: LINKS.swapMarket,
} as const

const AppLandingPage = () => {
  const startPage = useAppSettingsStore((state) => state.startPage)

  return <Navigate to={START_PAGE_LINKS[startPage]} search replace />
}

export const Route = createFileRoute("/")({
  component: AppLandingPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("home", i18n.t),
  }),
})
