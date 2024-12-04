import { useTranslation } from "react-i18next"
import { HeaderValues } from "sections/pools/header/PoolsHeader"
import { HeaderTotalData } from "sections/pools/header/PoolsHeaderTotal"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import BN from "bignumber.js"

type Props = { disconnected?: boolean }

export const WalletAssetsHeader = ({ disconnected }: Props) => {
  const { t } = useTranslation()
  const { isLoading, balanceTotal, assetsTotal, farmsTotal, lpTotal } =
    useWalletAssetsTotals()
  return (
    <HeaderValues
      skeletonHeight={[19, 38]}
      sx={{ align: ["normal", "end"] }}
      values={[
        {
          label: t("wallet.assets.header.balance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay
              isLoading={isLoading}
              fontSize={[19, 30]}
              value={balanceTotal}
            />
          ),
        },
        {
          label: t("wallet.assets.header.assetsBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay
              isLoading={isLoading}
              fontSize={[19, 30]}
              value={assetsTotal}
            />
          ),
        },
        {
          label: t("wallet.assets.header.liquidityBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay
              isLoading={isLoading}
              fontSize={[19, 30]}
              value={lpTotal}
            />
          ),
        },
        {
          label: t("wallet.assets.header.farmsBalance"),
          disconnected: disconnected,
          content: (
            <WalletAssetsHeaderDisplay
              isLoading={isLoading}
              fontSize={[19, 30]}
              value={farmsTotal}
            />
          ),
        },
      ]}
    />
  )
}

const WalletAssetsHeaderDisplay = ({
  fontSize,
  isLoading,
  value,
}: {
  isLoading: boolean
  fontSize?: [number, number]
  value: string
}) => {
  return (
    <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
      <HeaderTotalData
        value={BN(value)}
        isLoading={isLoading}
        fontSize={fontSize}
      />
    </div>
  )
}
