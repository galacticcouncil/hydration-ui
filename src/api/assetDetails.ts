import { ApiPromise } from "@polkadot/api"
import { Option } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { useQuery } from "@tanstack/react-query"
import { useAccountStore } from "state/store"
import { NATIVE_ASSET_ID } from "utils/api"
import { Maybe } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAccountBalances, useAccountBalances } from "./accountBalances"
import { getTokenLock } from "./balances"
import { getApiIds } from "./consts"
import { getHubAssetTradability, getOmnipoolAssets } from "./omnipool"
import { getAcceptedCurrency, getAccountCurrency } from "./payments"
import BN from "bignumber.js"
import { format } from "date-fns"
import { useRpcProvider } from "providers/rpcProvider"
import { PoolService, PoolType, TradeRouter } from "@galacticcouncil/sdk"
import { BN_0 } from "utils/constants"

export const useAssetTable = () => {
  const { api, assets } = useRpcProvider()
  const { account } = useAccountStore()

  return useQuery(
    QUERY_KEYS.assetsTable(account?.address),
    async () => {
      if (!account?.address) return undefined

      const balances = await getAccountBalances(api, account.address)()

      const allAcceptedTokens = [
        NATIVE_ASSET_ID,
        ...(balances.balances ?? []).map((balance) => balance.id),
      ].map((id) => getAcceptedCurrency(api, id)())

      const acceptedTokens = await Promise.all(allAcceptedTokens)

      const accountTokenId = await getAccountCurrency(api, account.address)()

      const apiIds = await getApiIds(api)()

      const tradeAssets = assets.tradeAssets

      const tokenLockPromises = acceptedTokens.map((token) =>
        getTokenLock(api, account.address, token.id)(),
      )
      const tokenLocks = await Promise.all(tokenLockPromises)

      const omnipoolAssets = await getOmnipoolAssets(api)()

      const hubAssetTradability = await getHubAssetTradability(api)()

      return {
        balances,
        accountTokenId,
        tradeAssets,
        acceptedTokens,
        tokenLocks,
        apiIds,
        omnipoolAssets,
        hubAssetTradability,
      }
    },
    { enabled: !!account?.address },
  )
}

export const useAcountAssets = (address: Maybe<AccountId32 | string>) => {
  const { assets } = useRpcProvider()
  const accountBalances = useAccountBalances(address)

  const tokenBalances = accountBalances.data?.balances
    ? accountBalances.data.balances.map((balance) => {
        const asset = assets.getAsset(balance.id)

        return { asset, balance }
      })
    : []
  if (accountBalances.data?.native)
    tokenBalances.unshift({
      balance: accountBalances.data.native,
      asset: assets.native,
    })

  return tokenBalances
}

type AssetType = "Token" | "Bond" | "StableSwap" | "PoolShare"

const getTokenParachainId = (
  rawLocation: Option<HydradxRuntimeXcmAssetLocation>,
) => {
  const location = rawLocation.unwrap()

  const type = location.interior.type
  if (location.interior && type !== "Here") {
    const xcm = location.interior[`as${type}`]

    const parachainId = !Array.isArray(xcm)
      ? xcm.asParachain.unwrap().toString()
      : xcm
          .find((el) => el.isParachain)
          ?.asParachain.unwrap()
          .toString()

    return parachainId
  }
}

type TAssetCommon = {
  id: string
  existentialDeposit: BN
  isToken: boolean
  isBond: boolean
  isStableSwap: boolean
  isNative: boolean
  symbol: string
  decimals: number
  name: string
  parachainId: string | undefined
}

export type TBond = TAssetCommon & {
  assetType: "Bond"
  assetId: string
  maturity: number
  isPast: boolean
}

export type TToken = TAssetCommon & {
  assetType: "Token"
}

export type TStableSwap = TAssetCommon & {
  assetType: "StableSwap"
  assets: string[]
}

export type TAsset = TToken | TBond | TStableSwap

export const isStableswap = (asset: TAsset): asset is TStableSwap => asset.isStableSwap

const fallbackAsset: TToken = {
  id: "",
  name: "N/A",
  symbol: "N/a",
  decimals: 12,
  assetType: "Token",
  existentialDeposit: BN_0,
  parachainId: undefined,
  isToken: false,
  isBond: false,
  isStableSwap: false,
  isNative: false,
}

