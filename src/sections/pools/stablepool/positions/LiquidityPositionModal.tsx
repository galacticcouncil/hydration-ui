import { Modal } from "components/Modal/Modal"
import { ComponentProps } from "react"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { OmnipoolPool, Stablepool } from "sections/pools/PoolsPage.utils"

type Props = ComponentProps<typeof LiquidityPosition> & {
  isOpen: boolean
  onClose: () => void
  pool: Stablepool | OmnipoolPool
}

export const LiquidityPositionModal = ({
  isOpen,
  onClose,
  ...props
}: Props) => {
  const { t } = useTranslation()
  const positions = usePoolPositions(props.poolId)

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.positions.modal.title")}
      headerVariant="FontOver"
      noPadding={true}
      onClose={onClose}
    >
      <div sx={{ flex: "column", align: "center", gap: 8 }}>
        <LiquidityPosition {...props} />
        <LiquidityPositionWrapper pool={props.pool} positions={positions} />
      </div>
    </Modal>
  )
}
