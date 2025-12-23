import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { AddLiquidityForm } from "./AddLiquidityForm"
import { isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { AddLiquidityFormXYK } from "./AddLiquidityFormXYK"
import { usePoolData } from "sections/pools/pool/Pool"
import { LimitModal } from "./components/LimitModal/LimitModal"
import { aDOT_ASSET_ID, DOT_ASSET_ID } from "utils/constants"

export enum Page {
  ADD_LIQUIDITY,
  ASSET_SELECTOR,
  LIMIT_LIQUIDITY,
}

type AddLiquidityProps = {
  isOpen: boolean
  onClose: () => void
}

export const AddLiquidity = ({ isOpen, onClose }: AddLiquidityProps) => {
  const { pool } = usePoolData()
  const { t } = useTranslation()
  const { page, direction, back, paginateTo } = useModalPagination()
  const [assetId, setAssetId] = useState(pool.id)

  const farms = pool.farms
  const isXYK = isXYKPoolType(pool)
  const isADot = pool.id === aDOT_ASSET_ID

  return (
    <Modal open={isOpen} disableCloseOutside onClose={onClose}>
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={onClose}
        onBack={
          page === Page.LIMIT_LIQUIDITY
            ? () => paginateTo(Page.ADD_LIQUIDITY)
            : undefined
        }
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            content: isXYK ? (
              <AddLiquidityFormXYK
                pool={pool}
                onClose={onClose}
                onSetLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
              />
            ) : (
              <AddLiquidityForm
                selectedAssetId={assetId}
                poolId={pool.id}
                farms={farms}
                onClose={onClose}
                onSetLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
                onAssetOpen={
                  isADot ? () => paginateTo(Page.ASSET_SELECTOR) : undefined
                }
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <AssetsModalContent
                defaultSelectedAsssetId={pool.id}
                hideInactiveAssets
                allowedAssets={isADot ? [pool.id, DOT_ASSET_ID] : undefined}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  back()
                }}
              />
            ),
          },
          {
            title: t("liquidity.add.modal.limit.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <LimitModal
                onConfirm={() => paginateTo(Page.ADD_LIQUIDITY)}
                type="liquidity"
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
