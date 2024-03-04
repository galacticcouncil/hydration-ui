import { useMutation } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { Trans, useTranslation } from "react-i18next"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { ToastMessage, useStore } from "state/store"
import { TOAST_MESSAGES } from "state/toasts"

export const useRemoveAllPositions = (positions: HydraPositionsTableData[]) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

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
        { toast },
      )
    } else {
      return await createTransaction({ tx: txs[0] }, { toast })
    }
  })
}
