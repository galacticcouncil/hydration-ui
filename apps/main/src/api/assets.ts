import { Asset, Bond } from "@galacticcouncil/sdk-next"
import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"
import { useAssetRegistry } from "@/states/assetRegistry"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  HYDRATION_PARACHAIN_ID,
} from "@/utils/consts"
import {
  getAccountKey20,
  getEthereumNetworkEntry,
  getExternalId,
  getParachainId,
} from "@/utils/externalAssets"

/**
 * Map of aTokens and their corresponding underlying asset ids
 */
export const A_TOKEN_UNDERLYING_ID_MAP_TESTNET: { [key: string]: string } = {
  // aDOT
  "1000037": "5",
  // aUSDT
  "1000039": "10",
  // aUSDC
  "1000038": "21",
  // aWBTC
  "1000040": "3",
  // aWETH
  "1000041": "20",
  //avDOT
  "1005": "15",
}

export const A_TOKEN_UNDERLYING_ID_MAP_MAINNET: { [key: string]: string } = {
  // aDOT
  "1001": "5",
  // aUSDT
  "1002": "10",
  // aUSDC
  "1003": "22",
  // aWBTC
  "1004": "19",
  //avDOT
  "1005": "15",
}

export const A_TOKEN_UNDERLYING_ID_MAP =
  import.meta.env.VITE_ENV === "production"
    ? A_TOKEN_UNDERLYING_ID_MAP_MAINNET
    : A_TOKEN_UNDERLYING_ID_MAP_TESTNET

export type TAssetResouce = {
  baseUrl: string
  branch: string
  cdn: {
    [key: string]: string
  }
  path: string
  repository: string
  items: string[]
}

export enum AssetType {
  TOKEN = "Token",
  BOND = "Bond",
  STABLESWAP = "StableSwap",
  ERC20 = "Erc20",
  External = "External",
  Unknown = "Unknown",
}

export enum AssetEcosystem {
  POLKADOT = "polkadot",
  ETHEREUM = "ethereum",
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
}

export type TToken = TCommonAssetData & {
  type: AssetType.TOKEN
  srcChain?: string
  parachainId?: string
  ecosystem: AssetEcosystem
}

export type TErc20 = TCommonAssetData & {
  type: AssetType.ERC20
  underlyingAssetId?: string
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
  | TBond
  | TStableswap
  | TExternal
  | TUnknown

const METADATA_BASE_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master"

const METADATA_PATHS = ["/assets-v2.json", "/chains-v2.json"]

const STABLESWAP_DATA_OVERRIDE_MAP: Record<
  string,
  Partial<TCommonAssetData>
> = {
  [GDOT_ASSET_ID]: {
    name: "GIGADOT",
    symbol: "GDOT",
    iconSrc: `polkadot/2034/assets/${GDOT_ERC20_ID}/icon.svg`,
  },
}

export const assetsQuery = (data: TProviderContext) => {
  const { assetClient, tradeRouter, isApiLoaded, dataEnv } = data

  return queryOptions({
    queryKey: ["assets", dataEnv],
    queryFn: async () => {
      const metadataQueries = METADATA_PATHS.map((path) =>
        fetch(METADATA_BASE_URL + path).then(
          (d) => d.json() as unknown as TAssetResouce,
        ),
      )

      const { sync, syncMetadata } = useAssetRegistry.getState()

      const [tradeAssets, assets, assetsMetadata, chainsMetadata] =
        await Promise.all([
          tradeRouter.getTradeableAssets(),
          assetClient.getOnChainAssets(true),
          ...metadataQueries,
        ])

      const syncData = assets.map((asset): TAssetData => {
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
          return assetToTokenType(
            asset,
            commonAssetData,
            findIconSrc(assetsMetadata?.items ?? []),
          )
        } else if (asset.type === AssetType.ERC20) {
          return assetToErc20Type(asset, commonAssetData)
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
      console.log({ syncData })
      syncMetadata({
        url: assetsMetadata ? getMetadataUrl(assetsMetadata) : undefined,
        chainsMetadata,
      })
      sync(syncData)

      // const [shareToken, poolAssets] = await Promise.all([
      //   api.query.xyk.shareToken.entries(),
      //   api.query.xyk.poolAssets.entries(),
      // ])

      // const shareTokens = shareToken
      //   .map(([key, shareTokenIdRaw]) => {
      //     const poolAddress = key.args[0].toString()
      //     const shareTokenId = shareTokenIdRaw.toString()

      //     const xykAssets = poolAssets.find(
      //       (xykPool) => xykPool[0].args[0].toString() === poolAddress,
      //     )?.[1]

      //     if (xykAssets)
      //       return {
      //         poolAddress,
      //         shareTokenId,
      //         assets: xykAssets.unwrap().map((asset) => asset.toString()),
      //       }

      //     return undefined
      //   })
      //   .filter(isNonNullish)

      // syncShareTokens(shareTokens)
      return []
    },
    enabled: isApiLoaded,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

function findIconSrc(items: string[]) {
  return (parachainId: string, assetIdOrAddress: string) => {
    return items.find((item) =>
      item.includes(`${parachainId}/assets/${assetIdOrAddress}`),
    )
  }
}

function getMetadataUrl(resource: TAssetResouce) {
  const { cdn, path, repository } = resource
  return [cdn["jsDelivr"], repository + "@latest", path].join("/")
}

function assetToTokenType(
  asset: Asset,
  commonAssetData: TCommonAssetData,
  getIconSrc: (
    parachainId: string,
    assetIdOrAddress: string,
  ) => string | undefined,
): TToken {
  const ethereumNetworkEntry = getEthereumNetworkEntry(asset)

  if (ethereumNetworkEntry) {
    const accountKey20 = getAccountKey20(asset)
    const parachainId = ethereumNetworkEntry?.value?.chain_id?.toString()
    const address = accountKey20?.key ? accountKey20.key.asHex() : ""

    return {
      ...commonAssetData,
      type: AssetType.TOKEN,
      ecosystem: AssetEcosystem.ETHEREUM,
      iconSrc: getIconSrc(parachainId, address),
      parachainId,
    }
  } else {
    const parachainId = getParachainId(asset)?.toString()

    return {
      ...commonAssetData,
      parachainId,
      type: AssetType.TOKEN,
      ecosystem: AssetEcosystem.POLKADOT,
      iconSrc: getIconSrc(
        HYDRATION_PARACHAIN_ID.toString(),
        commonAssetData.id,
      ),
    }
  }
}

function assetToErc20Type(
  asset: Asset,
  commonAssetData: TCommonAssetData,
): TErc20 {
  const underlyingAssetId = A_TOKEN_UNDERLYING_ID_MAP[asset.id]

  return {
    ...commonAssetData,
    type: AssetType.ERC20,
    underlyingAssetId,
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
    ...STABLESWAP_DATA_OVERRIDE_MAP[asset.id.toString()],
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
