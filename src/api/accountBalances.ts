import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { Maybe, undefinedNoop } from "utils/helpers"
import { u32, Vec } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { parseBalanceData } from "./balances"
import { ITuple } from "@polkadot/types-codec/types"
import { OrmlTokensAccountData } from "@polkadot/types/lookup"

export const useAccountBalances = (
  address: Maybe<AccountId32 | string>,
  noRefresh?: boolean,
) => {
  const { api, isLoaded } = useRpcProvider()
  return useQuery(
    noRefresh
      ? QUERY_KEYS.accountBalances(address)
      : QUERY_KEYS.accountBalancesLive(address),
    !!address ? getAccountBalances(api, address) : undefinedNoop,
    { enabled: address != null && isLoaded },
  )
}

export const useAccountsBalances = (addresses: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.accountsBalances(addresses),
    () =>
      Promise.all(
        addresses.map((address) => getAccountBalances(api, address)()),
      ),
    { enabled: !!addresses.length },
  )
}

export const getAccountBalanceData = async (
  api: ApiPromise,
  accountId: AccountId32 | string,
) => {
  return await api.call.currenciesApi.accounts<
    Vec<ITuple<[u32, OrmlTokensAccountData]>>
  >(accountId.toString())
}

export const getAccountBalances = (
  api: ApiPromise,
  accountId: AccountId32 | string,
) => {
  return async () => {
    const tokens = await getAccountBalanceData(api, accountId.toString())

    const balances = tokens.map(([id, data]) => {
      return parseBalanceData(data, id.toString(), accountId.toString())
    })

    const native = balances.find(
      ({ assetId }) => assetId === NATIVE_ASSET_ID,
    ) ?? {
      accountId: accountId.toString(),
      assetId: NATIVE_ASSET_ID,
      balance: new BigNumber(0),
      total: new BigNumber(0),
      freeBalance: new BigNumber(0),
      reservedBalance: new BigNumber(0),
    }

    return { native, balances, accountId }
  }
}

export const getAccountAssetBalances =
  (
    api: ApiPromise,
    pairs: Array<[address: AccountId32 | string, assetId: u32 | string]>,
  ) =>
  async () => {
    const [tokens, natives] = await Promise.all([
      api.query.tokens.accounts.multi(
        pairs.filter(([_, assetId]) => assetId.toString() !== NATIVE_ASSET_ID),
      ),
      api.query.system.account.multi(
        pairs
          .filter(([_, assetId]) => assetId.toString() === NATIVE_ASSET_ID)
          .map(([account]) => account),
      ),
    ])

    const values: Array<{
      free: BigNumber
      reserved: BigNumber
      frozen: BigNumber
      assetId: string
    }> = []
    for (
      let tokenIdx = 0, nativeIdx = 0;
      tokenIdx + nativeIdx < pairs.length;

    ) {
      const idx = tokenIdx + nativeIdx
      const [, assetId] = pairs[idx]

      if (assetId.toString() === NATIVE_ASSET_ID) {
        values.push({
          assetId: assetId.toString(),
          free: natives[nativeIdx].data.free.toBigNumber(),
          reserved: natives[nativeIdx].data.reserved.toBigNumber(),
          frozen: natives[nativeIdx].data.frozen.toBigNumber(),
        })

        nativeIdx += 1
      } else {
        values.push({
          assetId: assetId.toString(),
          free: tokens[tokenIdx].free.toBigNumber(),
          reserved: tokens[tokenIdx].reserved.toBigNumber(),
          frozen: tokens[tokenIdx].frozen.toBigNumber(),
        })

        tokenIdx += 1
      }
    }

    return values
  }
