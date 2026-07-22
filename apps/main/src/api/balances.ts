import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import { Binary } from "polkadot-api"

import { TAssetData } from "@/api/assets"
import { ENV } from "@/config/env"
import { isErc20 } from "@/providers/assetsProvider"
import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export enum TokenLockType {
  Vesting = "ormlvest",
  Democracy = "democrac",
  OpenGov = "pyconvot",
  Staking = "stk_stks",
  GigaStaking = "ghdxlock",
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
      const locks = await papi.query.Balances.Locks.getValue(address, {
        at: "best",
      })

      return locks
        .map(({ id, amount }) => {
          const type = Binary.toText(Binary.fromHex(id))

          if (!isKnownTokenLockType(type)) {
            return null
          }

          return {
            type,
            amount,
          }
        })
        .filter((lock) => lock !== null)
    },
    enabled: isApiLoaded && !!address,
  })
}

export const useNativeTokenLocks = () => {
  const { account } = useAccount()

  return useQuery({
    ...nativeTokenLocksQuery(useRpcProvider(), account?.address ?? ""),
    select: (locks) => new Map(locks.map((l) => [l.type, l.amount])),
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
          ? await papi.query.Balances.Reserves.getValue(address, {
              at: "best",
            })
          : await papi.query.Tokens.Reserves.getValue(
              address,
              Number(tokenId),
              {
                at: "best",
              },
            )

      return reserves.map(({ id, amount }) => {
        const type = Binary.toText(Binary.fromHex(id))

        return {
          type,
          amount,
        }
      })
    },
    enabled: isApiLoaded && !!address,
  })
}

export const useAccountTokenReserves = (tokenId: string, enabled?: boolean) => {
  const { account } = useAccount()

  return useQuery({
    ...tokenReservesQuery(useRpcProvider(), account?.address ?? "", tokenId),
    select: (reserves) => new Map(reserves.map((r) => [r.type, r.amount])),
    enabled,
  })
}

type BalanceData = {
  readonly accountId: string
  readonly assetId: string
  readonly total: bigint
  readonly free: bigint
  readonly reserved: bigint
  readonly transferable: bigint
}

export const parseTokenBalanceData = (
  {
    free,
    frozen,
    reserved,
  }: Awaited<ReturnType<Papi["query"]["Tokens"]["Accounts"]["getValue"]>>,
  assetId: string,
  address: string,
) => {
  const freezeExcess = frozen - reserved
  const netFreezeConstraint = freezeExcess > 0n ? freezeExcess : 0n

  const transferable =
    free > netFreezeConstraint ? free - netFreezeConstraint : 0n
  const total = free + reserved

  return {
    accountId: address,
    assetId,
    total,
    free,
    reserved,
    transferable,
  }
}

export const allTokenBalancesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    queryKey: ["allTokenBalances", address],
    queryFn: async (): Promise<BalanceData[]> => {
      const [nativeBalance, allEntries] = await Promise.all([
        papi.query.System.Account.getValue(address, {
          at: "best",
        }),
        papi.query.Tokens.Accounts.getEntries(address, {
          at: "best",
        }),
      ])

      const parsedNativeBalance = parseTokenBalanceData(
        nativeBalance.data,
        NATIVE_ASSET_ID,
        address,
      )
      const parsedTokenBalances = allEntries.map(({ keyArgs, value }) => {
        const tokenId = keyArgs[1].toString()
        return parseTokenBalanceData(value, tokenId, address)
      })

      return parsedNativeBalance.total > 0n
        ? [parsedNativeBalance, ...parsedTokenBalances]
        : parsedTokenBalances
    },
    enabled: isApiLoaded && !!address,
  })
}

export const tokenBalanceQuery = (
  { papi, isApiLoaded }: TProviderContext,
  tokenId: string,
  address: string,
) => {
  return queryOptions({
    queryKey: ["tokenBalance", address, tokenId],
    queryFn: async (): Promise<BalanceData> => {
      if (tokenId === NATIVE_ASSET_ID) {
        const res = await papi.query.System.Account.getValue(address, {
          at: "best",
        })

        return parseTokenBalanceData(res.data, tokenId, address)
      }

      const res = await papi.query.Tokens.Accounts.getValue(
        address,
        Number(tokenId),
        {
          at: "best",
        },
      )

      return parseTokenBalanceData(res, tokenId, address)
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
        papi.query.Balances.TotalIssuance.getValue({ at: "best" }),
        papi.query.Balances.InactiveIssuance.getValue({ at: "best" }),
      ])

      return totalissuance - inactiveIssuance
    },
    enabled: isApiLoaded,
    staleTime: millisecondsInMinute,
  })
}

export const tokenBalanceSDKQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  address: string,
  asset: TAssetData,
) => {
  return queryOptions({
    queryKey: ["tokenBalanceSDK", address, asset.id],
    queryFn: async () => {
      if (asset.id === NATIVE_ASSET_ID) {
        return await sdk.client.balance.getSystemBalance(address)
      }

      if (isErc20(asset)) {
        return await sdk.client.balance.getErc20Balance(
          address,
          Number(asset.id),
        )
      }

      return await sdk.client.balance.getTokenBalance(address, Number(asset.id))
    },
    enabled: isApiLoaded && !!address && !!asset.id,
  })
}
