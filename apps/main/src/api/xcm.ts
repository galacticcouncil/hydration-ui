import {
  formatSourceChainAddress,
  parseDryRunError,
} from "@galacticcouncil/utils"
import { createXcContext } from "@galacticcouncil/xc"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AnyChain, AssetAmount } from "@galacticcouncil/xc-core"
import { Transfer, TransferBuilder, Wallet } from "@galacticcouncil/xc-sdk"
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"
import { useEffect, useRef, useState } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useCrossChainConfig = () => {
  const { poolService } = useRpcProvider()
  return useSuspenseQuery({
    staleTime: Infinity,
    gcTime: Infinity,
    queryKey: ["xcm", "context"],
    queryFn: () =>
      createXcContext({
        poolCtx: poolService,
      }),
  })
}

export const useCrossChainConfigService = () => {
  const { data } = useCrossChainConfig()
  return data.config
}

export const useCrossChainWallet = () => {
  const { data } = useCrossChainConfig()
  return data.wallet
}

const createCrossChainBalanceQueryKey = (chainKey: string, address: string) => {
  return ["xcm", "balance", chainKey, address] as const
}

export const useCrossChainBalance = (address: string, chainKey: string) => {
  return useQuery({
    queryKey: createCrossChainBalanceQueryKey(chainKey, address),
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => {
      // This should never be called since we're using setQueryData
      // But we need a function here
      return new Map<string, AssetAmount>()
    },
  })
}

export const useCrossChainBalanceSubscription = (
  address: string,
  chainKey: string,
  onSuccess?: (balances: AssetAmount[]) => void,
) => {
  const queryClient = useQueryClient()
  const wallet = useCrossChainWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    const chain = chainsMap.get(chainKey)
    const queryKey = createCrossChainBalanceQueryKey(chainKey, address)
    const formattedAddress =
      address && chain ? formatSourceChainAddress(address, chain) : ""

    if (!wallet || !formattedAddress || !chain) {
      setIsLoading(false)
      return
    }

    let subscription:
      | Awaited<ReturnType<typeof wallet.subscribeBalance>>
      | undefined

    async function subscribeBalance(formattedAddress: string, chain: AnyChain) {
      try {
        const cachedData = queryClient.getQueryData(queryKey)
        setIsLoading(!cachedData)

        setIsError(false)

        subscription = await wallet.subscribeBalance(
          formattedAddress,
          chain,
          (balances) => {
            const balanceMap = new Map(
              balances.map((balance) => [balance.key, balance]),
            )

            queryClient.setQueryData<Map<string, AssetAmount>>(
              queryKey,
              balanceMap,
            )

            onSuccessRef.current?.(balances)
            setIsLoading(false)
          },
        )
      } catch (err) {
        console.error(err)
        setIsError(true)
        setIsLoading(false)
      }
    }

    subscribeBalance(formattedAddress, chain)

    return () => {
      subscription?.unsubscribe()
    }
  }, [address, chainKey, queryClient, wallet])

  return { isLoading, isError }
}

export type XcmTransferArgs = {
  readonly srcAddress: string
  readonly srcAsset: string
  readonly srcChain: string
  readonly destAddress: string
  readonly destAsset: string
  readonly destChain: string
}

export const xcmTransferQuery = (
  wallet: Wallet,
  {
    srcAddress,
    srcAsset,
    srcChain,
    destAddress,
    destChain,
    destAsset,
  }: XcmTransferArgs,
  options?: UseQueryOptions<Transfer>,
) => {
  return queryOptions({
    refetchInterval: secondsToMilliseconds(30),
    refetchOnWindowFocus: false,
    retry: false,
    queryKey: [
      "xcm",
      "transfer",
      srcAddress,
      destAddress,
      srcAsset,
      destAsset,
      srcChain,
      destChain,
    ],
    queryFn: () =>
      TransferBuilder(wallet)
        .withAsset(srcAsset)
        .withSource(srcChain)
        .withDestination(destChain)
        .build({
          srcAddress: srcAddress,
          dstAddress: destAddress,
          dstAsset: destAsset,
        }),
    enabled:
      !!srcAddress &&
      !!destAddress &&
      !!srcAsset &&
      !!destAsset &&
      !!srcChain &&
      !!destChain,
    ...options,
  })
}

export const xcmTransferReportQuery = (
  transfer: Transfer | null,
  transferArgs: XcmTransferArgs,
) =>
  queryOptions({
    enabled: !!transfer,
    placeholderData: keepPreviousData,
    queryKey: ["xcm", "report", transferArgs],
    queryFn: async () => {
      if (!transfer) return []
      return transfer.validate()
    },
  })

export const xcmTransferCallQuery = (
  transfer: Transfer | null,
  amount: string,
  transferArgs: XcmTransferArgs,
  dryRun?: boolean,
) =>
  queryOptions({
    enabled: !!transfer && !!amount,
    placeholderData: keepPreviousData,
    queryKey: ["xcm", "call", amount, transferArgs, dryRun],
    queryFn: async () => {
      if (!transfer) throw new Error("Invalid transfer")
      const call = await transfer.buildCall(amount)

      const dryRunError = await (async () => {
        if (!dryRun) {
          return null
        }

        const result = await call?.dryRun()

        if (result?.error) {
          return await parseDryRunError(result.error)
        }

        return null
      })()

      return { call, dryRunError }
    },
  })
