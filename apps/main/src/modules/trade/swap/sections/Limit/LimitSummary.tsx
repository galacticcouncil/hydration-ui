import {
  Box,
  Flex,
  SummaryRowLabel,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

/**
 * Summary section shown below the Limit form:
 *  - Human-readable description: "Sell X A for at least Y B when price
 *    reaches Z B for 1 A."
 *
 * We only render once the user has entered enough to make the sentence
 * meaningful (sell, buy, and limit price). Before that, there is nothing
 * useful to describe.
 *
 * NOTE: the Total fees row was intentionally hidden until the fee
 * breakdown is finalized. The `iceFeeQuery` is still available in
 * `@/api/intents` for when we add it back.
 */
export const LimitSummary: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset, sellAmount, buyAmount, limitPrice] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "buyAmount",
    "limitPrice",
  ])

  if (!sellAsset || !buyAsset || !sellAmount || !buyAmount || !limitPrice)
    return null

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" gap="base" py="base">
        <SummaryRowLabel>{t("summary")}</SummaryRowLabel>
        <Text fw={500} fs="p2" lh="l" color={getToken("text.high")}>
          <Trans
            t={t}
            i18nKey="trade:limit.summary.description"
            values={{
              sellAmount: t("currency", {
                value: sellAmount,
                symbol: sellAsset.symbol,
              }),
              buyAmount: t("currency", {
                value: buyAmount,
                symbol: buyAsset.symbol,
              }),
              limitPrice: t("currency", {
                value: limitPrice,
                symbol: buyAsset.symbol,
              }),
              sellSymbol: sellAsset.symbol,
            }}
          >
            <Box as="span" color={getToken("text.tint.secondary")} />
          </Trans>
        </Text>
      </Flex>
    </>
  )
}
