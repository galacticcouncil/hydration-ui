import {
  Flex,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { toDecimal } from "@/utils/formatting"

type Props = {
  amount: bigint
  isEstimate: boolean
  decimals: number
  symbol: string
}

/**
 * Badge shown at the top of each referendum card displaying the estimated
 * GIGAHDX reward pool earmarked for this referendum.
 *
 * When `isEstimate` is true the pool hasn't been allocated yet — the number is
 * `track_pct × accumulator_pot.free` and can move before allocation actually
 * happens (other refs may allocate first or the pot may be replenished).
 */
export const ReferendaRewardBadge: FC<Props> = ({
  amount,
  isEstimate,
  decimals,
  symbol,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const human = toDecimal(amount, decimals)

  const value = t("currency.compact", { value: human, symbol })
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
