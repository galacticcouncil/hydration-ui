import { useEffect, useMemo, useRef } from "react"
import { useSDKPools } from "./pools"
import { useRpcProvider } from "providers/rpcProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEY_PREFIX, QUERY_KEYS } from "utils/queryKeys"
import { useDegenModeSubscription } from "components/Layout/Header/DegenMode/DegenMode.utils"
import { useExternalAssetRegistry } from "./external"
import { useSettingsStore } from "state/store"
import { usePriceSubscriber } from "./spotPrice"
import { useProviderMetadata } from "./provider"
import { useOmnipoolVolumeSubscription } from "./omnipool"
import { useActiveQueries } from "hooks/useActiveQueries"
import { Balance } from "@galacticcouncil/sdk"
import {
  useStablepoolVolumeSubscription,
  useXYKVolumeSubscription,
} from "./volume"
import { VoidFn } from "@polkadot/api/types"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TAsset, useAssets } from "providers/assets"
import { NATIVE_ASSET_ID } from "utils/api"
import { TBalance } from "./balances"
import { GETH_ERC20_ASSET_ID } from "utils/constants"
import { setAccountBalances, setIsAccountBalance } from "./deposits"
import { percentageDifference } from "utils/helpers"
import { produce } from "immer"

const ERC20_THRESHOLD = 0.01

export const QuerySubscriptions = () => {
  const { isLoaded } = useRpcProvider()
  const { degenMode } = useSettingsStore()
  usePriceSubscriber()
  useProviderMetadata()
  useBalanceSubscription()

  if (!isLoaded) return null

  return (
    <>
      {degenMode && <DegenMode />}
      <InvalidateOnBlockSubscription />
      <OmnipoolAssetsSubscription />
      <ExternalAssetsMetadata />
      <OmnipoolVolumes />
      <XYKVolumes />
      <StablepoolVolumes />
    </>
  )
}

export const InvalidateOnBlockSubscription = () => {
  const queryClient = useQueryClient()
  const { api, isLoaded } = useRpcProvider()

  const cancelRef = useRef<VoidFunction | null>(null)

  useEffect(() => {
    if (isLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries([QUERY_KEY_PREFIX])
        })
        .then((cancel) => {
          cancelRef.current = cancel
        })
    }

    return () => {
      cancelRef.current?.()
    }
  }, [isLoaded, api, queryClient])

  return null
}

const OmnipoolAssetsSubscription = () => {
  useSDKPools()

  return null
}

const DegenMode = () => {
  useDegenModeSubscription()

  return null
}

const ExternalAssetsMetadata = () => {
  useExternalAssetRegistry()

  return null
}

const OmnipoolVolumes = () => {
  const activeQueriesAmount = useActiveQueries([
    ...QUERY_KEYS.omnipoolSquidVolumes,
  ])

  return activeQueriesAmount ? <OmnipoolVolumeSubscription /> : null
}

const OmnipoolVolumeSubscription = () => {
  useOmnipoolVolumeSubscription()
  return null
}

const XYKVolumes = () => {
  const activeQueriesAmount = useActiveQueries(["xykSquidVolumes"])

  return activeQueriesAmount ? <XYKVolumeSubscription /> : null
}

const XYKVolumeSubscription = () => {
  useXYKVolumeSubscription()
  return null
}

const StablepoolVolumes = () => {
  const activeQueriesAmount = useActiveQueries([
    ...QUERY_KEYS.stablepoolsSquidVolumes,
  ])

  return activeQueriesAmount ? <StablepoolVolumeSubscription /> : null
}

const StablepoolVolumeSubscription = () => {
  useStablepoolVolumeSubscription()
  return null
}

