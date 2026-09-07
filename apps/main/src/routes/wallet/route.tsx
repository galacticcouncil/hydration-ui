import { createFileRoute, Outlet } from "@tanstack/react-router"
import { FC } from "react"

const WalletRedirectLayout: FC = () => <Outlet />

export const Route = createFileRoute("/wallet")({
  component: WalletRedirectLayout,
})
