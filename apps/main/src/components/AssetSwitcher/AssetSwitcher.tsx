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

type ViewType = "default" | "reversed"

type AssetSwitcherProps = {
  readonly defaultView?: ViewType
  readonly assetInId: string
  readonly priceIn?: string | undefined | null
  readonly assetOutId: string
  readonly priceOut?: string | undefined | null
  readonly disabled?: boolean
  readonly switcherDisabled?: boolean
  readonly fallbackPrice?: string | undefined | null
  readonly isFallbackPriceLoading?: boolean
  readonly hidePrice?: boolean
  readonly onSwitchAssets?: () => void
}

export const AssetSwitcher = ({
  defaultView = "default",
  assetInId,
  assetOutId,
  priceIn,
  priceOut,
  disabled,
  switcherDisabled,
  fallbackPrice,
  isFallbackPriceLoading,
  hidePrice = false,
  onSwitchAssets,
}: AssetSwitcherProps) => {
  const { t } = useTranslation()
  const [view, setView] = useState(defaultView)
  // Persistent click-driven rotation so the swap animation doesn't snap back
  // when the button briefly becomes disabled (pending state) or loses hover.
  const [rotation, setRotation] = useState(0)

  const { getAssetWithFallback } = useAssets()
  const assetIn = getAssetWithFallback(assetInId)
  const assetOut = getAssetWithFallback(assetOutId)

  const canCalculatePrice = !!priceIn && !!priceOut

  const price = (() => {
    if (!canCalculatePrice) {
      return Big(fallbackPrice || "0")
    }

    return Big(priceIn).gt(0) ? Big(priceOut).div(priceIn) : Big(0)
  })()

  const [shownAssetIn, shownAssetOut, shownPrice] =
    view === "reversed"
      ? [assetOut, assetIn, price.gt(0) ? Big(1).div(price) : Big(0)]
      : [assetIn, assetOut, price]

  const switchAssets = (): void => {
    setView(defaultView)
    setRotation((r) => r + 180)
    onSwitchAssets?.()
  }

  const isPriceReady = canCalculatePrice || !isFallbackPriceLoading
  const isSwitcherDisabled =
    switcherDisabled || disabled || !assetInId || !assetOutId
  const isPriceDisabled = !assetInId || !assetOutId || shownPrice.lte(0)

  return (
    <SAssetSwitcher
      sx={{ alignItems: "center", mx: -20 }}
      data-no-price={hidePrice ? "true" : undefined}
    >
      <Separator />
      {onSwitchAssets && (
        <SSwitchContainer
          onClick={switchAssets}
          disabled={isSwitcherDisabled}
          rotation={rotation}
        >
          <Icon
            size="m"
            component={ArrowDown}
            color={getToken("icons.primary")}
          />
        </SSwitchContainer>
      )}
      {!hidePrice ? (
        <>
          <Separator />
          <SPriceContainer
            disabled={isPriceDisabled}
            onClick={() =>
              setView((view) => (view === "default" ? "reversed" : "default"))
            }
          >
            <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
              {!isPriceReady && <Skeleton width={120} />}
              {isPriceReady &&
                (isPriceDisabled
                  ? t("unknownExchangeRate")
                  : `1 ${shownAssetIn.symbol} = ${t("currency", {
                      value: shownPrice,
                      symbol: shownAssetOut.symbol,
                    })}`)}
            </Text>
          </SPriceContainer>
          <Separator />
        </>
      ) : (
        // No price pill: render a single full-width separator on the right so
        // the divider visually spans across the row instead of leaving a stub.
        <Separator />
      )}
    </SAssetSwitcher>
  )
}
