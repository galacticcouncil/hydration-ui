import { Icon, Separator, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { ArrowDown } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "./AssetSwitcher.styled"

type AssetSwitcherProps = {
  readonly assetInId: string
  readonly priceIn: string | undefined | null
  readonly assetOutId: string
  readonly priceOut: string | undefined | null
  readonly disabled?: boolean
  readonly fallbackPrice?: string | undefined | null
  readonly isFallbackPriceLoading?: boolean
  readonly onSwitchAssets?: () => void
}

export const AssetSwitcher = ({
  assetInId,
  assetOutId,
  priceIn,
  priceOut,
  disabled,
  fallbackPrice,
  isFallbackPriceLoading,
  onSwitchAssets,
}: AssetSwitcherProps) => {
  const { t } = useTranslation()
  const [isReversed, setIsReversed] = useState(false)

  const { getAssetWithFallback } = useAssets()
  const assetIn = getAssetWithFallback(assetInId)
  const assetOut = getAssetWithFallback(assetOutId)

  const canCalculatePrice = !!priceIn && !!priceOut

  const price = (() => {
    if (!canCalculatePrice) {
      return Big(fallbackPrice || "0")
    }

    return Big(priceOut).gt(0) ? Big(priceIn).div(priceOut) : Big(0)
  })()

  const [shownAssetIn, shownAssetOut, shownPrice] = isReversed
    ? [assetOut, assetIn, price.gt(0) ? Big(1).div(price) : Big(0)]
    : [assetIn, assetOut, price]

  const switchAssets = (): void => {
    setIsReversed(false)
    onSwitchAssets?.()
  }

  const isPriceReady = canCalculatePrice || !isFallbackPriceLoading
  const isSwitcherDisabled = disabled || !assetInId || !assetOutId
  const isPriceDisabled = !assetInId || !assetOutId || shownPrice.lte(0)

  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: -20 }}>
      <Separator />
      {onSwitchAssets && (
        <SSwitchContainer onClick={switchAssets} disabled={isSwitcherDisabled}>
          <Icon size={16} component={ArrowDown} />
        </SSwitchContainer>
      )}
      <>
        <Separator />
        <SPriceContainer
          disabled={isPriceDisabled}
          onClick={() => setIsReversed((isReversed) => !isReversed)}
        >
          <Text fs="p6" color={getToken("text.high")}>
            {!isPriceReady && <Skeleton width={120} />}
            {isPriceReady &&
              (isPriceDisabled
                ? t("unknownExchangeRate")
                : `1 ${shownAssetOut.symbol} = ${t("currency", {
                    value: shownPrice,
                    symbol: shownAssetIn.symbol,
                  })}`)}
          </Text>
        </SPriceContainer>
      </>
      <Separator />
    </SAssetSwitcher>
  )
}
