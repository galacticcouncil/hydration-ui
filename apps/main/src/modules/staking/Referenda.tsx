import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"

import { bestNumberQuery } from "@/api/chain"
import { ReferendaTrack } from "@/api/constants"
import { OngoingGovReferenda, referendumInfoQuery } from "@/api/democracy"
import {
  gigaRewardPoolEstimateQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { SReferenda } from "@/modules/staking/Referenda.styled"
import {
  getPerbillPercentage,
  getSupportThreshold,
  ginApprovalThreshold as getMinApprovalThreshold,
  useReferendaState,
} from "@/modules/staking/Referenda.utils"
import { ReferendaFooter } from "@/modules/staking/ReferendaFooter"
import { ReferendaHeader } from "@/modules/staking/ReferendaHeader"
import { ReferendaRewardBadge } from "@/modules/staking/ReferendaRewardBadge"
import { ReferendaSeparator } from "@/modules/staking/ReferendaSeparator"
import { ReferendaStatus } from "@/modules/staking/ReferendaStatus"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

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
  const { native, getAssetWithFallback } = useAssets()
  const ghdxMeta = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const { data: exchangeRate } = useGigaStakeExchangeRate()

  const { data: subscanInfo, isLoading } = useQuery(referendumInfoQuery(id))
  const { data: rewardPool } = useQuery(
    gigaRewardPoolEstimateQuery(rpc, id, item.track),
  )
  // Pool amounts are stored / emitted in HDX (the runtime moves HDX through
  // all reward pots; `claim_rewards` converts to GIGAHDX on claim). Convert
  // to GIGAHDX for display so the unit matches what users see elsewhere on
  // the staking page. Fallback to HDX-equivalent if rate not yet loaded.
  const rewardPoolGigaHdx = (() => {
    if (!rewardPool || !exchangeRate || exchangeRate.lte(0)) return undefined
    const hdxHuman = Big(rewardPool.amount.toString()).div(
      `1e${native.decimals}`,
    )
    const ghdxHuman = hdxHuman.div(exchangeRate.toString())
    return BigInt(
      ghdxHuman
        .times(`1e${ghdxMeta.decimals}`)
        .round(0, Big.roundDown)
        .toString(),
    )
  })()
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
      {rewardPool &&
        rewardPool.amount > 0n &&
        rewardPoolGigaHdx !== undefined && (
          <ReferendaRewardBadge
            amount={rewardPoolGigaHdx}
            isEstimate={rewardPool.isEstimate}
            decimals={ghdxMeta.decimals}
            symbol={ghdxMeta.symbol}
          />
        )}
      <ReferendaHeader
        track={track?.name}
        state={state}
        number={id}
        voted={voted}
        title={subscanInfo?.title ?? ""}
        isTitledLoading={isLoading}
      />
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
      />
      <ReferendaSeparator voted={voted} />
      <ReferendaFooter id={id} classId={item.track} voted={voted} />
    </SReferenda>
  )
}
