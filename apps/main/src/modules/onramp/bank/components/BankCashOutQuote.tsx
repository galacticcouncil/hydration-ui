import { Alert, Stack, SummaryRow } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type { RampQuoteResponse } from "@/modules/onramp/bank/config/schemas"
import { getPayoutLimitView } from "@/modules/onramp/bank/utils/cashOut"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type BankCashOutQuoteProps = {
  quote: RampQuoteResponse["quote"]
  payoutLimit: RampQuoteResponse["payoutLimit"]
  currency: "usd" | "eur"
}

/**
 * The fee split as the server quoted it, every figure exact USDC (no float).
 * Rule 17: a EUR account shows USDC only, with the conversion sentence.
 */
export const BankCashOutQuote: FC<BankCashOutQuoteProps> = ({
  quote,
  payoutLimit,
  currency,
}) => {
  const { t } = useTranslation(["onramp"])
  const usdc = (value: string) =>
    t("bank.cashOut.quote.usdc", { amount: formatUsdcBaseUnits(value) ?? "-" })
  const limit = getPayoutLimitView(payoutLimit)

  return (
    <Stack gap="s">
      <SummaryRow
        label={t("bank.cashOut.quote.amount")}
        content={usdc(quote.usdcAmount)}
      />
      <SummaryRow
        label={t("bank.cashOut.quote.psmFee")}
        content={usdc(quote.psmFee)}
      />
      <SummaryRow
        label={t("bank.cashOut.quote.developerFee")}
        content={usdc(quote.developerFee)}
      />
      <SummaryRow
        label={t("bank.cashOut.quote.bridgeCredited")}
        content={usdc(quote.bridgeCredited)}
      />
      <SummaryRow
        label={t("bank.cashOut.quote.floor")}
        content={usdc(quote.floor)}
      />
      {currency === "eur" && (
        <Alert variant="info" description={t("bank.cashOut.quote.eur")} />
      )}
      {limit.kind === "wait" && (
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
