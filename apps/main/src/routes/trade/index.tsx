import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/trade/")({
  component: () => <Navigate to="/trade/swap" />,
})
