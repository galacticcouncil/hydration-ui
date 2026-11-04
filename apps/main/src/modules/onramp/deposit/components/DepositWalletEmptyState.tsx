import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import i18n from "@/i18n"

export const DepositWalletEmptyState = ({
  symbol,
  chain,
  failed,
}: {
  symbol: string
  chain: string
  failed: boolean
}) => {
  // The wallet selector provides its own translations; these belong to the app.
  const { t } = useTranslation("onramp", { i18n })
  return (
    <EmptyState
      header={t("deposit.quick.sourceEmptyTitle")}
      description={t(
        failed ? "deposit.flow.assets.partial" : "deposit.quick.sourceEmpty",
        { symbol, chain },
      )}
    />
  )
}
