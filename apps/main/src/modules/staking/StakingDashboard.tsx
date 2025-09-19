import { Box, Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HowToStake } from "@/modules/staking/HowToStake"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { Stake } from "@/modules/staking/Stake"

export const StakingDashboard: FC = () => {
  const { t } = useTranslation("staking")

  return (
    <Box>
      <SectionHeader>{t("dashboard.title")}</SectionHeader>
      <Flex gap={30} pb={getTokenPx("scales.paddings.xxl")}>
        <HowToStake />
        <Stake />
      </Flex>
      <SectionHeader>{t("referenda.title")}</SectionHeader>
      <OngoingReferenda />
    </Box>
  )
}
