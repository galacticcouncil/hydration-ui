import { AssetInput, AssetInputProps } from "@galacticcouncil/ui/components"
import { useState } from "react"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { AssetLogo } from "@/components/AssetLogo"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetSelectModal } from "@/components/AssetSelectModal"
import { TAssetWithBalance } from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { scaleHuman } from "@/utils/formatting"

export type TSelectedAsset = {
  id: string
  decimals: number
  symbol: string
  iconId?: string | string[]
}

export type AssetSelectProps = AssetInputProps & {
  assets: TAssetData[]
  sortedAssets?: TAssetWithBalance[]
  selectedAsset: TSelectedAsset | undefined | null
  maxBalanceFallback?: string
  setSelectedAsset?: (asset: TAssetData) => void
  onLockToggle?: () => void
}

export const AssetSelect = ({
  assets,
  sortedAssets,
  selectedAsset,
  maxBalance: providedMaxBalance,
  maxBalanceFallback,
  setSelectedAsset,
  onLockToggle,
  ...props
}: AssetSelectProps) => {
  const [openModal, setOpeModal] = useState(false)

  const [displayValue_, { isLoading: displayValueLoading_ }] =
    useDisplayAssetPrice(
      props.ignoreDisplayValue || props.displayValue
        ? ""
        : (selectedAsset?.id ?? ""),
      props.value || "0",
    )

  const displayValue = props.displayValue ?? displayValue_
  const displayValueLoading = props.displayValueLoading ?? displayValueLoading_

  const { getTransferableBalance, getBalance, isBalanceLoading } =
    useAccountBalances()

  const maxBalance = ((): string | undefined => {
    if (providedMaxBalance) {
      return providedMaxBalance
    }

    if (props.ignoreBalance || !selectedAsset) {
      return maxBalanceFallback
    }

    const balance = getBalance(selectedAsset.id)
    const amount =
      props.hideMaxBalanceAction && balance
        ? balance.total
        : getTransferableBalance(selectedAsset.id)

    return amount !== undefined
      ? scaleHuman(amount, selectedAsset.decimals)
      : maxBalanceFallback
  })()

  const maxBalanceLoading = props.maxBalanceLoading ?? isBalanceLoading

  return (
    <>
      <AssetInput
        {...props}
        onLock={onLockToggle ?? props.onLock}
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
        maxBalanceLoading={maxBalanceLoading}
        onAsssetBtnClick={
          setSelectedAsset ? () => setOpeModal(true) : undefined
        }
      />

      <AssetSelectModal
        open={openModal}
        assets={assets}
        sortedAssets={sortedAssets}
        onOpenChange={setOpeModal}
        onSelect={setSelectedAsset}
        emptyState={<AssetSelectEmptyState />}
        selectedAssetId={selectedAsset?.id}
      />
    </>
  )
}
