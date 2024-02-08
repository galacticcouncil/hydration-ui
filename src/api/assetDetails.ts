import { ApiPromise } from "@polkadot/api"
import { Option } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
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
import { Asset, PoolService, PoolType, TradeRouter } from "@galacticcouncil/sdk"
import { BN_0 } from "utils/constants"

export const useAssetTable = (givenAddress?: string) => {
  const { api, assets } = useRpcProvider()
  const { account } = useAccount()

  const address = givenAddress ?? account?.address

  return useQuery(
    QUERY_KEYS.assetsTable(address),
    async () => {
      if (!address) return undefined

      const balances = await getAccountBalances(api, address)()

      const allAcceptedTokens = [
        NATIVE_ASSET_ID,
        ...(balances.balances ?? []).map((balance) => balance.id),
      ].map((id) => getAcceptedCurrency(api, id)())

      const acceptedTokens = await Promise.all(allAcceptedTokens)

      const accountTokenId = await getAccountCurrency(api, address)()

      const apiIds = await getApiIds(api)()

      const tradeAssets = assets.tradeAssets

      const tokenLockPromises = acceptedTokens.map((token) =>
        getTokenLock(api, address, token.id)(),
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
    { enabled: !!address },
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
  isShareToken: boolean
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
  isTradable: boolean
}

export type TToken = TAssetCommon & {
  assetType: "Token"
}

export type TStableSwap = TAssetCommon & {
  assetType: "StableSwap"
  assets: string[]
}

export type TShareToken = TAssetCommon & {
  assetType: "ShareToken"
  assets: string[]
  poolAddress: string | undefined
}

export type TAsset = TToken | TBond | TStableSwap | TShareToken

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
  isShareToken: false,
  isNative: false,
}

export const getAssets = async (api: ApiPromise) => {
  const poolService = new PoolService(api)
  const traderRoutes = [
    PoolType.Omni,
    PoolType.Stable,
    PoolType.XYK,
    PoolType.LBP,
  ]

  const tradeRouter = new TradeRouter(poolService, {
    includeOnly: traderRoutes,
  })

  let rawTradeAssets: Asset[] = []

  try {
    rawTradeAssets = await tradeRouter.getAllAssets()
  } catch (e) {}

  //TODO: remove after migrating to new asset registry
  const rawAssetsMeta = api.query.assetRegistry.assetMetadataMap
    ? await api.query.assetRegistry.assetMetadataMap.entries()
    : undefined

  const [
    system,
    rawAssetsData,
    rawAssetsLocations,
    hubAssetId,
    isReferralsEnabled,
  ] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
    api.query.assetRegistry.assetLocations.entries(),
    api.consts.omnipool.hubAssetId,
    api.query.referrals,
  ])

  const tokens: TToken[] = []
  const bonds: TBond[] = []
  const stableswap: TStableSwap[] = []
  const shareTokensRaw = []

  for (const [key, dataRaw] of rawAssetsData) {
    if (!dataRaw.isNone) {
      const data = dataRaw.unwrap()
      const id = key.args[0].toString()

      const assetType = data.assetType.type

      const isToken = assetType === "Token"
      const isBond = assetType === "Bond"
      const isStableSwap = assetType === "StableSwap"
      //@ts-ignore
      const isShareToken = assetType === (!!rawAssetsMeta ? "PoolShare" : "XYK")

      let meta
      if (rawAssetsMeta) {
        const assetsMeta = rawAssetsMeta
          .find((meta) => meta[0].args[0].toString() === id)?.[1]
          .unwrap()

        meta = {
          decimals: assetsMeta?.decimals.toNumber() ?? 12,
          symbol: assetsMeta?.symbol.toUtf8() ?? "N/a",
        }
      } else {
        meta = {
          //@ts-ignore
          decimals: Number(data.decimals.toString()) as number,
          //@ts-ignore
          symbol: data.symbol.toHuman() as string,
        }
      }

      const assetCommon = {
        id,
        isToken,
        isBond,
        isStableSwap,
        isShareToken,
        isNative: false,
        existentialDeposit: data.existentialDeposit.toBigNumber(),
        parachainId: undefined,
        name: data.name.toHuman() as string,
        ...meta,
      }

      if (isToken) {
        if (id === NATIVE_ASSET_ID) {
          const asset: TToken = {
            ...assetCommon,
            name: "HydraDX",
            symbol: system.tokenSymbol.unwrap()[0].toString(),
            decimals: system.tokenDecimals.unwrap()[0].toNumber(),
            isNative: true,
            assetType,
          }
          tokens.push(asset)
        } else {
          const location = rawAssetsLocations.find(
            (location) => location[0].args[0].toString() === id,
          )?.[1]
          //@ts-ignore
          const asset: TToken = {
            ...assetCommon,
            parachainId:
              location && !location.isNone
                ? getTokenParachainId(location)
                : undefined,
          }

          tokens.push(asset)
        }
      } else if (isBond) {
        const detailsRaw = await api.query.bonds.bonds(id)

        if (!detailsRaw.isNone) {
          const details = detailsRaw.unwrap()
          const [assetId, maturity] = details ?? []

          let underlyingAsset: { symbol: string; decimals: number } | undefined

          if (assetId.toString() === NATIVE_ASSET_ID) {
            underlyingAsset = {
              symbol: system.tokenSymbol.unwrap()[0].toString(),
              decimals: system.tokenDecimals.unwrap()[0].toNumber(),
            }
          } else {
            const meta = (rawAssetsMeta ?? rawAssetsData).find(
              (meta) => meta[0].args[0].toString() === assetId.toString(),
            )
            if (meta) {
              const underlyingAssetMeta = meta[1].unwrap()
              underlyingAsset = {
                decimals: Number(
                  //@ts-ignore
                  underlyingAssetMeta.decimals.toString(),
                ) as number,
                //@ts-ignore
                symbol: underlyingAssetMeta.symbol.toHuman() as string,
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
              (location) =>
                location[0].args[0].toString() === assetId.toString(),
            )?.[1]

            const isTradable = rawTradeAssets.some(
              (tradeAsset) => tradeAsset.id === id,
            )

            const asset: TBond = {
              ...assetCommon,
              assetId: assetId.toString(),
              name,
              assetType: "Bond",
              parachainId:
                location && !location.isNone
                  ? getTokenParachainId(location)
                  : undefined,
              decimals,
              symbol,
              maturity: maturity.toNumber(),
              isTradable,
            }

            bonds.push(asset)
          }
        }
      } else if (isStableSwap) {
        const decimals = 18

        const detailsRaw = await api.query.stableswap.pools(id)

        if (detailsRaw && !detailsRaw.isNone) {
          const details = detailsRaw.unwrap()
          const assets = details.assets.map((asset: any) => asset.toString())

          const name = assets
            .map((assetId: string) => {
              if (assetId === NATIVE_ASSET_ID) {
                return system.tokenSymbol.unwrap()[0].toString()
              }

              const meta = (rawAssetsMeta ?? rawAssetsData)
                .find((meta) => meta[0].args[0].toString() === assetId)?.[1]
                .unwrap()

              if (meta) {
                // @ts-ignore
                return meta.symbol.toHuman() as string
              }

              return "N/A"
            })
            .join("/")

          const asset: TStableSwap = {
            ...assetCommon,
            assetType: "StableSwap",
            decimals,
            assets,
            name,
          }
          stableswap.push(asset)
        }
      } else if (isShareToken) {
        const poolAddresses = await api.query.xyk.shareToken.entries()
        const poolAddress = poolAddresses
          .find(
            (poolAddress) => poolAddress[1].toString() === assetCommon.id,
          )?.[0]
          .args[0].toString()

        if (poolAddress) {
          const poolAssets = await api.query.xyk.poolAssets(poolAddress)
          const assets = poolAssets
            .unwrap()
            .map((poolAsset) => poolAsset.toString())

          shareTokensRaw.push({
            ...assetCommon,
            assets,
            poolAddress,
          })
        }
      }
    }
  }

  const native = tokens.find((token) => token.id === NATIVE_ASSET_ID) as TToken
  const hub = tokens.find(
    (token) => token.id === hubAssetId.toString(),
  ) as TToken

  const shareTokens = shareTokensRaw.reduce<Array<TShareToken>>(
    (acc, shareToken) => {
      const [assetAId, assetBId] = shareToken.assets

      const assetA = [...tokens, ...bonds].find(
        (token) => token.id === assetAId,
      ) as TToken
      const assetB = [...tokens, ...bonds].find(
        (token) => token.id === assetBId,
      ) as TToken

      if (assetA && assetB) {
        const assetDecimal =
          Number(assetA.id) > Number(assetB.id) ? assetB : assetA

        const decimals = assetDecimal.decimals
        const symbol = `${assetA.symbol}/${assetB.symbol}`
        const name = `${assetA.name.split(" (")[0]}/${
          assetB.name.split(" (")[0]
        }`

        acc.push({
          ...shareToken,
          decimals,
          symbol,
          name,
          assetType: "ShareToken",
        })
      }
      return acc
    },
    [],
  )

  const all = [...tokens, ...bonds, ...stableswap, ...shareTokens]

  const allTokensObject = all.reduce<Record<string, TAsset>>(
    (acc, asset) => ({ ...acc, [asset.id]: asset }),
    {},
  )
  const isStableSwap = (asset: TAsset): asset is TStableSwap =>
    asset.isStableSwap

  const isBond = (asset: TAsset): asset is TBond => asset.isBond

  const isShareToken = (asset: TAsset): asset is TShareToken =>
    asset.isShareToken

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
      shareTokens,
      native,
      hub,
      tradeAssets,
      getAsset,
      getBond,
      getAssets,
      isStableSwap,
      isBond,
      isShareToken,
    },
    tradeRouter,
    featureFlags: {
      referrals: !!isReferralsEnabled,
    },
  }
}
