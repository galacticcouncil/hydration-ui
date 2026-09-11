import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { useOtcOmnipoolComparison } from "@/modules/trade/otc/useOtcOmnipoolComparison"

type Props = {
  readonly offer: OtcOfferTabular
  /** Human amount of assetIn the taker pays (form sellAmount). */
  readonly sellAmount: string
  /** Human amount of assetOut received, net of OTC fee (form buyAmount). */
  readonly buyAmount: string
}

/**
 * Fill-modal row comparing this fill against swapping the entered amount on
 * Omnipool, after Omnipool's swap fee and price impact. Quoted for the exact
 * amount the user is filling, so there's no assumed-size caveat.
 */
export const OtcVsOmnipool: FC<Props> = ({ offer, sellAmount, buyAmount }) => {
  const { t } = useTranslation(["trade", "common"])

  const [debouncedSell] = useDebounce(sellAmount, 300)
  const [debouncedBuy] = useDebounce(buyAmount, 300)

  const { isLoading, comparison } = useOtcOmnipoolComparison({
    assetIn: offer.assetIn,
    assetOut: offer.assetOut,
    amountIn: debouncedSell,
    otcReceive: debouncedBuy,
    enabled: Big(debouncedSell || "0").gt(0),
  })

  if (!Big(sellAmount || "0").gt(0)) {
    return null
  }

  const isEqual = !!comparison && comparison.diffPct < 0.01

  const valueText =
    isLoading || debouncedSell !== sellAmount
      ? t("otc.vsOmnipool.loading")
      : comparison
        ? isEqual
          ? t("otc.vsOmnipool.modal.equal")
          : t(
              comparison.betterForTaker
                ? "otc.vsOmnipool.modal.better"
                : "otc.vsOmnipool.modal.worse",
              {
                percentage: t("common:percent.compact", {
                  value: comparison.diffPct,
                }),
              },
            )
        : t("otc.vsOmnipool.unavailable")

  const valueColor =
    comparison && !isEqual
      ? comparison.betterForTaker
        ? getToken("details.values.positive")
        : getToken("details.values.negative")
      : getToken("text.medium")

  return (
    <Flex justify="space-between" align="center" gap="m" my="s" px="xl">
      <Flex align="center" gap={4}>
        <Text fw={400} fs="p5" lh="m" color={getToken("text.medium")}>
          {t("otc.vsOmnipool.title")}
        </Text>
        <Tooltip text={t("otc.vsOmnipool.title.tooltip")} />
      </Flex>
      <Text
        fw={500}
        fs="p5"
        lh="s"
        color={valueColor}
        align="right"
        whiteSpace="nowrap"
      >
        {valueText}
      </Text>
    </Flex>
  )
}
