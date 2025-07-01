import { SubmittableExtrinsic } from "@polkadot/api/types"
import { ISubmittableResult } from "@polkadot/types/types"
import { TDeposit } from "api/deposits"
import { useRpcProvider } from "providers/rpcProvider"
import { TOmniDepositData } from "sections/pools/farms/position/FarmingPosition.utils"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"

export type TRemoveFarmingPosition = TOmniDepositData & TDeposit

export const useRemoveAllFarmingPositions = (
  deposits?: TRemoveFarmingPosition[],
) => {
  const { api } = useRpcProvider()

  if (!deposits) return undefined

  const { liquidityTxs, exitingFarmsTxs, totalShares } = deposits.reduce<{
    liquidityTxs: SubmittableExtrinsic<"promise", ISubmittableResult>[]
    exitingFarmsTxs: SubmittableExtrinsic<"promise", ISubmittableResult>[]
    totalShares: BN
  }>(
    (acc, deposit) => {
      const exitingFarmsTxs = [...acc.exitingFarmsTxs]

      deposit.data.yieldFarmEntries.forEach((entry) => {
        const tx = api.tx.omnipoolLiquidityMining.withdrawShares(
          deposit.depositId,
          entry.yieldFarmId,
        )

        exitingFarmsTxs.push(tx)
      })

      const liquidityTxs = [
        ...acc.liquidityTxs,
        api.tx.omnipool.removeLiquidity(deposit.id, deposit.shares),
      ]

      return {
        liquidityTxs,
        exitingFarmsTxs,
        totalShares: acc.totalShares.plus(deposit.shares),
      }
    },
    { liquidityTxs: [], exitingFarmsTxs: [], totalShares: BN_0 },
  )

  const txs = [...exitingFarmsTxs, ...liquidityTxs]

  return { totalShares: totalShares.toString() }
}
