import { Skeleton, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import React from "react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useAssetPrice, useDisplayAssetStore } from "@/states/displayAsset"

type AssetPriceProps = {
  assetId: string
  value?: number
  wrapper?: JSX.Element
  compact?: boolean
}

export const AssetPrice = ({
  assetId,
  wrapper,
  value = 1,
  compact,
}: AssetPriceProps) => {
  const [price, { isLoading }] = useDisplayAssetPrice(assetId, value, compact)

  const Wrapper = wrapper ?? <Text />
  const Content = <>{isLoading ? <Skeleton /> : price}</>

  return React.cloneElement(Wrapper, {}, Content)
}

export const useDisplayAssetPrice = (
  assetId: string,
  value: string | number,
  compact?: boolean,
) => {
  const { t } = useTranslation()
  const { isRealUSD, isStableCoin, symbol } = useDisplayAssetStore(
    useShallow(pick(["isRealUSD", "isStableCoin", "symbol"])),
  )

  const { price, isLoading, isValid } = useAssetPrice(assetId)
  const isDollar = isRealUSD || isStableCoin

  return [
    isValid
      ? t(compact ? "currency.compact" : "currency", {
          value: new Big(value || "0").times(price || "0").toString(),
          ...(isDollar ? {} : { currency: symbol }),
        })
      : price,
    { isLoading },
  ] as const
}
