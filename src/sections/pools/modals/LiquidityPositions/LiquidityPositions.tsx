import { useAccountDeposits } from "api/deposits"
import { Modal } from "components/Modal/Modal"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"

interface Props {
  isOpen: boolean
  pool: OmnipoolPool
  onClose: () => void
}

export const LiquidityPositions: FC<Props> = ({ isOpen, pool, onClose }) => {
  const positions = usePoolPositions(pool.id)
  const accountDeposits = useAccountDeposits(pool.id)
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.positions.modal.title")}
      headerVariant="FontOver"
      noPadding
      onClose={onClose}
    >
      <div
        sx={{
          flex: "column",
          align: "center",
          gap: 8,
        }}
      >
        <LiquidityPositionWrapper pool={pool} positions={positions} />
        {import.meta.env.VITE_FF_FARMS_ENABLED === "true" && (
          <FarmingPositionWrapper
            poolId={pool.id}
            deposits={accountDeposits.data}
          />
        )}
      </div>
    </Modal>
  )
}
