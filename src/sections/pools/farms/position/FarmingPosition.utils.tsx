import { u32 } from "@polkadot/types"
import { useOmniPositionIds, useUserDeposits } from "api/deposits"
import { useOmnipoolPositions } from "api/omnipool"
import { useMemo } from "react"
import { useXYKDepositValues } from "sections/pools/PoolsPage.utils"
import { TLPData, useLiquidityPositionData } from "utils/omnipool"
import { BN_0 } from "utils/constants"

export const useOmnipoolDepositValues = (depositIds: string[]) => {
  const { getData } = useLiquidityPositionData()

  const positionIds = useOmniPositionIds(depositIds ?? [])

  const positions = useOmnipoolPositions(
    positionIds.map((pos) => pos.data?.value),
  )

  const queries = positions
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    const rows = positions.reduce<
      Record<
        string,
        Array<
          TLPData & {
            depositId?: string
          }
        >
      >
    >((memo, position) => {
      if (position.data) {
        const positionData = getData(position.data)

        if (positionData) {
          const index = position.data.assetId

          memo[index] = [
            ...(memo[index] ?? []),
            {
              depositId: positionIds
                .find(
                  (pos) =>
                    pos.data?.value.toString() === position.data?.id.toString(),
                )
                ?.data?.depositionId.toString(),
              ...positionData,
            },
          ]
        }
      }

      return memo
    }, {})

    return rows
  }, [getData, positionIds, positions])

  return { data, isLoading }
}

export const useDepositShare = (poolId: u32 | string, depositNftId: string) => {
  const deposits = useAllOmnipoolDeposits()

  const deposit = deposits.data[poolId.toString()]?.find(
    (deposit) => deposit.depositId === depositNftId,
  )

  return { data: deposit, isLoading: deposits.isLoading }
}

export const useAllOmnipoolDeposits = (address?: string) => {
  const { omnipoolDeposits } = useUserDeposits(address)

  return useOmnipoolDepositValues(omnipoolDeposits.map((deposit) => deposit.id))
}

export const useAllXYKDeposits = (address?: string) => {
  const { xykDeposits } = useUserDeposits(address)

  return useXYKDepositValues(xykDeposits)
}

export const useAllFarmDeposits = (address?: string) => {
  const omnipoolDepositValues = useAllOmnipoolDeposits(address)
  const xykDepositValues = useAllXYKDeposits(address)

  const isLoading =
    omnipoolDepositValues.isLoading || xykDepositValues.isLoading

  return {
    isLoading,
    omnipool: omnipoolDepositValues.data,
    xyk: xykDepositValues.data,
  }
}

export const useFarmDepositsTotal = (address?: string) => {
  const { isLoading, omnipool, xyk } = useAllFarmDeposits(address)

  const total = useMemo(() => {
    let poolsTotal = BN_0

    for (const poolId in omnipool) {
      const poolTotal = omnipool[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      poolsTotal = poolsTotal.plus(poolTotal)
    }

    const xykTotal = xyk.reduce((memo, deposit) => {
      if (deposit.amountUSD) return memo.plus(deposit.amountUSD)
      return memo
    }, BN_0)

    return poolsTotal.plus(xykTotal)
  }, [omnipool, xyk])

  return { isLoading: isLoading, value: total }
}
