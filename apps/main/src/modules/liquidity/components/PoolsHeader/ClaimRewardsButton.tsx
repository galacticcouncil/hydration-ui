import {
  Box,
  Button,
  Flex,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useLiquidityMiningRewards } from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const ClaimRewardsButton = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const { totalUSD, claimableAssetValues } = useLiquidityMiningRewards()

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
          <Stack separated>
            {claimableAssetValues.entries().map(([assetId, value]) => {
              const asset = getAssetWithFallback(assetId)

              return (
                <Text
                  fs={16}
                  color={getToken("text.high")}
                  fw={500}
                  key={assetId}
                >
                  {t("common:currency", {
                    value: scaleHuman(value, asset.decimals),
                    symbol: asset.symbol,
                  })}
                </Text>
              )
            })}
          </Stack>
          <Separator />
          <Text fs="p5" color={getToken("text.high")} fw={400}>
            {t("header.claim.totalUsdValue", {
              value: t("common:currency", { value: totalUSD }),
            })}
          </Text>
          <Button>{t("header.claim.button")}</Button>
        </Flex>
      </HoverCardContent>
    </HoverCard>
  )
}
