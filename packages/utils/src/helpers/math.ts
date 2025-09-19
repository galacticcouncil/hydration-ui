import Big from "big.js"

export const linearScale =
  (input: [number, number], output: [number, number]) =>
  (value: number): number => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }

export const percentageDifference = (
  a: string | bigint | Big,
  b: string | bigint | Big,
): Big => {
  const aBig = Big(typeof a === "bigint" ? a.toString() : a)
  const bBig = Big(typeof b === "bigint" ? b.toString() : b)

  return aBig.minus(bBig).abs().div(aBig.plus(bBig).div(2)).mul(100)
}
