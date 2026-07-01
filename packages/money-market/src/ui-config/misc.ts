export const GDOT_STABLESWAP_ASSET_ID = "690"
export const GDOT_ERC20_ASSET_ID = "69"
export const GETH_STABLESWAP_ASSET_ID = "4200"
export const GETH_ERC20_ASSET_ID = "420"
export const VDOT_ASSET_ID = "15"
export const VDOT_ERC20_ASSET_ID = "1005"
export const DOT_ASSET_ID = "5"
export const PRIME_ASSET_ID = "43"
export const PRIME_STABLESWAP_ASSET_ID = "143"
export const PRIME_ERC20_ASSET_ID = "1043"
export const HDX_ERC20_ASSET_ID = "67"
export const STHDX_ASSET_ID = "670"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.1
export const HEALTH_FACTOR_LIQUIDATION_THRESHOLD = 1

export const PRIME_APY = 0.075

/**
 * Block at which the GIGAHDX launch proposal was enacted — the same atomic batch
 * that swept the gigapot to ~0 (so the exchange rate GIGAHDX:HDX = 1 at this
 * block). Anchors the passive-APR window so its baseline can never predate the
 * sweep and show a misleading 0% for the market's first ~60 days.
 *
 * TODO: set this to the mainnet enactment block when GIGAHDX is launched on
 * mainnet. (currently the 0.lark test-fork enactment block.)
 */
export const GIGAHDX_LAUNCH_BLOCK = 75
