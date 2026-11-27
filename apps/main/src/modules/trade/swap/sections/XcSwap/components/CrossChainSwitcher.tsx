import { Icon, Separator, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { ArrowDown } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import {
  SAssetSwitcher,
  SPriceContainer,
  SSwitchContainer,
} from "@/components/AssetSwitcher/AssetSwitcher.styled"

type SymbolOnly = { readonly symbol: string }

type Props = {
  readonly sellAsset: SymbolOnly | null | undefined
  readonly buyAsset: SymbolOnly | null | undefined
  /** Buy asset per sell asset, human units */
  readonly price: Big.BigSource | null | undefined
  readonly isLoading: boolean
}

export const CrossChainSwitcher: FC<Props> = ({
  sellAsset,
  buyAsset,
  price: rawPrice,
  isLoading,
}) => {
  const { t } = useTranslation()
  const [view, setView] = useState<"default" | "reversed">("reversed")

  const price = isNullish(rawPrice) ? null : Big(rawPrice)

  const isPriceReady = !isLoading
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
    <SAssetSwitcher align="center" mx="-xl">
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
