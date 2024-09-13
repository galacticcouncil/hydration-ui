import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { Maybe, undefinedNoop } from "utils/helpers"
import { u32, StorageKey } from "@polkadot/types"
import { OrmlTokensAccountData } from "@polkadot/types/lookup"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { calculateFreeBalance } from "./balances"

export const useAccountBalances = (
  id: Maybe<AccountId32 | string>,
  noRefresh?: boolean,
) => {
  const { api, isLoaded } = useRpcProvider()
  return useQuery(
    noRefresh
      ? QUERY_KEYS.accountBalances(id)
      : QUERY_KEYS.accountBalancesLive(id),
    !!id ? getAccountBalances(api, id) : undefinedNoop,
    { enabled: id != null && isLoaded },
  )
}

export const useAccountsBalances = (ids: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.accountsBalances(ids), () =>
    Promise.all(ids.map((id) => getAccountBalances(api, id)())),
  )
}

export const createAccountBalancesFetcher =
  (api: ApiPromise) => async (accountId: AccountId32 | string) => {
    const params = api.createType("AccountId", accountId)
    const result = await api.rpc.state.call(
      "CurrenciesApi_accounts",
      params.toHex(),
    )
    const balances = api.createType(
      "Vec<(AssetId, OrmlTokensAccountData)>",
      result,
    )

    return balances as unknown as [StorageKey<[u32]>, OrmlTokensAccountData][]
  }

export const getAccountBalances = (
  api: ApiPromise,
  accountId: AccountId32 | string,
) => {
  const fetchAccountBalances = createAccountBalancesFetcher(api)

  return async () => {
    const tokens = await fetchAccountBalances(accountId)

    const balances = tokens.map(([id, data]) => {
      const freeBalance = new BigNumber(data.free.toHex())
      const reservedBalance = new BigNumber(data.reserved.toHex())
      const frozenBalance = new BigNumber(data.frozen.toHex())
      const balance = new BigNumber(
        calculateFreeBalance(freeBalance, frozenBalance) ?? NaN,
      )

      return {
        accountId: accountId.toString(),
        id: id.toString(),
        balance,
        total: freeBalance.plus(reservedBalance),
        reservedBalance,
        freeBalance,
      }
    })

    const native = balances.find(({ id }) => id === NATIVE_ASSET_ID)

    return { native, balances, accountId }
  }
}

export const useAccountAssetBalances = (
  pairs: Array<[address: AccountId32 | string, assetId: u32 | string]>,
) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountAssetBalances(pairs),
    pairs != null ? getAccountAssetBalances(api, pairs) : undefinedNoop,
    { enabled: pairs.length > 0 },
  )
}

const getAccountAssetBalances =
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
