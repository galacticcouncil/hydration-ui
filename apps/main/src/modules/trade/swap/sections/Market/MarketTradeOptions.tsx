import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { Box, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { formatDistanceToNow } from "date-fns"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TwapOrder } from "@/api/utils/twapApi"
import { TradeOption } from "@/modules/trade/swap/components/TradeOption/TradeOption"
import { TradeOptionSkeleton } from "@/modules/trade/swap/components/TradeOption/TradeOptionSkeleton"
import {
  MarketFormValues,
  SwapType,
} from "@/modules/trade/swap/sections/Market/useMarketForm"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TwapOrder | undefined
  readonly isLoading: boolean
}

export const MarketTradeOptions: FC<Props> = ({ swap, twap, isLoading }) => {
  const { t } = useTranslation("trade")
  const { watch, control } = useFormContext<MarketFormValues>()
  const buyAsset = watch("buyAsset")

  if (isLoading && (!swap || !twap)) {
    return (
      <Box pt={8} pb={12}>
        <TradeOptionSkeleton />
      </Box>
    )
  }

  if (!swap || !buyAsset || !twap) {
    return null
  }

  const price = scaleHuman(swap.amountOut, buyAsset.decimals)
  const twapPrice = scaleHuman(twap.amountOut, buyAsset.decimals)
  const diff = Big(twapPrice).minus(price).toString()

  return (
    <Controller
      control={control}
      name="type"
      render={({ field: { value, onChange } }) => (
        <Flex sx={{ flexDirection: "column", gap: 8, pt: 8, pb: 12 }}>
          <TradeOption
            buyAsset={buyAsset}
            value={price}
            active={"swap" === value}
            onClick={() => onChange("swap" satisfies SwapType)}
            label={t("market.form.type.single")}
            time="Instant execution"
          />
          <TradeOption
            buyAsset={buyAsset}
            value={twapPrice}
            diff={diff}
            active={"twap" === value}
            onClick={() => onChange("twap" satisfies SwapType)}
            label={t("market.form.type.split")}
            time={t("market.form.type.split.timeframe", {
              timeframe: formatDistanceToNow(Date.now() + twap.time),
            })}
            disabled={!!twap.error}
          />
        </Flex>
      )}
    />
  )
}
