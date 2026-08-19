import {
  Amount,
  AssetBalance,
  Balance as SdkBalance,
} from "@galacticcouncil/sdk-next"
import { percentageDifference } from "@galacticcouncil/utils"
import {
  combineLatest,
  defer,
  map,
  Observable,
  pairwise,
  startWith,
} from "rxjs"

import {
  AccountBalanceFilter,
  Balance,
  BalanceRecord,
} from "@/api/balances/types"
import { TProviderContext } from "@/providers/rpcProvider"

export const mergeBalances = (
  balances: BalanceRecord,
  chunk: AssetBalance[],
): BalanceRecord => {
  const next = { ...balances }

  for (const { id, balance } of chunk) {
    const assetId = id.toString()

    if (balance.total > 0n) {
      next[assetId] = { ...balance, assetId }
    } else {
      delete next[assetId]
    }
  }

  return next
}

const isSameBalance = (
  previous: SdkBalance | undefined,
  next: SdkBalance,
): boolean =>
  previous !== undefined &&
  previous.transferable === next.transferable &&
  previous.total === next.total

const getBalanceDeltas = (
  previous: AssetBalance[],
  current: AssetBalance[],
): AssetBalance[] => {
  const previousById = previous.reduce(
    (map, { id, balance }) => map.set(id, balance),
    new Map<number, SdkBalance>(),
  )

  return current.filter(
    ({ id, balance }) => !isSameBalance(previousById.get(id), balance),
  )
}

export const watchFilteredAccountBalances = (
  sdk: TProviderContext["sdk"],
  address: string,
  { followedTokenIds, erc20AssetIds }: AccountBalanceFilter,
): Observable<AssetBalance[]> => {
  const { balance } = sdk.client
  const followedTokenIdSet = new Set(followedTokenIds)

  return defer(() => {
    const system$ = balance.watchSystemBalance(address)
    const tokens$ = balance
      .watchTokensBalance(address)
      .pipe(
        map((balances) =>
          balances.filter(({ id }) => followedTokenIdSet.has(id)),
        ),
      )
    const erc20$ = balance.watchErc20Balance(address, [...erc20AssetIds])

    return combineLatest([system$, tokens$, erc20$])
  }).pipe(
    map(([system, tokens, erc20]) => [system, ...tokens, ...erc20]),
    startWith([] as AssetBalance[]),
    pairwise(),
    map(([previous, current]) =>
      previous.length === 0 ? current : getBalanceDeltas(previous, current),
    ),
  )
}

const ERC20_MAX_WITHDRAW_SYNC_THRESHOLD = 0.01

export type Erc20BalanceSnapshot = Map<
  string,
  { total: bigint; transferable: bigint }
>

const hasSignificantChange = (previous: bigint, next: bigint): boolean =>
  previous !== next &&
  percentageDifference(previous, next).gt(ERC20_MAX_WITHDRAW_SYNC_THRESHOLD)

export const syncErc20BalanceSnapshot = (
  snapshot: Erc20BalanceSnapshot,
  balances: BalanceRecord,
  isErc20AToken: (assetId: string) => boolean,
): boolean => {
  let shouldSync = false

  for (const [assetId, { total, transferable }] of Object.entries(balances)) {
    if (!isErc20AToken(assetId)) continue

    const snap = snapshot.get(assetId)

    if (
      snap &&
      (hasSignificantChange(snap.transferable, transferable) ||
        hasSignificantChange(snap.total, total))
    ) {
      shouldSync = true
    }

    snapshot.set(assetId, { total, transferable })
  }

  return shouldSync
}

export const withMaxWithdraw = (
  balance: Balance,
  underlyingAssetId: string | undefined,
  maxWithdrawAll: Record<number, Amount>,
  isMaxWithdrawFetching = false,
): Balance => {
  const maxWithdraw = underlyingAssetId
    ? maxWithdrawAll[Number(underlyingAssetId)]
    : undefined

  if (!maxWithdraw) return balance

  if (isMaxWithdrawFetching && balance.transferable > maxWithdraw.amount) {
    return balance
  }

  return { ...balance, transferable: maxWithdraw.amount }
}
