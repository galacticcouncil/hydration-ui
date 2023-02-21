import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Modal } from "components/Modal/Modal"
import { usePoolPositions } from "../../pool/Pool.utils"
import { OmnipoolPool } from "../../PoolsPage.utils"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"

interface Props {
  isOpen: boolean
  pool: OmnipoolPool
  onClose: () => void
}

export const LiquidityPositions: FC<Props> = ({ isOpen, pool, onClose }) => {
  const positions = usePoolPositions(pool)
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      withoutOutsideClose
      title={t("liquidity.positions.modal.title")}
      isDrawer
      onClose={onClose}
    >
      <div
        sx={{
          flex: "column",
          gap: 8,
          align: "center",
          m: "20px -20px -36px",
        }}
      >
        <LiquidityPositionWrapper positions={positions} />
        <FarmingPositionWrapper positions={{ data: [""] }} />
      </div>
    </Modal>
  )
}
