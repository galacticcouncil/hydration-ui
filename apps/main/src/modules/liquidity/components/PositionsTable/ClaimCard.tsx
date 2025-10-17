import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useRelayChainBlockNumber } from "@/api/chain"
import { useFarmRewards } from "@/api/farms"
import {
  useClaimFarmRewardsMutation,
  useSummarizeClaimableValues,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { useAssets } from "@/providers/assetsProvider"
import { DepositPosition } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

import { SClaimCard } from "./ClaimCard.styled"

export const ClaimCard = ({
  className,
  positions,
}: {
  className?: string
  positions: DepositPosition[]
}) => {
  const { getAssetWithFallback } = useAssets()
  const { t } = useTranslation(["liquidity", "common"])
  const relayChainBlockNumber = useRelayChainBlockNumber()

  const {
    data: rewards,
    isLoading,
    refetch,
  } = useFarmRewards(positions, relayChainBlockNumber)

  const claimableValues = useSummarizeClaimableValues(
    rewards?.map((reward) => reward.rewards),
    isLoading,
  )

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

  const { mutate: claimRewards } = useClaimFarmRewardsMutation({
    claimableDeposits: rewards ?? [],
    onSuccess: () => {
      refetch()
    },
  })

  if (!rewards?.length) return null

  return (
    <SClaimCard sx={{ maxWidth: ["100%", "100%", 454] }} className={className}>
      <Flex direction="column" gap={1}>
        <Text fs="p6" fw={400} color={getToken("text.high")} sx={{ mb: 4 }}>
          {t("liquidity.claimCard.totalClaimableValue")}
        </Text>
        <Text
          fs="h7"
          fw={700}
          font="primary"
          color={getToken("accents.success.emphasis")}
          lh={1}
        >
          {t("common:currency", {
            value: claimableValues.totalUSD,
          })}
        </Text>
        <Text fs="p6" fw={400} color={getToken("text.medium")} lh={1}>
          {rewardsString}
        </Text>
      </Flex>
      <Button
        variant="success"
        disabled={isLoading || claimableValues.totalUSD === "0"}
        onClick={() => claimRewards({ displayValue: rewardsString })}
      >
        {t("liquidity.claimCard.claim")}
      </Button>
    </SClaimCard>
  )
}
