import { ModalBody } from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import {
  useAccountFeePaymentAssets,
  useSetFeePaymentAsset,
} from "@/api/payments"
import { AssetSelectModalContent } from "@/components/AssetSelectModal"
import { TransactionOptions } from "@/states/transactions"

export const TransactionFeePaymentAssetModal: React.FC<TransactionOptions> = (
  txOptions,
) => {
  const { mutate } = useSetFeePaymentAsset(txOptions)

  const { accountFeePaymentAsset, acceptedFeePaymentAssets } =
    useAccountFeePaymentAssets()

  const filteredPaymentAssets = useMemo(() => {
    return (acceptedFeePaymentAssets ?? []).filter(
      (asset) => asset.id !== accountFeePaymentAsset?.id,
    )
  }, [acceptedFeePaymentAssets, accountFeePaymentAsset?.id])

  return (
    <ModalBody sx={{ padding: 0 }}>
      <AssetSelectModalContent
        assets={filteredPaymentAssets}
        onSelect={(asset) => {
          mutate(asset.id)
        }}
      />
    </ModalBody>
  )
}
