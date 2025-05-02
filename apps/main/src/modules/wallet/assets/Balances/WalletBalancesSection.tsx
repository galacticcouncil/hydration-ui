import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const assets = 10301874
  const [assetsDisplay] = useDisplayAssetPrice("10", assets)

  const liquidity = 10301874
  const [liquidityDisplay] = useDisplayAssetPrice("10", liquidity)

  const farms = 10301874
  const [farmsDisplay] = useDisplayAssetPrice("10", farms)

  const supplyBorrow = 10301874
  const [supplyBorrowDisplay] = useDisplayAssetPrice("10", supplyBorrow)

  return (
    <Stack separated direction="column" justify="space-between" gap={[8, 0]}>
      <ValueStats
        size="small"
        label={t("balances.header.assets")}
        value={t("common:number", { value: assets })}
        bottomLabel={assetsDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.liquidity")}
        value={t("common:number", { value: liquidity })}
        bottomLabel={liquidityDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.farms")}
        value={t("common:number", { value: farms })}
        bottomLabel={farmsDisplay}
      />
      <ValueStats
        size="small"
        label={t("balances.header.supplyBorrow")}
        value={t("common:number", { value: supplyBorrow })}
        bottomLabel={supplyBorrowDisplay}
      />
    </Stack>
  )
}
