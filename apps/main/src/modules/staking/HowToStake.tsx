import {
  Box,
  Flex,
  Paper,
  Points,
  Separator,
  Stack,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

// TODO integrate
const stakingPercentage = 55.5
const stakingSymbol = "HDX"
const circulatedSupply = 4_500_000_000
const projectedAPR = 2.5

type Points = ReadonlyArray<readonly [title: string, description: string]>

export const HowToStake: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const points = t("staking:howTo.points", { returnObjects: true }) as Points

  return (
    <Paper maxWidth={640}>
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
      <Flex
        px={getTokenPx("containers.paddings.primary")}
        gap={getTokenPx("scales.paddings.m")}
        align="center"
      >
        <Flex
          py={7}
          gap={getTokenPx("containers.paddings.tertiary")}
          align="center"
        >
          <Box>TODO filled half chart</Box>
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quart")}
          >
            <Text fw={500} fs={10} lh={px(12)} color={getToken("text.high")}>
              {t("staking:howTo.supplyStaked.title", { symbol: stakingSymbol })}
            </Text>
            <Flex direction="column" gap={getTokenPx("scales.paddings.xs")}>
              <Text fw={500} fs={28} lh={px(30)} color={getToken("text.high")}>
                {t("percent", { value: stakingPercentage })}
              </Text>
              <Text
                fw={400}
                fs={11}
                lh={px(15)}
                color={getToken("text.medium")}
              >
                {t("staking:howTo.supplyStaked.ofSupply", {
                  amount: t("number", { value: circulatedSupply }),
                })}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={9} align="center">
          <Box>TODO badge</Box>
          <Flex direction="column" gap={3}>
            <Flex gap={4} align="center">
              <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
                {t("staking:howTo.projectedAPR")}
              </Text>
              <Tooltip text="TODO" />
            </Flex>
            <Text fw={500} fs="h7" lh={1} color={getToken("text.high")}>
              {t("percent", { value: projectedAPR })}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Paper>
  )
}
