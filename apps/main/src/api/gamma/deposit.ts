import Big from "big.js"
import { Hex, maxUint256, PublicClient } from "viem"

import { UNIPROXY_ABI } from "@/api/gamma/abi"

/** Amounts of the other token UniProxy accepts against a deposit of one. */
export type DepositBand = { start: bigint; end: bigint }

export const readDepositBand = async (
  evm: PublicClient,
  {
    uniProxy,
    vault,
    token,
    amount,
  }: { uniProxy: Hex; vault: Hex; token: Hex; amount: bigint },
): Promise<DepositBand> => {
  const [start, end] = await evm.readContract({
    abi: UNIPROXY_ABI,
    address: uniProxy,
    functionName: "getDepositAmount",
    args: [vault, token, amount],
  })

  return { start, end }
}

export const bandMid = ({ start, end }: DepositBand) => (start + end) / 2n

// Empty vault accepts any ratio.
const accepts = (band: DepositBand, amount: bigint) =>
  band.end === maxUint256 || (amount >= band.start && amount <= band.end)

export type PairedAmountCheck = {
  /** false: the vault ratio moved further than the user's tolerance */
  ok: boolean
  /** what to sign; when not ok, what the form should show instead */
  amount: bigint
}

/**
 * Decides the amount to sign for the side the user did not type, against a
 * band read at submit. The shown amount while the vault accepts it, the band
 * mid while that stays within `tolerance` percent of what was shown. Never
 * swaps in a bigger move: the user has to see it first.
 */
export const checkPairedAmount = (
  shown: bigint,
  band: DepositBand,
  tolerance: number,
): PairedAmountCheck => {
  if (accepts(band, shown)) return { ok: true, amount: shown }

  const mid = bandMid(band)
  const diff = mid > shown ? mid - shown : shown - mid
  const ok =
    shown > 0n &&
    Big(diff.toString()).times(100).lte(Big(shown.toString()).times(tolerance))

  return { ok, amount: mid }
}
