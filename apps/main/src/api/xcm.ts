import {
  formatSourceChainAddress,
  HYDRATION_CHAIN_KEY,
  isEvmParachain,
  QUERY_KEY_BLOCK_PREFIX,
} from "@galacticcouncil/utils"
import { createXcContext } from "@galacticcouncil/xc"
import { chainsMap, clients } from "@galacticcouncil/xc-cfg"
import {
  AnyChain,
  Asset,
  AssetAmount,
  ChainRoutes,
  Ntt,
} from "@galacticcouncil/xc-core"
import { Transfer, TransferBuilder, Wallet } from "@galacticcouncil/xc-sdk"
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import { useEffect, useRef, useState } from "react"

import { ENV } from "@/config/env"
import { resolveRouteBuilderArgs } from "@/modules/xcm/transfer/utils/bridge"
import { withPermissiveEvmResolver } from "@/modules/xcm/transfer/utils/chain"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

// TODO: remove — temporary XCM balance debug override
const XCM_DEBUG_FAKE_BALANCE = {
  enabled: true,
  amount: 10_000_000,
} as const

const getDebugFakeAmount = (decimals: number) =>
  BigInt(XCM_DEBUG_FAKE_BALANCE.amount) * 10n ** BigInt(decimals)

const applyDebugFakeBalances = (
  balances: AssetAmount[],
  chain: AnyChain,
): Map<string, AssetAmount> => {
  const balanceMap = new Map<string, AssetAmount>()

  for (const { asset, decimals } of chain.assetsData.values()) {
    if (!decimals) continue

    balanceMap.set(
      asset.key,
      AssetAmount.fromAsset(asset, {
        amount: getDebugFakeAmount(decimals),
        decimals,
      }),
    )
  }

  for (const balance of balances) {
    balanceMap.set(
      balance.key,
      balance.copyWith({ amount: getDebugFakeAmount(balance.decimals) }),
    )
  }

  return balanceMap
}

const applyDebugFakeTransferSource = (transfer: Transfer) => {
  const { balance, fee, max } = transfer.source
  const fakeAmount = getDebugFakeAmount(balance.decimals)

  transfer.source.balance = balance.copyWith({ amount: fakeAmount })
  transfer.source.max = max.copyWith({
    amount: fee.amount < fakeAmount ? fakeAmount - fee.amount : fakeAmount,
  })
}

export const useCrossChainConfig = () => {
  const { sdk } = useRpcProvider()
  return useSuspenseQuery({
    staleTime: Infinity,
    gcTime: Infinity,
    queryKey: ["xcm", "context"],
    queryFn: async () => {
      const ctx = await createXcContext({
        poolCtx: sdk.ctx.pool,
      })

      const hydration = ctx.config.chains.get(HYDRATION_CHAIN_KEY)
      if (hydration && isEvmParachain(hydration)) {
        withPermissiveEvmResolver(hydration)
      }

      // Wormhole carries basejump with it — basejump routes hop through the
      // wormhole stack — but basejump can also be pulled on its own.
      const disabledBridgeTags = [
        ...(ENV.VITE_WORMHOLE_DISABLED
          ? [XcmTag.Wormhole, XcmTag.Basejump]
          : []),
        ...(ENV.VITE_BASEJUMP_DISABLED ? [XcmTag.Basejump] : []),
      ]

      if (disabledBridgeTags.length) {
        ctx.config.routes.forEach((chainRoutes) => {
          ctx.config.updateRoutes(
            new ChainRoutes({
              chain: chainRoutes.chain,
              routes: chainRoutes.getRoutes().filter((route) => {
                const tags = route.tags ?? []
                return !disabledBridgeTags.some((tag) => tags.includes(tag))
              }),
            }),
          )
        })
      }

      return ctx
    },
  })
}

