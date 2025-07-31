import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useWalletBalancesSectionData } from "@/modules/wallet/assets/Balances/WalletBalancesSection.data"
import { USDT_ASSET_ID } from "@/utils/consts"

export const WalletBalancesSection: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { assets, liquidity, farms, supplyBorrow } =
    useWalletBalancesSectionData()

  const [assetsDisplay] = useDisplayAssetPrice(USDT_ASSET_ID, assets)
  const [liquidityDisplay] = useDisplayAssetPrice(USDT_ASSET_ID, liquidity)
  const [farmsDisplay] = useDisplayAssetPrice(USDT_ASSET_ID, farms)
  const [supplyBorrowDisplay] = useDisplayAssetPrice(
    USDT_ASSET_ID,
    supplyBorrow,
  )

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
