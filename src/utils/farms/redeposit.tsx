import { useMutation } from "@tanstack/react-query"
import { Farm } from "api/farms"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { TOAST_MESSAGES } from "state/toasts"
import { Trans, useTranslation } from "react-i18next"

export type FarmRedepositMutationType = ReturnType<
  typeof useFarmRedepositMutation
>

export const useFarmRedepositMutation = (
  availableYieldFarms: Farm[] | undefined,
  depositNft: TMiningNftPosition,
  poolId: string,
  onClose?: () => void,
) => {
  const { t } = useTranslation()
  const { api, assets } = useRpcProvider()
  const { createTransaction } = useStore()

  return useMutation(async ({ shares }: { shares: string }) => {
    if (!availableYieldFarms?.length)
      throw new Error("No available farms to redeposit into")

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`farms.modal.join.toast.${msType}`}
          tOptions={{
            amount: shares,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    const meta = assets.getAsset(poolId)
    const isXYK = assets.isShareToken(meta)

    const txs = availableYieldFarms
      .map((farm) => {
        return isXYK
          ? api.tx.xykLiquidityMining.redepositShares(
              farm.globalFarm.id,
              farm.yieldFarm.id,
              { assetIn: meta.assets[0], assetOut: meta.assets[1] },
              depositNft.id,
            )
          : api.tx.omnipoolLiquidityMining.redepositShares(
              farm.globalFarm.id,
              farm.yieldFarm.id,
              depositNft.id,
            )
      })
      .flat(2)

    if (txs.length > 1) {
      await createTransaction(
        { tx: api.tx.utility.batchAll(txs) },
        { toast, onSubmitted: onClose, onBack: () => {}, onClose },
      )
    } else {
      await createTransaction({ tx: txs[0] }, { toast, onSubmitted: onClose })
    }
  })
}
