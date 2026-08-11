import { Balance as SdkBalance } from "@galacticcouncil/sdk-next"
import { useAccount } from "@galacticcouncil/web3-connect"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { Binary } from "polkadot-api"
import { firstValueFrom } from "rxjs"

import { TAssetData } from "@/api/assets"
import { TProviderData } from "@/api/provider"
import { ENV } from "@/config/env"
import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { Balance } from "@/states/account"
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
        const res = await papi.query.System.Account.getValue(address ?? "", {
          at: "best",
        })

        return parseNativeBalanceData(res, tokenId, address ?? "")
      }

      const res = await papi.query.Tokens.Accounts.getValue(
        address ?? "",
        Number(tokenId),
        {
          at: "best",
        },
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
        papi.query.Balances.TotalIssuance.getValue({ at: "best" }),
        papi.query.Balances.InactiveIssuance.getValue({ at: "best" }),
      ])

      return totalissuance - inactiveIssuance
    },
    enabled: isApiLoaded,
    staleTime: millisecondsInMinute,
  })
}

type TokenPalletEntry = { id: number; balance: SdkBalance }

const toAccountBalance = (assetId: string, balance: SdkBalance): Balance => ({
  assetId,
  ...balance,
})

export const mapNativeBalance = (
  nativeId: string,
  balance: SdkBalance,
): Balance => toAccountBalance(nativeId, balance)

export const mapTokenPalletBalances = (
  entries: TokenPalletEntry[],
  followedTokenIds: ReadonlySet<number>,
): Balance[] =>
  entries.flatMap(({ id, balance }) =>
    followedTokenIds.has(id) ? [toAccountBalance(id.toString(), balance)] : [],
  )

export const mapErc20PalletBalances = (
  entries: TokenPalletEntry[],
): Balance[] =>
  entries.map(({ id, balance }) => toAccountBalance(id.toString(), balance))

export const getFollowedAssetIds = ({
  tokens,
  stableswap,
  bonds,
  xykShareTokens,
  nativeId,
}: {
  tokens: ReadonlyArray<{ id: string }>
  stableswap: ReadonlyArray<{ id: string }>
  bonds: ReadonlyArray<{ id: string }>
  xykShareTokens: ReadonlyArray<{ id: string }> | undefined
  nativeId: string
}): ReadonlySet<number> => {
  if (!xykShareTokens) return new Set()

  const ids = new Set([
    ...tokens.map((token) => Number(token.id)),
    ...stableswap.map((token) => Number(token.id)),
    ...bonds.map((token) => Number(token.id)),
    ...xykShareTokens.map((token) => Number(token.id)),
  ])

  ids.delete(Number(nativeId))

  return ids
}

export const mapHydrationBalancesToAssetAmounts = (
  balances: Balance[],
  getAsset: (id: string) => TAssetData | undefined,
  includeAsset: (meta: TAssetData) => boolean,
): AssetAmount[] =>
  balances.flatMap((entry) => {
    const meta = getAsset(entry.assetId)
    if (!meta || !includeAsset(meta)) return []

    return [
      new AssetAmount({
        key: meta.id,
        originSymbol: meta.symbol,
        amount: entry.total,
        decimals: meta.decimals,
        symbol: meta.symbol,
      }),
    ]
  })

export const fetchHydrationRegistryAssetAmounts = async ({
  address,
  sdk,
  getAsset,
  isToken,
  isErc20,
  followedTokenIds,
  erc20AssetIds,
  nativeId = NATIVE_ASSET_ID,
}: {
  address: string
  sdk: TProviderData["sdk"]
  getAsset: (id: string) => TAssetData | undefined
  isToken: (asset: TAssetData) => boolean
  isErc20: (asset: TAssetData) => boolean
  followedTokenIds: ReadonlySet<number>
  erc20AssetIds: readonly number[]
  nativeId?: string
}): Promise<AssetAmount[]> => {
  const { balance } = sdk.client

  const [systemBalance, tokenBalances, erc20Balances] = await Promise.all([
    firstValueFrom(balance.watchSystemBalance(address)),
    firstValueFrom(balance.watchTokensBalance(address)),
    firstValueFrom(balance.watchErc20Balance(address, [...erc20AssetIds])),
  ])

  const balances: Balance[] = [
    mapNativeBalance(nativeId, systemBalance.balance),
    ...mapTokenPalletBalances(tokenBalances, followedTokenIds),
    ...mapErc20PalletBalances(erc20Balances),
  ]

  return mapHydrationBalancesToAssetAmounts(
    balances,
    getAsset,
    (meta) => isToken(meta) || isErc20(meta),
  )
}
