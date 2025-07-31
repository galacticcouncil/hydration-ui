import { PoolToken } from "@galacticcouncil/sdk"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react"

import {
  AssetEcosystem,
  AssetType,
  TAssetData,
  TBond,
  TErc20,
  TErc20AToken,
  TExternal,
  TStableswap,
  TToken,
} from "@/api/assets"
import { TAssetStored, useAssetRegistry } from "@/states/assetRegistry"
import { HUB_ID, NATIVE_ASSET_ID } from "@/utils/consts"
import { ASSETHUB_ID_BLACKLIST } from "@/utils/externalAssets"

const bannedAssets = ["1000042"]

type TAssetsState = {
  all: Map<string, TAsset>
  tokens: TAsset[]
  stableswap: TStableswap[]
  bonds: TBond[]
  external: TExternal[]
  externalInvalid: TExternal[]
  erc20: TErc20[]
  tradable: TAsset[]
  native: TAsset
  hub: TAsset
}

type AssetId = string | number

type TAssetsContext = TAssetsState & {
  getAsset: (id: AssetId) => TAsset | undefined
  getAssets: (ids: AssetId[]) => (TAsset | undefined)[]
  getBond: (id: AssetId) => TBond | undefined
  getAssetWithFallback: (id: AssetId) => TAsset
  getExternalByExternalId: (externalId: AssetId) => TExternal | undefined
  getErc20: (id: AssetId) => TErc20 | TErc20AToken | undefined
  getErc20AToken: (id: AssetId) => TErc20AToken | undefined
  getRelatedAToken: (id: AssetId) => TErc20 | undefined
  isToken: (asset: TAsset) => asset is TToken
  isExternal: (asset: TAsset) => asset is TExternal
  isBond: (asset: TAsset) => asset is TBond
  isErc20: (asset: TAsset) => asset is TErc20
  isErc20AToken: (asset: TAsset) => asset is TErc20AToken
  isStableSwap: (asset: TAsset) => asset is TStableswap
  getMetaFromXYKPoolTokens: (tokens: PoolToken[]) => {
    symbol: string
    name: string
    iconId: string[]
    decimals: number
  } | null
}

const AssetsContext = createContext<TAssetsContext>({} as TAssetsContext)

export const useAssets = () => useContext(AssetsContext)

export const isToken = (asset: TAssetStored): asset is TToken =>
  asset.type === AssetType.TOKEN
export const isExternal = (asset: TAssetStored): asset is TExternal =>
  asset.type === AssetType.External
export const isBond = (asset: TAssetStored): asset is TBond =>
  asset.type === AssetType.BOND
export const isErc20 = (asset: TAssetStored): asset is TErc20 =>
  asset.type === AssetType.ERC20
export const isErc20AToken = (asset: TAssetStored): asset is TErc20AToken =>
  asset.type === AssetType.ERC20 &&
  "underlyingAssetId" in asset &&
  !!asset.underlyingAssetId
export const isStableSwap = (asset: TAssetStored): asset is TStableswap =>
  asset.type === AssetType.STABLESWAP

const fallbackAsset: TAsset = {
  id: "",
  name: "N/A",
  symbol: "N/a",
  decimals: 12,
  existentialDeposit: "0",
  parachainId: undefined,
  isSufficient: false,
  isTradable: false,
  type: AssetType.TOKEN,
  ecosystem: AssetEcosystem.POLKADOT,
}

export type TAsset = TAssetData

export type TShareToken = TAsset & {
  poolAddress: string
  assets: TAsset[]
}

export type XYKPoolMeta = {
  symbol: string
  name: string
  iconId: string[]
  decimals: number
}

