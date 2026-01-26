import { Asset, Bond } from "@galacticcouncil/sdk-next"
import {
  AssetMetadataFactory,
  HYDRATION_PARACHAIN_ID,
} from "@galacticcouncil/utils"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import { isNonNullish, zip } from "remeda"

import { TProviderContext } from "@/providers/rpcProvider"
import {
  TATokenPairStored,
  TShareTokenStored,
  useAssetRegistryStore,
} from "@/states/assetRegistry"
import {
  getAccountKey20,
  getEthereumNetworkEntry,
  getExternalId,
  getParachainId,
} from "@/utils/externalAssets"

export enum AssetType {
  TOKEN = "Token",
  BOND = "Bond",
  STABLESWAP = "StableSwap",
  ERC20 = "Erc20",
  External = "External",
  Unknown = "Unknown",
  XYK = "XYK",
}

import { ChainEcosystem } from "@galacticcouncil/xc-core"

import { allPools } from "./pools"

type TCommonAssetData = {
  id: string
  existentialDeposit: string
  symbol: string
  decimals: number
  name: string
  isTradable: boolean
  isSufficient: boolean
  iconSrc?: string
  chainSrc?: string
}

export type TToken = TCommonAssetData & {
  type: AssetType.TOKEN
  parachainId?: string
  ecosystem: ChainEcosystem
}

export type TErc20 = TCommonAssetData & {
  type: AssetType.ERC20
}

export type TErc20AToken = TErc20 & {
  underlyingAssetId: string
}

export type TBond = TCommonAssetData & {
  type: AssetType.BOND
  underlyingAssetId: string
  maturity: number
}

export type TStableswap = TCommonAssetData & {
  type: AssetType.STABLESWAP
  underlyingAssetId?: string[]
}

export type TExternal = TCommonAssetData & {
  type: AssetType.External
  externalId?: string
  parachainId?: string
}

export type TUnknown = TCommonAssetData & {
  type: AssetType.Unknown
}

export type TAssetData =
  | TToken
  | TErc20
  | TErc20AToken
  | TBond
  | TStableswap
  | TExternal
  | TUnknown

