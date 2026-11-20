// An under-gassed rung does not revert: LooperLogic catches the out-of-gas and
// records an AaveRefused stall, so these stay generous rather than estimated.
// ponytail: placeholders until the lark3 measurement ticket (#101) records real gas per action
export const MULTIPLY_OPEN_GAS = 5_000_000n
export const MULTIPLY_ACTION_GAS = 3_500_000n
// approve measured on lark3: 26k (asset precompiles), 47k (HOLLAR)
export const MULTIPLY_APPROVE_GAS = 100_000n

export const MULTIPLY_QUERY_KEY_PREFIX = "multiply"

export const MULTIPLY_MIN_LEVERAGE = 1.1
export const MULTIPLY_LEVERAGE_STEP = 0.1
export const MULTIPLY_DEFAULT_LEVERAGE = 3

// Off: every loop is entered with its collateral (the supply asset) and the
// pair picker is one step. On: pool-share loops also take other assets.
export const MULTIPLY_PAY_WITH_OTHER_ASSETS = false
