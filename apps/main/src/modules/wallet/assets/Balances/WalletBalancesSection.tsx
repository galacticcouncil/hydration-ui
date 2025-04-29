import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalancesSection.data"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { assets, liquidity, farms, supplyBorrow } =
    useWalletBalancesSectionData()

  const [assetsDisplay] = useDisplayAssetPrice("10", assets)
  const [liquidityDisplay] = useDisplayAssetPrice("10", liquidity)
  const [farmsDisplay] = useDisplayAssetPrice("10", farms)
  const [supplyBorrowDisplay] = useDisplayAssetPrice("10", supplyBorrow)

  return (
    <Stack separated direction="column" justify="space-between" gap={[8, 0]}>
      <ValueStats
        size="small"
        label={t("balances.header.assets")}
        value={t("common:currency", { value: assets })}
        bottomLabel={assetsDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.liquidity")}
        value={t("common:currency", { value: liquidity })}
        bottomLabel={liquidityDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.farms")}
        value={t("common:currency", { value: farms })}
        bottomLabel={farmsDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.supplyBorrow")}
        value={t("common:currency", { value: supplyBorrow })}
        bottomLabel={supplyBorrowDisplay}
      />
    </Stack>
  )
}