export const getAssets = async (api: ApiPromise) => {
  const poolService = new PoolService(api)
  const tradeRouter = new TradeRouter(poolService, {
    includeOnly: [PoolType.Omni, PoolType.LBP],
  })

  const [
    system,
    rawAssetsData,
    rawAssetsMeta,
    rawAssetsLocations,
    rawTradeAssets,
  ] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
    api.query.assetRegistry.assetMetadataMap.entries(),
    api.query.assetRegistry.assetLocations.entries(),
    tradeRouter.getAllAssets(),
  ])

  const tokens: TToken[] = []
  const bonds: TBond[] = []
  const stableswap: TStableSwap[] = []

  for (const [key, dataRaw] of rawAssetsData) {
    const data = dataRaw.unwrap()
    const id = key.args[0].toString()

    const assetType = data.assetType.type as AssetType

    const isToken = assetType === "Token"
    const isBond = assetType === "Bond"
    const isStableSwap = assetType === "StableSwap"

    const assetCommon = {
      id,
      isToken,
      isBond,
      isStableSwap,
      isNative: false,
      existentialDeposit: data.existentialDeposit.toBigNumber(),
      parachainId: undefined,
    }

    if (isToken) {
      if (id === NATIVE_ASSET_ID) {
        const asset: TToken = {
          ...assetCommon,
          name: "Hydra",
          symbol: system.tokenSymbol.unwrap()[0].toString(),
          decimals: system.tokenDecimals.unwrap()[0].toNumber(),
          isNative: true,
          assetType,
        }
        tokens.push(asset)
      }
      const name = data.name.toUtf8()

      const location = rawAssetsLocations.find(
        (location) => location[0].args[0].toString() === id,
      )?.[1]

      const meta = rawAssetsMeta
        .find((meta) => meta[0].args[0].toString() === id)?.[1]
        .unwrap()

      /* meta data should exist for each Token asset */
      if (meta) {
        const asset: TToken = {
          ...assetCommon,
          name,
          assetType,
          parachainId: location ? getTokenParachainId(location) : undefined,
          decimals: meta.decimals.toNumber(),
          symbol: meta.symbol.toUtf8(),
        }

        tokens.push(asset)
      }
    } else if (isBond) {
      const detailsRaw = await api.query.bonds.bonds(id)
      // @ts-ignore
      const details = detailsRaw.unwrap()

      const [assetId, maturity] = details ?? []

      let underlyingAsset: { symbol: string; decimals: number } | undefined

      if (assetId.toString() === NATIVE_ASSET_ID) {
        underlyingAsset = {
          symbol: system.tokenSymbol.unwrap()[0].toString(),
          decimals: system.tokenDecimals.unwrap()[0].toNumber(),
        }
      } else {
        const meta = rawAssetsMeta.find(
          (meta) => meta[0].args[0].toString() === assetId.toString(),
        )
        if (meta) {
          const underlyingAssetMeta = meta[1].unwrap()
          underlyingAsset = {
            symbol: underlyingAssetMeta.symbol.toUtf8(),
            decimals: underlyingAssetMeta.decimals.toNumber(),
          }
        }
      }

      if (underlyingAsset) {
        const symbol = `${underlyingAsset.symbol}b`
        const name = `${underlyingAsset.symbol} Bond ${format(
          new Date(maturity.toNumber()),
          "dd/MM/yyyy",
        )}`
        const decimals = underlyingAsset.decimals

        const location = rawAssetsLocations.find(
          (location) => location[0].args[0].toString() === assetId.toString(),
        )?.[1]

        const isPast = !rawTradeAssets.some(
          (tradeAsset) => tradeAsset.id === id,
        )

        const asset: TBond = {
          ...assetCommon,
          assetId: assetId.toString(),
          name,
          assetType: "Bond",
          parachainId: location ? getTokenParachainId(location) : undefined,
          decimals,
          symbol,
          maturity: maturity.toNumber(),
          isPast,
        }

        bonds.push(asset)
      }
    } else if (isStableSwap) {
      const symbol = "SPS"
      const decimals = 18

      const detailsRaw = await api.query.stableswap.pools(id)
      // @ts-ignore
      const details = detailsRaw.unwrap()
      const assets = details.assets.map((asset: any) => asset.toString())

      const name = assets
        .map((assetId: string) => {
          if (assetId === NATIVE_ASSET_ID) {
            return system.tokenSymbol.unwrap()[0].toString()
          }

          const meta = rawAssetsMeta
            .find((meta) => meta[0].args[0].toString() === assetId)?.[1]
            .unwrap()

          if (meta) {
            return meta.symbol.toUtf8()
          }

          return "N/A"
        })
        .join("/")

      const asset: TStableSwap = {
        ...assetCommon,
        assetType: "StableSwap",
        symbol,
        decimals,
        assets,
        name,
      }
      stableswap.push(asset)
    }
  }

  const native = tokens.find((token) => token.id === NATIVE_ASSET_ID) as TToken

  const all = [...tokens, ...bonds, ...stableswap]

  const allTokensObject = all.reduce<Record<string, TAsset>>(
    (acc, asset) => ({ ...acc, [asset.id]: asset }),
    {},
  )
  const isBond = (asset: TAsset): asset is TBond => asset.isBond
  const getAsset = (id: string) => allTokensObject[id] ?? fallbackAsset

  const getBond = (id: string) => {
    const asset = allTokensObject[id] ?? fallbackAsset

    if (isBond(asset)) return asset
  }

  const getAssets = (ids: string[]) => ids.map((id) => getAsset(id))

  const tradeAssets = rawTradeAssets.map((tradeAsset) =>
    getAsset(tradeAsset.id),
  )

  return {
    assets: {
      all,
      tokens,
      bonds,
      stableswap,
      native,
      tradeAssets,
      getAsset,
      getBond,
      getAssets,
      isBond,
    },
    tradeRouter,
  }
}
