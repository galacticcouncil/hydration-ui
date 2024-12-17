import { useMedia } from "react-use"
import { theme } from "theme"
import { Bell } from "./buttons/Bell"
import { Documentation } from "./buttons/Documentation"
import { Settings } from "./buttons/Settings"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useMatchRoute, useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { Button } from "components/Button/Button"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { Icon } from "components/Icon/Icon"

export const HeaderToolbar = () => {
  const isSmallMedia = useMedia(theme.viewport.lt.sm)
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()

  const isSubmitTransactionPath = matchRoute({ to: LINKS.submitTransaction })

  return (
    <div sx={{ flex: "row", align: "center", gap: 14 }}>
      <div sx={{ flex: "row", gap: 10, align: "center" }}>
        {!isSmallMedia && <Documentation />}
        <Bell />
        {!isSmallMedia && !isSubmitTransactionPath && <Settings />}
        <Button
          size="compact"
          variant="mutedSecondary"
          onClick={() => navigate({ to: LINKS.deposit })}
        >
          <Icon size={18} sx={{ ml: -4 }} icon={<DownloadIcon />} />
          Deposit
        </Button>
      </div>
      <Web3ConnectModalButton size="small" css={{ maxHeight: 40 }} />
    </div>
  )
}
