import {
  Flex,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { gigaRewardPoolEstimateQuery } from "@/api/gigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

type ReferendaRewardBadgeProps = {
  id: number
  trackId: number
}

export const ReferendaRewardBadge: FC<ReferendaRewardBadgeProps> = ({
  id,
  trackId,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { data: rewardPool } = useQuery(
    gigaRewardPoolEstimateQuery(rpc, id, trackId),
  )

  if (!rewardPool) {
    return null
  }

  const { amount, isEstimate } = rewardPool

  const amountHuman = toDecimal(amount, native.decimals)

  const value = t("currency.compact", {
    value: amountHuman,
    symbol: native.symbol,
  })

  const label = isEstimate
    ? t("staking:referenda.rewardPool.upTo", { value })
    : t("staking:referenda.rewardPool", { value })

  return (
    <Flex
      align="center"
      justify="center"
      gap="xs"
      px="m"
      py="s"
      bg={getToken("buttons.primary.medium.rest")}
    >
      <Text
        fs="p5"
        fw={500}
        color={getToken("buttons.primary.medium.onButton")}
      >
        ✦ {label}
      </Text>
      {isEstimate && (
        <Tooltip
          asChild={false}
          text={t("staking:referenda.rewardPool.estimateTooltip")}
        >
          <TooltipIcon color={getToken("buttons.primary.medium.onButton")} />
        </Tooltip>
      )}
    </Flex>
  )
}
