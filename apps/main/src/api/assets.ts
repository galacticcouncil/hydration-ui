import { Asset, Bond } from "@galacticcouncil/sdk-next"
import {
  AssetMetadataFactory,
  HYDRATION_PARACHAIN_ID,
} from "@galacticcouncil/utils"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import { isNonNullish, zip } from "remeda"

import { assetMetadataQuery } from "@/api/metadata"
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

/**
 * Assets that predate the direct NTT route still carry moonbeam branding the
 * app no longer routes through — a "(Moonbeam Wormhole)" suffix on the name
 * from the on-chain registry, and a moonbeam chain badge from the metadata cdn.
 *
 * Overridden here for display until both sources are updated. Names are the
 * registry's own with "Moonbeam " dropped — nothing else reworded. The
 * "(Wormhole)" suffix stays: each of these coexists with a native asset of the
 * same symbol (weth 1000189 / weth_mwh 20, usdc 22 / usdc_mwh 21, …) and the
 * suffix is what keeps the two apart in selectors.
 */
const MOONBEAM_PARACHAIN_ID = "2004"

/**
 * Icons are committed per hydration asset id in the metadata cdn, so the legacy
 * assets carry their own moonbeam-branded art. Borrow the native twin's icon
 * where one exists — dai (18) and eurc (44) have no twin on hydration and can
 * only be fixed in the metadata repo.
 */
const ASSET_ICON_OVERRIDES: Record<string, string> = {
  "19": "1000190",
  "20": "1000189",
  "21": "22",
  "23": "10",
  "1000745": "1000626",
}

const ASSET_NAME_OVERRIDES: Record<string, string> = {
  "18": "DAI (Wormhole)",
  "19": "Wrapped BTC (Wormhole)",
  "20": "Wrapped ETH (Wormhole)",
  "21": "USDC (Wormhole)",
  "23": "Tether (Wormhole)",
  "44": "EURC (Wormhole)",
  "1000745": "sUSDS (Wormhole)",
  "1000752": "Solana (Wormhole)",
  "1000753": "SUI (Wormhole)",
}

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
  const { sdk, papi, isEndpointSettled, dataEnv, genesisHash } = context

  return queryOptions({
    queryKey: ["assets", dataEnv],
    queryFn: async () => {
      const { syncAssets, syncATokenPairs, syncShareTokens } =
        useAssetRegistryStore.getState()

      // Icons are baked into the stored registry, so the metadata singleton has
      // to be warm before the assets are mapped - it is no longer warmed by the
      // provider query.
      const [tradeAssets, pools, assets, metadata] = await Promise.all([
        sdk.api.router.getTradeableAssets(),
        queryClient.ensureQueryData(allPools(sdk)),
        sdk.client.asset.getSupported(true),
        queryClient.ensureQueryData(assetMetadataQuery()),
      ])
      const tradeAssetsMap = new Set(tradeAssets)

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
        const isTradable = tradeAssetsMap.has(asset.id)
        const id = asset.id.toString()

        const commonAssetData: TCommonAssetData = {
          id,
          existentialDeposit: asset.existentialDeposit.toString(),
          symbol: asset.symbol ?? "",
          decimals: asset.decimals ?? 0,
          name: ASSET_NAME_OVERRIDES[id] ?? asset.name ?? "",
          isTradable,
          isSufficient: asset.isSufficient,
        }

        if (asset.type === AssetType.TOKEN) {
          return assetToTokenType(asset, commonAssetData, metadata)
        } else if (asset.type === AssetType.ERC20) {
          return assetToErc20Type(asset, commonAssetData, aTokenMap, metadata)
        } else if (asset.type === AssetType.BOND) {
          return assetToBondType(asset, commonAssetData, metadata)
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

      syncAssets(assetsData, genesisHash)
      syncShareTokens(shareTokens)

      return []
    },
    enabled: isEndpointSettled,
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
    const address = accountKey20?.key ?? ""
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
    const iconId = ASSET_ICON_OVERRIDES[commonAssetData.id] ?? asset.id

    return {
      ...commonAssetData,
      type: AssetType.TOKEN,
      parachainId,
      ecosystem,
      iconSrc: metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, iconId),
      chainSrc:
        parachainId && parachainId !== MOONBEAM_PARACHAIN_ID
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
  metadata: AssetMetadataFactory,
): TBond {
  const bondData = asset as Bond
  const { underlyingAssetId, maturity } = bondData

  return {
    ...commonAssetData,
    type: AssetType.BOND,
    underlyingAssetId: underlyingAssetId.toString(),
    iconSrc: metadata.getAssetLogoSrc(
      HYDRATION_PARACHAIN_ID,
      underlyingAssetId,
    ),
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
