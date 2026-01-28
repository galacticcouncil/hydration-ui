import { Box, Flex, Tooltip } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AyeDetails } from "@/modules/staking/AyeDetails"
import { SReferendaProgress } from "@/modules/staking/Referenda.styled"
import { ReferendaThresholdLine } from "@/modules/staking/ReferendaThresholdLine"

type Props = {
  readonly ayeValue: string
  readonly ayePercent: number
  readonly thresholdPercent: number
  readonly nayValue: string
  readonly nayPercent: number
  readonly supportPercent: number
  readonly supportMaxPercentage: number
  readonly supportThreshold: number
  readonly supportTooltipPercent: number
  readonly supportMarkPercentage: number
  readonly voted: boolean
}

export const ReferendaStatus: FC<Props> = ({
  ayeValue,
  ayePercent,
  thresholdPercent,
  nayValue,
  nayPercent,
  supportPercent,
  supportMaxPercentage,
  supportThreshold,
  supportTooltipPercent,
  supportMarkPercentage,
  voted,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { isMobile } = useBreakpoints()
  return (
    <Flex direction="column" gap="l">
      <Flex direction="column" gap="s">
        <SReferendaProgress size="large">
          <Flex position="relative" gap="s">
            <Box
              height="2xs"
              bg="#6FC272"
              width={`${ayePercent}%`}
              borderRadius="m"
            />
            <Box
              height="2xs"
              bg="#FF5757"
              width={`${nayPercent}%`}
              borderRadius="m"
            />
            <ReferendaThresholdLine
              sx={{ top: "-m" }}
              percentage={thresholdPercent}
              voted={voted}
            />
          </Flex>
        </SReferendaProgress>
        <Flex pb="base" justify="space-between">
          <AyeDetails
            label={t("staking:referenda.item.aye")}
            labelProps={{
              color: voted
                ? getToken("accents.success.emphasis")
                : getToken("text.lowest"),
            }}
            value={ayeValue}
            percent={ayePercent}
            voted={voted}
          />
          <AyeDetails
            label={t("staking:referenda.item.threshold")}
            labelProps={{
              color: voted
                ? getToken("text.medium")
                : getToken("surfaces.containers.low.onPrimary"),
              align: "center",
            }}
            percent={thresholdPercent}
            percentProps={{
              align: "center",
            }}
            voted={voted}
          />
          <AyeDetails
            label={t("staking:referenda.item.nay")}
            labelProps={{
              color: voted
                ? getToken("accents.danger.secondary")
                : getToken("text.lowest"),
              align: "right",
            }}
            value={nayValue}
            percent={nayPercent}
            voted={voted}
          />
        </Flex>
      </Flex>
      <Flex py="base" direction="column" gap="s">
        <Tooltip
          text={
            !isMobile
              ? t("staking:referenda.item.supportTooltip", {
                  percentage: t("percent", { value: supportTooltipPercent }),
                })
              : null
          }
        >
          <SReferendaProgress size="small">
            <Box position="relative">
              <Box
                height="2xs"
                bg={getToken("text.tint.secondary")}
                borderRadius="m"
                width={`${supportPercent}%`}
              />
              <ReferendaThresholdLine
                sx={{ top: "-base" }}
                percentage={supportMarkPercentage}
                voted={voted}
              />
            </Box>
          </SReferendaProgress>
        </Tooltip>
        <Flex justify="space-between">
          <AyeDetails percent={0} voted={voted} />
          <AyeDetails
            label={t("staking:referenda.item.threshold")}
            labelProps={{
              color: voted ? getToken("text.medium") : getToken("text.lowest"),
              align: "center",
            }}
            percent={supportThreshold}
            percentProps={{
              align: "center",
            }}
            voted={voted}
          />
          <AyeDetails
            percent={supportMaxPercentage}
            percentProps={{
              color: voted
                ? getToken("text.high")
                : getToken("surfaces.containers.low.onPrimary"),
              align: "right",
            }}
            voted={voted}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
