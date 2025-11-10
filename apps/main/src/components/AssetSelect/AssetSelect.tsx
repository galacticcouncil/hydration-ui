import { AssetInput, AssetInputProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLogo } from "@/components/AssetLogo"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetSelectModal } from "@/components/AssetSelectModal"
import { useAccountBalances } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type TSelectedAsset = {
  id: string
  decimals: number
  symbol: string
  iconId?: string | string[]
}

export type AssetSelectProps = Omit<
  AssetInputProps,
  "dollarValue" | "dollarValueLoading"
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
  const { t } = useTranslation("common")
  const [openModal, setOpeModal] = useState(false)

  const {
    price: assetPrice,
    isLoading: assetPriceLoading,
    isValid,
  } = useAssetPrice(props.ignoreDollarValue ? undefined : selectedAsset?.id)

  const dollarValue = isValid
    ? new Big(assetPrice).times(props.value || "0").toString()
    : "NaN"

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
        dollarValue={t("number", { value: dollarValue })}
        dollarValueLoading={assetPriceLoading}
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
