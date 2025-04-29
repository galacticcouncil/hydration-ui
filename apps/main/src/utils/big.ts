import Big from "big.js"

export const bigJsMax = (
  num: Big | string,
  ...nums: ReadonlyArray<Big | string>
): Big =>
  nums
    .map((num) => new Big(num))
    .reduce((max, num) => (num.gt(max) ? num : max), new Big(num))

export const bigIntMax = (
  num: bigint,
  ...nums: ReadonlyArray<bigint>
): bigint => nums.reduce((max, num) => (num > max ? num : max), num)
