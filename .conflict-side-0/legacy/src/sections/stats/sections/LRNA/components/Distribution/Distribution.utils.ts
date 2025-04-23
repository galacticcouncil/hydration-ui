import BigNumber from "bignumber.js"

export const makePercent = (value?: BigNumber, total?: BigNumber) =>
  value && total ? value.div(total).multipliedBy(100) : undefined
