export const GDOT_STABLESWAP_ASSET_ID = "690"
export const GDOT_ERC20_ASSET_ID = "69"
export const GETH_STABLESWAP_ASSET_ID = "4200"
export const GETH_ERC20_ASSET_ID = "420"
export const VDOT_ASSET_ID = "15"
export const VDOT_ERC20_ASSET_ID = "1005"
export const DOT_ASSET_ID = "5"
export const ETH_ASSET_ID = "34"
export const PRIME_ASSET_ID = "43"
export const PRIME_STABLESWAP_ASSET_ID = "143"
export const PRIME_ERC20_ASSET_ID = "1043"
export const HDX_ERC20_ASSET_ID = "67"
export const STHDX_ASSET_ID = "670"
export const HOLLAR_ASSET_ID = "222"
export const WBTC_ASSET_ID = "19"

export const HEALTH_FACTOR_RISK_THRESHOLD = 1.1
export const HEALTH_FACTOR_LIQUIDATION_THRESHOLD = 1

export const PRIME_APY = 0.075

/**
 * Block at which the GIGAHDX launch proposal (ref 358) was enacted — the same
 * atomic batch that swept the gigapot to ~0 (so the exchange rate
 * GIGAHDX:HDX = 1 at this block). Anchors the passive-APR baseline so it can
 * never predate the sweep. Also gates when `measured` (rate-delta) becomes
 * meaningful — before ~7 days of pallet age the display falls back to the
 * governance-guaranteed constant.
 */
export const GIGAHDX_LAUNCH_BLOCK = 12959351

/**
 * Annual HDX budget scheduled to enter the GIGAHDX yield pot (`gigahdx!`)
 * per governance ref 358. Delivered as periodic `balances.transferKeepAlive`
 * from treasury every 600 blocks (~1 hour) at 4,109.59 HDX per tick, for
 * 8,760 iterations = 1 year. When divided by current `totalStake`, gives the
 * governance-guaranteed base APR floor.
 */
export const GIGAHDX_ANNUAL_BASE_INCENTIVES_HDX = 36_000_000

/**
 * Annual HDX budget scheduled to enter the voting-rewards accumulator pot
 * (`gigarwd!`) per governance ref 358. Delivered every 600 blocks (~1 hour)
 * at 6,164.38 HDX per tick for 8,760 iterations = 1 year. Divided by current
 * `totalStake`, gives the voting-APR floor (mirrors base APR's structure).
 */
export const GIGAHDX_ANNUAL_VOTING_INCENTIVES_HDX = 54_000_000
