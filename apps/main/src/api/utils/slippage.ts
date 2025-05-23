import Big from "big.js"

export const PCT_100 = "100"

export function calculateSlippage(
  amount: bigint,
  slippagePct: string | number,
): bigint {
  const slippage = Big(amount.toString()).div(PCT_100).mul(slippagePct)
  return BigInt(slippage.toFixed(0, 1))
}
