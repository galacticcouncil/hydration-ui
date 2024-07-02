import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { Maybe, undefinedNoop } from "utils/helpers"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { calculateFreeBalance } from "./balances"

export const useAccountBalances = (
  id: Maybe<AccountId32 | string>,
  noRefresh?: boolean,
) => {
  const { api } = useRpcProvider()
  return useQuery(
    noRefresh
      ? QUERY_KEYS.accountBalances(id)
      : QUERY_KEYS.accountBalancesLive(id),
    !!id ? getAccountBalances(api, id) : undefinedNoop,
    { enabled: id != null },
  )
}

export const useAccountsBalances = (ids: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.accountsBalances(ids), () =>
    Promise.all(ids.map((id) => getAccountBalances(api, id)())),
  )
}

export const getAccountBalances =
  (api: ApiPromise, accountId: AccountId32 | string) => async () => {
    const [tokens, nativeData] = await Promise.all([
      api.query.tokens.accounts.entries(accountId),
      api.query.system.account(accountId),
    ])
    const balances = tokens.map(([key, data]) => {
      const [, id] = key.args

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

    const freeBalance = new BigNumber(nativeData.data.free.toHex())

    const frozenBalance = new BigNumber(nativeData.data.frozen.toHex())
    const reservedBalance = new BigNumber(nativeData.data.reserved.toHex())

    const balance = freeBalance.minus(frozenBalance)

    const native = {
      accountId: accountId.toString(),
      id: NATIVE_ASSET_ID,
      balance,
      total: freeBalance.plus(reservedBalance),
      reservedBalance,
      freeBalance,
    }

    return { native, balances, accountId }
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
