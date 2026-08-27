import { hub } from "@galacticcouncil/descriptors"
import { formatSourceChainAddress } from "@galacticcouncil/utils"
import {
  normalizeAssetAmount,
  SubstrateBalanceType,
} from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import {
  catchError,
  filter,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  take,
  timer,
} from "rxjs"

import { assethub } from "@/api/external/assethub"
import { useObservable } from "@/hooks/useObservable"

export type DepositConfirmationResult = "confirmed" | "timeout" | "skipped"

export type UseDepositConfirmationProps = {
  address: string
  chainKey: string
  assetKey: string
  targetBalance: bigint | null
  onSettled: (result: DepositConfirmationResult) => void
}

const CONFIRMATION_TIMEOUT_MS = 60_000

export const useDepositConfirmation = ({
  address,
  chainKey,
  assetKey,
  targetBalance,
  onSettled,
}: UseDepositConfirmationProps) => {
  const result$ = useMemo(() => {
    const skip = of<DepositConfirmationResult>("skipped")

    // Only Asset Hub is supported for deposits
    const isAssethub = chainKey === assethub.key
    if (!address || targetBalance === null || !isAssethub) {
      return skip
    }

    const asset = assethub.getAsset(assetKey)
    if (!asset) return skip

    const formattedAddress = formatSourceChainAddress(address, assethub)
    const query = assethub.client.getTypedApi(hub).query
    let balance$: Observable<bigint>

    switch (assethub.getBalanceType(asset)) {
      case SubstrateBalanceType.System:
        balance$ = query.System.Account.watchValue(formattedAddress, {
          at: "finalized",
        }).pipe(
          map(({ value: { data } }) =>
            data.free >= data.frozen ? data.free - data.frozen : 0n,
          ),
        )
        break
      case SubstrateBalanceType.Assets:
        balance$ = query.Assets.Account.watchValue(
          Number(assethub.getBalanceAssetId(asset)),
          formattedAddress,
          { at: "finalized" },
        ).pipe(map(({ value }) => value?.balance ?? 0n))
        break
      default:
        return skip
    }

    const confirmed$ = balance$.pipe(
      mergeMap(async (balance) => {
        const { amount } = await normalizeAssetAmount(balance, asset, assethub)
        return amount
      }),
      filter((amount) => amount >= targetBalance),
      map((): DepositConfirmationResult => "confirmed"),
    )

    const timeout$ = timer(CONFIRMATION_TIMEOUT_MS).pipe(
      map((): DepositConfirmationResult => "timeout"),
    )

    return merge(confirmed$, timeout$).pipe(
      take(1),
      catchError(() => {
        return of<DepositConfirmationResult>("skipped")
      }),
    )
  }, [address, assetKey, chainKey, targetBalance])

  useObservable(result$, { enabled: true, onUpdate: onSettled })
}
