import { useTranslation } from "react-i18next"
import { PoolBase } from "@galacticcouncil/sdk"
import { useDeposits } from "api/deposits"
import { useStore } from "state/store"
import { Button } from "components/Button/Button"
import { useMutation } from "@tanstack/react-query"
import { useApiPromise } from "utils/network"

export function PoolJoinFarmWithdraw(props: { pool: PoolBase }) {
  const api = useApiPromise()
  const deposits = useDeposits(props.pool.address)
  const { createTransaction } = useStore()
  const { t } = useTranslation()
  const [assetIn, assetOut] = props.pool.tokens

  const mutate = useMutation(async () => {
    const txs =
      deposits.data
        ?.map((record) => {
          return record.deposit.yieldFarmEntries.map((entry) => {
            return api.tx.liquidityMining.withdrawShares(
              record.id,
              entry.yieldFarmId,
              { assetIn: assetIn.id, assetOut: assetOut.id },
            )
          })
        })
        .flat(2) ?? []

    if (txs.length > 0) {
      return await createTransaction({
        tx: api.tx.utility.batchAll(txs),
      })
    }
  })

  return (
    <Button
      variant="secondary"
      disabled={!deposits.data?.length}
      isLoading={mutate.isLoading}
      onClick={() => mutate.mutate()}
    >
      {t("pools.allFarms.modal.withdraw.submit")}
    </Button>
  )
}
