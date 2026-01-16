import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { useCallback, useMemo } from "react"
import {
  FieldPathByValue,
  useController,
  useFormContext,
} from "react-hook-form"

import {
  ChainAssetPair,
  ChainAssetSelection,
  ChainAssetSelectModal,
  ChainAssetSelectModalSelectionChange,
} from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type ChainAssetFormFieldProps = {
  fieldName: FieldPathByValue<XcmFormValues, Asset | null>
  chainFieldName: FieldPathByValue<XcmFormValues, AnyChain | null>
  type: "source" | "destination"
  address?: string
  disabled?: boolean
  chainAssetPairs: ChainAssetPair[]
  onSelectionConfirm?: (change: ChainAssetSelectModalSelectionChange) => void
  onAssetChange?: () => void
}

export const ChainAssetFormField: React.FC<ChainAssetFormFieldProps> = ({
  fieldName,
  chainFieldName,
  type,
  address = "",
  disabled = false,
  chainAssetPairs,
  onSelectionConfirm,
  onAssetChange,
}) => {
  const { control, watch } = useFormContext<XcmFormValues>()
  const { field } = useController({
    control,
    name: fieldName,
  })
  const selectedChain = watch(chainFieldName)

  const currentSelection = useMemo<ChainAssetSelection | null>(() => {
    if (selectedChain && field.value) {
      return { chain: selectedChain, asset: field.value }
    }
    return null
  }, [field.value, selectedChain])

  const handleAssetSelect = useCallback(
    ({ chain, asset }: ChainAssetSelection) => {
      const previousSelection = currentSelection
      const newSelection = { chain, asset }
      const previousAssetKey = field.value?.key

      field.onChange(asset)

      if (asset.key !== previousAssetKey) {
        onAssetChange?.()
      }

      onSelectionConfirm?.({
        previousSelection,
        newSelection,
      })
    },
    [currentSelection, field, onAssetChange, onSelectionConfirm],
  )

  return (
    <ChainAssetSelectModal
      type={type}
      address={address}
      disabled={disabled}
      chainAssetPairs={chainAssetPairs}
      currentSelection={currentSelection}
      selectedChain={selectedChain ?? null}
      onAssetSelect={handleAssetSelect}
    />
  )
}
