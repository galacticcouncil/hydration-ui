import BN from "bignumber.js"

export const BN_0 = new BN(0)
export const BN_1 = new BN(1)
export const BN_10 = new BN(10)
export const BN_25 = new BN(25)
export const BN_100 = new BN(100)
export const BN_BILL = new BN(BN_10.pow(12))
export const BN_QUINTILL = new BN(BN_10.pow(18))

export const BN_MILL = new BN(BN_10.pow(6))

export const BN_NAN = new BN(NaN)

export const TRADING_FEE = new BN(3).div(new BN(1000))

export const SHARE_TOKEN_DECIMALS = new BN(12)

export const DAY_IN_MILLISECONDS = new BN(86400000)

// block time in seconds
export const BLOCK_TIME = new BN(6)

// ms until toast closes
export const TOAST_CLOSE_TIME = 5000

// Vesting ID
export const ORMLVEST = "ormlvest"

BN.config({ EXPONENTIAL_AT: 666 })

export const MIN_WITHDRAWAL_FEE = new BN(100).div(1000000)

export const MAX_WITHDRAWAL_FEE = new BN(10000).div(1000000).multipliedBy(100)

export const STABLECOIN_SYMBOL = "tether"

export const REFETCH_INTERVAL = 60000

export const STABLEPOOL_TOKEN_DECIMALS = 18

//decimals
export const TRILL = 12
export const QUINTILL = 18

export const DOC_LINK = "https://docs.hydration.net"

export const HYDRATION_PARACHAIN_ID = 2034
export const HYDRATION_CHAIN_KEY = "hydration"
export const HYDRATION_PARACHAIN_ADDRESS =
  "13cKp89Uh2yWgTG28JA1QEvPUMjEPKejqkjHKf9zqLiFKjH6"

export const GDOT_STABLESWAP_ASSET_ID = "690"
export const GDOT_ERC20_ASSET_ID = "69"
export const GETH_STABLESWAP_ASSET_ID = "4200"
export const GETH_ERC20_ASSET_ID = "420"
export const VDOT_ASSET_ID = "15"
export const VDOT_ERC20_ASSET_ID = "1005"
export const DOT_ASSET_ID = "5"
export const ETH_ASSET_ID = "34"
export const WSTETH_ASSET_ID = "1000809"
export const SUSDE_ASSET_ID = "1000625"
export const SUSDS_ASSET_ID = "1000745"
export const USDT_POOL_ASSET_ID = "103"

export const HUSDC_ASSET_ID = "103"
export const HUSDT_ASSET_ID = "104"
export const HUSDS_ASSET_ID = "105"
export const HUSDE_ASSET_ID = "106"

export const HOLLAR_POOLS = [
  HUSDC_ASSET_ID,
  HUSDT_ASSET_ID,
  HUSDS_ASSET_ID,
  HUSDE_ASSET_ID,
]

export const STRATEGY_ASSETS_BLACKLIST = [
  GDOT_STABLESWAP_ASSET_ID,
  GDOT_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  GETH_ERC20_ASSET_ID,
]

export const AAVE_EXTRA_GAS = 1_000_000n
