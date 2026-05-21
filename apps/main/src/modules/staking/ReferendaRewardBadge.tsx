import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Flex,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
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

type Props = {
  id: number
  trackId: number
}

/**
 * Badge shown at the top of each referendum card displaying the estimated
 * GIGAHDX reward pool earmarked for this referendum.
 *
 * Pool amounts are stored / emitted in HDX (the runtime moves HDX through
 * all reward pots; `claim_rewards` converts to GIGAHDX on claim). Convert
 * to GIGAHDX here so the unit matches what users see elsewhere on the
 * staking page. Returns `null` until we have both the pool data and the
 * exchange rate.
 *
 * When `isEstimate` is true the pool hasn't been allocated yet — the number
 * is `track_pct × accumulator_pot.free` and can move before allocation
 * actually happens (other refs may allocate first or the pot may be
 * replenished).
 */
export const ReferendaRewardBadge: FC<Props> = ({ id, trackId }) => {
  const { t } = useTranslation(["common", "staking"])
  const { native, getAssetWithFallback } = useAssets()
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const rpc = useRpcProvider()
  const { data: rewardPool } = useQuery(
    gigaRewardPoolEstimateQuery(rpc, id, trackId),
  )
  const { data: exchangeRate } = useGigaStakeExchangeRate()

  if (!rewardPool || rewardPool.amount <= 0n) return null
  if (!exchangeRate || exchangeRate.lte(0)) return null

  const hdxHuman = Big(rewardPool.amount.toString()).div(
    `1e${native.decimals}`,
  )
  const ghdxHuman = hdxHuman.div(exchangeRate.toString())
  const amount = BigInt(
    ghdxHuman
      .times(`1e${ghdxMeta.decimals}`)
      .round(0, Big.roundDown)
      .toString(),
  )

  const { isEstimate } = rewardPool
  const human = toDecimal(amount, ghdxMeta.decimals)
  const value = t("currency.compact", { value: human, symbol: ghdxMeta.symbol })
  // Allocated pools are exact; unallocated estimates are upper bounds —
  // wording reflects the difference. "Up to" only applies to estimates.
  const label = isEstimate
    ? t("staking:referenda.rewardPool.upTo", { value })
    : t("staking:referenda.rewardPool", { value })

  return (
    <Flex
      align="center"
      gap="xs"
      px="m"
      py="s"
      sx={{
        background: getToken("surfaces.containers.high.accent"),
        borderTopLeftRadius: "var(--rounded-medium)",
        borderTopRightRadius: "var(--rounded-medium)",
      }}
    >
      <Text fs="p6" lh={1} color={getToken("text.high")}>
        ✦
      </Text>
      <Text fs="p5" fw={500} lh={1.2} color={getToken("text.high")}>
        {label}
      </Text>
      {isEstimate && (
        <Tooltip
          asChild={false}
          text={t("staking:referenda.rewardPool.estimateTooltip")}
        >
          <TooltipIcon color={getToken("text.medium")} />
        </Tooltip>
      )}
    </Flex>
  )
}
