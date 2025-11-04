import { useNavigate } from "@tanstack/react-location"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { Button, ButtonProps } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useShallow } from "hooks/useShallow"
import { useTranslation } from "react-i18next"
import {
  selectPendingDepositsByAccount,
  useDepositStore,
} from "sections/deposit/DepositPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { LINKS } from "utils/navigation"
import { SBadge } from "./DepositButton.styled"

export const DepositButton: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { account } = useAccount()

  const pendingDeposits = useDepositStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  return (
    <Button
      variant="mutedSecondary"
      size="compact"
      onClick={() => navigate({ to: LINKS.deposit })}
      css={{ position: "relative" }}
      disabled
      {...props}
    >
      <Icon size={14} sx={{ ml: -4 }} icon={<DownloadIcon />} />
      {t("deposit")}
      {pendingDeposits.length > 0 && <SBadge>{pendingDeposits.length}</SBadge>}
    </Button>
  )
}
