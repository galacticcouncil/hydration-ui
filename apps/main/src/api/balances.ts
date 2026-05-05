import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { Binary } from "polkadot-api"

import { ENV } from "@/config/env"
import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_DECIMALS, NATIVE_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export enum TokenLockType {
  Vesting = "ormlvest",
  Democracy = "democrac",
  OpenGov = "pyconvot",
  Staking = "stk_stks",
}

export enum TokenReserveType {
  DCA = "dcaorder",
  XCM = "depositc",
  OTC = "otcorder",
}

const isKnownTokenLockType = (type: string): type is TokenLockType => {
  return Object.values(TokenLockType).includes(type as TokenLockType)
}

export const nativeTokenLocksQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    queryKey: ["balances", "native-lock", address],
    queryFn: async () => {
      const locks = await papi.query.Balances.Locks.getValue(address)

      return locks
        .map((lock) => {
          const type = Binary.toText(Binary.fromHex(lock.id))

          if (!isKnownTokenLockType(type)) {
            return null
          }

          return {
            type: type,
            amount: scaleHuman(lock.amount, NATIVE_ASSET_DECIMALS),
          } as const
        })
        .filter((lock) => lock !== null)
    },
    enabled: isApiLoaded && !!address,
  })
}

export const tokenReservesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
  tokenId: string,
) => {
  return queryOptions({
    queryKey: ["reserves", address, tokenId],
    queryFn: async () => {
      const reserves =
        tokenId === NATIVE_ASSET_ID
          ? await papi.query.Balances.Reserves.getValue(address)
          : await papi.query.Tokens.Reserves.getValue(address, Number(tokenId))

      return reserves.map((reserve) => {
        const type = Binary.toText(Binary.fromHex(reserve.id))

        return {
          type,
          amount: reserve.amount,
        }
      })
    },
    enabled: isApiLoaded && !!address,
  })
}

export const useAccountTokenReserves = (tokenId: string) => {
  const { account } = useAccount()

  return useQuery({
    ...tokenReservesQuery(useRpcProvider(), account?.address ?? "", tokenId),
    select: (reserves) => new Map(reserves.map((r) => [r.type, r.amount])),
  })
}

export type BalanceData = {
  readonly accountId: string
  readonly assetId: string
  readonly balance: string
  readonly total: string
  readonly freeBalance: string
  readonly reservedBalance: string
}

export const parseNativeBalanceData = (
  { data }: Awaited<ReturnType<Papi["query"]["System"]["Account"]["getValue"]>>,
  assetId: string,
  address: string,
) => {
  const freeBalance = new Big(data.free.toString())
  const frozenBalance = new Big(data.frozen.toString())
  const reservedBalance = new Big(data.reserved.toString())
  const balance = freeBalance.minus(frozenBalance)
  const total = freeBalance.plus(reservedBalance)

  return {
    accountId: address,
    assetId,
    balance: balance.toString(),
    total: total.toString(),
    freeBalance: freeBalance.toString(),
    reservedBalance: reservedBalance.toString(),
  }
}

export const parseTokenBalanceData = (
  data: Awaited<ReturnType<Papi["query"]["Tokens"]["Accounts"]["getValue"]>>,
  assetId: string,
  address: string,
) => {
  const freeBalance = new Big(data.free.toString())
  const frozenBalance = new Big(data.frozen.toString())
  const reservedBalance = new Big(data.reserved.toString())
  const balance = freeBalance.minus(frozenBalance)
  const total = freeBalance.plus(reservedBalance)

  return {
    accountId: address,
    assetId,
    balance: balance.toString(),
    total: total.toString(),
    freeBalance: freeBalance.toString(),
    reservedBalance: reservedBalance.toString(),
  }
}

export const tokenBalanceQuery = (
  { papi, isApiLoaded }: TProviderContext,
  tokenId: string,
  address: string | undefined | null,
) => {
  return queryOptions({
    queryKey: ["tokenBalance", tokenId, address],
    queryFn: async (): Promise<BalanceData> => {
      if (tokenId === NATIVE_ASSET_ID) {
        const res = await papi.query.System.Account.getValue(address ?? "")

        return parseNativeBalanceData(res, tokenId, address ?? "")
      }

      const res = await papi.query.Tokens.Accounts.getValue(
        address ?? "",
        Number(tokenId),
      )

      return parseTokenBalanceData(res, tokenId, address ?? "")
    },
    enabled: isApiLoaded && !!address && !!tokenId,
  })
}

export const HDXStakingBalanceQuery = (
  rpc: TProviderContext,
): ReturnType<typeof tokenBalanceQuery> => ({
  ...tokenBalanceQuery(rpc, NATIVE_ASSET_ID, ENV.VITE_TRSRY_ADDR),
  staleTime: Infinity,
})

export const HDXIssuanceQuery = ({ papi, isApiLoaded }: TProviderContext) => {
  return queryOptions({
    queryKey: ["hdxIssuance"],
    queryFn: async () => {
      const [totalissuance, inactiveIssuance] = await Promise.all([
        papi.query.Balances.TotalIssuance.getValue(),
        papi.query.Balances.InactiveIssuance.getValue(),
      ])

      return totalissuance - inactiveIssuance
    },
    enabled: isApiLoaded,
    staleTime: millisecondsInMinute,
  })
}
