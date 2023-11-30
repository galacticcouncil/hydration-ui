import { Text } from "components/Typography/Text/Text"
import { SPositions } from "sections/pools/pool/Pool.styled"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import ChartIcon from "assets/icons/ChartIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"

type Props = {
  pool: TOmnipoolAsset
  refetchPositions: () => void
}

export const LiquidityPositionWrapper = ({ pool, refetchPositions }: Props) => {
  const { t } = useTranslation()

  if (!pool.omnipoolNftPositions.length) return null

  return (
    <SPositions>
      <div sx={{ flex: "row", align: "center", gap: 8, mb: 20 }}>
        <Icon size={13} sx={{ color: "pink600" }} icon={<ChartIcon />} />
        <Text fs={[16, 16]} color="pink600">
          {t("liquidity.asset.omnipoolPositions.title")}
        </Text>
      </div>
      <div sx={{ flex: "column", gap: 16 }}>
        {pool.omnipoolNftPositions.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={refetchPositions}
            pool={pool}
          />
        ))}
      </div>
    </SPositions>
  )
}
