import {
  ArrowRight,
  QuestionCircleRegular,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ExternalLink,
  Flex,
  Icon,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, xcscan } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { JourneyDate } from "@/modules/xcm/history/components/JourneyDate"
import { JourneyStatus } from "@/modules/xcm/history/components/JourneyStatus"
import { useXcmBridgeTxStore } from "@/modules/xcm/history/hooks/useXcmBridgeTxStore"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import {
  getTransferAsset,
  resolveNetwork,
} from "@/modules/xcm/history/utils/assets"
import { isJourneyClaimable } from "@/modules/xcm/history/utils/claim"
import { getFormattedAddresses } from "@/modules/xcm/history/utils/journey"
import { isOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

function getBasejumpStatus(status: TJourneyStatus): TJourneyStatus {
  if (FAILED_STATUSES.includes(status)) return status
  if (status === "pending" || status === "sent") return status
  return "completed"
}

export const XcJourneyCard: React.FC<XcJourney> = (journey) => {
  const { origin, destination, sentAt, correlationId, status, totalUsd } =
    journey
  const { t } = useTranslation(["common", "xcm"])
  const { pendingCorrelationIds } = usePendingClaimsStore()
  const { entries } = useXcmBridgeTxStore()

  const entry = originTxPrimary ? entries[originTxPrimary] : undefined
  const isBasejump = entry?.bridgeProvider === XcmTag.InstaBridge

  const displayDestination = (isBasejump && entry?.destUrn) ? entry.destUrn : destination
  const displayStatus = isBasejump ? getBasejumpStatus(status) : status

  const originNetwork = resolveNetwork(origin)
  const destinationNetwork = resolveNetwork(displayDestination)
  const transferAsset = getTransferAsset(journey)
  const { from, to } = getFormattedAddresses(journey)

  const link = xcscan.tx(correlationId)

  const isNotPending = !pendingCorrelationIds.includes(journey.correlationId)
  const isClaimable = isNotPending && !isBasejump && isJourneyClaimable(journey)

  return (
    <Stack as={Paper} px="primary">
      <Flex align="center">
        <Flex py="m" align="center">
          {originNetwork && destinationNetwork ? (
            <>
              <JourneyChainLogo networkUrn={origin} />
              <Icon
                component={ArrowRight}
                size="l"
                mx="s"
                color={getToken("icons.onSurface")}
              />
              <JourneyChainLogo networkUrn={displayDestination} />
            </>
          ) : (
            <Icon
              component={QuestionCircleRegular}
              size="l"
              mx="s"
              color={getToken("icons.onSurface")}
            />
          )}
        </Flex>

        <Separator
          mx="l"
          orientation="vertical"
          sx={{ alignSelf: "stretch" }}
        />

        <Flex align="center" gap="s">
          {isBasejump && (
            <Text fs="p5" fw={500} color={getToken("controls.solid.accent")}>
              {t("xcm:bridge.provider.instabridge", "Basejump 🪂")}
            </Text>
          )}
          <JourneyStatus status={displayStatus} fs="p5" />
        </Flex>

        {sentAt && (
          <Flex align="center" justify="space-between" ml="auto">
            <JourneyDate
              timestamp={sentAt}
              fs="p5"
              color={getToken("text.medium")}
            />
          </Flex>
        )}
      </Flex>

      <Separator mx="-primary" />

      <Flex align="center">
        {transferAsset && (
          <Flex gap="base" py="m" align="center" mr={["l", "xl"]}>
            <JourneyAssetLogo assetKey={transferAsset.asset} size="small" />
            <Stack>
              <Text fs="p5" lh={1} fw={600} color={getToken("text.high")}>
                {t("currency", {
                  value: toDecimal(
                    transferAsset.amount,
                    transferAsset.decimals,
                  ),
                  symbol: transferAsset.symbol,
                })}
              </Text>
              {isNumber(totalUsd) && totalUsd > 0 && (
                <Text fs="p6" lh={1} color={getToken("text.medium")}>
                  {t("currency", { value: totalUsd })}
                </Text>
              )}
            </Stack>
          </Flex>
        )}

        <Stack>
          <Flex gap="s" align="center">
            {from && (
              <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
                {t("from")}: {shortenAccountAddress(from)}
              </Text>
            )}
          </Flex>
          <Flex gap="s" align="center">
            {to && (
              <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
                {t("to")}: {shortenAccountAddress(to)}
              </Text>
            )}
          </Flex>
        </Stack>

        <Flex py="m" gap="s" ml="auto">
          {isClaimable && <ClaimButton journey={journey} />}
          {isOptimisticJourney(journey) ? (
            <Button variant="accent" outline disabled>
              {t("details")}
            </Button>
          ) : (
            <Button variant="accent" outline asChild>
              <ExternalLink href={link}>{t("details")}</ExternalLink>
            </Button>
          )}
        </Flex>
      </Flex>
    </Stack>
  )
}
