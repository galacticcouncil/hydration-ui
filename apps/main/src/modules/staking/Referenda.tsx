import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"

import { bestNumberQuery } from "@/api/chain"
import { ReferendaTrack } from "@/api/constants"
import {
  OngoingGovReferenda,
  referendumInfoQuery,
  TAccountVote,
} from "@/api/democracy"
import { SReferenda, SReferendaBody } from "@/modules/staking/Referenda.styled"
import {
  getPerbillPercentage,
  getSupportThreshold,
  ginApprovalThreshold as getMinApprovalThreshold,
  useReferendaState,
} from "@/modules/staking/Referenda.utils"
import { ReferendaFooter } from "@/modules/staking/ReferendaFooter"
import { ReferendaHeader } from "@/modules/staking/ReferendaHeader"
import { ReferendaRewardBadge } from "@/modules/staking/ReferendaRewardBadge"
import { ReferendaStatus } from "@/modules/staking/ReferendaStatus"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

type Props = {
  readonly id: number
  readonly item: OngoingGovReferenda
  readonly track: ReferendaTrack
  readonly totalIssuance: bigint | undefined
  readonly vote: TAccountVote | undefined
  readonly isGigaStaking?: boolean
}

export const Referenda: FC<Props> = ({
  id,
  item,
  track,
  totalIssuance,
  vote,
  isGigaStaking,
}) => {
  const rpc = useRpcProvider()
  const { native } = useAssets()

  const { data: subscanInfo, isLoading } = useQuery(referendumInfoQuery(id))
  const state = useReferendaState(item)

  const sum = item.tally.ayes + item.tally.nays

  const { data: bestNumberData } = useQuery(bestNumberQuery(rpc))
  const parachainBlockNumber = bestNumberData?.parachainBlockNumber

  const thresholdPercentage = getMinApprovalThreshold(
    track,
    item,
    parachainBlockNumber,
  )

  const ayesPercentage = Big(item.tally.ayes.toString())
    .div(sum.toString())
    .times(100)
    .toNumber()

  const naysPercentage = Big(item.tally.nays.toString())
    .div(sum.toString())
    .times(100)
    .toNumber()

  const {
    threshold: _,
    maxSupportBarValue,
    barPercentage,
    markPercentage,
    support,
  } = getSupportThreshold(
    track,
    item,
    totalIssuance ?? 0n,
    parachainBlockNumber,
  )

  const voted = !!vote

  return (
    <SReferenda voted={voted}>
      <ReferendaRewardBadge id={id} trackId={item.track} />
      <ReferendaHeader
        trackId={item.track}
        trackName={track.name}
        state={state}
        id={id}
        vote={vote}
        isGigaStaking={isGigaStaking}
      />
      <SReferendaBody>
        <ReferendaStatus
          ayeValue={toDecimal(item.tally.ayes, native.decimals)}
          ayePercent={ayesPercentage}
          thresholdPercent={thresholdPercentage}
          nayValue={toDecimal(item.tally.nays, native.decimals)}
          nayPercent={naysPercentage}
          supportPercent={barPercentage}
          supportThreshold={getPerbillPercentage(_)}
          supportMaxPercentage={getPerbillPercentage(maxSupportBarValue)}
          supportTooltipPercent={getPerbillPercentage(support)}
          supportMarkPercentage={markPercentage}
          voted={voted}
          title={subscanInfo?.title ?? ""}
          isTitledLoading={isLoading}
        />
      </SReferendaBody>
      <ReferendaFooter
        id={id}
        classId={item.track}
        voted={voted}
        isGigaStaking={isGigaStaking}
      />
    </SReferenda>
  )
}