const useHydrationClient = () => {
  return useSuspenseQuery({
    queryKey: ["xcm", "hydrationClient"],
    queryFn: () => {
      const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
      if (!hydration || !isEvmParachain(hydration))
        throw new Error("Invalid chain for HydrationClient")
      return new clients.HydrationClient(hydration)
    },
    staleTime: Infinity,
    gcTime: Infinity,
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

export const useNttOutboundLimit = (
  chain: AnyChain | null,
  asset: Asset | null,
) => {
  const enabled = !!chain && !!asset && Ntt.isKnown(chain, asset)

  return useQuery({
    queryKey: ["xcm", "ntt", "outboundLimit", chain?.key, asset?.key],
    staleTime: minutesToMilliseconds(1),
    enabled,
    queryFn: () => {
      if (!chain || !asset) throw new Error("chain and asset are required")
      return new clients.NttClient(chain, asset).getOutboundLimit()
    },
  })
}

export const useNttInboundLimit = (
  chain: AnyChain | null,
  asset: Asset | null,
  from: AnyChain | null,
) => {
  const enabled = !!chain && !!asset && !!from && Ntt.isKnown(chain, asset)

  return useQuery({
    queryKey: ["xcm", "ntt", "inboundLimit", chain?.key, asset?.key, from?.key],
    staleTime: minutesToMilliseconds(1),
    enabled,
    queryFn: () => {
      if (!chain || !asset || !from) {
        throw new Error("chain, asset, and from are required")
      }
      return new clients.NttClient(chain, asset).getInboundLimit(from)
    },
  })
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

/**
 * One-shot balance snapshot for a whole chain — no live subscription held.
 * Used by the asset picker, which only needs balances while it is open and
 * would otherwise subscribe every asset on every chain you highlight.
 */
export const useCrossChainBalancesFetch = (
  address: string,
  chainKey: string,
) => {
  const queryClient = useQueryClient()
  const wallet = useCrossChainWallet()

  const { data, dataUpdatedAt, isLoading, isError } = useQuery({
    queryKey: ["xcm", "balanceSnapshot", chainKey, address],
    enabled: !!wallet && !!address && !!chainKey,
    // Reopening the picker inside this window reuses the snapshot; past it we
    // re-fetch, which is the "re-fetch when you reopen the chain list" case.
    staleTime: secondsToMilliseconds(30),
    queryFn: async () => {
      const chain = chainsMap.get(chainKey)
      if (!chain) return []
      return wallet.getBalances(formatSourceChainAddress(address, chain), chain)
    },
  })

  // Apply each fetch once. The picker remounts on every open and react-query
  // serves cached data synchronously, so keying this on `data` alone replays an
  // old snapshot over the fresher values the live subscription has been writing
  // for the selected asset.
  const appliedAt = useRef(0)

  useEffect(() => {
    if (!data || dataUpdatedAt === appliedAt.current) return
    appliedAt.current = dataUpdatedAt
    const chain = chainsMap.get(chainKey)
    const queryKey = createCrossChainBalanceQueryKey(chainKey, address)

    if (XCM_DEBUG_FAKE_BALANCE.enabled && chain) {
      queryClient.setQueryData(queryKey, applyDebugFakeBalances(data, chain))
      return
    }

    queryClient.setQueryData<Map<string, AssetAmount>>(queryKey, (prev) => {
      const next = new Map(prev)
      for (const balance of data) next.set(balance.key, balance)
      return next
    })
  }, [data, dataUpdatedAt, chainKey, address, queryClient])

  return { isLoading, isError }
}

export const useCrossChainBalanceSubscription = (
  address: string,
  chainKey: string,
  assets: Asset[],
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

  // Assets is a fresh array each render; key the effect on its contents so we
  // resubscribe when the selection changes, not on every render.
  const assetsRef = useRef(assets)
  assetsRef.current = assets
  const assetsKey = assets
    .map((asset) => asset.key)
    .sort()
    .join(",")

  useEffect(() => {
    const chain = chainsMap.get(chainKey)
    const queryKey = createCrossChainBalanceQueryKey(chainKey, address)
    const formattedAddress =
      address && chain ? formatSourceChainAddress(address, chain) : ""

    if (!wallet || !formattedAddress || !chain || !assetsRef.current.length) {
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
          assetsRef.current,
          (balances) => {
            if (XCM_DEBUG_FAKE_BALANCE.enabled) {
              queryClient.setQueryData(
                queryKey,
                applyDebugFakeBalances(balances, chain),
              )
            } else {
              // Merge, don't replace. The cache key has no asset dimension, so a
              // narrow subscription (selected asset) and a wide one (asset list)
              // on the same chain would otherwise blank each other out.
              queryClient.setQueryData<Map<string, AssetAmount>>(
                queryKey,
                (prev) => {
                  const next = new Map(prev)
                  for (const balance of balances) next.set(balance.key, balance)
                  return next
                },
              )
            }

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
  }, [address, chainKey, assetsKey, queryClient, wallet])

  return { isLoading, isError }
}

export type XcmTransferArgs = {
  readonly srcAddress: string
  readonly srcAsset: string
  readonly srcChain: string
  readonly destAddress: string
  readonly destAsset: string
  readonly destChain: string
  readonly bridgeTag?: string
}

const hasAssetOnChain = (assetKey: string, chainKey: string) =>
  !!chainsMap.get(chainKey)?.assetsData.has(assetKey)

export const xcmTransferQuery = (
  wallet: Wallet,
  transferArgs: XcmTransferArgs | null,
  options?: Partial<UseQueryOptions<Transfer>>,
) => {
  const {
    srcAddress,
    srcAsset,
    srcChain,
    destAddress,
    destChain,
    destAsset,
    bridgeTag,
  } = transferArgs ?? {}

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
      bridgeTag,
    ],
    queryFn: async () => {
      if (!transferArgs) throw new Error("Invalid transfer args")

      const builder = TransferBuilder(wallet)
        .withAsset(transferArgs.srcAsset)
        .withSource(transferArgs.srcChain)
        .withDestination(transferArgs.destChain)

      const { tag, destAsset: dstAsset } = resolveRouteBuilderArgs(
        builder.routes,
        transferArgs.destAsset,
        transferArgs.bridgeTag,
      )

      const transfer = await builder.build({
        srcAddress: transferArgs.srcAddress,
        dstAddress: transferArgs.destAddress,
        dstAsset,
        tag,
      })

      if (XCM_DEBUG_FAKE_BALANCE.enabled) {
        applyDebugFakeTransferSource(transfer)
      } else {
        const { balance, fee, max } = transfer.source
        if (balance.isSame(fee) && max.amount > 0n) {
          try {
            const atMaxFee = await transfer.estimateFee(
              toDecimal(max.amount, max.decimals),
            )
            const delta = atMaxFee.amount - fee.amount
            if (delta > 0n) {
              transfer.source.max = max.copyWith({ amount: max.amount - delta })
            }
          } catch {
            // keep original max if re-pricing fails
          }
        }
      }

      return transfer
    },
    ...options,
    enabled:
      !!srcAddress &&
      !!destAddress &&
      !!srcAsset &&
      !!destAsset &&
      !!srcChain &&
      !!destChain &&
      hasAssetOnChain(srcAsset, srcChain) &&
      hasAssetOnChain(destAsset, destChain) &&
      Boolean(options?.enabled ?? true),
  })
}

export const xcmTransferReportQuery = (
  transfer: Transfer | null,
  transferArgs: XcmTransferArgs | null,
) =>
  queryOptions({
    enabled: !!transfer && !!transferArgs,
    placeholderData: keepPreviousData,
    queryKey: ["xcm", "report", transferArgs],
    queryFn: async () => {
      if (!transfer) return []
      return transfer.validate()
    },
  })

export const xcmDestinationFeeQuery = (
  transfer: Transfer | null,
  amount: string,
  transferArgs: XcmTransferArgs | null,
) =>
  queryOptions({
    enabled: !!transfer && !!transferArgs && !!amount && Number(amount) > 0,
    placeholderData: keepPreviousData,
    queryKey: ["xcm", "destFee", amount, transferArgs],
    queryFn: async () => {
      if (!transfer) throw new Error("Invalid transfer")
      return transfer.estimateDestinationFee(amount)
    },
  })

export const xcmTransferCallQuery = (
  { dryRunErrorDecoder }: TProviderContext,
  transfer: Transfer | null,
  amount: string,
  transferArgs: XcmTransferArgs | null,
  dryRun?: boolean,
) =>
  queryOptions({
    enabled: !!transfer && !!transferArgs && !!amount,
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
          return await dryRunErrorDecoder.parseError(result.error)
        }

        return null
      })()

      return { call, dryRunError }
    },
  })

export const useCrossChainDepositLimit = (asset: Asset | null) => {
  const { data: client } = useHydrationClient()

  return useQuery({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "xcm", "depositLimit", asset?.key],
    queryFn: () => {
      if (!asset) throw new Error("Asset is required")
      return client.getAssetDepositLimit(asset)
    },
    enabled: !!asset,
  })
}

export const useCrossChainGlobalWithdrawLimit = () => {
  const { data: client } = useHydrationClient()

  return useQuery({
    queryKey: ["xcm", "globalWithdrawLimit"],
    staleTime: minutesToMilliseconds(5),
    queryFn: () => client.getGlobalWithdrawLimit(),
  })
}
