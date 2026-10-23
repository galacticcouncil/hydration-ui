import { Alert, Stack, Summary, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  BankWithdrawalQuote,
  getDemoWithdrawalBank,
} from "./BankWithdraw.utils"

type BankWithdrawReviewProps = {
  quote: BankWithdrawalQuote
  bankAccount?: string
}

export const BankWithdrawReview: FC<BankWithdrawReviewProps> = ({
  quote,
  bankAccount,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <Stack gap="l">
      <Text fs="p3" fw={600}>
        {t("bankWithdraw.review.title")}
      </Text>
      <Summary
        rows={[
          {
            label: t("bankWithdraw.review.sell"),
            content: t("common:currency", {
              value: quote.amount,
              symbol: "HOLLAR",
            }),
          },
          {
            label: t("bankWithdraw.review.fee"),
            content: t("common:currency", {
              value: quote.fee,
              symbol: "HOLLAR",
            }),
          },
          {
            label: t("bankWithdraw.review.rate"),
            content: t("bankWithdraw.review.rateValue", {
              value: t("common:number", { value: quote.rate }),
              currency: quote.currency,
            }),
          },
          {
            label: t("bankWithdraw.review.receive"),
            content: t("common:currency", {
              value: quote.received,
              symbol: quote.currency,
            }),
          },
          {
            label: t("bankWithdraw.review.bank"),
            content: (
              <Text
                fs="p5"
                fw={500}
                lh={1.2}
                align="right"
                sx={{ overflowWrap: "anywhere" }}
                data-bank-account-value
              >
                {bankAccount ?? getDemoWithdrawalBank(quote.currency).account}
              </Text>
            ),
          },
          {
            label: t("bankWithdraw.review.rail"),
            content: t(`bankWithdraw.rail.${quote.currency}`),
          },
        ]}
      />
      <Alert description={t("bankWithdraw.review.indicative")} />
      <Text fs="p5" color={getToken("text.medium")}>
        {t("bankWithdraw.review.confirmDescription")}
      </Text>
    </Stack>
  )
}
