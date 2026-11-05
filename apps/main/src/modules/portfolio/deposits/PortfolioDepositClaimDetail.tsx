import {
  ModalBody,
  ModalHeader,
  Stack,
  Summary,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity"
import { DepositClaimAction } from "@/modules/onramp/deposit/components/DepositClaimAction"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import { toDecimal } from "@/utils/formatting"

export type PortfolioDepositClaimDetailProps = {
  journey: XcJourney
  address: string
}

export const PortfolioDepositClaimDetail: FC<
  PortfolioDepositClaimDetailProps
> = ({ journey, address }) => {
  const { t } = useTranslation(["onramp", "common"])
  const asset = getTransferAsset(journey)
  const source = resolveChainFromUrn(journey.origin)

  return (
    <>
      <ModalHeader title={t("deposit.portfolio.claim.title")} align="center" />
      <ModalBody>
        <Stack gap="xl" justify="flex-start">
          {asset && (
            <Stack align="center" gap="m" justify="flex-start">
              <JourneyAssetLogo assetKey={asset.asset} size="large" />
              <Text font="primary" fs="h5">
                {t("common:currency", {
                  value: toDecimal(asset.amount, asset.decimals),
                  symbol: asset.symbol,
                })}
              </Text>
            </Stack>
          )}
          <Text fs="p4" color={getToken("text.medium")}>
            {t("deposit.portfolio.claims.description")}
          </Text>
          <Summary
            rows={[
              {
                label: t("common:from"),
                content: source?.name ?? t("common:unknown"),
              },
              { label: t("common:destination"), content: "Hydration" },
              {
                label: t("deposit.onchain.destination"),
                content: <AccountIdentity address={address} />,
              },
            ]}
          />
          <DepositClaimAction journey={journey} address={address} />
        </Stack>
      </ModalBody>
    </>
  )
}
