import Big, { BigSource } from "big.js"

function bigMinFn(valueA: BigSource, valueB: BigSource) {
  const a = Big(valueA)
  const b = Big(valueB)
  return a.lt(b) ? a : b
}

function bigMaxFn(valueA: BigSource, valueB: BigSource) {
  const a = Big(valueA)
  const b = Big(valueB)
  return a.gt(b) ? a : b
}

export function bigMin(...values: BigSource[]): Big {
  return values.reduce<Big>(
    (min, current) => bigMinFn(min, current),
    Big(values[0]),
  )
}

export function bigMax(...values: BigSource[]): Big {
  return values.reduce<Big>(
    (max, current) => bigMaxFn(max, current),
    Big(values[0]),
  )
}

export function bigShift(value: BigSource, places: number): Big {
  const big = Big(value)
  return places >= 0
    ? big.times(new Big(10).pow(places))
    : big.div(new Big(10).pow(-places))
}
