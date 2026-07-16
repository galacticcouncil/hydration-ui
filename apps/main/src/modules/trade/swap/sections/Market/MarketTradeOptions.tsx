import { Flex } from "@galacticcouncil/ui/components"
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
  TradeType,
} from "@/api/trade"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly isSwapLoading: boolean
  readonly isTwapLoading: boolean
}

export const MarketTradeOptions: FC<Props> = ({
  swap,
  twap,
  isSwapLoading,
  isTwapLoading,
}) => {
  const { t } = useTranslation("trade")
  const rpc = useRpcProvider()

  const { control, watch } = useFormContext<MarketFormValues>()
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

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

  // Buy-intent (guaranteed Buy) keeps the production behaviour: raw output diff
  // vs the single trade. Sell-intent shows the guaranteed fee saving instead —
  // the difference of the actual fees paid (same fee asset), clamped >= 0; small
  // slices pay a smaller dynamic fee regardless of how the market moves. Kept
  // identical to the "Save X on fees" figure in the split summary.
  const feeSaving = twap
    ? Math.max(
        0,
        Number(scaleHuman(swap.tradeFee, asset.decimals)) -
          Number(scaleHuman(twap.tradeFee, asset.decimals)),
      ).toString()
    : "0"
  const outputDiff = Big(twapPrice).minus(price).toString()
  const splitDiff = isBuy ? outputDiff : feeSaving

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
              diff={splitDiff}
              isBuy={isBuy}
              approx={!isBuy}
              active={!field.value}
              onClick={(): void => {
                field.onChange(false)
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
        </Flex>
      )}
    />
  )
}
