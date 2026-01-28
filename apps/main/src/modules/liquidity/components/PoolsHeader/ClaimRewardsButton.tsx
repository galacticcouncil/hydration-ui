import {
  Box,
  Button,
  Flex,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  useClaimFarmRewardsMutation,
  useLiquidityMiningRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const ClaimRewardsButton = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const [open, setOpen] = useState(false)

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger sx={{ margin: "auto 0" }}>
        <Button asChild>
          <Box>{t("header.claim.title")}</Box>
        </Button>
      </HoverCardTrigger>

      {open && <RewardsHoverCard />}
    </HoverCard>
  )
}

const RewardsHoverCard = () => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const miningRewards = useLiquidityMiningRewards()

  const { claimableValues, rewards, refetch } = miningRewards
  const { totalUSD, claimableAssetValues, isLoading } = claimableValues

  const { mutate: claimRewards } = useClaimFarmRewardsMutation({
    claimableDeposits: rewards ?? [],
    onSuccess: () => refetch(),
  })

  const rewardsString = Array.from(
    claimableValues.claimableAssetValues.entries(),
  )
    .map(([assetId, reward]) => {
      const meta = getAssetWithFallback(assetId)

      return t("common:currency", {
        value: scaleHuman(reward, meta.decimals),
        symbol: meta.symbol,
      })
    })
    .join(" + ")

  return (
    <HoverCardContent borderRadius="xl" asChild p="xxl">
      <Flex direction="column" gap="m">
        <Text fs="p5" color={getToken("text.medium")} fw={400}>
          {t("header.claim.claimableFromAllPositions")}
        </Text>
        {isLoading ? (
          <Skeleton width={100} />
        ) : (
          <Stack separated>
            {claimableAssetValues.entries().map(([assetId, value]) => {
              const asset = getAssetWithFallback(assetId)

              return (
                <Text
                  fs="p2"
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
        )}
        <Separator />
        <Text fs="p5" color={getToken("text.high")} fw={400}>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            t("header.claim.totalUsdValue", {
              value: t("common:currency", { value: totalUSD }),
            })
          )}
        </Text>
        <Button
          onClick={() => claimRewards({ displayValue: rewardsString })}
          disabled={isLoading || totalUSD === "0"}
        >
          {t("header.claim.button")}
        </Button>
      </Flex>
    </HoverCardContent>
  )
}
