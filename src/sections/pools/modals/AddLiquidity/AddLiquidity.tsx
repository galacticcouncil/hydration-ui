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

export enum Page {
  ADD_LIQUIDITY,
  ASSET_SELECTOR,
}

type AddLiquidityProps = {
  isOpen: boolean
  onClose: () => void
}

export const AddLiquidity = ({ isOpen, onClose }: AddLiquidityProps) => {
  const { pool } = usePoolData()
  const { t } = useTranslation()
  const { page, direction, back } = useModalPagination()
  const [assetId, setAssetId] = useState(pool.id)

  const farms = pool.farms
  const isXYK = isXYKPoolType(pool)

  return (
    <Modal open={isOpen} disableCloseOutside onClose={onClose}>
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={onClose}
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            content: isXYK ? (
              <AddLiquidityFormXYK pool={pool} onClose={onClose} />
            ) : (
              <AddLiquidityForm
                assetId={assetId}
                farms={farms}
                onClose={onClose}
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
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  back()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
