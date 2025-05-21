import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { PropsWithChildren, useState } from "react"

import {
  useAccountFeePaymentAssets,
  useSetFeePaymentAsset,
} from "@/api/payments"
import { AssetSelectModal } from "@/components/AssetSelectModal"

export const TransactionFeePaymentAssetModal: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [open, setOpen] = useState(false)

  const { mutate } = useSetFeePaymentAsset()

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const { accountFeePaymentAsset, acceptedFeePaymentAssets } =
    useAccountFeePaymentAssets()

  const filteredPaymentAssets = acceptedFeePaymentAssets.filter(
    (asset) => asset.id !== accountFeePaymentAsset?.id,
  )

  return (
    <>
      <ButtonTransparent asChild onClick={openModal}>
        {children}
      </ButtonTransparent>
      <AssetSelectModal
        assets={filteredPaymentAssets}
        open={open}
        onOpenChange={setOpen}
        onSelect={(asset) => {
          mutate(asset.id)
          closeModal()
        }}
      />
    </>
  )
}
