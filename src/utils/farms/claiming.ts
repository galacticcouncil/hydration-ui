import { useMutation } from "@tanstack/react-query"
import { TDeposit, useAccountAssets } from "api/deposits"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { useAssets } from "providers/assets"

export const useClaimFarmMutation = (
  poolId?: string,
  depositNft?: TDeposit,
  toast?: ToastMessage,
  onClose?: () => void,
  onBack?: () => void,
) => {
  const { api } = useRpcProvider()
  const { getAsset, isShareToken } = useAssets()
  const { createTransaction } = useStore()
  const meta = poolId ? getAsset(poolId) : undefined
  const isXYK = isShareToken(meta)

  const { omnipoolDeposits = [], xykDeposits = [] } =
    useAccountAssets().data ?? {}

  let omnipoolDeposits_: TDeposit[] = []
  let xykDeposits_: TDeposit[] = []

  if (depositNft) {
    if (isXYK) {
      xykDeposits_ = [depositNft]
    } else {
      omnipoolDeposits_ = [depositNft]
    }
  } else {
    if (poolId) {
      if (isXYK) {
        xykDeposits_ = xykDeposits.filter(
          (deposit) => deposit.data.ammPoolId.toString() === meta.poolAddress,
        )
      } else {
        omnipoolDeposits_ = omnipoolDeposits.filter(
          (deposit) => deposit.data.ammPoolId.toString() === poolId,
        )
      }
    } else {
      xykDeposits_ = xykDeposits
      omnipoolDeposits_ = omnipoolDeposits
    }
  }

  return useMutation(async () => {
    const omnipoolTxs =
      omnipoolDeposits_
        .map((deposit) =>
          deposit.data.yieldFarmEntries.map((entry) =>
            api.tx.omnipoolLiquidityMining.claimRewards(
              deposit.id,
              entry.yieldFarmId,
            ),
          ),
        )
        .flat(2) ?? []

    const xykTxs =
      xykDeposits_
        .map((deposit) =>
          deposit.data.yieldFarmEntries.map((entry) =>
            api.tx.xykLiquidityMining.claimRewards(
              deposit.id,
              entry.yieldFarmId,
            ),
          ),
        )
        .flat(2) ?? []

    const allTxs = [...omnipoolTxs, ...xykTxs]

    if (allTxs.length > 0) {
      return await createTransaction(
        {
          tx: allTxs.length > 1 ? api.tx.utility.forceBatch(allTxs) : allTxs[0],
        },
        { toast, onBack, onClose },
      )
    }
  })
}
