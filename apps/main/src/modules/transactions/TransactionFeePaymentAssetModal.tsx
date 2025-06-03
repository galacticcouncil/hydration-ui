import { Modal } from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import {
  useAccountFeePaymentAssets,
  useSetFeePaymentAsset,
} from "@/api/payments"
import {
  AssetSelectModalContent,
  AssetSelectModalProps,
} from "@/components/AssetSelectModal"

type Props = Pick<AssetSelectModalProps, "open" | "onOpenChange">

export const TransactionFeePaymentAssetModalContent: React.FC<Props> = (
  props,
) => {
  const { mutate } = useSetFeePaymentAsset()

  const { accountFeePaymentAsset, acceptedFeePaymentAssets } =
    useAccountFeePaymentAssets()

  const filteredPaymentAssets = useMemo(() => {
    return (acceptedFeePaymentAssets ?? []).filter(
      (asset) => asset.id !== accountFeePaymentAsset?.id,
    )
  }, [acceptedFeePaymentAssets, accountFeePaymentAsset?.id])

  return (
    <AssetSelectModalContent
      assets={filteredPaymentAssets}
      onSelect={(asset) => {
        mutate(asset.id)
        props.onOpenChange(false)
      }}
      {...props}
    />
  )
}

export const TransactionFeePaymentAssetModal: React.FC<Props> = (props) => {
  return (
    <Modal {...props}>
      <TransactionFeePaymentAssetModalContent {...props} />
    </Modal>
  )
}
