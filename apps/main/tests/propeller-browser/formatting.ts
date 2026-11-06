import Big from "big.js"
export const scaleHuman = (value, decimals) =>
  Big(value.toString()).div(Big(10).pow(decimals)).toString()
export const percentageOf = (value, percent, decimals) =>
  Big(value).times(percent).div(100).toFixed(decimals, 0)
