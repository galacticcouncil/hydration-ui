import { Flex, OptionCard } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { doNothing } from "remeda"

import { Trade, TradeOrder, tradeOrderDurationQuery } from "@/api/trade"
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

  const price = scaleHuman(swap.amountOut, buyAsset.decimals)
  const twapPrice = twap ? scaleHuman(twap.amountOut, buyAsset.decimals) : "0"
  const diff = Big(twapPrice).minus(price).toString()

  return (
    <Controller
      control={control}
      name="isSingleTrade"
      render={({ field }) => (
        <Flex sx={{ flexDirection: "column", gap: "base" }}>
          <TradeOption
            asset={buyAsset}
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
              asset={buyAsset}
              value={twapPrice}
              diff={diff}
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
