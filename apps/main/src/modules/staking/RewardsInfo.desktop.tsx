import { HydrationLogo } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly allocatedRewards: string
  readonly isLoading: boolean
}

export const RewardsInfoDesktop: FC<Props> = ({
  allocatedRewards,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  return (
    <Flex align="center" justify="space-between">
      <Flex align="center" gap="base">
        <Icon component={HydrationLogo} size="m" />
        <Text fs="p2" fw={500} lh={1.2} color={getToken("text.high")}>
          {t("staking:dashboard.allocated.desktop")}
        </Text>
      </Flex>
      {isLoading ? (
        <Skeleton height={21} width={120} />
      ) : (
        <Text
          font="primary"
          fw={700}
          fs="h6"
          lh={1}
          color={getToken("text.high")}
        >
          {t("currency", {
            value: allocatedRewards,
            symbol: native.symbol,
          })}
        </Text>
      )}
    </Flex>
  )
}
