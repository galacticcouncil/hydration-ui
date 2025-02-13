import { Bell, QuestionCircleRegular } from "@galacticcouncil/ui/assets/icons"
import { ButtonIcon } from "@galacticcouncil/ui/components"
import { FC, lazy } from "react"

import { SHeaderToolbar } from "@/modules/layout/components/HeaderToolbar.styled"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"
import { useHasTopNavbar } from "@/modules/layout/use-has-top-navbar"

const Settings = lazy(async () => ({
  default: await import("@/modules/layout/components/Settings/Settings").then(
    (m) => m.Settings,
  ),
}))

export const HeaderToolbar: FC = () => {
  const hasTopNavbar = useHasTopNavbar()

  return (
    <SHeaderToolbar>
      {/* PLACEHOLDER */}
      {hasTopNavbar && (
        <ButtonIcon>
          <QuestionCircleRegular />
        </ButtonIcon>
      )}
      {/* PLACEHOLDER */}
      <ButtonIcon>
        <Bell />
      </ButtonIcon>
      {hasTopNavbar && <Settings />}
      <HeaderWeb3ConnectButton />
    </SHeaderToolbar>
  )
}
