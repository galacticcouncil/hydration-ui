import { useMutation } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { useStore } from "state/store"

export const useRemoveAllPositions = (
  positions: HydraPositionsTableData[],
  onClose?: () => void,
  onBack?: () => void,
) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  return useMutation(async () => {
    const txs = positions.map((position) =>
      api.tx.omnipool.removeLiquidity(position.id, position.value.toFixed(0)),
    )

    return await createTransaction(
      { tx: api.tx.utility.batch(txs) },
      //   { {}, onBack, onClose },
    )
  })
}
