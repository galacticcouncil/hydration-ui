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
import { TransactionOptions } from "@/states/transactions"

export const TransactionFeePaymentAssetModalContent: React.FC<
  TransactionOptions
> = (txOptions) => {
  const { mutate } = useSetFeePaymentAsset(txOptions)

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
      }}
    />
  )
}

export const TransactionFeePaymentAssetModal: React.FC<
  Pick<AssetSelectModalProps, "open" | "onOpenChange">
> = (props) => {
  return (
    <Modal {...props}>
      <TransactionFeePaymentAssetModalContent
        onSubmitted={() => props.onOpenChange(false)}
      />
    </Modal>
  )
}
