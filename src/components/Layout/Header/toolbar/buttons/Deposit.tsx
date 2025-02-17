import { useNavigate } from "@tanstack/react-location"
import DownloadIcon from "assets/icons/DownloadIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useShallow } from "hooks/useShallow"
import { useTranslation } from "react-i18next"
import {
  selectPendingDepositsByAccount,
  useDepositStore,
} from "sections/deposit/DepositPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { LINKS } from "utils/navigation"
import { SBadge } from "./Deposit.styled"

export const Deposit = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { account } = useAccount()

  const pendingDeposits = useDepositStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  return (
    <Button
      size="compact"
      variant="mutedSecondary"
      onClick={() => navigate({ to: LINKS.deposit })}
      css={{ position: "relative" }}
    >
      <Icon size={18} sx={{ ml: -4 }} icon={<DownloadIcon />} />
      {t("deposit")}
      {pendingDeposits.length > 0 && <SBadge>{pendingDeposits.length}</SBadge>}
    </Button>
  )
}
