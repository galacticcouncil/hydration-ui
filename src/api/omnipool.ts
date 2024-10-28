import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS, WS_QUERY_KEYS } from "utils/queryKeys"
import { REFETCH_INTERVAL } from "utils/constants"
import { useRpcProvider } from "providers/rpcProvider"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useEffect } from "react"
import { VoidFn } from "@polkadot/api/types"
import { arraysEqual } from "utils/helpers"
import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math-omnipool"
import { createClient } from "graphql-ws"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { u8aToHex } from "@polkadot/util"

export type TOmnipoolAssetsData = Array<{
  id: string
  hubReserve: string
  cap: string
  protocolShares: string
  shares: string
  bits: number
  balance: string
}>

export const useOmnipoolDataObserver = () => {
  const { data, isLoading } = useQuery<TOmnipoolAssetsData>(
    WS_QUERY_KEYS.omnipoolAssets,
    {
      enabled: false,
      staleTime: Infinity,
    },
  )

  return {
    data,
    dataMap: data ? new Map(data.map((asset) => [asset.id, asset])) : undefined,
    isLoading,
  }
}

const squidWSClient = createClient({
  webSocketImpl: WebSocket,
  url: "wss://galacticcouncil.squids.live/hydration-xyk-pools-indexer/graphql",
})

export const useSquidSubscription = () => {
  const { shareTokens } = useAssets()

  const hexAddresses = shareTokens.map((shareToken) =>
    u8aToHex(decodeAddress(shareToken.poolAddress)),
  )

  useEffect(() => {
    const unsubscribe = squidWSClient.subscribe(
      {
        query: `
      subscription ($poolIds: [String!]!){
        xykPoolHistoricalVolume(filter: {poolIds: $poolIds}) {
          event
          node {
            assetAId
            assetATotalVolumeIn
            assetATotalVolumeOut
            assetAVolumeIn
            assetAVolumeOut
            assetBId
            assetBTotalVolumeIn
            assetBTotalVolumeOut
            assetBVolumeIn
            assetBVolumeOut
            paraChainBlockHeight
            poolId
          }
        }
      }
      `,
        variables: { poolIds: hexAddresses },
      },
      {
        next: (data) => {
          console.log(
            `New transfers: ${JSON.parse(JSON.stringify(data))}`,
            data,
          )
        },
        error: (error) => {
          console.error("error", error)
        },
        complete: () => {
          console.log("done!")
        },
      },
    )

    return () => unsubscribe()
  }, [])

  return null
}

export const useOmnipoolAssetsSubsciption = () => {
  const {
    native: { id: nativeId },
  } = useAssets()
  const { api, isLoaded } = useRpcProvider()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isLoaded) return undefined

    let unsubAssets: VoidFn | undefined

    const loadAssets = async () => {
      const keys = (await api.query.omnipool.assets.keys()).map((key) =>
        key.args[0].toString(),
      )
      const balanceKeys = keys.map((key) => [OMNIPOOL_ACCOUNT_ADDRESS, key])

      unsubAssets = await api.query.omnipool.assets.multi(
        keys,
        async (assets) => {
          const [nativeBalance, balancesRaw] = await Promise.all([
            api.query.system.account(OMNIPOOL_ACCOUNT_ADDRESS),
            api.query.tokens.accounts.multi(balanceKeys),
          ])

          const balances = new Map(
            balancesRaw.map((d, i) => {
              const id = keys[i]
              const balance = d.free
                .toBigNumber()
                .minus(d.frozen.toBigNumber())
                .toString()

              return [id, balance]
            }),
          )

          const data: TOmnipoolAssetsData = assets.map((dataRaw, i) => {
            const asset = dataRaw.unwrap()
            const id = keys[i]
            const balance =
              id === nativeId
                ? nativeBalance.data.free
                    .toBigNumber()
                    .minus(nativeBalance.data.frozen.toString())
                    .toString()
                : (balances.get(id) as string)

            return {
              id,
              hubReserve: asset.hubReserve.toString(),
              shares: asset.shares.toString(),
              protocolShares: asset.protocolShares.toString(),
              cap: asset.cap.toString(),
              bits: asset.tradable.bits.toNumber(),
              balance,
            }
          })

          const prevData: TOmnipoolAssetsData =
            queryClient.getQueryData(WS_QUERY_KEYS.omnipoolAssets) ?? []

          if (!arraysEqual(prevData, data)) {
            queryClient.setQueryData(WS_QUERY_KEYS.omnipoolAssets, data)
          }
        },
      )
    }

    loadAssets()

    return () => {
      if (unsubAssets) {
        unsubAssets()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, isLoaded])
}

export const useOmnipoolFee = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.omnipoolFee, getOmnipoolFee(api))
}

export const getOmnipoolFee = (api: ApiPromise) => async () => {
  const { minFee, maxFee } = await api.consts.dynamicFees.assetFeeParameters

  return {
    minFee: minFee.toBigNumber().div(1000000),
    maxFee: maxFee.toBigNumber().div(1000000),
  }
}

export const getHubAssetImbalance = (api: ApiPromise) =>
  api.query.omnipool.hubAssetImbalance()

export const useHubAssetImbalance = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.hubAssetImbalance(),
    () => getHubAssetImbalance(api),
    {
      enabled: isLoaded,
      refetchInterval: REFETCH_INTERVAL,
    },
  )
}

export const useAllLiquidityPositions = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    queryKey: QUERY_KEYS.allOmnipoolPositions,
    queryFn: async () => {
      const collectionId = await api.consts.omnipool.nftCollectionId

      const [positions, uniques] = await Promise.all([
        api.query.omnipool.positions.entries(),
        api.query.uniques.asset.entries(collectionId.toString()),
      ])

      const data = positions.reduce<
        {
          amount: BigNumber
          shares: BigNumber
          price: string[]
          assetId: string
          owner: string
        }[]
      >((acc, [idRaw, dataRaw]) => {
        const id = idRaw.args[0].toString()

        const owner = uniques
          .find(([key]) => {
            const [, itemId] = key.args
            return itemId.toString() === id
          })?.[1]
          ?.unwrap()
          .owner.toString()

        if (owner) {
          const data = dataRaw.unwrap()

          acc.push({
            amount: data.amount.toBigNumber(),
            shares: data.shares.toBigNumber(),
            price: data.price.map((e) => e.toString()),
            assetId: data.assetId.toString(),
            owner,
          })
        }
        return acc
      }, [])

      return data
    },
    enabled: isLoaded,
  })
}

export const useOmnipoolMinLiquidity = () => {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.omnipoolMinLiquidity, getOmnipoolMinLiquidity(api))
}

const getOmnipoolMinLiquidity = (api: ApiPromise) => async () => {
  const data = await api.consts.omnipool.minimumPoolLiquidity

  return data.toBigNumber()
}

export const getTradabilityFromBits = (bits: number) => {
  const canBuy = is_buy_allowed(bits)
  const canSell = is_sell_allowed(bits)
  const canAddLiquidity = is_add_liquidity_allowed(bits)
  const canRemoveLiquidity = is_remove_liquidity_allowed(bits)

  return { canBuy, canSell, canAddLiquidity, canRemoveLiquidity }
}
