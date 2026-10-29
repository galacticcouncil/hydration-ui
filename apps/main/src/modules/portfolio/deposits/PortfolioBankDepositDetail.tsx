import { FiatEur, FiatUsd } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import type {
  BankDepositHistory,
  BankDepositHistoryEntry,
} from "@/api/bankDeposits"

import { PortfolioDepositModalContent } from "./PortfolioDepositModalContent"

type PortfolioBankDepositDetailProps = {
  deposit: BankDepositHistoryEntry
  source: BankDepositHistory["source"]
  onClose: () => void
}

export const PortfolioBankDepositDetail: FC<
  PortfolioBankDepositDetailProps
> = ({ deposit: sample, source, onClose }) => {
  const { t } = useTranslation(["onramp", "common"])

  return (
    <PortfolioDepositModalContent
      title={t("deposit.portfolio.detail.title")}
      logo={
        <Icon
          component={sample.currency === "USD" ? FiatUsd : FiatEur}
          size="4xl"
        />
      }
      amount={t("common:currency", {
        value: sample.amount,
        symbol: sample.symbol,
      })}
      status={sample.status}
      description={t(`deposit.portfolio.detail.${sample.status}`)}
      rows={[
        {
          label: t("deposit.portfolio.table.method"),
          content: t("deposit.portfolio.method.bank"),
        },
        {
          label: t("bankV2.deposit.amount"),
          content: t("common:currency", {
            value: sample.amount,
            symbol: sample.currency,
          }),
        },
        { label: t("bankV2.deposit.method"), content: sample.rail },
        {
          label: t("common:destination"),
          content: `Hydration · ${sample.destinationSymbol}`,
        },
        { label: t("common:status"), content: sample.providerStatus },
        {
          label: t("common:date"),
          content: t("common:date.datetime.short", {
            value: sample.sentAt,
          }),
        },
        {
          label: t("deposit.portfolio.detail.reference"),
          content: sample.id,
        },
      ]}
      notice={
        source === "preview" ? t("deposit.portfolio.sampleNote") : undefined
      }
      closeLabel={t("common:close")}
      onClose={onClose}
    />
  )
}
