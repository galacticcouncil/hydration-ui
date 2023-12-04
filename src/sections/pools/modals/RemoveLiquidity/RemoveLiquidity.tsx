import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveLiquidityForm } from "./RemoveLiquidityForm"
import { RemoveLiquidityModal as RemoveStablepoolLiquidityModal } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityModal"
import { TPoolFullData, isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { RemoveXYKLiquidityForm } from "./RemoveXYKLiquidityForm"
import { useRpcProvider } from "providers/rpcProvider"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position?: HydraPositionsTableData
  onSuccess: () => void
  pool: TPoolFullData | TXYKPool
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const isXyk = isXYKPoolType(pool)
  const isStablepool = assets.getAsset(pool.id).isStableSwap

  if (isStablepool && !isXyk) {
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
