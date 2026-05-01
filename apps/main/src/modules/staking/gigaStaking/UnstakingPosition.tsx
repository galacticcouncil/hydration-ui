import {
  Amount,
  Button,
  Flex,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { durationInDaysAndHoursFromNow } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { bestNumberQuery } from "@/api/chain"
import { AssetLogo } from "@/components/AssetLogo"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SUnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type UnstakingPositionProps = {
  amount: bigint
  unlock_at: number
}

export const UnstakingPosition: FC<UnstakingPositionProps> = ({
  amount,
  unlock_at,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { data: best } = useQuery(bestNumberQuery(rpc))

  // TODO: Add claiming logic

  const amountShifted = scaleHuman(amount, native.decimals)
  const [displayValue] = useDisplayAssetPrice(native.id, amountShifted)

  const { parachainBlockNumber: currentBlock, timestamp: nowMs } = best ?? {}

  const unlockStats = useMemo(() => {
    if (!currentBlock || !nowMs) {
      return null
    }

    const blocksRemaining = Math.max(0, unlock_at - Number(currentBlock))

    if (blocksRemaining === 0) {
      return { claimableNow: true, label: "" }
    }

    const msRemaining = blocksRemaining * rpc.slotDurationMs
    const endDate = durationInDaysAndHoursFromNow(msRemaining)

    return {
      claimableNow: false,
      label: endDate ? `~${endDate}` : "--",
    }
  }, [currentBlock, nowMs, rpc.slotDurationMs, unlock_at])

  return (
    <SUnstakingPosition align="center" justify="space-between">
      <Flex align="center" gap="s">
        <AssetLogo id={native.id} />

        <Amount
          value={t("currency", { value: amountShifted, symbol: native.symbol })}
          displayValue={displayValue}
        />
      </Flex>

      {unlockStats === null ? (
        <ValueStats
          label={t("staking:gigaStaking.unstakingPositions.claimableIn")}
          value="—"
          wrap
          size="small"
          sx={{
            alignItems: "flex-end",
          }}
        />
      ) : unlockStats.claimableNow ? (
        <Button variant="secondary" size="small">
          {t("staking:gigaStaking.unstakingPositions.claimCta")}
        </Button>
      ) : (
        <ValueStats
          label={t("staking:gigaStaking.unstakingPositions.claimableIn")}
          value={unlockStats.label}
          wrap
          size="small"
          sx={{
            alignItems: "flex-end",
          }}
        />
      )}
    </SUnstakingPosition>
  )
}
