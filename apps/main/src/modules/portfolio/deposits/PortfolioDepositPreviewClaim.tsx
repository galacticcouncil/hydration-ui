import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

import { PortfolioDepositModalContent } from "./PortfolioDepositModalContent"
import { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"

type PortfolioDepositPreviewClaimProps = {
  deposit: PortfolioDepositSample
  onConfirm: () => void
  onClose: () => void
}

export const PortfolioDepositPreviewClaim: FC<
  PortfolioDepositPreviewClaimProps
> = ({ deposit, onConfirm, onClose }) => {
  const { t } = useTranslation(["onramp", "common"])

  return (
    <PortfolioDepositModalContent
      title={t("deposit.portfolio.claim.title")}
      logo={<AssetLogo id={deposit.assetId} size="large" />}
      amount={t("common:currency", {
        value: deposit.amount,
        symbol: deposit.symbol,
      })}
      status={deposit.status}
      description={t("deposit.portfolio.claim.description")}
      rows={[
        { label: t("common:from"), content: deposit.source },
        { label: t("common:chain"), content: deposit.network },
        { label: t("common:destination"), content: "Hydration" },
      ]}
      notice={t("deposit.portfolio.sampleNote")}
      closeLabel={t("common:cancel")}
      onClose={onClose}
      action={{
        label: t("common:claim"),
        onClick: onConfirm,
        disabled: deposit.status !== "claimable",
      }}
    />
  )
}
