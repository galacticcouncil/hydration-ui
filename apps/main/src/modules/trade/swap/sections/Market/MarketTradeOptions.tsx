import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Box, Flex } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { formatDistanceToNow } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { blockTimeQuery } from "@/api/chain"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import {
  MarketFormValues,
  TradeOrderType,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly isLoading: boolean
}

export const MarketTradeOptions: FC<Props> = ({ swap, twap, isLoading }) => {
  const { t } = useTranslation("trade")

  const { watch, control } = useFormContext<MarketFormValues>()
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

  const blockTime = useQuery({
    ...blockTimeQuery(useRpcProvider()),
    enabled: !!swap && !!twap && !isLoading,
  })

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

  const [asset, amount, twapAmount] =
    swap.type === TradeType.Buy
      ? [sellAsset, swap.amountIn, twap.amountIn]
      : [buyAsset, swap.amountOut, twap.amountOut]

  const price = scaleHuman(amount, asset.decimals)
  const twapPrice = scaleHuman(twapAmount, asset.decimals)
  const diff = Big(twapPrice).minus(price).toString()

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
            onClick={() => field.onChange(true)}
            label={t("market.form.type.single")}
            time={t("market.form.type.single.instant")}
          />
          <TradeOption
            asset={asset}
            value={twapPrice}
            diff={diff}
            isBuy={twap.type === TradeOrderType.TwapBuy}
            active={!field.value}
            onClick={() => field.onChange(false)}
            label={t("market.form.type.split")}
            time={t("market.form.type.split.timeframe", {
              timeframe: formatDistanceToNow(
                Date.now() +
                  (blockTime.data ?? PARACHAIN_BLOCK_TIME) * twap.tradePeriod,
                {
                  includeSeconds: true,
                },
              ),
            })}
            disabled={!!twap.errors.length}
          />
        </Flex>
      )}
    />
  )
}
