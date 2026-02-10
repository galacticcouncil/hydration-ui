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

import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { JourneyDate } from "@/modules/xcm/history/components/JourneyDate"
import { JourneyStatus } from "@/modules/xcm/history/components/JourneyStatus"
import { resolveNetwork } from "@/modules/xcm/history/utils/assets"
import { toDecimal } from "@/utils/formatting"

export const XcJourneyCard: React.FC<XcJourney> = ({
  origin,
  destination,
  assets,
  sentAt,
  correlationId,
  status,
  fromFormatted,
  from,
  toFormatted,
  to,
  totalUsd,
}) => {
  const { t } = useTranslation(["common", "xcm"])

  const originNetwork = resolveNetwork(origin)
  const destinationNetwork = resolveNetwork(destination)

  // TODO: fix this in SDK, types are wrong
  const assetsArray = Array.isArray(assets) ? assets : assets ? [assets] : []
  const transferAsset =
    assetsArray.find((a) => a.role === "transfer") || assetsArray[0]

  const link = xcscan.tx(correlationId)

  const isValidAsset =
    !!transferAsset && !!transferAsset.symbol && !!transferAsset.decimals

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
          <JourneyStatus status={status} fs="p5" />
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
        {isValidAsset && (
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
              <Text fs="p6" lh={1} color={getToken("text.medium")}>
                {t("currency", { value: totalUsd })}
              </Text>
            </Stack>
          </Flex>
        )}

        <Stack>
          <Flex gap="s" align="center">
            <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
              {t("from")}: {shortenAccountAddress(fromFormatted || from)}
            </Text>
          </Flex>
          <Flex gap="s" align="center">
            <Text fs="p6" lh={1.3} color={getToken("text.medium")}>
              {t("to")}: {shortenAccountAddress(toFormatted || to)}
            </Text>
          </Flex>
        </Stack>

        <Flex py="m" gap="s" ml="auto">
          <Button variant="accent" outline asChild>
            <ExternalLink href={link}>Details</ExternalLink>
          </Button>
        </Flex>
      </Flex>
    </Stack>
  )
}
