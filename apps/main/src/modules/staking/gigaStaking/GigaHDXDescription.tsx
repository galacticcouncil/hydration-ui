import { Paper, Points, Separator, Stack } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { GigaHDXDocLink } from "@/modules/staking/gigaStaking/GigaHDXDocLink"
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

      <Separator m="xl" />

      <GigaHDXSupplyInfo />

      <GigaHDXDocLink />
    </Paper>
  )
}
