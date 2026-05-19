import { Box, Paper, Points, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { GigaHDXDocLink } from "@/modules/staking/gigaStaking/GigaHDXDocLink"
import { SRewardsContainer } from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { GigaHDXSupplyInfo } from "@/modules/staking/gigaStaking/supplyInfo/GigaHDXSupplyInfo"

type Points = ReadonlyArray<readonly [title: string, description: string]>

export const GigaHDXDescription: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const points = t("staking:gigaHdxDescription.points", {
    returnObjects: true,
  }) as Points

  return (
    <Paper>
      <Stack separated gap="l" px="xl" pt="xl">
        {points.map(([title, description], index) => (
          <Points
            key={index}
            size="l"
            number={index + 1}
            title={title}
            description={<Trans t={t} i18nKey={description} />}
            sx={{ p: 0 }}
          />
        ))}
      </Stack>

      {/* Onboarding description (no-position view) — chart removed per the
          new design. Just renders the governance-blurb in the same styled
          container so the visual treatment matches the position card's
          rewards block. */}
      <Box mt="xxl" mx="xl">
        <SRewardsContainer asChild>
          <Text fs="p2" lh="m" color={getToken("text.medium")}>
            {t("staking:gigaStaking.rewards.desc")}
          </Text>
        </SRewardsContainer>
      </Box>

      <GigaHDXSupplyInfo />

      <GigaHDXDocLink />
    </Paper>
  )
}
