import {
  Amount,
  AssetBalance,
  Balance as SdkBalance,
} from "@galacticcouncil/sdk-next"
import { percentageDifference } from "@galacticcouncil/utils"
import {
  catchError,
  combineLatest,
  concat,
  concatMap,
  defer,
  EMPTY,
  map,
  Observable,
  of,
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

/**
 * papi's best-block watch starts at the finalized block and can stay there for
 * a finality round (~30 s) after the page opens, showing balances from before
 * the latest transactions. A read at the best block right after the watch's
 * first value catches up; later values queue behind it, so the newest block
 * always lands last.
 */
export const catchUpToBest = <T>(
  watch$: Observable<T>,
  readBest: () => Promise<T>,
): Observable<T> =>
  watch$.pipe(
    concatMap((value, index) =>
      index === 0
        ? concat(
            of(value),
            // the watch alone still catches up, just later
            defer(readBest).pipe(catchError(() => EMPTY)),
          )
        : of(value),
    ),
  )

export const watchFilteredAccountBalances = (
  { sdk, papi }: Pick<TProviderContext, "sdk" | "papi">,
  address: string,
  { followedTokenIds, erc20AssetIds }: AccountBalanceFilter,
): Observable<AssetBalance[]> => {
  const { balance } = sdk.client
  const followedTokenIdSet = new Set(followedTokenIds)

  const readTokensAtBest = async () => {
    const entries = await papi.query.Tokens.Accounts.getEntries(address, {
      at: "best",
    })
    return Promise.all(
      entries.map(async ({ keyArgs: [, id] }) => ({
        id,
        balance: await balance.getTokenBalance(address, id),
      })),
    )
  }

  return defer(() => {
    const system$ = catchUpToBest(
      balance.watchSystemBalance(address),
      async () => ({ id: 0, balance: await balance.getSystemBalance(address) }),
    )
    const tokens$ = catchUpToBest(
      balance.watchTokensBalance(address),
      readTokensAtBest,
    ).pipe(
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

export type Erc20BalanceSnapshot = {
  isPrimed: boolean
  entries: Map<string, { total: bigint; transferable: bigint }>
}

export const createErc20BalanceSnapshot = (): Erc20BalanceSnapshot => ({
  isPrimed: false,
  entries: new Map(),
})

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

    const snap = snapshot.entries.get(assetId)

    // A newly held aToken (e.g. an ICE fill) has nothing to diff against
    if (
      snap
        ? hasSignificantChange(snap.transferable, transferable) ||
          hasSignificantChange(snap.total, total)
        : snapshot.isPrimed
    ) {
      shouldSync = true
    }

    snapshot.entries.set(assetId, { total, transferable })
  }

  snapshot.isPrimed = true
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
