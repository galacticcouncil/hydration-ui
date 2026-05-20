import {
  Flex,
  LinkTextButton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { STAKING_DOCS_LINK } from "@/config/links"

export const ProjectedAPRTooltipContent = () => {
  const { t } = useTranslation("staking")
  const lines = t("dashboard.projectedAPR.tooltip", {
    returnObjects: true,
  }) as Array<string>

  return (
    <Flex direction="column" gap="m">
      <Text fw={600} fs="p6" lh={1.4} color={getToken("text.high")}>
        {lines[0]}
      </Text>

      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Text as="span" fw={600}>
          Base APR
        </Text>{" "}
        is shared automatically by GIGAHDX holders.
      </Text>

      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Text as="span" fw={600}>
          Voting APR
        </Text>{" "}
        applies only when you vote and assumes Locked 6x conviction.
      </Text>

      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
        {lines[3]}
      </Text>

      <LinkTextButton href={STAKING_DOCS_LINK} direction="internal">
        {t("dashboard.projectedAPR.tooltip.docs")}
      </LinkTextButton>
    </Flex>
  )
}

export const ProjectedAPRTooltip = () => (
  <Tooltip text={<ProjectedAPRTooltipContent />} />
)
