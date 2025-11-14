import { AssetInput, AssetInputProps } from "@galacticcouncil/ui/components"
import { useState } from "react"

import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetSelectModal } from "@/components/AssetSelectModal"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export type TSelectedAsset = {
  id: string
  decimals: number
  symbol: string
  iconId?: string | string[]
}

export type AssetSelectProps = Omit<
  AssetInputProps,
  "displayValue" | "displayValueLoading"
> & {
  assets: TAssetData[]
  selectedAsset: TSelectedAsset | undefined | null
  maxBalanceFallback?: string
  setSelectedAsset?: (asset: TAssetData) => void
}

export const AssetSelect = ({
  assets,
  selectedAsset,
  maxBalance: providedMaxBalance,
  maxBalanceFallback,
  setSelectedAsset,
  ...props
}: AssetSelectProps) => {
  const [openModal, setOpeModal] = useState(false)

  const [displayValue, { isLoading: displayValueLoading }] =
    useDisplayAssetPrice(
      props.ignoreDisplayValue ? "" : (selectedAsset?.id ?? ""),
      props.value || "0",
    )

  const { getTransferableBalance } = useAccountBalances()
  const maxBalance = ((): string | undefined => {
    if (providedMaxBalance) {
      return providedMaxBalance
    }

    const maxBalance =
      !props.ignoreBalance && selectedAsset
        ? getTransferableBalance(selectedAsset.id)
        : undefined

    return maxBalance && selectedAsset
      ? scaleHuman(maxBalance, selectedAsset.decimals)
      : maxBalanceFallback
  })()

  return (
    <>
      <AssetInput
        {...props}
        selectedAssetIcon={
          selectedAsset ? (
            <AssetLogo id={selectedAsset.iconId ?? selectedAsset.id} />
          ) : undefined
        }
        symbol={selectedAsset?.symbol}
        modalDisabled={!setSelectedAsset}
        displayValue={displayValue}
        displayValueLoading={displayValueLoading}
        maxBalance={maxBalance}
        onAsssetBtnClick={
          setSelectedAsset ? () => setOpeModal(true) : undefined
        }
      />

      <AssetSelectModal
        open={openModal}
        assets={assets}
        onOpenChange={setOpeModal}
        onSelect={setSelectedAsset}
        emptyState={<AssetSelectEmptyState />}
        selectedAssetId={selectedAsset?.id}
      />
    </>
  )
}
