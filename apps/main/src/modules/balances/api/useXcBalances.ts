import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { xcBalanceStore } from "@/modules/balances/api/xcBalanceStore"
import { XcBalance } from "@/modules/balances/api/xcBalanceTypes"

export const createXcBalancesQueryKey = (address: string) => [
  "xcbalances",
  address,
]

export const useXcBalances = (address: string) => {
  const xcbalances = useQuery<XcBalance[]>({
    queryKey: createXcBalancesQueryKey(address),
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialDataUpdatedAt: 0,
    initialData: [],
    queryFn: () => [],
  })

  const isLoading = xcbalances.dataUpdatedAt === 0

  return {
    isLoading,
    data: xcbalances.data,
  }
}

export const useXcBalancesSubscription = (address: string) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    const queryKey = createXcBalancesQueryKey(address)
    const cachedData = queryClient.getQueryData<XcBalance[]>(queryKey)

    setIsLoading(!cachedData)
    setIsError(false)

    xcBalanceStore.subscribe(address, {
      onLoad(balances) {
        queryClient.setQueryData(queryKey, balances)
        setIsLoading(false)
        setIsError(false)
      },
      onChange(balances) {
        queryClient.setQueryData(queryKey, balances)
      },
      onError() {
        setIsError(true)
        setIsLoading(false)
      },
    })

    return () => {
      xcBalanceStore.unsubscribe()
    }
  }, [address, queryClient])

  return {
    isLoading,
    isError,
  }
}
