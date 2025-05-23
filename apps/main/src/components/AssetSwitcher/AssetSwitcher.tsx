import { Icon, Separator, Text } from "@galacticcouncil/ui/components"
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
  readonly priceIn: string
  readonly assetOutId: string
  readonly priceOut: string
  readonly disabled?: boolean
  readonly onSwitchAssets: () => void
}

export const AssetSwitcher = ({
  assetInId,
  assetOutId,
  priceIn,
  priceOut,
  disabled,
  onSwitchAssets,
}: AssetSwitcherProps) => {
  const { t } = useTranslation()
  const [isReversed, setIsReversed] = useState(false)

  const { getAssetWithFallback } = useAssets()
  const assetIn = getAssetWithFallback(assetInId)
  const assetOut = getAssetWithFallback(assetOutId)

  const price = isReversed
    ? Big(priceOut || "0").gt(0)
      ? Big(priceIn || "0").div(priceOut)
      : Big(0)
    : Big(priceIn || "0").gt(0)
      ? Big(priceOut || "0").div(priceIn)
      : Big(0)

  const shownAssetIn = isReversed ? assetOut : assetIn
  const shownAssetOut = isReversed ? assetIn : assetOut

  const switchAssets = (): void => {
    setIsReversed(false)
    onSwitchAssets()
  }

  const isSwitcherDisabled = disabled || !assetInId || !assetOutId
  const isPriceDisabled = !assetInId || !assetOutId || price.lte(0)

  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: -20 }}>
      <Separator />
      <SSwitchContainer onClick={switchAssets} disabled={isSwitcherDisabled}>
        <Icon size={16} component={ArrowDown} />
      </SSwitchContainer>
      <>
        <Separator />
        <SPriceContainer
          disabled={isPriceDisabled}
          onClick={() => setIsReversed((isReversed) => !isReversed)}
        >
          <Text fs="p6" color={getToken("text.high")}>
            {isPriceDisabled
              ? t("unknownExchangeRate")
              : `1 ${shownAssetIn.symbol} = ${t("currency", {
                  value: price,
                  symbol: shownAssetOut.symbol,
                })}`}
          </Text>
        </SPriceContainer>
      </>
      <Separator />
    </SAssetSwitcher>
  )
}
