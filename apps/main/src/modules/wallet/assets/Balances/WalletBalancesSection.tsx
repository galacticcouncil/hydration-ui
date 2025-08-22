import { Flex, Separator, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalancesSection.data"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const {
    assets,
    isAssetsLoading,
    liquidity,
    farms,
    isLiquidityLoading,
    borrow,
    isBorrowLoading,
  } = useWalletBalancesSectionData()

  return (
    <Flex direction="column" gap={[20, 10]}>
      <ValueStats
        size="small"
        wrapThreshold="md"
        label={t("balances.header.assets")}
        value={t("common:currency", { value: assets })}
        bottomLabel={t("balances.header.assets.borrowed", {
          amount: t("common:currency", { value: borrow }),
        })}
        isLoading={isAssetsLoading || isBorrowLoading}
      />
      <Separator />
      <ValueStats
        size="small"
        wrapThreshold="md"
        label={t("balances.header.liquidity")}
        value={t("common:currency", { value: liquidity })}
        bottomLabel={t("balances.header.liquidity.farming", {
          amount: t("common:currency", { value: farms }),
        })}
        isLoading={isLiquidityLoading}
      />
    </Flex>
  )
}
