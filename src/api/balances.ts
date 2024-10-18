import { NATIVE_ASSET_ID } from "utils/api"
import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import {
  PalletBalancesAccountData,
  OrmlTokensAccountData,
} from "@polkadot/types/lookup"

export type TBalance = ReturnType<typeof parseBalanceData>

export const parseBalanceData = (
  data: PalletBalancesAccountData | OrmlTokensAccountData,
  id: string,
  address: string,
) => {
  const freeBalance = new BigNumber(data.free.toHex())
  const frozenBalance = new BigNumber(data.frozen.toHex())
  const reservedBalance = new BigNumber(data.reserved.toHex())
  const balance = freeBalance.minus(frozenBalance)

  return {
    accountId: address,
    assetId: id,
    balance,
    total: freeBalance.plus(reservedBalance),
    freeBalance,
    reservedBalance,
  }
}

const createTokenBalanceFetcher =
  (api: ApiPromise) =>
  async (account: AccountId32 | string, id: string | u32) => {
    const params = api.createType("(AssetId, AccountId)", [id, account])
    const result = await api.rpc.state.call(
      "CurrenciesApi_account",
      params.toHex(),
    )
    return api.createType<OrmlTokensAccountData>(
      "OrmlTokensAccountData",
      result,
    )
  }

export const getTokenBalance = (
  api: ApiPromise,
  account: AccountId32 | string,
  id: string | u32,
) => {
  const fetchTokenBalance = createTokenBalanceFetcher(api)

  return async () => {
    const res = await fetchTokenBalance(account, id)

    return parseBalanceData(res, id.toString(), account.toString())
  }
}

export const useTokenBalance = (
  id: Maybe<string | u32>,
  address: Maybe<AccountId32 | string>,
) => {
  const { api, isLoaded } = useRpcProvider()

  const enabled = !!id && !!address && isLoaded

  return useQuery(
    QUERY_KEYS.tokenBalance(id, address),
    enabled ? getTokenBalance(api, address, id) : undefinedNoop,
    { enabled },
  )
}

export function useTokensBalances(
  tokenIds: (string | u32)[],
  address: Maybe<AccountId32 | string>,
  noRefresh?: boolean,
) {
  const { api, isLoaded } = useRpcProvider()

  return useQueries({
    queries: tokenIds.map((id) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.tokenBalance(id, address)
        : QUERY_KEYS.tokenBalanceLive(id, address),
      queryFn: address ? getTokenBalance(api, address, id) : undefinedNoop,
      enabled: !!id && !!address && isLoaded,
    })),
  })
}

const getExistentialDeposit = (api: ApiPromise) => {
  return api.consts.balances.existentialDeposit
}

export function useExistentialDeposit() {
  const { api } = useRpcProvider()
  return useQuery(QUERY_KEYS.existentialDeposit, async () => {
    const existentialDeposit = await getExistentialDeposit(api)
    return existentialDeposit.toBigNumber()
  })
}

export const useTokenLocks = (id: Maybe<u32 | string>) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.lock(account?.address, id),
    account?.address != null
      ? getTokenLock(api, account.address, id?.toString() ?? "")
      : undefinedNoop,
    { enabled: !!account?.address && !!id },
  )
}

export const getTokenLock =
  (api: ApiPromise, address: AccountId32 | string, id: string) => async () => {
    const res =
      id === NATIVE_ASSET_ID
        ? await api.query.balances.locks(address)
        : await api.query.tokens.locks(address, id)

    return res.map((lock) => ({
      id: id,
      amount: lock.amount.toBigNumber(),
      type: lock.id.toHuman(),
    }))
  }
