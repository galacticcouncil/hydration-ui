import {
  ArrowRight,
  Basejumper,
  ExternalLinkIcon,
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
import { basejumpscan, xcscan } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/AccountIdentity"
import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { JourneyDate } from "@/modules/xcm/history/components/JourneyDate"
import { JourneyDisplayStatus } from "@/modules/xcm/history/components/JourneyDisplayStatus"
import { JourneyProtocol } from "@/modules/xcm/history/components/JourneyProtocol"
import { useJourneyAddresses } from "@/modules/xcm/history/hooks/useJourneyAddresses"
import { useJourneyClaimable } from "@/modules/xcm/history/hooks/useJourneyClaimable"
import {
  getTransferAsset,
  resolveNetwork,
} from "@/modules/xcm/history/utils/assets"
import { isOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"
import { toDecimal } from "@/utils/formatting"

export const XcJourneyCard: React.FC<XcJourney> = (journey) => {
  const {
    origin,
    destination,
    sentAt,
    correlationId,
    totalUsd,
    originProtocol,
  } = journey
  const { t } = useTranslation(["common", "xcm"])

  const originNetwork = resolveNetwork(origin)
  const destinationNetwork = resolveNetwork(destination)
  const transferAsset = getTransferAsset(journey)
  const { from, to } = useJourneyAddresses(journey)

  const link =
    originProtocol === "basejump"
      ? basejumpscan.tx(correlationId)
      : xcscan.tx(correlationId)

  const isClaimable = useJourneyClaimable(journey)

  const usdValue = Big(totalUsd || transferAsset?.usd || 0)

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
              <JourneyChainLogo networkUrn={destination} />
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

        <Flex align="center" justify="space-between">
          <JourneyDisplayStatus journey={journey} fs="p5" />
        </Flex>

        {sentAt && (
          <Flex
            direction={["column", "row"]}
            align={["flex-end", "center"]}
            gap={["xs", "m"]}
            justify="space-between"
            ml="auto"
          >
            {originProtocol === "basejump" && (
              <Flex gap="s" align="center">
                <Icon
                  component={Basejumper}
                  size="m"
                  color={getToken("colors.skyBlue.600")}
                />
                <JourneyProtocol fs="p5" protocol={originProtocol} />
              </Flex>
            )}
            <JourneyDate
              truncate
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
              {usdValue.gt(0) && (
                <Text fs="p6" lh={1} color={getToken("text.medium")}>
                  {t("currency", { value: usdValue })}
                </Text>
              )}
            </Stack>
          </Flex>
        )}

        <Stack>
          <Flex gap="s" align="center">
            {from && (
              <Flex gap="s" align="center">
                <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
                  {t("from")}:
                </Text>
                <AccountIdentity fs="p6" lh={1.3} address={from} />
              </Flex>
            )}
          </Flex>
          <Flex gap="s" align="center">
            {to && (
              <Flex gap="s" align="center">
                <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
                  {t("to")}:
                </Text>
                <AccountIdentity fs="p6" lh={1.3} address={to} />
              </Flex>
            )}
          </Flex>
        </Stack>

        <Flex py="m" gap="s" ml="auto">
          {isClaimable && <ClaimButton journey={journey} />}
          {isOptimisticJourney(journey) ? (
            <Button variant="accent" outline disabled>
              <Text display={["none", "inline"]} as="span">
                {t("details")}
              </Text>
              <Icon
                display={["block", "none"]}
                size="s"
                component={ExternalLinkIcon}
              />
            </Button>
          ) : (
            <Button variant="accent" outline asChild>
              <ExternalLink href={link}>
                <Text display={["none", "inline"]} as="span">
                  {t("details")}
                </Text>
                <Icon
                  display={["block", "none"]}
                  size="s"
                  component={ExternalLinkIcon}
                />
              </ExternalLink>
            </Button>
          )}
        </Flex>
      </Flex>
    </Stack>
  )
}
