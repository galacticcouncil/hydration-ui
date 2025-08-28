import { AssetInput, AssetInputProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetSelectModal } from "@/components/AssetSelectModal"
import { Logo } from "@/components/Logo"
import { useAccountBalances } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

type TSelectedAsset = {
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
  setSelectedAsset?: (asset: TAssetData) => void
}

export const AssetSelect = ({
  assets,
  selectedAsset,
  maxBalance: providedMaxBalance,
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

  const { getBalance } = useAccountBalances()
  const maxBalance = ((): string | undefined => {
    if (providedMaxBalance) {
      return providedMaxBalance
    }

    const maxBalance =
      !props.ignoreBalance && selectedAsset
        ? getBalance(selectedAsset.id)
        : undefined

    return maxBalance && selectedAsset
      ? scaleHuman(maxBalance.free, selectedAsset.decimals)
      : undefined
  })()

  return (
    <>
      <AssetInput
        {...props}
        selectedAssetIcon={
          selectedAsset ? (
            <Logo id={selectedAsset.iconId ?? selectedAsset.id} />
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
