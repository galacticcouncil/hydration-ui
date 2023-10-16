import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { RemoveLiquidityForm } from "./RemoveLiquidityForm"
import { useRpcProvider } from "providers/rpcProvider"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useModalPagination } from "components/Modal/Modal.utils"
import { RemoveLiquidity as RemoveStablepoolLiquidity } from "sections/pools/stablepool/removeLiquidity/RemoveLiquidity"
import { useState } from "react"
import {
  isStablepool,
  OmnipoolPool,
  Stablepool,
} from "sections/pools/PoolsPage.utils"
import { AssetsModalContent } from "sections/assets/AssetsModal"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
  pool: Stablepool | OmnipoolPool
}

type RemoveStableSwapAssetProps = {
  onClose: RemoveLiquidityProps["onClose"]
  onSuccess: RemoveLiquidityProps["onSuccess"]
  position: RemoveLiquidityProps["position"]
  pool: Stablepool
}

const RemoveStableSwapAsset = ({
  onClose,
  onSuccess,
  pool,
  position,
}: RemoveStableSwapAssetProps) => {
  const { t } = useTranslation()
  const { page, direction, paginateTo } = useModalPagination(0)
  const [assetId, setAssetId] = useState<string>(pool.assets[0]?.id)

  const handleBack = () => paginateTo(page - 1)

  return (
    <ModalContents
      direction={direction}
      onClose={onClose}
      page={page}
      onBack={handleBack}
      contents={[
        {
          title: t("liquidity.remove.modal.title"),
          headerVariant: "gradient",
          content: (
            <RemoveLiquidityForm
              onClose={console.log}
              position={position}
              onSuccess={() => paginateTo(1)}
            />
          ),
        },
        {
          title: t("liquidity.remove.modal.title"),
          headerVariant: "gradient",
          content: (
            <RemoveStablepoolLiquidity
              assetId={assetId}
              onClose={onClose}
              position={{
                reserves: pool.reserves,
                fee: pool.fee,
                poolId: pool.id,
                amount: position.providedAmount,
              }}
              onSuccess={onSuccess}
              onAssetOpen={() => paginateTo(2)}
            />
          ),
        },
        {
          title: t("selectAsset.title"),
          headerVariant: "gradient",
          content: (
            <AssetsModalContent
              hideInactiveAssets={true}
              allowedAssets={pool.assets.map((asset) => asset.id)}
              onSelect={(asset) => {
                setAssetId(asset.id)
                handleBack()
              }}
            />
          ),
        },
      ]}
    />
  )
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  onSuccess,
  position,
  pool,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      disableCloseOutside
      title={isStablepool(pool) ? undefined : t("liquidity.remove.modal.title")}
      onClose={onClose}
    >
      {isStablepool(pool) ? (
        <RemoveStableSwapAsset
          pool={pool}
          onClose={onClose}
          onSuccess={onSuccess}
          position={position}
        />
      ) : (
        <RemoveLiquidityForm
          onClose={onClose}
          position={position}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  )
}
