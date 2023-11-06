import { Modal } from "components/Modal/Modal"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import {
  isXYKPool,
  TOmnipoolAsset,
  TXYKPool,
} from "sections/pools/PoolsPage.utils"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"

interface Props {
  isOpen: boolean
  pool: TOmnipoolAsset | TXYKPool
  onClose: () => void
  refetchPositions: () => void
}

export const PoolPositionsMobile: FC<Props> = ({
  isOpen,
  pool,
  onClose,
  refetchPositions,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.positions.modal.title")}
      headerVariant="FontOver"
      noPadding
      onClose={onClose}
    >
      {!isXYKPool(pool) && (
        <div
          sx={{
            flex: "column",
            align: "center",
            gap: 8,
          }}
        >
          {pool.isStablepool && (
            <StablepoolPosition
              pool={pool}
              refetchPositions={refetchPositions}
            />
          )}
          <LiquidityPositionWrapper
            pool={pool}
            refetchPositions={refetchPositions}
          />
          <FarmingPositionWrapper pool={pool} />
        </div>
      )}
    </Modal>
  )
}