export const AssetsProvider = ({ children }: { children: ReactNode }) => {
  const { assets, aTokenReverseMap } = useAssetRegistry()

  const {
    all,
    stableswap,
    bonds,
    external,
    externalInvalid,
    erc20,
    tradable,
    native,
    hub,
    tokens,
  } = useMemo(() => {
    return assets.reduce<TAssetsState>(
      (acc, asset) => {
        if (bannedAssets.includes(asset.id)) return acc

        if (
          isExternal(asset) &&
          asset.externalId &&
          ASSETHUB_ID_BLACKLIST.includes(asset.externalId)
        ) {
          return acc
        }

        if (isToken(asset)) {
          acc.tokens.push(asset)
        } else if (isStableSwap(asset)) {
          acc.stableswap.push(asset)
        } else if (isBond(asset)) {
          acc.bonds.push(asset)
        } else if (isExternal(asset)) {
          //   const externalId = externalTokens[dataEnv].find(
          //     (token) => token.internalId === asset.id,
          //   )?.id

          //const externalId = undefined

          //if (externalId) {
          acc.external.push({ ...asset })
          // } else if (asset.externalId) {
          //   acc.externalInvalid.push(asset)
          // }
        } else if (isErc20(asset)) {
          acc.erc20.push(asset)
        }

        acc.all.set(asset.id, asset)

        if (asset.isTradable) {
          acc.tradable.push(asset)
        }

        if (asset.id === NATIVE_ASSET_ID) {
          acc.native = asset
        }

        if (asset.id === HUB_ID) {
          acc.hub = asset
        }

        return acc
      },
      {
        all: new Map([]),
        tradable: [],
        tokens: [],
        stableswap: [],
        bonds: [],
        external: [],
        externalInvalid: [],
        erc20: [],
        native: {} as TAsset,
        hub: {} as TAsset,
      },
    )
  }, [assets])

  const getMetaFromXYKPoolTokens = useCallback(
    (tokens: PoolToken[]): XYKPoolMeta | null => {
      const assetA = all.get(tokens[0]?.id ?? "")
      const assetB = all.get(tokens[1]?.id ?? "")

      if (!assetA || !assetB) return null

      const decimals =
        Number(assetA.id) > Number(assetB.id)
          ? assetB.decimals
          : assetA.decimals
      const symbol = `${assetA.symbol}/${assetB.symbol}`
      const name = `${assetA.name.split(" (")[0]}/${assetB.name.split(" (")[0]}`
      const iconId = [
        isBond(assetA) ? assetA.underlyingAssetId : assetA.id,
        isBond(assetB) ? assetB.underlyingAssetId : assetB.id,
      ]

      return {
        symbol,
        name,
        iconId,
        decimals,
      }
    },
    [all],
  )

  const getAsset = useCallback((id: AssetId) => all.get(id.toString()), [all])
  const getAssetWithFallback = useCallback(
    (id: AssetId) => getAsset(id.toString()) ?? fallbackAsset,
    [getAsset],
  )
  const getAssets = useCallback(
    (ids: AssetId[]) => ids.map((id) => getAsset(id)),
    [getAsset],
  )

  const getExternalByExternalId = useCallback(
    (externalId: AssetId) =>
      [...external, ...externalInvalid].find(
        (token) => token.externalId === externalId.toString(),
      ),
    [external, externalInvalid],
  )
  const getBond = useCallback(
    (id: AssetId) => bonds.find((token) => token.id === id.toString()),
    [bonds],
  )

  const getErc20 = useCallback(
    (id: AssetId) => erc20.find((token) => token.id === id.toString()),
    [erc20],
  )

  const getErc20AToken = useCallback(
    (id: AssetId) => {
      const asset = getErc20(id)
      return asset && isErc20AToken(asset) ? asset : undefined
    },
    [getErc20],
  )

  const getRelatedAToken = useCallback(
    (id: AssetId) => {
      const aTokenId = aTokenReverseMap.get(id.toString()) ?? ""
      return getErc20(aTokenId)
    },
    [aTokenReverseMap, getErc20],
  )

  return (
    <AssetsContext.Provider
      value={{
        all,
        tokens,
        stableswap,
        bonds,
        external,
        externalInvalid,
        erc20,
        tradable,
        native,
        hub,
        getAsset,
        getAssets,
        getBond,
        getAssetWithFallback,
        getExternalByExternalId,
        getMetaFromXYKPoolTokens,
        getErc20,
        getErc20AToken,
        getRelatedAToken,
        isToken,
        isErc20AToken,
        isExternal,
        isBond,
        isErc20,
        isStableSwap,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}
