import {
  Box,
  Button,
  Flex,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const ClaimRewardsButton = () => {
  const { t } = useTranslation("liquidity")

  return (
    <HoverCard>
      <HoverCardTrigger sx={{ margin: "auto 0" }}>
        <Button asChild>
          <Box>{t("header.claim.title")}</Box>
        </Button>
      </HoverCardTrigger>

      <HoverCardContent
        borderRadius="xl"
        asChild
        p={getTokenPx("containers.paddings.primary")}
      >
        <Flex direction="column" gap={getTokenPx("scales.paddings.m")}>
          <Text fs="p5" color={getToken("text.medium")} fw={400}>
            {t("header.claim.claimableFromAllPositions")}
          </Text>
          {/* TODO: add claimable amount */}
          <Text fs={16} color={getToken("text.high")} fw={500}>
            130 100 HDX
          </Text>

          <Separator />
          {/* TODO: add total amount */}
          <Text fs="p5" color={getToken("text.high")} fw={400}>
            Total of ≈ $2855.24
          </Text>

          <Button>{t("header.claim.button")}</Button>
        </Flex>
      </HoverCardContent>
    </HoverCard>
  )
}
