// An under-gassed rung does not revert: LooperLogic catches the out-of-gas and
// records an AaveRefused stall, so these stay generous rather than estimated.
// ponytail: placeholders until the lark3 measurement ticket (#101) records real gas per action
export const MULTIPLY_OPEN_GAS = 5_000_000n
export const MULTIPLY_ACTION_GAS = 3_500_000n

export const MULTIPLY_QUERY_KEY_PREFIX = "multiply"

export const MULTIPLY_MIN_LEVERAGE = 1.1
export const MULTIPLY_LEVERAGE_STEP = 0.1
export const MULTIPLY_DEFAULT_LEVERAGE = 3
