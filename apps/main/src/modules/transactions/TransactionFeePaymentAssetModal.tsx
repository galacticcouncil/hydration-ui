import { InputProps, ModalBody } from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import {
  useAccountFeePaymentAssets,
  useSetFeePaymentAsset,
} from "@/api/payments"
import { AssetSelectModalContent } from "@/components/AssetSelectModal"
import { TransactionOptions } from "@/states/transactions"

type Props = TransactionOptions & {
  searchInputVariant?: InputProps["variant"]
}

export const TransactionFeePaymentAssetModal: React.FC<Props> = ({
  searchInputVariant,
  ...txOptions
}) => {
  const { mutate } = useSetFeePaymentAsset(txOptions)

  const { accountFeePaymentAsset, acceptedFeePaymentAssets } =
    useAccountFeePaymentAssets()

  const filteredPaymentAssets = useMemo(() => {
    return (acceptedFeePaymentAssets ?? []).filter(
      (asset) => asset.id !== accountFeePaymentAsset?.id,
    )
  }, [acceptedFeePaymentAssets, accountFeePaymentAsset?.id])

  return (
    <ModalBody sx={{ padding: 0 }} scrollable={false}>
      <AssetSelectModalContent
        assets={filteredPaymentAssets}
        searchInputVariant={searchInputVariant}
        onSelect={(asset) => {
          mutate(asset.id)
        }}
      />
    </ModalBody>
  )
}
