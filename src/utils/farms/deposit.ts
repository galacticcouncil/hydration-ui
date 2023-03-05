import { u32 } from "@polkadot/types"
import { useMutation } from "@tanstack/react-query"
import { useFarms } from "api/farms"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"

export type FarmDepositMutationType = ReturnType<typeof useFarmDepositMutation>

export const useFarmDepositMutation = (poolId: u32, positionId: string) => {
  const { createTransaction } = useStore()
  const api = useApiPromise()
  const farms = useFarms(poolId)

  return useMutation(async () => {
    const [firstFarm, ...restFarm] = farms.data ?? []
    if (firstFarm == null) throw new Error("Missing farm")

    // TODO: add error handling and better toast descriptions
    const firstDeposit = await createTransaction({
      tx: api.tx.omnipoolLiquidityMining.depositShares(
        firstFarm.globalFarm.id,
        firstFarm.yieldFarm.id,
        positionId,
      ),
    })

    for (const record of firstDeposit.events) {
      if (api.events.omnipoolLiquidityMining.SharesDeposited.is(record.event)) {
        const depositId = record.event.data.depositId

        const txs = restFarm.map((farm) =>
          api.tx.omnipoolLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            depositId,
          ),
        )

        if (txs.length > 0) {
          await createTransaction({
            tx: txs.length > 1 ? api.tx.utility.batch(txs) : txs[0],
          })
        }
      }
    }
  })
}
