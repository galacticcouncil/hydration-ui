import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalancesSection.data"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const {
    liquidity,
    farms,
    isLiquidityLoading,
    supply,
    borrow,
    isBorrowLoading,
  } = useWalletBalancesSectionData()

  return (
    <Stack separated direction="column" gap={[8, 0]}>
      <ValueStats
        size="small"
        label={t("balances.header.liquidity")}
        value={t("common:currency", { value: liquidity })}
        bottomLabel={t("balances.header.liquidity.inFarms", {
          amount: t("common:currency", { value: farms }),
        })}
        isLoading={isLiquidityLoading}
      />
      <ValueStats
        size="small"
        label={t("balances.header.borrow")}
        value={t("common:currency", { value: borrow })}
        isLoading={isBorrowLoading}
      />
      <ValueStats
        size="small"
        label={t("balances.header.supply")}
        value={t("common:currency", { value: supply })}
        isLoading={isBorrowLoading}
      />
    </Stack>
  )
}
