export const HOLLAR_ASSET_ID = "222"
export const H2O_ASSET_ID = "1"
export const USDT_ASSET_ID = "10"
export const GDOT_ASSET_ID = "690"
export const GDOT_ERC20_ID = "69"
export const GETH_ASSET_ID = "4200"
export const GETH_ERC20_ID = "420"
export const DOT_ASSET_ID = "5"
export const VDOT_ASSET_ID = "15"
export const VDOT_ERC20_ID = "1005"
export const ETH_ASSET_ID = "34"
export const WSTETH_ASSET_ID = "1000809"
export const SUSDE_ASSET_ID = "1000625"
export const SUSDS_ASSET_ID = "1000745"
export const USDT_POOL_ASSET_ID = "103"
export const WETH_POOL_ASSET_ID = "104"

export const HUSDC_ASSET_ID = "110"
export const HUSDT_ASSET_ID = "111"
export const HUSDS_ASSET_ID = "112"
export const HUSDE_ASSET_ID = "113"
export const PRIME_ASSET_ID = "43"
export const PRIME_ERC20_ID = "1043"
export const PRIME_STABLESWAP_ASSET_ID = "143"

export const HOLLAR_ASSETS = [
  HUSDC_ASSET_ID,
  HUSDT_ASSET_ID,
  HUSDS_ASSET_ID,
  HUSDE_ASSET_ID,
]

export const GIGA_ASSETS = [GDOT_ASSET_ID, GETH_ASSET_ID]
export const GIGA_ERC20 = [GDOT_ERC20_ID, GETH_ERC20_ID]

export const MONEY_MARKET_STRATEGY_ASSETS = [
  ...GIGA_ASSETS,
  USDT_POOL_ASSET_ID,
  ...HOLLAR_ASSETS,
]

export const ISOLATED_MODE_ASSETS = [PRIME_ASSET_ID]

export const SELL_ONLY_ASSETS = [
  H2O_ASSET_ID,
  USDT_POOL_ASSET_ID,
  WETH_POOL_ASSET_ID,
  ...GIGA_ASSETS,
  ...HOLLAR_ASSETS,
]
