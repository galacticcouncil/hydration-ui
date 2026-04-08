import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import {
  MultisigAccount,
  MultisigPendingTx,
  useAccountMultisigs,
} from "@galacticcouncil/web3-connect"
import { normalizeMultisigEntry } from "@galacticcouncil/web3-connect/src/utils/multisig"
import { useQueries, useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react"
import { merge } from "rxjs"
import { distinctUntilChanged, map, skip } from "rxjs/operators"

import { useRpcProvider } from "@/providers/rpcProvider"

type MultisigContextValue = {
  multisigs: MultisigAccount[]
  isMultisigsLoading: boolean
  pendingTxsByMultisig: Map<string, MultisigPendingTx[]>
  isPendingTxsLoading: boolean
  totalPendingTxCount: number
}

const MultisigContext = createContext<MultisigContextValue>({
  multisigs: [],
  isMultisigsLoading: false,
  pendingTxsByMultisig: new Map(),
  isPendingTxsLoading: false,
  totalPendingTxCount: 0,
})

export const useMultisigContext = () => useContext(MultisigContext)

export const MultisigProvider = ({ children }: { children: ReactNode }) => {
  const { data: accountMultisigs, isPending: isMultisigsLoading } =
    useAccountMultisigs()
  const { isApiLoaded, papi } = useRpcProvider()
  const queryClient = useQueryClient()

  const multisigs = useMemo(
    () => accountMultisigs?.accounts ?? [],
    [accountMultisigs?.accounts],
  )

  const multisigAddresses = useMemo(
    () =>
      multisigs
        .map((m) => safeConvertPublicKeyToSS58(m.pubKey))
        .filter(Boolean),
    [multisigs],
  )

  const pendingTxQueries = useQueries({
    queries: multisigAddresses.map((address) => ({
      enabled: isApiLoaded && !!address,
      queryKey: ["multisig", "pendingTxs", address],
      staleTime: Infinity,
      queryFn: async () => {
        const entries = await papi.query.Multisig.Multisigs.getEntries(
          address,
          { at: "best" },
        )
        return entries.map(normalizeMultisigEntry)
      },
    })),
  })

  const allSuccess = pendingTxQueries.every((q) => q.isSuccess)

  useEffect(() => {
    if (!isApiLoaded || !allSuccess || multisigAddresses.length === 0) return

    const subscription = merge(
      ...multisigAddresses.map((address) =>
        papi.query.Multisig.Multisigs.watchEntries(address, {
          at: "best",
        }).pipe(
          skip(1),
          distinctUntilChanged((_, curr) => !curr.deltas),
          map((data) => ({
            address,
            entries: data.entries,
          })),
        ),
      ),
    ).subscribe(({ address, entries }) => {
      queryClient.setQueryData(
        ["multisig", "pendingTxs", address],
        entries.map((entry) =>
          normalizeMultisigEntry({
            ...entry,
            keyArgs: entry.args,
          }),
        ),
      )
    })

    return () => subscription.unsubscribe()
  }, [isApiLoaded, allSuccess, multisigAddresses, papi, queryClient])

  const { pendingTxsByMultisig, totalPendingTxCount, isPendingTxsLoading } =
    useMemo(() => {
      const map = new Map<string, MultisigPendingTx[]>()
      let total = 0
      let loading = false

      pendingTxQueries.forEach((query, index) => {
        const address = multisigAddresses[index]
        if (query.isPending) {
          loading = true
        }
        if (query.data && address) {
          map.set(address, query.data)
          total += query.data.length
        }
      })

      return {
        pendingTxsByMultisig: map,
        totalPendingTxCount: total,
        isPendingTxsLoading: loading,
      }
    }, [pendingTxQueries, multisigAddresses])

  return (
    <MultisigContext.Provider
      value={{
        multisigs,
        isMultisigsLoading,
        pendingTxsByMultisig,
        isPendingTxsLoading,
        totalPendingTxCount,
      }}
    >
      {children}
    </MultisigContext.Provider>
  )
}
