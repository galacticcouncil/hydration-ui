import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  gigaRewardPoolEstimateQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
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
  const { native, getAssetWithFallback } = useAssets()
  const rpc = useRpcProvider()
  const { data: rewardPool } = useQuery(
    gigaRewardPoolEstimateQuery(rpc, id, trackId),
  )
  const { data: exchangeRate } = useGigaStakeExchangeRate()

  if (!rewardPool) {
    return null
  }

  const { amount, isEstimate } = rewardPool
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)

  const amountHuman = toDecimal(amount, native.decimals)
  const amountInGigaHdx = exchangeRate
    ? Big(amountHuman).div(exchangeRate.toString())
    : undefined

  const value = t("currency.compact", {
    value: amountInGigaHdx,
    symbol: ghdxMeta.symbol,
  })

  const label = isEstimate
    ? t("staking:referenda.rewardPool.upTo", { value })
    : t("staking:referenda.rewardPool", { value })

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="xs"
      px="m"
      py="m"
      bg={getToken("buttons.primary.medium.rest")}
    >
      <Text
        fs="p4"
        lh={1}
        fw={500}
        color={getToken("buttons.primary.medium.onButton")}
        aria-hidden
      >
        ✦
      </Text>
      <Text
        fs="p4"
        lh={1.1}
        fw={500}
        color={getToken("buttons.primary.medium.onButton")}
      >
        {label}
      </Text>
      {isEstimate ? (
        <Tooltip
          asChild={true}
          text={t("staking:referenda.rewardPool.estimateTooltip")}
          iconColor={getToken("buttons.primary.medium.onButton")}
        />
      ) : (
        <div />
      )}
    </Flex>
  )
}
