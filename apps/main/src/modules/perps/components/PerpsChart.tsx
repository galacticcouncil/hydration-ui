import {
  CandleInterval,
  candlesQuery,
} from "@galacticcouncil/hyperliquid/queries"
import {
  Button,
  Flex,
  Skeleton,
  Text,
  TradingViewChart,
} from "@galacticcouncil/ui/components"
import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useMemo, useState } from "react"

import { HYPERLIQUID } from "@/config/hyperliquid"
import {
  PERPS_BODY_HEIGHT,
  PerpsPanel,
} from "@/modules/perps/components/PerpsPanel"

const INTERVALS: CandleInterval[] = ["5m", "15m", "1h", "4h", "1d"]

export const PerpsChart: FC<{ symbol: string; coin: string }> = ({
  symbol,
  coin,
}) => {
  const [interval, setInterval] = useState<CandleInterval>("1h")

  const { data, isLoading } = useQuery(
    candlesQuery(HYPERLIQUID.isTestnet, coin, interval),
  )

  const candles = useMemo<OhlcData[]>(
    () =>
      (data ?? []).map((candle) => ({
        time: toUTCTimestamp(candle.t),
        open: Number(candle.o),
        high: Number(candle.h),
        low: Number(candle.l),
        close: Number(candle.c),
      })),
    [data],
  )

  return (
    <PerpsPanel
      title={symbol}
      action={
        <Flex gap="xs">
          {INTERVALS.map((option) => (
            <Button
              key={option}
              size="small"
              variant={option === interval ? "secondary" : "muted"}
              sx={{ borderRadius: 4 }}
              onClick={() => setInterval(option)}
            >
              <Text fs="p6" font="mono">
                {option}
              </Text>
            </Button>
          ))}
        </Flex>
      }
    >
      {isLoading ? (
        <Skeleton height={PERPS_BODY_HEIGHT} />
      ) : (
        <TradingViewChart
          type="Candlestick"
          data={candles}
          height={PERPS_BODY_HEIGHT}
        />
      )}
    </PerpsPanel>
  )
}
