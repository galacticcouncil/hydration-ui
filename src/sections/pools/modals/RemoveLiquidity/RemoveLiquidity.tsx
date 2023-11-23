import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveLiquidityForm } from "./RemoveLiquidityForm"
import { RemoveLiquidityModal as RemoveStablepoolLiquidityModal } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityModal"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { isXYKPool } from "sections/pools/PoolsPage.utils"
import { RemoveXYKLiquidityForm } from "./RemoveXYKLiquidityForm"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position?: HydraPositionsTableData
  onSuccess: () => void
  pool: TOmnipoolAsset | TXYKPool
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()

  const isXyk = isXYKPool(pool)

  if (!isXyk && pool.isStablepool) {
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
