import { Button } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { LINKS } from "@/config/navigation"
import {
  selectPendingDepositsByAccount,
  useOnrampStore,
} from "@/modules/onramp/store/useOnrampStore"

export const DepositButton = () => {
  const { t } = useTranslation(["common"])

  const { account } = useAccount()

  const pendingDeposits = useOnrampStore(
    useShallow(selectPendingDepositsByAccount(account?.address)),
  )

  const count = pendingDeposits.length

  return (
    <Button asChild variant="accent" outline glow={count > 0}>
      <Link to={LINKS.deposit}>
        {count > 0 ? t("deposit.pending", { count }) : t("deposit")}
      </Link>
    </Button>
  )
}
