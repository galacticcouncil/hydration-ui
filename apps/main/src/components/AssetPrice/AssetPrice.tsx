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
}

export const AssetPrice = ({
  assetId,
  wrapper,
  value = 1,
}: AssetPriceProps) => {
  const { t } = useTranslation()
  const { isRealUSD, isStableCoin, symbol } = useDisplayAssetStore(
    useShallow(pick(["isRealUSD", "isStableCoin", "symbol"])),
  )

  const priceRaw = useAssetsPrice([assetId])

  const isDollar = isRealUSD || isStableCoin

  const { price, isLoading } = priceRaw[assetId]

  const Wrapper = wrapper ?? <Text />
  const Content = (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        t("currency", {
          value: value * Number(price),
          ...(isDollar ? {} : { currency: symbol }),
        })
      )}
    </>
  )

  return React.cloneElement(Wrapper, {}, Content)
}