export function useBalanceSubscription() {
  const { isLoaded, sdk } = useRpcProvider()
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const { all, erc20, getErc20, native, getAssetWithFallback, shareTokens } =
    useAssets()

  const accountAddress = account?.address
  const { client, api } = sdk ?? {}
  const { balanceV2 } = client ?? {}

  const {
    data: systemBalance,
    isSuccess: isSuccessSystem,
    isLoading: isLoadingSystem,
  } = useQuery<Balance | false>(QUERY_KEYS.accountSystemBalance, {
    enabled: false,
    staleTime: Infinity,
  })

  const {
    data: tokenBalances,
    isSuccess: isSuccessTokens,
    isLoading: isLoadingTokens,
  } = useQuery<Map<string, Balance>>(QUERY_KEYS.accountTokenBalances, {
    enabled: false,
    staleTime: Infinity,
  })

  const {
    data: accountErc20Balances,
    isSuccess: isSuccessErc20,
    isLoading: isLoadingErc20,
  } = useQuery<Map<string, Balance>>(QUERY_KEYS.accountErc20Balance, {
    enabled: false,
    staleTime: Infinity,
  })

  const followedAssetIds = useMemo(
    () => [
      ...Array.from(all.values())
        .filter((token) => !token.isErc20 && token.id !== NATIVE_ASSET_ID)
        .map((token) => token.id),
      ...shareTokens.map((token) => token.id),
    ],
    [all, shareTokens],
  )

  const erc20AssetIds = useMemo(() => erc20.map((a) => a.id), [erc20])

  useEffect(() => {
    if (
      !accountAddress ||
      !balanceV2 ||
      !isLoaded ||
      !followedAssetIds.length ||
      !erc20AssetIds.length
    )
      return

    console.log("Subscribe to balances")

    let unsubSystemBalance: VoidFn | null = null
    let unsubTokensBalance: VoidFn | null = null
    let unsubErcBalance: VoidFn | null = null

    const subscribeSystemBalance = async () => {
      unsubSystemBalance = await balanceV2.subscribeSystemBalance(
        accountAddress,
        (assetId: string, balance: Balance) => {
          if (balance.total !== "0") {
            queryClient.setQueryData(QUERY_KEYS.accountSystemBalance, balance)
          } else {
            queryClient.setQueryData(QUERY_KEYS.accountSystemBalance, false)
          }
        },
      )
    }

    const subscribeTokensBalance = async () => {
      unsubTokensBalance = await balanceV2.subscribeTokenBalance(
        accountAddress,
        (balances) => {
          const validBalances = new Map([])

          for (const [assetId, balance] of balances) {
            if (balance.total !== "0") {
              validBalances.set(assetId, balance)
            }
          }

          queryClient.setQueryData(
            QUERY_KEYS.accountTokenBalances,
            validBalances,
          )
        },
        followedAssetIds,
      )
    }

    const snapABalances = new Map<string, Balance>([])

    const subscribeErc20Balance = async () => {
      unsubErcBalance = await balanceV2.subscribeErc20Balance(
        accountAddress,
        async (balances) => {
          const validBalances = new Map<string, Balance>([])

          let shouldSync = false

          for (const [assetId, balance] of balances) {
            if (balance.total !== "0") {
              const snapBalance = snapABalances.get(assetId)

              validBalances.set(assetId, balance)
              snapABalances.set(assetId, balance)

              const snapTransferable = snapBalance?.transferable ?? "0"
              const { transferable } = balance

              if (
                snapTransferable !== transferable &&
                percentageDifference(snapTransferable, transferable).gt(
                  ERC20_THRESHOLD,
                )
              ) {
                shouldSync = true
              }
            }
          }

          if (!shouldSync && validBalances.size) {
            return
          }

          const maxReserves = await api.aave.getMaxWithdrawAll(accountAddress)

          const maxReservesMap = new Map(
            Object.entries(maxReserves).map(([token, amount]) => [
              token,
              amount,
            ]),
          )

          const adjustedBalances = produce(validBalances, (validBalances) => {
            for (const [assetId, balance] of validBalances.entries()) {
              const registryId = getErc20(assetId)?.underlyingAssetId ?? ""
              const maxReserve = maxReservesMap.get(registryId)

              if (maxReserve) {
                balance.transferable = maxReserve.amount.toString()
              }
            }
          })

          queryClient.setQueryData(
            QUERY_KEYS.accountErc20Balance,
            adjustedBalances,
          )
        },
        erc20AssetIds,
      )
    }

    subscribeSystemBalance()
    subscribeTokensBalance()
    subscribeErc20Balance()

    return () => {
      console.log("Unsubscribe of balances")
      unsubSystemBalance?.()
      unsubTokensBalance?.()
      unsubErcBalance?.()
    }
  }, [
    accountAddress,
    balanceV2,
    queryClient,
    isLoaded,
    followedAssetIds,
    erc20AssetIds,
    api,
    getErc20,
  ])

  const getIsPoolPositions = (asset: TAsset, balance: Balance) =>
    (asset.isShareToken ||
      asset.isStableSwap ||
      asset.id === GETH_ERC20_ASSET_ID) &&
    balance.total !== "0"

  const data = useMemo(() => {
    if (!isSuccessSystem || !isSuccessTokens || !isSuccessErc20) return

    const accountAssetsMap: Map<
      string,
      { balance: TBalance; asset: TAsset; isPoolPositions: boolean }
    > = new Map([])
    let isBalance = false

    if (systemBalance) {
      accountAssetsMap.set(native.id, {
        balance: systemBalance,
        asset: native,
        isPoolPositions: false,
      })
    }

    if (tokenBalances) {
      for (const [assetId, balance] of tokenBalances.entries()) {
        const asset = getAssetWithFallback(assetId)

        const isPoolPositions = getIsPoolPositions(asset, balance)

        if (isPoolPositions) {
          isBalance = true
        }

        accountAssetsMap.set(assetId, {
          balance,
          asset,
          isPoolPositions,
        })
      }
    }

    if (accountErc20Balances) {
      for (const [assetId, balance] of accountErc20Balances.entries()) {
        const asset = getAssetWithFallback(assetId)

        const isPoolPositions = getIsPoolPositions(asset, balance)

        if (isPoolPositions) {
          isBalance = true
        }

        accountAssetsMap.set(assetId, {
          balance,
          asset,
          isPoolPositions,
        })
      }
    }

    const balances = [...accountAssetsMap.values()]

    return {
      accountAssetsMap,
      balances,
      isBalance,
    }
  }, [
    getAssetWithFallback,
    isSuccessErc20,
    isSuccessSystem,
    isSuccessTokens,
    native,
    systemBalance,
    tokenBalances,
    accountErc20Balances,
  ])

  const isLoading = isLoadingSystem || isLoadingTokens || isLoadingErc20
  const isInitialLoading = isLoading
  const isSuccess = isSuccessSystem || isSuccessTokens || isSuccessErc20

  useEffect(() => {
    setAccountBalances({ data, isLoading, isInitialLoading, isSuccess })
  }, [data, isInitialLoading, isLoading, isSuccess])

  useEffect(() => {
    if (data?.isBalance) {
      setIsAccountBalance(data.isBalance)
    }
  }, [data?.isBalance])
}
