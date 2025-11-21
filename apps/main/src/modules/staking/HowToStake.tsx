import {
  Box,
  Points,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

type Points = ReadonlyArray<readonly [title: string, description: string]>

export const HowToStake: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const points = t("staking:howTo.points", { returnObjects: true }) as Points

  return (
    <Box>
      <Text
        p={getTokenPx("containers.paddings.primary")}
        font="primary"
        fw={500}
        fs={17.5}
        lh={px(21)}
        color={getToken("text.high")}
      >
        {t("staking:howTo.title")}
      </Text>
      <Separator />
      <Stack separated>
        {points.map(([title, description], index) => (
          <Points
            key={index}
            size="l"
            sx={{ px: getTokenPx("containers.paddings.primary") }}
            number={index + 1}
            title={title}
            description={
              <Trans
                t={t}
                i18nKey={description}
                components={[<Link key="trade-link" to="/trade/swap" />]}
              />
            }
          />
        ))}
      </Stack>
    </Box>
  )
}
