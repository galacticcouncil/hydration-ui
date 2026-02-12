import { Alert, Flex } from "@galacticcouncil/ui/components"
import { DryRunError, formatPascalCaseToSentence } from "@galacticcouncil/utils"
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
  readonly swapDryRunError: DryRunError | null
  readonly twap: TradeOrder | undefined
  readonly twapDryRunError: DryRunError | null
  readonly isSwapLoading: boolean
  readonly isTwapLoading: boolean
}

export const MarketTradeOptions: FC<Props> = ({
  swap,
  swapDryRunError,
  twap,
  twapDryRunError,
  isSwapLoading,
  isTwapLoading,
}) => {
  const { t } = useTranslation("trade")
  const rpc = useRpcProvider()

  const { control, watch, getValues, reset } =
    useFormContext<MarketFormValues>()
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

  const calculateBuyAmount = useCalculateBuyAmount()
  const calculateSellAmount = useCalculateSellAmount()

  const { data: tradeOrderDuration = 0 } = useQuery(
    tradeOrderDurationQuery(rpc, twap?.tradeCount ?? 0),
  )

  if (isSwapLoading || !swap) {
    return (
      <Flex direction="column" gap="base">
        <TradeOptionSkeleton />
        <TradeOptionSkeleton />
      </Flex>
    )
  }

  if (!buyAsset || !sellAsset) {
    return null
  }

  const isBuy = swap.type === TradeType.Buy

  const [asset, amount, twapAmount] = isBuy
    ? [sellAsset, swap.amountIn, twap?.amountIn]
    : [buyAsset, swap.amountOut, twap?.amountOut]

  const price = scaleHuman(amount, asset.decimals)
  const twapPrice = twapAmount ? scaleHuman(twapAmount, asset.decimals) : "0"
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
        <Flex sx={{ flexDirection: "column", gap: "base" }}>
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
          {isTwapLoading || !twap ? (
            <TradeOptionSkeleton />
          ) : (
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
          )}
          {field.value && swapDryRunError && (
            <Alert
              sx={{ width: "100%" }}
              variant="error"
              title={formatPascalCaseToSentence(swapDryRunError.name)}
              tooltip={swapDryRunError.description}
            />
          )}
          {!field.value && twapDryRunError && (
            <Alert
              sx={{ width: "100%" }}
              variant="error"
              title={formatPascalCaseToSentence(twapDryRunError.name)}
              tooltip={twapDryRunError.description}
            />
          )}
        </Flex>
      )}
    />
  )
}
