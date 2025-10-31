import { isEvmAddress } from "@galacticcouncil/sdk"
import { safeConvertH160toSS58 } from "@galacticcouncil/utils"
import {
  assetsMap,
  chainsMap,
  dex,
  HydrationConfigService,
  routesMap,
  validations,
} from "@galacticcouncil/xcm-cfg"
import { AssetAmount } from "@galacticcouncil/xcm-core"
import { Transfer, Wallet } from "@galacticcouncil/xcm-sdk"
import {
  queryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"

export const hydrationConfigServiceQuery = queryOptions({
  queryKey: ["xcm", "configService"],
  queryFn: () =>
    new HydrationConfigService({
      assets: assetsMap,
      chains: chainsMap,
      routes: routesMap,
    }),
  staleTime: Infinity,
  gcTime: Infinity,
})

export const useHydrationConfigService = () => {
  const { data: configService } = useSuspenseQuery(hydrationConfigServiceQuery)
  return configService
}

export const useCrossChainWallet = () => {
  const { legacy_poolService } = useRpcProvider()

  const configService = useHydrationConfigService()
  return useMemo(() => {
    const wallet = new Wallet({
      configService,
      transferValidations: validations,
    })

    const hydration = configService.getChain("hydration")
    const assethub = configService.getChain("assethub")
    const assethubCex = configService.getChain("assethub_cex")

    wallet.registerDex(
      new dex.HydrationDex(hydration, legacy_poolService),
      new dex.AssethubDex(assethub),
      new dex.AssethubDex(assethubCex),
    )

    return wallet
  }, [configService, legacy_poolService])
}

const createCrossChainBalanceQueryKey = (chainKey: string, address: string) => {
  return ["xcm", "balance", chainKey, address]
}

export const useCrossChainBalance = (address: string, chainKey: string) => {
  const { promise } = useRef(
    Promise.withResolvers<Map<string, AssetAmount>>(),
  ).current
  return useQuery<Map<string, AssetAmount>>({
    queryKey: createCrossChainBalanceQueryKey(chainKey, address),
    enabled: false,
    staleTime: Infinity,
    queryFn: () => promise,
  })
}

export const useCrossChainBalanceSubscription = (
  address: string,
  chainKey: string,
  onSuccess?: (balances: AssetAmount[]) => void,
) => {
  const wallet = useCrossChainWallet()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!wallet) return
    let subscription:
      | Awaited<ReturnType<typeof wallet.subscribeBalance>>
      | undefined

    async function subscribeBalance() {
      const chain = chainsMap.get(chainKey)
      if (!address || !chainKey || !wallet || !chain) return

      setIsLoading(true)

      const formattedAddress =
        chain.isEvmParachain() && isEvmAddress(address)
          ? safeConvertH160toSS58(address)
          : address

      subscription = await wallet.subscribeBalance(
        formattedAddress,
        chain,
        (balances) => {
          onSuccess?.(balances)
          queryClient.setQueryData<Map<string, AssetAmount>>(
            createCrossChainBalanceQueryKey(chainKey, address),
            new Map(balances.map((balance) => [balance.key, balance])),
          )
          setIsLoading(false)
        },
      )
    }

    subscribeBalance()

    return () => {
      subscription?.unsubscribe()
      setIsLoading(false)
    }
  }, [address, chainKey, onSuccess, queryClient, wallet])

  return { isLoading }
}

type XcmTransferArgs = {
  readonly srcAddress: string
  readonly asset: string
  readonly srcChain: string
  readonly destAddress: string
  readonly destChain: string
}

export const xcmTransferQuery = (
  wallet: Wallet,
  { srcAddress, asset, srcChain, destAddress, destChain }: XcmTransferArgs,
  options?: UseQueryOptions<Transfer>,
) => {
  return queryOptions({
    queryKey: [
      "xcm",
      "transfer",
      srcAddress,
      asset,
      srcChain,
      destAddress,
      destChain,
    ],
    queryFn: () =>
      wallet.transfer(asset, srcAddress, srcChain, destAddress, destChain),
    enabled:
      !!srcAddress && !!asset && !!srcChain && !!destAddress && !!destChain,
    ...options,
  })
}
