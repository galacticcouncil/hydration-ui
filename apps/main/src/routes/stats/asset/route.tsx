import { createFileRoute, Outlet } from "@tanstack/react-router"

/**
 * Layout for asset detail pages - no SubpageLayout/tabs, just renders child content
 */
export const Route = createFileRoute("/stats/asset")({
  component: () => <Outlet />,
})
