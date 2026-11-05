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
  /** false: the vault no longer accepts the shown amount */
  ok: boolean
  /** ok: the shown amount, to sign; not ok: the fresh amount to show instead */
  amount: bigint
}

/**
 * Checks the side the user did not type against a band read at submit. Only
 * ever signs the amount the user saw: if the vault moved off it, by any
 * margin, the form shows the fresh amount and the user submits again.
 */
export const checkPairedAmount = (
  shown: bigint,
  band: DepositBand,
): PairedAmountCheck =>
  accepts(band, shown)
    ? { ok: true, amount: shown }
    : { ok: false, amount: bandMid(band) }
