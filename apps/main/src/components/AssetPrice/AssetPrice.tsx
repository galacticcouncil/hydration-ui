import { Skeleton, Text } from "@galacticcouncil/ui/components"
import Big from "big.js"
import React from "react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useAssetsPrice, useDisplayAssetStore } from "@/states/displayAsset"

type AssetPriceProps = {
  assetId: string
  value?: number
  maximumFractionDigits?: number | null
  compact?: boolean
  wrapper?: React.JSX.Element
}

export const AssetPrice = ({
  assetId,
  value = 1,
  maximumFractionDigits,
  compact,
  wrapper,
}: AssetPriceProps) => {
  const [price, { isLoading }] = useDisplayAssetPrice(assetId, value, {
    maximumFractionDigits,
    compact,
  })

  const Wrapper = wrapper ?? <Text />
  const Content = <>{isLoading ? <Skeleton /> : price}</>

  return React.cloneElement(Wrapper, {}, Content)
}

type HookOptions = {
  maximumFractionDigits?: number | null
  compact?: boolean
}

export const useDisplayAssetPrice = (
  assetId: string,
  value: string | number,
  options?: HookOptions,
) => {
  return useDisplayAssetsPrice([[assetId, value]], options)
}

export const useDisplayAssetsPrice = (
  assets: ReadonlyArray<readonly [id: string, value: string | number]>,
  options?: HookOptions,
) => {
  const { t } = useTranslation("common")
  const { isRealUSD, isStableCoin, symbol } = useDisplayAssetStore(
    useShallow(pick(["isRealUSD", "isStableCoin", "symbol"])),
  )

  const { prices, isLoading } = useAssetsPrice(assets.map((asset) => asset[0]))
  const isDollar = isRealUSD || isStableCoin

  const [price, isValid] = assets.reduce(
    (acc, [assetId, value]) => {
      if (!acc[1]) {
        return acc
      }

      const price = prices[assetId]

      return price?.isValid
        ? ([
            acc[0].plus(Big(value || "0").times(price.price || "0")),
            true,
          ] as const)
        : acc
    },
    [Big(0), true] as const,
  )

  const maximumFractionDigits = options?.maximumFractionDigits

  const formattedPrice = isValid
    ? t(options?.compact ? "currency.compact" : "currency", {
        value: price.toString(),
        ...(!isDollar
          ? { currency: symbol, maximumFractionDigits }
          : { maximumFractionDigits }),
      })
    : price.toString()

  return [formattedPrice, { price: price.toString(), isLoading }] as const
}
