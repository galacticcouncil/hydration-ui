import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { evmAccountBindingQuery } from "@/api/evm"
import { gigaTotalLockedQuery } from "@/api/gigaStake"
import { stakingPositionsQuery } from "@/api/staking"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const useGigaStakingMigration = () => {
  const { t } = useTranslation("staking")
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (stakeAmount: string) => {
      if (!account) throw new Error("No account connected")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const isBound = await rpc.queryClient.ensureQueryData(
        evmAccountBindingQuery(rpc, account.address),
      )

      const migrateTx = unsafeApi.tx.GigaHdx.migrate()

      const stakedAmountHuman = toDecimal(stakeAmount, native.decimals)

      const toasts = {
        submitted: t("gigaStaking.migrate.toasts.submitted", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
        success: t("gigaStaking.migrate.toasts.success", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
      }

      return createTransaction({
        tx: !isBound
          ? rpc.papi.tx.Utility.batch_all({
              calls: [
                rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
                migrateTx.decodedCall,
              ],
            })
          : migrateTx,
        invalidateQueries: [
          userGigaBorrowSummaryQueryKey(account.address),
          gigaTotalLockedQuery(rpc).queryKey,
          stakingPositionsQuery(rpc, account.address).queryKey,
        ],
        toasts,
      })
    },
  })
}
