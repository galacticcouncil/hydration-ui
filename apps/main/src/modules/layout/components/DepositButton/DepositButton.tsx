import { Button } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"
import { useShallow } from "zustand/shallow"

import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"
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

  const openOnramp = useOnrampModalStore((state) => state.open)

  const count = pendingDeposits.length

  return (
    <Button
      variant="accent"
      outline
      glow={count > 0}
      onClick={() => openOnramp("deposit")}
    >
      {count > 0 ? t("deposit.pending", { count }) : t("deposit")}
    </Button>
  )
}
