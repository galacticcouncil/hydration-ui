import { Alert, Separator, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, Fragment } from "react"
import { useTranslation } from "react-i18next"

import type { RampQuoteResponse } from "@/modules/onramp/bank/config/schemas"
import { getPayoutLimitView } from "@/modules/onramp/bank/utils/cashOut"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type BankCashOutQuoteProps = {
  pricing?: Pick<RampQuoteResponse, "quote" | "payoutLimit">
  currency: "usd" | "eur"
  account?: string | null
  sourceAsset?: "HOLLAR" | "USDC"
}

export const BankCashOutQuote: FC<BankCashOutQuoteProps> = ({
  pricing,
  currency,
  account,
  sourceAsset = "USDC",
}) => {
  const { t } = useTranslation(["onramp"])
  const usdc = (value: string) =>
    t("bank.cashOut.quote.usdc", { amount: formatUsdcBaseUnits(value) ?? "-" })

  const rows = [
    { label: t("bank.cashOut.summary.toAccount"), value: account ?? "-" },
    {
      label: t("bank.cashOut.summary.payoutCurrency"),
      value: t(`bank.deposit.currency.${currency}`),
    },
  ]
  if (pricing) {
    const { psmFee, developerFee, floor } = pricing.quote
    rows.push(
      {
        label: t("bank.cashOut.quote.psmFee"),
        value:
          sourceAsset === "HOLLAR"
            ? `${formatUsdcBaseUnits(psmFee) ?? "-"} HOLLAR`
            : usdc(psmFee),
      },
      {
        label: t("bank.cashOut.quote.developerFee"),
        value: usdc(developerFee),
      },
      { label: t("bank.cashOut.quote.floor"), value: usdc(floor) },
    )
  }
  const limit = pricing ? getPayoutLimitView(pricing.payoutLimit) : null

  return (
    <Stack gap="m">
      <Text font="primary" fs="p2" color={getToken("text.tint.secondary")}>
        {t("bank.cashOut.summary.overview")}
      </Text>
      <Stack
        as="dl"
        m={0}
        sx={{
          borderRadius: "xl",
          bg: getToken("surfaces.containers.dim.dimOnHigh"),
        }}
      >
        {rows.map(({ label, value }, index) => (
          <Fragment key={label}>
            {index > 0 && <Separator />}
            <Stack gap="s" px="l" py="m">
              <Text as="dt" fs="p5" color={getToken("text.medium")}>
                {label}
              </Text>
              <Text
                as="dd"
                fs="p5"
                fw={600}
                m={0}
                sx={{ overflowWrap: "anywhere" }}
              >
                {value}
              </Text>
            </Stack>
          </Fragment>
        ))}
      </Stack>
      {currency === "eur" && (
        <Alert variant="info" description={t("bank.cashOut.quote.eur")} />
      )}
      {limit?.kind === "wait" && (
        <Alert
          variant="info"
          description={
            limit.minMinutes === null
              ? t("bank.cashOut.quote.payoutWait")
              : t("bank.cashOut.quote.payoutWaitAtLeast", {
                  count: limit.minMinutes,
                })
          }
        />
      )}
    </Stack>
  )
}
