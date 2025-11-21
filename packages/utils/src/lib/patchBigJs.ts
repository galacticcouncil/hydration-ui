import Big from "big.js"

declare module "big.js" {
  interface BigConstructor {
    min(...values: [Big.BigSource, ...Big.BigSource[]]): Big.Big
    max(...values: [Big.BigSource, ...Big.BigSource[]]): Big.Big
    _patched?: boolean
  }
}

function bigMinFn(valueA: Big.BigSource, valueB: Big.BigSource): Big {
  const a = Big(valueA)
  const b = Big(valueB)
  return a.lt(b) ? a : b
}

function bigMaxFn(valueA: Big.BigSource, valueB: Big.BigSource): Big {
  const a = Big(valueA)
  const b = Big(valueB)
  return a.gt(b) ? a : b
}

function bigMin(...values: [Big.BigSource, ...Big.BigSource[]]): Big {
  const first = values?.[0] ?? 0
  return values.reduce<Big>(
    (min, current) => bigMinFn(min, current),
    Big(first),
  )
}

function bigMax(...values: [Big.BigSource, ...Big.BigSource[]]): Big {
  const first = values?.[0] ?? 0
  return values.reduce<Big>(
    (max, current) => bigMaxFn(max, current),
    Big(first),
  )
}

export function patchBigJs() {
  if (!Big.prototype._patched) {
    const originalDiv = Big.prototype.div

    // Return 0 instead of throwing an error when dividing by 0
    Big.prototype.div = function (n: Big.BigSource) {
      const divisor = new Big(n)
      if (divisor.eq(0)) {
        return new Big(0)
      }
      return originalDiv.call(this, divisor)
    }

    Big.min = bigMin
    Big.max = bigMax

    Big.prototype._patched = true
  }
}
