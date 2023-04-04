import { NATIVE_ASSET_ID, useApiPromise, useTradeRouter } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32, u8 } from "@polkadot/types"
import { Maybe, normalizeId, isNotNil } from "utils/helpers"
import { getAccountBalances, useAccountBalances } from "./accountBalances"
import { AccountId32 } from "@polkadot/types/interfaces"
import { PalletAssetRegistryAssetType } from "@polkadot/types/lookup"
import { getAssetsBalances } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { getAcceptedCurrency, getAccountCurrency } from "./payments"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { getApiIds } from "./consts"
import { getSpotPrice } from "./spotPrice"
import { getTokenLock } from "./balances"
import { getHubAssetTradability, getOmnipoolAssets } from "./omnipool"
import { BN_0 } from "utils/constants"

export const useAssetDetails = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assets, getAssetDetails(api), {
    select: (data) => data.find((i) => i.id === id?.toString()),
  })
}

interface AssetDetailsListFilter {
  assetType: PalletAssetRegistryAssetType["type"][]
}

export const useAssetTable = () => {
  const api = useApiPromise()
  const tradeRouter = useTradeRouter()

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

      const allAssets = await getAssetsTableDetails(api)()

      const tradeAssets = await tradeRouter.getAllAssets()

      const spotPricePromises = acceptedTokens.map((token) =>
        getSpotPrice(tradeRouter, token.id, apiIds.usdId ?? "")(),
      )
      const spotPrices = await Promise.all(spotPricePromises)
      const tokenLockPromises = acceptedTokens.map((token) =>
        getTokenLock(api, account.address, token.id)(),
      )

      const tokenLocks = await Promise.all(tokenLockPromises)

      const omnipoolAssets = await getOmnipoolAssets(api)()

      const hubAssetTradability = await getHubAssetTradability(api)()

      const assetsBalances = getAssetsBalances(
        balances.balances,
        spotPrices,
        allAssets,
        tokenLocks,
        balances.native,
      )

      return {
        allAssets,
        accountTokenId,
        tradeAssets,
        acceptedTokens,
        assetsBalances,
        apiIds,
        omnipoolAssets,
        hubAssetTradability,
      }
    },
    {
      enabled: !!account?.address,
    },
  )
}

export const useAssetDetailsList = (
  ids?: Maybe<u32 | string>[],
  filter: AssetDetailsListFilter = {
    assetType: ["Token"],
  },
) => {
  const api = useApiPromise()

  const normalizedIds = ids?.filter(isNotNil).map(normalizeId)

  return useQuery(QUERY_KEYS.assets, getAssetDetails(api), {
    select: (data) => {
      const normalized =
        normalizedIds != null
          ? data.filter((i) => normalizedIds?.includes(i.id))
          : data

      return normalized.filter((asset) =>
        filter.assetType.includes(asset.assetType),
      )
    },
  })
}

export const useAssetAccountDetails = (
  address: Maybe<AccountId32 | string>,
) => {
  const accountBalances = useAccountBalances(address)

  const ids = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []

  return useAssetDetailsList(ids)
}

const getAssetDetails = (api: ApiPromise) => async () => {
  const [system, entries] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
  ])

  const assets = entries.map(([key, data]) => {
    return {
      id: key.args[0].toString(),
      name: data.unwrap().name.toUtf8(),
      locked: data.unwrap().locked.toPrimitive(),
      assetType: data.unwrap().assetType.type,
      existentialDeposit: data.unwrap().existentialDeposit.toBigNumber(),
    }
  })

  if (!assets.find((i) => i.id === NATIVE_ASSET_ID)) {
    assets.push({
      id: NATIVE_ASSET_ID,
      locked: false,
      name: system.tokenSymbol.unwrap()[0].toString(),
      assetType: "Token",
      existentialDeposit: BN_0,
    })
  }

  return assets
}

export const getAssetsTableDetails = (api: ApiPromise) => async () => {
  const [system, rawAssetsData, rawAssetsMeta] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
    api.query.assetRegistry.assetMetadataMap.entries(),
  ])

  const assetsMeta: Array<{
    id: string
    symbol: string
    decimals: u8 | u32
  }> = rawAssetsMeta.map(([key, data]) => {
    return {
      id: key.args[0].toString(),
      symbol: data.unwrap().symbol.toUtf8(),
      decimals: data.unwrap().decimals,
    }
  })

  if (!assetsMeta.find((i) => i.id === NATIVE_ASSET_ID)) {
    const [decimals] = system.tokenDecimals.unwrap()
    const [symbol] = system.tokenSymbol.unwrap()

    assetsMeta.push({
      id: NATIVE_ASSET_ID,
      symbol: symbol.toString(),
      decimals,
    })
  }

  const assets = rawAssetsData.map(([key, data]) => {
    const { symbol = "N/A", decimals } =
      assetsMeta.find(
        (assetMeta) => assetMeta.id.toString() === key.args[0].toString(),
      ) || {}

    return {
      id: key.args[0].toString(),
      name: data.unwrap().name.toUtf8() || getAssetName(symbol),
      locked: data.unwrap().locked.toPrimitive(),
      assetType: data.unwrap().assetType.type,
      symbol,
      decimals,
    }
  })

  if (!assets.find((i) => i.id === NATIVE_ASSET_ID)) {
    const { symbol = "N/A", decimals } =
      assetsMeta.find(
        (assetMeta) => assetMeta.id.toString() === NATIVE_ASSET_ID,
      ) || {}

    assets.push({
      id: NATIVE_ASSET_ID,
      locked: false,
      name: system.tokenSymbol.unwrap()[0].toString() || getAssetName(symbol),
      assetType: "Token",
      symbol,
      decimals,
    })
  }

  return assets
}
