import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/strategies/hollar-bonds")({
  component: () => <Outlet />,
  staticData: { crumb: true },
})
