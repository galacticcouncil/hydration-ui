import { useMutation } from "@tanstack/react-query"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { TClaimableFarmValue, useRefetchClaimableFarmValues } from "api/farms"
import { useAssets } from "providers/assets"
import { useRefetchAccountAssets } from "api/deposits"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { ISubmittableResult } from "@polkadot/types/types"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"

export const useClaimFarmMutation = (
  claimableFarms?: TClaimableFarmValue[],
  toast?: ToastMessage,
  onClose?: () => void,
  onBack?: () => void,
) => {
  const { api } = useRpcProvider()
  const { getShareTokenByAddress } = useAssets()
  const { createTransaction } = useStore()
  const refetchAccountAssets = useRefetchAccountAssets()
  const refetchClaimableValues = useRefetchClaimableFarmValues()
  const { createBatch } = useCreateBatchTx()

  const mutation = useMutation(async () => {
    let omnipoolFarms: TClaimableFarmValue[] = []
    let xykFarms: TClaimableFarmValue[] = []

    claimableFarms?.forEach((farm) =>
      (farm.isXyk ? xykFarms : omnipoolFarms).push(farm),
    )

    const omnipool = omnipoolFarms.map((farm) =>
      farm.isActiveFarm
        ? api.tx.omnipoolLiquidityMining.claimRewards(
            farm.depositId,
            farm.yieldFarmId,
          )
        : api.tx.omnipoolLiquidityMining.withdrawShares(
            farm.depositId,
            farm.yieldFarmId,
          ),
    )

    const xyk = xykFarms.reduce<
      SubmittableExtrinsic<"promise", ISubmittableResult>[]
    >((acc, farm) => {
      const meta = getShareTokenByAddress(farm.poolId)

      if (meta) {
        acc.push(
          farm.isActiveFarm
            ? api.tx.xykLiquidityMining.claimRewards(
                farm.depositId,
                farm.yieldFarmId,
              )
            : api.tx.xykLiquidityMining.withdrawShares(
                farm.depositId,
                farm.yieldFarmId,
                {
                  assetIn: meta.assets[0].id,
                  assetOut: meta.assets[1].id,
                },
              ),
        )
      }

      return acc
    }, [])

    const allTxs = [...omnipool, ...xyk]

    if (allTxs.length > 0) {
      const options = {
        toast,
        onBack,
        onClose,
        onSuccess: () => {
          refetchClaimableValues()
          refetchAccountAssets()
        },
      }

      if (allTxs.length > 1) {
        return await createBatch(allTxs, {}, options)
      } else {
        return await createTransaction(
          {
            tx: allTxs[0],
          },
          options,
        )
      }
    }
  })

  const claim = () => mutation.mutate()

  return {
    claim,
    isLoading: mutation.isLoading,
  }
}
