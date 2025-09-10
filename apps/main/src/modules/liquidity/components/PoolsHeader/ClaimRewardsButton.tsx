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

import { useLiquidityMiningRewards } from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useAssets } from "@/providers/assetsProvider"

export const ClaimRewardsButton = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { native } = useAssets()
  const { total } = useLiquidityMiningRewards()

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
          <Text fs={16} color={getToken("text.high")} fw={500}>
            {/* TODO */}
            {t("common:currency", { value: total, symbol: native.symbol })}
          </Text>
          <Separator />
          <Text fs="p5" color={getToken("text.high")} fw={400}>
            {t("header.claim.totalUsdValue", {
              value: t("common:currency", { value: total }),
            })}
          </Text>
          <Button>{t("header.claim.button")}</Button>
        </Flex>
      </HoverCardContent>
    </HoverCard>
  )
}
