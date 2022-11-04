import { PoolBase } from "@galacticcouncil/sdk"
import { useMutation } from "@tanstack/react-query"
import { DepositNftType } from "api/deposits"
import { useAccountStore, useStore } from "state/store"
import { useApiPromise } from "utils/api"
import { AprFarm } from "./apr"

export const useRedepositMutation = (
  pool: PoolBase,
  availableYieldFarms: AprFarm[],
  depositNfts: DepositNftType[],
) => {
  const api = useApiPromise()

  const [assetIn, assetOut] = pool.tokens
  const { createTransaction } = useStore()
  const { account } = useAccountStore()

  return useMutation(async () => {
    if (!account) throw new Error("No account found")
    if (!availableYieldFarms.length)
      throw new Error("No available farms to redeposit into")

    const txs = depositNfts
      .map((record) => {
        return availableYieldFarms.map((farm) => {
          return api.tx.xykLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            {
              assetIn: assetIn.id,
              assetOut: assetOut.id,
            },
            record.id,
          )
        })
      })
      .flat(2)

    if (txs.length > 1) {
      return await createTransaction({ tx: api.tx.utility.batchAll(txs) })
    } else {
      return await createTransaction({ tx: txs[0] })
    }
  })
}
