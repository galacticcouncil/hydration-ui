import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { Trans, useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"

export const useRemoveAllPositions = (
  positions: HydraPositionsTableData[],
  poolId: string,
) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api, assets } = useRpcProvider()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  const onSuccess = () => {
    queryClient.refetchQueries(
      QUERY_KEYS.accountOmnipoolPositions(account?.address),
    )

    if (assets.getAsset(poolId).isStableSwap) {
      queryClient.refetchQueries(
        QUERY_KEYS.tokenBalance(poolId, account?.address),
      )
    }
  }

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans t={t} i18nKey={`liquidity.remove.modal.all.toast.${msType}`}>
        <span />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  return useMutation(async () => {
    const txs = positions.map((position) =>
      api.tx.omnipool.removeLiquidity(position.id, position.shares.toFixed(0)),
    )

    if (txs.length > 1) {
      return await createTransaction(
        { tx: api.tx.utility.batch(txs) },
        { toast, onSuccess },
      )
    } else {
      return await createTransaction({ tx: txs[0] }, { toast, onSuccess })
    }
  })
}
