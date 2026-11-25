import { Flex, OptionCard } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { doNothing } from "remeda"

import { TAssetData } from "@/api/assets"
import {
  Trade,
  TradeOrder,
  tradeOrderDurationQuery,
  TradeType,
} from "@/api/trade"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { isTwapEnabled } from "@/modules/trade/swap/sections/XcSwap/lib/isTwapEnabled"
import { getTradeOrderErrorMessage } from "@/modules/trade/swap/sections/XcSwap/lib/tradeOrderErrorMessages"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly sellAsset: TAssetData | null
  readonly buyAsset: TAssetData | null
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly isSwapLoading: boolean
  readonly isTwapLoading: boolean
}

export const TradeModeOptions: FC<Props> = ({
  sellAsset,
  buyAsset,
  swap,
  twap,
  isSwapLoading,
  isTwapLoading,
}) => {
  const { t } = useTranslation("trade")
  const rpc = useRpcProvider()

  const { control } = useFormContext<XcSwapFormValues>()

  const { data: twapDurationMs, isPending: isDurationPending } = useQuery(
    tradeOrderDurationQuery(rpc, twap?.tradeCount ?? 0, twap?.tradePeriod ?? 0),
  )

  const showFullSkeleton = isSwapLoading || !swap
  const showSplitSkeleton = isTwapLoading || !twap

  if (showFullSkeleton) {
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

  // A split buy is placed as a sell, so its fee is in the buy asset: convert it
  // into the sell asset at the order's own rate before comparing.
  const twapFee = !twap
    ? null
    : !isBuy
      ? twap.tradeFee
      : twap.amountOut > 0n
        ? (twap.tradeFee * twap.amountIn) / twap.amountOut
        : null

  const feeSaving =
    twapFee === null || swap.tradeFee <= twapFee
      ? "0"
      : scaleHuman(swap.tradeFee - twapFee, asset.decimals)

  const twapError = twap?.errors[0]
  const twapSubtitle = twapError
    ? getTradeOrderErrorMessage(twapError, t)
    : isDurationPending || !twapDurationMs
      ? t("market.form.type.split.pending")
      : t("market.form.type.split.timeframe", {
          timeframe: formatDistanceToNowStrict(Date.now() + twapDurationMs),
        })

  return (
    <Controller
      control={control}
      name="isSingleTrade"
      render={({ field }) => (
        <Flex direction="column" gap="base">
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
          ) : showSplitSkeleton ? (
            <TradeOptionSkeleton />
          ) : (
            <TradeOption
              asset={asset}
              value={twapPrice}
              diff={feeSaving}
              approx
              active={!field.value}
              onClick={(): void => {
                field.onChange(false)
              }}
              label={t("market.form.type.split")}
              time={twapSubtitle}
              disabled={!!twap.errors.length}
            />
          )}
        </Flex>
      )}
    />
  )
}
