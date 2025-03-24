import { Skeleton, Text } from "@galacticcouncil/ui/components"
import React from "react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useAssetsPrice, useDisplayAssetStore } from "@/states/displayAsset"

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
  value: number,
  compact?: boolean,
) => {
  const { t } = useTranslation()
  const { isRealUSD, isStableCoin, symbol } = useDisplayAssetStore(
    useShallow(pick(["isRealUSD", "isStableCoin", "symbol"])),
  )
  const { getAssetPrice } = useAssetsPrice([assetId])
  const { price, isLoading } = getAssetPrice(assetId)

  const isDollar = isRealUSD || isStableCoin

  return [
    t(compact ? "currency.compact" : "currency", {
      value: value * Number(price),
      ...(isDollar ? {} : { currency: symbol }),
    }),
    { isLoading },
  ] as const
}
