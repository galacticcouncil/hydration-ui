import { useAccountDeposits } from "api/deposits"
import { Modal } from "components/Modal/Modal"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"
import { u32 } from "@polkadot/types-codec"

interface Props {
  isOpen: boolean
  poolId: u32
  onClose: () => void
  canRemoveLiquidity: boolean
}

export const LiquidityPositions: FC<Props> = ({
  isOpen,
  poolId,
  onClose,
  canRemoveLiquidity,
}) => {
  const positions = usePoolPositions(poolId)
  const accountDeposits = useAccountDeposits(poolId)
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
        <LiquidityPositionWrapper
          poolId={poolId}
          positions={positions}
          disableRemoveLiquidity={!canRemoveLiquidity}
        />
        {import.meta.env.VITE_FF_FARMS_ENABLED === "true" && (
          <FarmingPositionWrapper
            poolId={poolId}
            deposits={accountDeposits.data}
          />
        )}
      </div>
    </Modal>
  )
}
