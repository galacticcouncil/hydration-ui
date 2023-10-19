import { AccountId32 } from "@polkadot/types/interfaces"
import { NATIVE_ASSET_ID } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { Maybe, undefinedNoop } from "utils/helpers"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import BN from "bn.js"
import { useRpcProvider } from "providers/rpcProvider"
import { calculateFreeBalance } from "./balances"
import { BN_0 } from "utils/constants"

export const useAccountBalances = (id: Maybe<AccountId32 | string>) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountBalances(id),
    !!id ? getAccountBalancesNew(api, id) : undefinedNoop,
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
    const [tokens, native] = await Promise.all([
      api.query.tokens.accounts.entries(accountId),
      api.query.system.account(accountId),
    ])
    const balances = tokens.map(([key, data]) => {
      const [, id] = key.args
      return { id, data }
    })

    return { accountId, native, balances }
  }

export const getAccountBalancesNew =
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
        calculateFreeBalance(freeBalance, BN_0, frozenBalance) ?? NaN,
      )

      return {
        accountId: accountId.toString(),
        id: id.toString(),
        balance,
        total: freeBalance.plus(reservedBalance),
        freeBalance,
      }
    })

    const freeBalance = new BigNumber(nativeData.data.free.toHex())
    const miscFrozenBalance = new BigNumber(nativeData.data.miscFrozen.toHex())
    const feeFrozenBalance = new BigNumber(nativeData.data.feeFrozen.toHex())
    const reservedBalance = new BigNumber(nativeData.data.reserved.toHex())

    const balance = new BigNumber(
      calculateFreeBalance(freeBalance, miscFrozenBalance, feeFrozenBalance),
    )

    const native = {
      accountId: accountId.toString(),
      id: NATIVE_ASSET_ID,
      balance,
      total: freeBalance.plus(reservedBalance),
      freeBalance,
    }

    return { native, balances }
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
      free: BN
      reserved: BN
      frozen: BN
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
          free: natives[nativeIdx].data.free,
          reserved: natives[nativeIdx].data.reserved,
          frozen: natives[nativeIdx].data.feeFrozen.add(
            natives[nativeIdx].data.miscFrozen,
          ),
        })

        nativeIdx += 1
      } else {
        values.push({
          assetId: assetId.toString(),
          free: tokens[tokenIdx].free,
          reserved: tokens[tokenIdx].reserved,
          frozen: tokens[tokenIdx].frozen,
        })

        tokenIdx += 1
      }
    }

    return values
  }
