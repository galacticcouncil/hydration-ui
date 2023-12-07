import { useTranslation } from "react-i18next"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import { BN_0 } from "utils/constants"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  return (
    <HeaderValues
      skeletonHeight={[19, 38]}
      values={[
        {
          label: t("wallet.assets.header.balance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay
              fontSize={[19, 38]}
              type="balanceTotal"
            />
          ),
        },
        {
          label: t("wallet.assets.header.assetsBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay fontSize={[19, 24]} type="assetsTotal" />
          ),
        },
        {
          label: t("wallet.assets.header.liquidityBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay fontSize={[19, 24]} type="lpTotal" />
          ),
        },
        {
          label: t("wallet.assets.header.farmsBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay fontSize={[19, 24]} type="farmsTotal" />
          ),
        },
      ]}
    />
  )
}

const WalletAssetsHeaderDisplay = ({
  fontSize,
  type,
}: {
  fontSize?: [number, number]
  type: "balanceTotal" | "assetsTotal" | "lpTotal" | "farmsTotal"
}) => {
  const { isLoading, ...totals } = useWalletAssetsTotals()
  return (
    <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
      <HeaderTotalData
        value={totals[type] ?? BN_0}
        isLoading={isLoading}
        fontSize={fontSize}
      />
    </div>
  )
}
