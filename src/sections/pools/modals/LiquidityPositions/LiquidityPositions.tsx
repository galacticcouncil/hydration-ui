import { usePoolDeposits } from "api/deposits"
import { Modal } from "components/Modal/Modal"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { OmnipoolPool } from "../../PoolsPage.utils"
import { usePoolPositions } from "../../pool/Pool.utils"

interface Props {
  isOpen: boolean
  pool: OmnipoolPool
  onClose: () => void
}

export const LiquidityPositions: FC<Props> = ({ isOpen, pool, onClose }) => {
  const positions = usePoolPositions(pool)
  const accountDeposits = usePoolDeposits(pool.id)
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
          <FarmingPositionWrapper pool={pool} deposits={accountDeposits.data} />
        )}
      </div>
    </Modal>
  )
}
