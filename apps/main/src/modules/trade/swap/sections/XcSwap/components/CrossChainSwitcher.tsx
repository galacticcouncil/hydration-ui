import { Icon, Separator, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { XcSwapTrade } from "@galacticcouncil/xc-swap"
import Big from "big.js"
import { ArrowDown } from "lucide-react"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "@/components/AssetSwitcher/AssetSwitcher.styled"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

type Props = {
  readonly swap: XcSwapTrade | undefined
}

export const CrossChainSwitcher: FC<Props> = ({ swap }) => {
  const { t } = useTranslation()
  const { watch } = useFormContext<XcSwapFormValues>()
  const { isQuoteLoading } = useXcSwap()
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])
  const [view, setView] = useState<"default" | "reversed">("reversed")

  const price = (() => {
    if (swap?.spotPrice === undefined) {
      return null
    }

    return Big(swap.spotPrice)
  })()

  const isPriceReady = !isQuoteLoading
  const isPriceDisabled = !sellAsset || !buyAsset || !price || price.lte(0)

  const [shownAssetIn, shownAssetOut, shownPrice] = (() => {
    if (!sellAsset || !buyAsset || !price || price.lte(0)) {
      return [null, null, Big(0)] as const
    }

    return view === "reversed"
      ? ([buyAsset, sellAsset, Big(1).div(price)] as const)
      : ([sellAsset, buyAsset, price] as const)
  })()

  return (
    <SAssetSwitcher sx={{ alignItems: "center", mx: "-xl" }}>
      <Separator />
      <SSwitchContainer disabled>
        <Icon
          size="m"
          component={ArrowDown}
          color={getToken("icons.primary")}
        />
      </SSwitchContainer>
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
            (isPriceDisabled || !shownAssetIn || !shownAssetOut
              ? t("unknownExchangeRate")
              : `1 ${shownAssetIn.symbol} = ${t("currency", {
                  value: shownPrice,
                  symbol: shownAssetOut.symbol,
                })}`)}
        </Text>
      </SPriceContainer>
      <Separator />
    </SAssetSwitcher>
  )
}
