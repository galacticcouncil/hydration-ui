import { Flex, OptionCard } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { doNothing } from "remeda"

import {
  Trade,
  TradeOrder,
  tradeOrderDurationQuery,
  TradeType,
} from "@/api/trade"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
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
  const { featureFlags } = rpc

  const { control, watch } = useFormContext<MarketFormValues>()
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

  // Duration falls out of the order's own schedule (slices × cadence). Under the
  // adaptive proposal the cadence varies with size, so read it from the chain
  // rather than assuming the fixed TWAP interval.
  const { data: twapDurationMs = 0 } = useQuery(
    tradeOrderDurationQuery(rpc, twap?.tradeCount ?? 0, twap?.tradePeriod ?? 0),
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

  // Show the raw router quote — the expected amount, net of trade fees and
  // price impact but NOT the user's slippage (same as the classic swap page).
  // Slippage shows as "Minimum received" in the summary; the extrinsic still
  // commits the floor. Split trade (TWAP) keeps the raw quote too.
  const [asset, amount, twapAmount] = isBuy
    ? [sellAsset, swap.amountIn, twap?.amountIn]
    : [buyAsset, swap.amountOut, twap?.amountOut]

  const price = scaleHuman(amount, asset.decimals)
  const twapPrice = twapAmount ? scaleHuman(twapAmount, asset.decimals) : "0"

  // Intent TWAP settles at market (per-slice floor is the adaptive oracle
  // limit, not a fixed minimum), so the split output is an estimate (~) and
  // the badge shows the guaranteed fee saving vs the single trade instead of
  // the output difference: small slices pay a smaller dynamic fee no matter
  // how the market moves. Fee assets line up with the card asset in both
  // directions (sell → out asset, buy → in asset).
  const isIce = featureFlags.isIceEnabled
  const feeSaving = twap
    ? Math.max(
        0,
        Number(scaleHuman(swap.tradeFee, asset.decimals)) -
          Number(scaleHuman(twap.tradeFee, asset.decimals)),
      ).toString()
    : "0"
  const outputDiff = Big(twapPrice).minus(price).toString()
  const diff = isIce ? feeSaving : outputDiff

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
          {!isTwapEnabled(swap) ? (
            <OptionCard
              label={t("market.form.type.split")}
              description={t("market.form.type.split.unavailable")}
              value=""
              isActive={false}
              onClick={doNothing}
              disabled
            />
          ) : isTwapLoading || !twap ? (
            <TradeOptionSkeleton />
          ) : (
            <TradeOption
              asset={asset}
              value={twapPrice}
              diff={diff}
              // Intent TWAP settles at market in BOTH directions, so the
              // derived amount is an estimate whether the user fixed the sell
              // (buy is derived) or the buy (the sell needed is derived).
              approx={isIce}
              active={!field.value}
              onClick={(): void => {
                field.onChange(false)
              }}
              label={t("market.form.type.split")}
              time={t("market.form.type.split.timeframe", {
                timeframe: formatDistanceToNowStrict(
                  Date.now() + twapDurationMs,
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
