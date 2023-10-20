import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveLiquidityForm } from "./RemoveLiquidityForm"
import { RemoveLiquidityModal as RemoveStablepoolLiquidityModal } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidityModal"
import {
  isStablepool,
  OmnipoolPool,
  Stablepool,
} from "sections/pools/PoolsPage.utils"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
  pool: Stablepool | OmnipoolPool
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  onSuccess,
  position,
  pool,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()

  if (isStablepool(pool)) {
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
      <RemoveLiquidityForm
        onClose={onClose}
        position={position}
        onSuccess={onSuccess}
      />
    </Modal>
  )
}
