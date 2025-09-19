import { Box, Flex, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AyeDetails } from "@/modules/staking/AyeDetails"
import { SReferendaProgress } from "@/modules/staking/Referenda.styled"
import { ReferendaThresholdLine } from "@/modules/staking/ReferendaThresholdLine"

type Props = {
  readonly ayeValue: string
  readonly ayePercent: number
  readonly thresholdValue: string
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
  thresholdValue,
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

  return (
    <Flex direction="column" gap={16}>
      <Flex position="relative" direction="column" gap={7}>
        <SReferendaProgress>
          <Box
            height={5}
            bg="#6FC272"
            width={`${ayePercent}%`}
            borderRadius={7}
          />
          <Box
            height={5}
            bg="#FF5757"
            width={`${nayPercent}%`}
            borderRadius={7}
          />
        </SReferendaProgress>
        <ReferendaThresholdLine
          sx={{ top: -5 }}
          percentage={thresholdPercent}
          voted={voted}
        />
        <Flex pb={7} justify="space-between">
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
            value={thresholdValue}
            percent={thresholdPercent}
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
      <Flex position="relative" py={7} direction="column" gap={7}>
        <Tooltip
          text={t("staking:referenda.item.supportTooltip", {
            percentage: t("percent", { value: supportTooltipPercent }),
          })}
        >
          <SReferendaProgress>
            <Box
              height={5}
              bg={getToken("text.tint.secondary")}
              borderRadius={7}
              width={`${supportPercent}%`}
            />
          </SReferendaProgress>
        </Tooltip>
        <ReferendaThresholdLine
          sx={{ top: 3 }}
          percentage={supportMarkPercentage}
          voted={voted}
        />
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
