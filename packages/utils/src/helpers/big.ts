import Big, { BigSource } from "big.js"

export function bigShift(value: BigSource, places: number): Big {
  const big = Big(value || 0)
  return places >= 0
    ? big.times(new Big(10).pow(places))
    : big.div(new Big(10).pow(-places))
}