export const assetsQuery = (
  context: TProviderContext,
  queryClient: QueryClient,
) => {
  const { sdk, papi, isApiLoaded, dataEnv, metadata } = context

  return queryOptions({
    queryKey: ["assets", dataEnv],
    queryFn: async () => {
      const { syncAssets, syncATokenPairs, syncShareTokens } =
        useAssetRegistryStore.getState()

      const [tradeAssets, pools, assets] = await Promise.all([
        sdk.api.router.getTradeableAssets(),
        queryClient.ensureQueryData(allPools(sdk)),
        sdk.client.asset.getSupported(true),
      ])

      const xykPoolsAddress = pools.xykPools.map<[string]>((p) => [p.address])
      const xykPoolsShareTokens =
        await papi.query.XYK.ShareToken.getValues(xykPoolsAddress)

      const entries = zip(pools.xykPools, xykPoolsShareTokens)

      const shareTokens: TShareTokenStored[] = []
      for (const [pool, shareToken] of entries) {
        const assetAId = pool.tokens[0]?.id.toString()
        const assetBId = pool.tokens[1]?.id.toString()

        if (assetAId && assetBId) {
          shareTokens.push({
            poolAddress: pool.address,
            shareTokenId: shareToken.toString(),
            assets: [assetAId, assetBId],
          })
        }
      }

      const aTokenPairs: TATokenPairStored[] = pools.aavePools
        .map((p) => {
          const [reserve, atoken] = p.tokens

          if (!atoken || !reserve) return

          return [atoken.id.toString(), reserve.id.toString()] as const
        })
        .filter(isNonNullish)

      const aTokenMap = new Map(aTokenPairs)

      syncATokenPairs(aTokenPairs)

      const assetsData = assets.map((asset): TAssetData => {
        const isTradable = tradeAssets.some((id) => id === asset.id)

        const commonAssetData: TCommonAssetData = {
          id: asset.id.toString(),
          existentialDeposit: asset.existentialDeposit.toString(),
          symbol: asset.symbol ?? "",
          decimals: asset.decimals ?? 0,
          name: asset.name ?? "",
          isTradable,
          isSufficient: asset.isSufficient,
        }

        if (asset.type === AssetType.TOKEN) {
          return assetToTokenType(asset, commonAssetData, metadata)
        } else if (asset.type === AssetType.ERC20) {
          return assetToErc20Type(asset, commonAssetData, aTokenMap, metadata)
        } else if (asset.type === AssetType.BOND) {
          return assetToBondType(asset, commonAssetData)
        } else if (asset.type === AssetType.STABLESWAP) {
          return assetToStableSwapType(asset, commonAssetData)
        } else if (asset.type === AssetType.External) {
          return assetToExternalType(asset, commonAssetData)
        } else {
          return {
            ...commonAssetData,
            type: AssetType.Unknown,
          }
        }
      })

      syncAssets(assetsData)
      syncShareTokens(shareTokens)

      return []
    },
    enabled: isApiLoaded,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

function assetToTokenType(
  asset: Asset,
  commonAssetData: TCommonAssetData,
  metadata: AssetMetadataFactory,
): TToken {
  const ethereumNetworkEntry = getEthereumNetworkEntry(asset)

  if (ethereumNetworkEntry) {
    const accountKey20 = getAccountKey20(asset)
    const parachainId = ethereumNetworkEntry?.value?.chain_id?.toString()
    const address = accountKey20?.key ? accountKey20.key.asHex() : ""
    const ecosystem = ChainEcosystem.Ethereum

    return {
      ...commonAssetData,
      type: AssetType.TOKEN,
      parachainId,
      ecosystem,
      iconSrc: metadata.getAssetLogoSrc(parachainId, address, ecosystem),
      chainSrc: metadata.getChainLogoSrc(parachainId, ecosystem),
    }
  } else {
    const parachainId = getParachainId(asset)?.toString()
    const ecosystem = ChainEcosystem.Polkadot

    return {
      ...commonAssetData,
      type: AssetType.TOKEN,
      parachainId,
      ecosystem,
      iconSrc: metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, asset.id),
      chainSrc: parachainId
        ? metadata.getChainLogoSrc(parachainId, ecosystem)
        : undefined,
    }
  }
}

function assetToErc20Type(
  asset: Asset,
  commonAssetData: TCommonAssetData,
  aTokenMap: Map<string, string>,
  metadata: AssetMetadataFactory,
): TErc20 | TErc20AToken {
  const underlyingAssetId = aTokenMap.get(asset.id.toString())
  return {
    ...commonAssetData,
    type: AssetType.ERC20,
    iconSrc: metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, asset.id),
    ...(underlyingAssetId && { underlyingAssetId }),
  }
}

function assetToBondType(
  asset: Asset,
  commonAssetData: TCommonAssetData,
): TBond {
  const bondData = asset as Bond
  const { underlyingAssetId, maturity } = bondData

  return {
    ...commonAssetData,
    type: AssetType.BOND,
    underlyingAssetId: underlyingAssetId.toString(),
    maturity,
  }
}

function assetToStableSwapType(
  asset: Asset,
  commonAssetData: TCommonAssetData,
): TStableswap {
  const underlyingAssetId = asset?.meta ? Object.keys(asset.meta) : undefined

  return {
    ...commonAssetData,
    type: AssetType.STABLESWAP,
    underlyingAssetId,
  }
}

function assetToExternalType(
  asset: Asset,
  commonAssetData: TCommonAssetData,
): TExternal {
  const externalId = getExternalId(asset)
  const parachainId = getParachainId(asset)?.toString()

  return {
    ...commonAssetData,
    type: AssetType.External,
    externalId: externalId ? externalId.toString() : undefined,
    parachainId: parachainId ? parachainId.toString() : undefined,
  }
}
