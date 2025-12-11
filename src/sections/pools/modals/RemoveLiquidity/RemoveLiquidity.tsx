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
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useModalPagination } from "components/Modal/Modal.utils"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position?: TLPData | TLPData[]
  onSuccess: () => void
  pool: TAnyPool
}

export enum Page {
  REMOVE_LIQUIDITY,
  LIMIT_LIQUIDITY,
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
  const { page, direction, back, paginateTo } = useModalPagination()

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
    <Modal open={isOpen} disableCloseOutside={true} onClose={onClose}>
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={onClose}
        onBack={back}
        contents={[
          {
            title: t("liquidity.remove.modal.title"),
            content: isXyk ? (
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
                setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
              />
            ) : null,
          },
          {
            title: t("liquidity.remove.modal.limit.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <LimitModal
                onConfirm={() => paginateTo(Page.REMOVE_LIQUIDITY)}
                type="liquidity"
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
