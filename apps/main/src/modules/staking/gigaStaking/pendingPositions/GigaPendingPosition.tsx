import { Button } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { millisecondsInDay, millisecondsInMinute } from "date-fns/constants"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { bestNumberQuery, useBlockTime } from "@/api/chain"
import {
  getCooldownExpiresAt,
  gigaStakeConstantsQuery,
  gigaTwoSecBlocksSinceQuery,
} from "@/api/gigaStake"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { PendingPosition } from "@/components/PendingPosition"
import { CancelConfirmationModal } from "@/modules/staking/gigaStaking/pendingPositions/CancelConfirmationModal"
import {
  useCancelPendingPosition,
  useClaimPendingPosition,
} from "@/modules/staking/gigaStaking/pendingPositions/PendingPosition.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type GigaPendingPositionProps = {
  amount: bigint
  voteAtBlock: number
}

export const GigaPendingPosition: FC<GigaPendingPositionProps> = ({
  amount,
  voteAtBlock,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const [isCancelConfirmationModalOpen, setIsCancelConfirmationModalOpen] =
    useState(false)
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { data: blockTimeMs } = useBlockTime()
  const { data: best } = useQuery({
    ...bestNumberQuery(rpc),
    queryKey: ["gigaStake", "pendingPositionBestNumber", rpc.endpoint],
    staleTime: millisecondsInMinute,
    refetchInterval: millisecondsInMinute,
  })
  const { data: gigaStakeConstants } = useQuery(gigaStakeConstantsQuery(rpc))
  const { data: twoSecBlocksSince = null } = useQuery(
    gigaTwoSecBlocksSinceQuery(rpc),
  )
  const cancelPendingPosition = useCancelPendingPosition()
  const claimPendingPosition = useClaimPendingPosition()
  const cooldownPeriod = gigaStakeConstants?.cooldownPeriod

  const amountShifted = scaleHuman(amount, native.decimals)
  const [displayValue, { isLoading: isDisplayValueLoading }] =
    useDisplayAssetPrice(native.id, amountShifted)

  const { parachainBlockNumber: currentBlock } = best ?? {}

  const unlockStats = useMemo(() => {
    if (!currentBlock || !cooldownPeriod) {
      return null
    }

    const claimableAtBlock = getCooldownExpiresAt(
      voteAtBlock,
      cooldownPeriod,
      twoSecBlocksSince,
    )

    const blocksRemaining = Math.max(0, claimableAtBlock - Number(currentBlock))

    if (blocksRemaining === 0) {
      return { claimableNow: true, label: "" }
    }

    const msRemaining = blocksRemaining * (blockTimeMs ?? 0)
    const unlockDate = new Date(Date.now() + msRemaining)

    return {
      claimableNow: false,
      label:
        msRemaining > 0
          ? `~${t("interval", { value: msRemaining, largest: 1, ...(msRemaining > millisecondsInDay && { unit: "d" }) })}`
          : "-",
      tooltip: t("date.long", { value: unlockDate }),
    }
  }, [
    currentBlock,
    blockTimeMs,
    t,
    cooldownPeriod,
    voteAtBlock,
    twoSecBlocksSince,
  ])

  return (
    <>
      <PendingPosition
        assetId={native.id}
        value={t("currency", {
          value: amountShifted,
          symbol: native.symbol,
        })}
        displayValue={displayValue}
        isLoading={isDisplayValueLoading}
        stats={
          unlockStats?.claimableNow
            ? undefined
            : [
                {
                  label: t(
                    "staking:gigaStaking.unstakingPositions.claimableIn",
                  ),
                  value: unlockStats?.label ?? "—",
                  tooltip: unlockStats?.tooltip,
                },
              ]
        }
        status={
          unlockStats?.claimableNow && (
            <Button
              variant="secondary"
              size="small"
              onClick={() =>
                claimPendingPosition.mutate({ voteAtBlock, amount })
              }
              width="fit-content"
              disabled={claimPendingPosition.isPending}
            >
              {t("staking:gigaStaking.unstakingPositions.claimCta")}
            </Button>
          )
        }
        action={
          <Button
            variant="tertiary"
            size="small"
            onClick={() => setIsCancelConfirmationModalOpen(true)}
            disabled={cancelPendingPosition.isPending}
          >
            {t("cancel")}
          </Button>
        }
      />
      <CancelConfirmationModal
        open={isCancelConfirmationModalOpen}
        onClose={() => setIsCancelConfirmationModalOpen(false)}
        onConfirm={() => cancelPendingPosition.mutate({ voteAtBlock, amount })}
      />
    </>
  )
}
