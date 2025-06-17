import { Asset, Bond } from "@galacticcouncil/sdk-next"
import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { A_TOKEN_UNDERLYING_ID_MAP } from "@/config/atokens"
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
  chainSrc?: string
}

export type TToken = TCommonAssetData & {
  type: AssetType.TOKEN
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

const STABLESWAP_DATA_OVERRIDE_MAP: Record<
  string,
  Partial<TCommonAssetData> & { iconId?: string }
> = {
  [GDOT_ASSET_ID]: {
    name: "GIGADOT",
    symbol: "GDOT",
    iconId: GDOT_ERC20_ID,
  },
}

export const assetsQuery = (data: TProviderContext) => {
  const { sdk, isApiLoaded, dataEnv } = data

  return queryOptions({
    queryKey: ["assets", dataEnv],
    queryFn: async () => {
      const metadata = AssetMetadataFactory.getInstance()

      const { sync } = useAssetRegistry.getState()

      const [tradeAssets, assets] = await Promise.all([
        sdk.api.router.getTradeableAssets(),
        sdk.client.asset.getOnChainAssets(true),
        metadata.fetchAssets(),
        metadata.fetchChains(),
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
          return assetToTokenType(asset, commonAssetData, metadata)
        } else if (asset.type === AssetType.ERC20) {
          return assetToErc20Type(asset, commonAssetData)
        } else if (asset.type === AssetType.BOND) {
          return assetToBondType(asset, commonAssetData)
        } else if (asset.type === AssetType.STABLESWAP) {
          return assetToStableSwapType(asset, commonAssetData, metadata)
        } else if (asset.type === AssetType.External) {
          return assetToExternalType(asset, commonAssetData)
        } else {
          return {
            ...commonAssetData,
            type: AssetType.Unknown,
          }
        }
      })

      sync(syncData)

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
    const ecosystem = AssetEcosystem.ETHEREUM

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
    const ecosystem = AssetEcosystem.POLKADOT

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
  metadata: AssetMetadataFactory,
): TStableswap {
  const underlyingAssetId = asset?.meta ? Object.keys(asset.meta) : undefined

  const { iconId, ...overrideProps } =
    STABLESWAP_DATA_OVERRIDE_MAP[asset.id] ?? {}

  return {
    ...commonAssetData,
    type: AssetType.STABLESWAP,
    underlyingAssetId,
    ...overrideProps,
    ...(iconId && {
      iconSrc: metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, iconId),
    }),
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
