import { useQueries, useQuery } from "@tanstack/react-query"
import { TransferApi } from "api/wormhole/transfers"
import { TransferStatus, TransferWithOperation } from "api/wormhole/types"
import { useMemo, useRef } from "react"
import { QUERY_KEYS } from "utils/queryKeys"

export type TransferStatusMap = Map<string, TransferStatus | undefined>

export const useWormholeTransfersQuery = (
  api: TransferApi,
  address: string,
) => {
  return useQuery({
    enabled: !!address,
    refetchInterval: 10000,
    queryKey: QUERY_KEYS.womrholeTransfers(address),
    queryFn: async () => {
      const [transfers, operations] = await Promise.all([
        api.getTransfers(address),
        api.getOperations(address),
      ])

      return transfers.map<TransferWithOperation>((transfer) => {
        return {
          ...transfer,
          operation: operations.get(transfer.id),
        }
      })
    },
  })
}

export const useWormholeTransfersStatusQuery = (
  api: TransferApi,
  transfers: TransferWithOperation[],
): TransferStatusMap => {
  const completedRef = useRef(new Map<string, true>())

  const queries = useQueries({
    queries: transfers.map((transfer) => ({
      // periodically check the status of non-completed transfers
      refetchInterval: completedRef.current.get(transfer.id)
        ? undefined
        : 10000,
      queryKey: QUERY_KEYS.wormholeTransfer(transfer.id),
      keepPreviousData: true,
      queryFn: async () => {
        const { operation } = transfer
        if (!operation) {
          return TransferStatus.Unknown
        }
        if (!operation?.vaa) {
          return TransferStatus.WaitingForVaa
        }
        const isComplete = await api.isTransferComplete(
          transfer,
          operation.vaa.raw,
        )

        if (isComplete) {
          completedRef.current.set(transfer.id, true)
        }

        return isComplete ? TransferStatus.Completed : TransferStatus.VaaEmitted
      },
    })),
  })

  return useMemo(() => {
    const entries = transfers.map<[string, TransferStatus | undefined]>(
      (transfer, index) => [transfer.id, queries[index]?.data],
    )
    return new Map(entries)
  }, [queries, transfers])
}
