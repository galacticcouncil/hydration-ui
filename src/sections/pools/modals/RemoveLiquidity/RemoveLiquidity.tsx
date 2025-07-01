import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { RemoveLiquidityForm } from "./RemoveLiquidityForm"
import { RemoveLiquidityModal as RemoveStablepoolLiquidityModal } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityModal"
import {
  TAnyPool,
  isStablepoolType,
  isXYKPoolType,
} from "sections/pools/PoolsPage.utils"
import { RemoveXYKLiquidityForm } from "./RemoveXYKLiquidityForm"
import { TLPData } from "utils/omnipool"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position?: TLPData | TLPData[]
  onSuccess: () => void
  pool: TAnyPool
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()

  const isXyk = isXYKPoolType(pool)

  if (isStablepoolType(pool) && !pool.isGETH) {
    return (
      <RemoveStablepoolLiquidityModal
        isOpen={isOpen}
        pool={pool}
        onClose={onClose}
        onSuccess={onSuccess}
        position={position}
      />
    )
  }

  return (
    <Modal
      open={isOpen}
      disableCloseOutside={true}
      title={t("liquidity.remove.modal.title")}
      onClose={onClose}
    >
      {isXyk ? (
        <RemoveXYKLiquidityForm
          onClose={onClose}
          onSuccess={onSuccess}
          pool={pool}
        />
      ) : position ? (
        <RemoveLiquidityForm
          onClose={onClose}
          position={position}
          onSuccess={onSuccess}
        />
      ) : null}
    </Modal>
  )
}
