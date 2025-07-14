import { QuestionCircleRegular } from "@galacticcouncil/ui/assets/icons"
import { ButtonIcon, ExternalLink } from "@galacticcouncil/ui/components"
import { FC, lazy } from "react"

import { HYDRATION_DOCS_LINK } from "@/config/links"
import { SHeaderToolbar } from "@/modules/layout/components/HeaderToolbar.styled"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"
import { NotificationCenter } from "@/modules/layout/components/NotificationCenter/NotificationCenter"
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
      {hasTopNavbar && (
        <ButtonIcon asChild>
          <ExternalLink href={HYDRATION_DOCS_LINK}>
            <QuestionCircleRegular />
          </ExternalLink>
        </ButtonIcon>
      )}
      <NotificationCenter />
      {hasTopNavbar && <Settings />}
      <HeaderWeb3ConnectButton />
    </SHeaderToolbar>
  )
}
