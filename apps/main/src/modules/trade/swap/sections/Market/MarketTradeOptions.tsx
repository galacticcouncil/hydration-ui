import { Box, Flex } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  Trade,
  TradeOrder,
  tradeOrderDurationQuery,
  TradeOrderType,
  TradeType,
} from "@/api/trade"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import { useCalculateBuyAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount"
import { useCalculateSellAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateSellAmount"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly isLoading: boolean
}

export const MarketTradeOptions: FC<Props> = ({ swap, twap, isLoading }) => {
  const { t } = useTranslation("trade")
  const rpc = useRpcProvider()

  const { control, watch, getValues, reset } =
    useFormContext<MarketFormValues>()
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

  const calculateBuyAmount = useCalculateBuyAmount()
  const calculateSellAmount = useCalculateSellAmount()

  const { data: tradeOrderDuration = 0 } = useQuery(
    tradeOrderDurationQuery(
      rpc,
      twap?.tradeCount ?? 0,
      !!swap && !!twap && !isLoading,
    ),
  )

  if (isLoading) {
    return (
      <Box pt={8} pb={12}>
        <TradeOptionSkeleton />
      </Box>
    )
  }

  if (!buyAsset || !sellAsset || !swap || !twap) {
    return null
  }

  const isBuy = swap.type === TradeType.Buy

  const [asset, amount, twapAmount] = isBuy
    ? [sellAsset, swap.amountIn, twap.amountIn]
    : [buyAsset, swap.amountOut, twap.amountOut]

  const price = scaleHuman(amount, asset.decimals)
  const twapPrice = scaleHuman(twapAmount, asset.decimals)
  const diff = Big(twapPrice).minus(price).toString()

  const recalculateAmount = async (isSingleTrade: boolean): Promise<void> => {
    const formValues = getValues()

    if (!formValues.sellAsset || !formValues.buyAsset) {
      return
    }

    if (isBuy) {
      reset({
        ...formValues,
        sellAmount: await calculateSellAmount({
          sellAsset: formValues.sellAsset,
          buyAsset: formValues.buyAsset,
          buyAmount: formValues.buyAmount,
          isSingleTrade,
        }),
      })
    } else if (formValues.buyAsset) {
      reset({
        ...formValues,
        buyAmount: await calculateBuyAmount({
          sellAsset: formValues.sellAsset,
          buyAsset: formValues.buyAsset,
          sellAmount: formValues.sellAmount,
          isSingleTrade,
        }),
      })
    }
  }

  return (
    <Controller
      control={control}
      name="isSingleTrade"
      render={({ field }) => (
        <Flex sx={{ flexDirection: "column", gap: 8, pt: 8, pb: 12 }}>
          <TradeOption
            asset={asset}
            value={price}
            active={field.value}
            onClick={(): void => {
              field.onChange(true)
              recalculateAmount(true)
            }}
            label={t("market.form.type.single")}
            time={t("market.form.type.single.instant")}
          />
          <TradeOption
            asset={asset}
            value={twapPrice}
            diff={diff}
            isBuy={twap.type === TradeOrderType.TwapBuy}
            active={!field.value}
            onClick={(): void => {
              field.onChange(false)
              recalculateAmount(false)
            }}
            label={t("market.form.type.split")}
            time={t("market.form.type.split.timeframe", {
              timeframe: formatDistanceToNowStrict(
                Date.now() + tradeOrderDuration,
              ),
            })}
            disabled={!!twap.errors.length}
          />
        </Flex>
      )}
    />
  )
}
