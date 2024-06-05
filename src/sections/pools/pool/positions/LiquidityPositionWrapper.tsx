import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import ChartIcon from "assets/icons/ChartIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { TPoolDetails, TPoolFullData } from "sections/pools/PoolsPage.utils"
import { Button } from "components/Button/Button"
import TrashIcon from "assets/icons/IconRemove.svg?react"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { useState } from "react"

type Props = {
  positions: TPoolDetails["omnipoolNftPositions"]
  pool: TPoolFullData
  refetchPositions: () => void
}

export const LiquidityPositionWrapper = ({
  pool,
  positions,
  refetchPositions,
}: Props) => {
  const { t } = useTranslation()
  const [openRemove, setOpenRemove] = useState(false)

  if (!positions.length) return null

  return (
    <>
      <div>
        <div
          sx={{ flex: "row", justify: "space-between", mb: [17, 20], mt: 12 }}
        >
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Icon size={13} sx={{ color: "pink600" }} icon={<ChartIcon />} />
            <Text fs={[16, 16]} color="pink600" font="GeistMonoSemiBold">
              {t("liquidity.asset.omnipoolPositions.title")}
            </Text>
          </div>

          <Button
            variant="error"
            size="compact"
            onClick={() => setOpenRemove(true)}
          >
            <Icon size={12} icon={<TrashIcon />} />
            {t("liquidity.pool.positions.removeAll.btn")}
          </Button>
        </div>
        <div sx={{ flex: "column", gap: 16 }}>
          {positions.map((position, i) => (
            <LiquidityPosition
              key={`${i}-${position.assetId}`}
              position={position}
              index={i + 1}
              onSuccess={refetchPositions}
              pool={pool}
            />
          ))}
        </div>
      </div>
      {openRemove && (
        <RemoveLiquidity
          pool={pool}
          position={positions}
          isOpen
          onClose={() => setOpenRemove(false)}
          onSuccess={refetchPositions}
        />
      )}
    </>
  )
}
