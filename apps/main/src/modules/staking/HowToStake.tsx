import {
  Box,
  Points,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Points = ReadonlyArray<readonly [title: string, description: string]>

export const HowToStake: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const points = t("staking:howTo.points", { returnObjects: true }) as Points

  return (
    <Box>
      <Text
        p={getTokenPx("containers.paddings.primary")}
        fw={500}
        fs="h7"
        lh={1}
        color={getToken("text.high")}
      >
        {t("staking:howTo.title")}
      </Text>
      <Separator />
      <Stack separated>
        {points.map(([title, description], index) => (
          <Points
            key={index}
            sx={{ px: getTokenPx("containers.paddings.primary") }}
            number={index + 1}
            title={title}
            description={description}
          />
        ))}
      </Stack>
    </Box>
  )
}
