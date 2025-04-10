import { PoolToken } from "@galacticcouncil/sdk"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react"

import {
  AssetType,
  TAssetData,
  TBond,
  TErc20,
  TExternal,
  TStableswap,
  TToken,
} from "@/api/assets"
import { TAssetStored, useAssetRegistry } from "@/states/assetRegistry"
import { HUB_ID, NATIVE_ASSET_ID } from "@/utils/consts"
import { ASSETHUB_ID_BLACKLIST } from "@/utils/externalAssets"

const bannedAssets = ["1000042"]

type TAssetsContext = {
  all: Map<string, TAsset>
  tokens: TAsset[]
  stableswap: TStableswap[]
  bonds: TBond[]
  external: TExternal[]
  externalInvalid: TExternal[]
  erc20: TAsset[]
  tradable: TAsset[]
  native: TAsset
  hub: TAsset
  getAsset: (id: string) => TAsset | undefined
  getAssets: (ids: string[]) => (TAsset | undefined)[]
  getBond: (id: string) => TBond | undefined
  getAssetWithFallback: (id: string) => TAsset
  getExternalByExternalId: (externalId: string) => TExternal | undefined
  getErc20: (id: string) => TErc20 | undefined
  isToken: (asset: TAsset) => asset is TToken
  isExternal: (asset: TAsset) => asset is TExternal
  isBond: (asset: TAsset) => asset is TBond
  isErc20: (asset: TAsset) => asset is TErc20
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

const isToken = (asset: TAssetStored): asset is TToken =>
  asset.type === AssetType.TOKEN
const isExternal = (asset: TAssetStored): asset is TExternal =>
  asset.type === AssetType.External
const isBond = (asset: TAssetStored): asset is TBond =>
  asset.type === AssetType.BOND
const isErc20 = (asset: TAssetStored): asset is TErc20 =>
  asset.type === AssetType.ERC20
const isStableSwap = (asset: TAssetStored): asset is TStableswap =>
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
  const { assets, metadata } = useAssetRegistry()
  //const dataEnv = useProviderRpcUrlStore.getState().getDataEnv()
  //const degenMode = useSettingsStore.getState().degenMode
  //   const { tokens: externalTokens } =
  //     degenMode && ExternalAssetCursor.deref()
  //       ? ExternalAssetCursor.deref().state
  //       : useUserExternalTokenStore.getState()
  console.log("Loading stored assets from local storage")
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
    const chains = metadata.chainsMetadata?.items
    return assets.reduce<{
      all: Map<string, TAsset>
      tradable: TAsset[]
      tokens: TAsset[]
      stableswap: TStableswap[]
      bonds: TBond[]
      external: TExternal[]
      externalInvalid: TExternal[]
      erc20: TErc20[]
      native: TAsset
      hub: TAsset
    }>(
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
          const chainSrc = chains?.find((item) =>
            item.includes(`${asset.ecosystem}/${asset.parachainId}`),
          )

          asset.srcChain = chainSrc

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
  }, [assets, metadata])

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

  const getAsset = useCallback((id: string) => all.get(id), [all])
  const getAssetWithFallback = useCallback(
    (id: string) => getAsset(id) ?? fallbackAsset,
    [getAsset],
  )
  const getAssets = useCallback(
    (ids: string[]) => ids.map((id) => getAsset(id)),
    [getAsset],
  )

  const getExternalByExternalId = useCallback(
    (externalId: string) =>
      [...external, ...externalInvalid].find(
        (token) => token.externalId === externalId,
      ),
    [external, externalInvalid],
  )
  const getBond = useCallback(
    (id: string) => bonds.find((token) => token.id === id),
    [bonds],
  )

  const getErc20 = useCallback(
    (id: string) => erc20.find((token) => token.id === id),
    [erc20],
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
        isToken,
        getErc20,
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
