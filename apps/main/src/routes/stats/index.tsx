import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/")({
  component: () => <Navigate to="/stats/overview" />,
})
