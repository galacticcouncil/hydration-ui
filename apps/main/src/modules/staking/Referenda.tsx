import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"

import { bestNumberQuery } from "@/api/chain"
import { ReferendaTrack } from "@/api/constants"
import { OngoingGovReferenda, referendumInfoQuery } from "@/api/democracy"
import { SReferenda } from "@/modules/staking/Referenda.styled"
import {
  getPerbillPercentage,
  getSupportThreshold,
  ginApprovalThreshold as getMinApprovalThreshold,
  useReferendaState,
} from "@/modules/staking/Referenda.utils"
import { ReferendaFooter } from "@/modules/staking/ReferendaFooter"
import { ReferendaHeader } from "@/modules/staking/ReferendaHeader"
import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"
import { ReferendaStatus } from "@/modules/staking/ReferendaStatus"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly id: number
  readonly item: OngoingGovReferenda
  readonly track: ReferendaTrack | undefined
  readonly totalIssuance: bigint | undefined
  readonly voted: boolean
}

export const Referenda: FC<Props> = ({
  id,
  item,
  track,
  totalIssuance,
  voted,
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

  return (
    <SReferenda voted={voted}>
      <ReferendaHeader
        track={track?.name}
        state={state}
        number={id}
        voted={voted}
        title={subscanInfo?.title ?? ""}
        isTitledLoading={isLoading}
      />
      <ReferendaStatus
        ayeValue={scaleHuman(item.tally.ayes, native.decimals)}
        ayePercent={ayesPercentage}
        thresholdPercent={thresholdPercentage}
        nayValue={scaleHuman(item.tally.nays, native.decimals)}
        nayPercent={naysPercentage}
        supportPercent={barPercentage}
        supportThreshold={getPerbillPercentage(_)}
        supportMaxPercentage={getPerbillPercentage(maxSupportBarValue)}
        supportTooltipPercent={getPerbillPercentage(support)}
        supportMarkPercentage={markPercentage}
        voted={voted}
      />
      <ReferendaSeparator voted={voted} />
      <ReferendaFooter id={id} voted={voted} />
    </SReferenda>
  )
}
