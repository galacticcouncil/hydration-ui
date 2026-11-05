import { QuestionCircleRegular } from "@galacticcouncil/ui/assets/icons"
import { Button, ExternalLink } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, lazy, useRef, useState } from "react"

import { HYDRATION_DOCS_LINK } from "@/config/links"
import { DepositButton } from "@/modules/layout/components/DepositButton/DepositButton"
import { SHeaderToolbar } from "@/modules/layout/components/HeaderToolbar.styled"
import { HeaderWeb3ConnectButton } from "@/modules/layout/components/HeaderWeb3ConnectButton"
import { NotificationCenter } from "@/modules/layout/components/NotificationCenter/NotificationCenter"
import { FULL_HEADER_BREAKPOINT } from "@/modules/layout/constants"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"

const Settings = lazy(async () => ({
  default: await import("@/modules/layout/components/Settings/Settings").then(
    (m) => m.Settings,
  ),
}))

export const HeaderToolbar: FC = () => {
  const hasTopNavbar = useHasTopNavbar()
  const { gte } = useBreakpoints()
  const isFullHeader = gte(FULL_HEADER_BREAKPOINT)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationReturnFocus = useRef<HTMLElement | null>(null)

  return (
    <SHeaderToolbar>
      {hasTopNavbar && (
        <Button
          icon={QuestionCircleRegular}
          variant="ghost"
          size="medium"
          asChild
        >
          <ExternalLink href={HYDRATION_DOCS_LINK} />
        </Button>
      )}
      <NotificationCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        returnFocusRef={notificationReturnFocus}
      />
      {hasTopNavbar && <Settings />}
      {hasTopNavbar && isFullHeader && (
        <DepositButton
          onClaimClick={(event) => {
            notificationReturnFocus.current = event.currentTarget
            setNotificationsOpen(true)
          }}
        />
      )}
      <HeaderWeb3ConnectButton />
    </SHeaderToolbar>
  )
}
