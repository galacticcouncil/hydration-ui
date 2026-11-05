import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

import { PortfolioDepositModalContent } from "./PortfolioDepositModalContent"
import { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"

type PortfolioDepositPreviewDetailProps = {
  deposit: PortfolioDepositSample
  onClose: () => void
  onClaim: () => void
}

export const PortfolioDepositPreviewDetail: FC<
  PortfolioDepositPreviewDetailProps
> = ({ deposit, onClose, onClaim }) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <PortfolioDepositModalContent
      title={t("deposit.portfolio.detail.title")}
      logo={<AssetLogo id={deposit.assetId} size="large" />}
      amount={t("common:currency", {
        value: deposit.amount,
        symbol: deposit.symbol,
      })}
      status={deposit.status}
      description={t(`deposit.portfolio.detail.${deposit.status}`)}
      rows={[
        {
          label: t("deposit.portfolio.table.method"),
          content: t(`deposit.portfolio.method.${deposit.method}`),
        },
        { label: t("common:from"), content: deposit.source },
        { label: t("common:chain"), content: deposit.network },
        { label: t("common:destination"), content: "Hydration" },
        {
          label: t("common:date"),
          content: t("common:date.datetime.short", {
            value: deposit.createdAt,
          }),
        },
        {
          label: t("deposit.portfolio.detail.reference"),
          content: deposit.id,
        },
      ]}
      notice={t("deposit.portfolio.sampleNote")}
      closeLabel={t("common:close")}
      onClose={onClose}
      action={
        deposit.status === "claimable"
          ? { label: t("common:claim"), onClick: onClaim }
          : undefined
      }
    />
  )
}
