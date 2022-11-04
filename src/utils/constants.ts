import BN from "bignumber.js"

export const BN_0 = new BN(0)
export const BN_1 = new BN(1)
export const BN_10 = new BN(10)
export const BN_100 = new BN(100)
export const BN_BILL = new BN(BN_10.pow(12))
export const BN_QUINTILL = new BN(BN_10.pow(18))
export const BN_NAN = new BN(NaN)

export const TRADING_FEE = new BN(3).div(new BN(1000))

// block time in seconds
export const BLOCK_TIME = new BN(6)

export const AUSD_NAME = "AUSD"

// ms until toast closes
export const TOAST_CLOSE_TIME = 5000

// Vesting ID
export const ORMLVEST = "ormlvest"
