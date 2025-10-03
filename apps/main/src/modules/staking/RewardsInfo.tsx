import { HydrationLogo } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useAssets } from "@/providers/assetsProvider"

export const RewardsInfo: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  const { data: stakingRewards, isLoading } = useStakingRewards()

  return (
    <Flex align="center" justify="space-between">
      <Flex align="center" gap={8}>
        <Icon component={HydrationLogo} size={18} />
        <Text fs={15} fw={500} lh={1.2} color={getToken("text.high")}>
          {t("staking:dashboard.allocated")}
        </Text>
      </Flex>
      {isLoading ? (
        <Skeleton height={21} width={120} />
      ) : (
        <Text fw={700} color={getToken("text.high")}>
          {t("currency", {
            value: stakingRewards || "0",
            symbol: native.symbol,
          })}
        </Text>
      )}
    </Flex>
  )
}
