import { FC, lazy } from "react"

import { SHeaderToolbar } from "@/modules/layout/components/HeaderToolbar.styled"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"
import { NotificationCenter } from "@/modules/layout/components/NotificationCenter/NotificationCenter"
import { ThemeModeToggle } from "@/modules/layout/components/Settings/ThemeModeToggle"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"

const Settings = lazy(async () => ({
  default: await import("@/modules/layout/components/Settings/Settings").then(
    (m) => m.Settings,
  ),
}))

export const HeaderToolbar: FC = () => {
  const hasTopNavbar = useHasTopNavbar()

  return (
    <SHeaderToolbar>
      <NotificationCenter />
      {hasTopNavbar && <ThemeModeToggle />}
      {hasTopNavbar && <Settings />}
      <HeaderWeb3ConnectButton />
    </SHeaderToolbar>
  )
}
