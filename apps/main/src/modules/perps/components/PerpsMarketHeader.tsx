import { Flex, Paper, Stack, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { PerpsMarket } from "@/modules/perps/PerpsPage.data"

const compactUsd = (value: string) => {
  const n = Number(value)

  if (!n) return "-"
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`

  return `$${n.toFixed(0)}`
}

const Stat: FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color,
}) => (
  <Stack gap="xs">
    <Text
      fs="p6"
      transform="uppercase"
      sx={{ letterSpacing: "0.06em", opacity: 0.55 }}
    >
      {label}
    </Text>
    <Text fs="p5" font="mono" fw={600} color={color}>
      {value}
    </Text>
  </Stack>
)

type Props = {
  market: PerpsMarket | undefined
  isSpot: boolean
  onOpenSelect: () => void
}

export const PerpsMarketHeader: FC<Props> = ({
  market,
  isSpot,
  onOpenSelect,
}) => {
  const { t } = useTranslation("trade")

  if (!market) return null

  const mark = Number(market.markPx)
  const prev = Number(market.prevDayPx)
  const change = prev ? ((mark - prev) / prev) * 100 : 0

  return (
    <Paper p="l">
      <Flex gap="xl" align="center" wrap>
        <Stack gap="xs">
          <Text
            as="button"
            fs="p3"
            fw={700}
            onClick={onOpenSelect}
            sx={{
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              textAlign: "left",
            }}
          >
            {`${market.symbol} ▾`}
          </Text>
          <Text fs="p6" font="mono" color={change >= 0 ? "green400" : "red400"}>
            {`${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
          </Text>
        </Stack>

        <Stat label={t("perps.header.mark")} value={market.markPx} />
        {!isSpot && (
          <Stat label={t("perps.header.oracle")} value={market.oraclePx} />
        )}
        <Stat
          label={t("perps.header.volume")}
          value={compactUsd(market.dayNtlVlm)}
        />
        {!isSpot && (
          <>
            <Stat
              label={t("perps.header.openInterest")}
              value={compactUsd(
                String(Number(market.openInterest) * Number(market.markPx)),
              )}
            />
            <Stat
              label={t("perps.header.funding")}
              value={`${(Number(market.funding) * 8 * 100).toFixed(4)}%`}
              color={Number(market.funding) >= 0 ? "green400" : "red400"}
            />
          </>
        )}
      </Flex>
    </Paper>
  )
}
