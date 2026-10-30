const BPS = 10_000n
const LTV_MASK = 0xffffn
const BASE_TO_WAD = 10n ** 10n

/** one block of the vault, loop and Main debt state a headroom exit is judged on */
export type HeadroomState = {
  gapBps: number
  /** the collateral reserve's configuration bitmap; bits 0-15 are max LTV */
  reserveConfig: bigint
  /** collateral the vault supplies, as aTokens */
  supplied: bigint
  /** collateral the vault holds outright */
  idle: bigint
  roundingReserve: bigint
  totalAssets: bigint
  queuedCollateral: bigint
  /** shares not yet in an exit */
  supply: bigint
  /** the vault's Aave account, 8 decimals */
  collateralBase: bigint
  debtBase: bigint
  syntheticSupplied: bigint
  loopShares: bigint
  reservedShares: bigint
  /** the vault's loop equity, 8 decimals */
  sourceEquity: bigint
  sourceShares: bigint
  activeDebt: bigint
  activeCash: bigint
  queuedDebt: bigint
  protocolReserve: bigint
}

/**
 * Whether an exit of `collateral` starting now would settle from the vault's
 * LTV headroom instead of waiting for the loop's unwind, as
 * CompoundLogic._fromHeadroom decides it. The exit's own reward and fee
 * slices are left out, so it is an estimate.
 */
export const headroomExitFits = (
  s: HeadroomState,
  collateral: bigint,
): boolean => {
  const active = s.totalAssets - s.queuedCollateral
  const cap = s.reserveConfig & LTV_MASK
  const gap = BigInt(s.gapBps)
  if (collateral <= 0n || active <= 0n || s.supply <= 0n) return false
  if (cap <= gap || s.sourceShares <= 0n || s.loopShares <= s.reservedShares)
    return false
  const shares = (collateral * s.supply) / active
  const slice = ((s.loopShares - s.reservedShares) * shares) / s.supply
  if (slice === 0n) return false

  const idle = s.idle > s.roundingReserve ? s.idle - s.roundingReserve : 0n
  const leaving =
    (active * shares + s.supply - 1n) / s.supply +
    (s.queuedCollateral > idle ? s.queuedCollateral - idle : 0n)
  if (leaving >= s.supplied) return false
  const synth = s.syntheticSupplied / BASE_TO_WAD
  if (s.collateralBase <= synth) return false
  const room =
    (((s.collateralBase - synth) * (s.supplied - leaving)) / s.supplied) *
    (cap - gap)
  if (s.debtBase * BPS > room) return false

  const value = (s.sourceEquity * BASE_TO_WAD * slice) / s.sourceShares
  const need = (s.activeDebt * shares) / s.supply
  const cash = (s.activeCash * shares) / s.supply
  if (value === 0n || cash >= need) return false
  // the reserve takes what the slice can't cover, or the exit queues
  const shortfall = need - cash - value
  return shortfall <= 0n || s.queuedDebt + shortfall <= s.protocolReserve
}
