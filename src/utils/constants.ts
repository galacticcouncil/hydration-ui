import BN from "bignumber.js"

export const BN_0 = new BN(0)
export const BN_1 = new BN(1)
export const BN_2 = new BN(2)
export const BN_10 = new BN(10)
export const BN_12 = new BN(12)
export const BN_QUINTILL = new BN(BN_10.pow(18))

export const TRADING_FEE = new BN(3).div(new BN(1000))

// block time in seconds
export const BLOCK_TIME = new BN(12)

// temporary values
export const DOLLAR_RATES = new Map([
  ["BSX", new BN(0.00015843)],
  ["Basilisk", new BN(0.00015843)],
  ["KSM", new BN(46.52)],
  ["Kusama", new BN(46.52)],
  ["AUSD", new BN(0.933333)],
  ["Acala USD", new BN(0.933333)],
  ["PHA", new BN(0.099127)],
  ["Phala", new BN(0.099127)],
])
