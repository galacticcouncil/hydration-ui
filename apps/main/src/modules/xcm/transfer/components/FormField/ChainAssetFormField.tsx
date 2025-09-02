import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import {
  FieldPathByValue,
  useController,
  useFormContext,
} from "react-hook-form"

import { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { ChainAssetSelectModal } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type ChainAssetFormFieldProps = {
  fieldName: FieldPathByValue<XcmFormValues, Asset | null>
  type: "source" | "destination"
  disabled?: boolean
  chainAssetPairs: ChainAssetPair[]
  selectedChain: AnyChain | null
  setSelectedChain: (chain: AnyChain | null) => void
  onAssetChange?: () => void
}

export const ChainAssetFormField: React.FC<ChainAssetFormFieldProps> = ({
  fieldName,
  type,
  disabled = false,
  chainAssetPairs,
  selectedChain,
  setSelectedChain,
  onAssetChange,
}) => {
  const { control } = useFormContext<XcmFormValues>()
  const { field } = useController({
    control,
    name: fieldName,
  })

  const handleSelection = (
    selection: { asset: Asset; chain: AnyChain } | null,
  ) => {
    const newAsset = selection?.asset || null
    const currentAsset = field.value
    field.onChange(newAsset)

    if (newAsset?.key !== currentAsset?.key) {
      onAssetChange?.()
    }
  }

  const selectedAssetAndChain =
    field.value && selectedChain
      ? { asset: field.value, chain: selectedChain }
      : null

  return (
    <ChainAssetSelectModal
      type={type}
      disabled={disabled}
      chainAssetPairs={chainAssetPairs}
      selectedAsset={selectedAssetAndChain}
      onSelectionChange={handleSelection}
      selectedChain={selectedChain}
      setSelectedChain={setSelectedChain}
    />
  )
}
