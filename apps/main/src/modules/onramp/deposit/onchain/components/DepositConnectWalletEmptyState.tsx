import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"

export const DepositConnectWalletEmptyState = () => {
  const { t } = useTranslation("onramp")
  return (
    <EmptyState
      image={NoFunds}
      header={t("deposit.empty.connectTitle")}
      description={t("deposit.empty.connectDescription")}
    />
  )
}
