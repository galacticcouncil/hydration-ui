const BPS = 10_000n
const LTV_MASK = 0xffffn
const BASE_TO_WAD = 10n ** 10n

/**
 * How the keeper deploys the vault's waiting borrowing credit: one entry-lane
 * slice per rebalance, up to the band's target LTV (CompoundLogic.rebalance).
 * Deploying borrows Main debt, which closes headroom before a waiting exit starts.
 */
export type DeploymentState = {
  /** collateral the vault has borrowing credit for and has not deployed */
  credit: bigint
  /** the band's target gap under the collateral's max LTV, bps */
  bandGapBps: number
  /** HOLLAR one rebalance borrows at most: the entry lane's maximum */
  sliceHollar: bigint
  /** seconds between the keeper's deploying rebalances, as measured */
  sliceSeconds: number
}

/** one block of the vault, loop and Main debt state a headroom exit is judged on */
export type HeadroomState = {
  /** false while the vault has headroom exits off: every exit unwinds */
  headroomOn?: boolean
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
  /** null when the keeper has nothing to deploy or its pace is unknown */
  deployment?: DeploymentState | null
}

/** What an exit's start takes from the vault, as CompoundLogic.startExit computes it. */
type ExitQuote = {
  shares: bigint
  slice: bigint
  /** loop equity of the slice, HOLLAR */
  value: bigint
  /** the slice's share of Main debt and cash, HOLLAR */
  need: bigint
  cash: bigint
  /** whether _fromHeadroom settles it; otherwise it waits for the unwind */
  headroom: boolean
}

const quoteExit = (s: HeadroomState, collateral: bigint): ExitQuote | null => {
  const active = s.totalAssets - s.queuedCollateral
  if (collateral <= 0n || active <= 0n || s.supply <= 0n) return null
  const shares = (collateral * s.supply) / active
  const slice =
    s.loopShares > s.reservedShares
      ? ((s.loopShares - s.reservedShares) * shares) / s.supply
      : 0n
  const value =
    s.sourceShares > 0n
      ? (s.sourceEquity * BASE_TO_WAD * slice) / s.sourceShares
      : 0n
  const need = (s.activeDebt * shares) / s.supply
  const cash = (s.activeCash * shares) / s.supply
  return {
    shares,
    slice,
    value,
    need,
    cash,
    headroom: headroomOpen(s, active, shares, slice, value, need, cash),
  }
}

const headroomOpen = (
  s: HeadroomState,
  active: bigint,
  shares: bigint,
  slice: bigint,
  value: bigint,
  need: bigint,
  cash: bigint,
) => {
  if (s.headroomOn === false) return false
  const cap = s.reserveConfig & LTV_MASK
  const gap = BigInt(s.gapBps)
  if (cap <= gap || slice === 0n) return false
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
  if (value === 0n || cash >= need) return false
  // the reserve takes what the slice can't cover, or the exit queues
  const shortfall = need - cash - value
  return shortfall <= 0n || s.queuedDebt + shortfall <= s.protocolReserve
}

/**
 * The vault after an exit starts. A headroom exit leaves its loop slice and
 * Main debt with the holders who stay, unwinding only a surplus over that debt
 * (or handing a shortfall to the reserve); any other exit unwinds its slice
 * and takes its debt and cash share into the queue.
 */
const startExit = (
  s: HeadroomState,
  q: ExitQuote,
  collateral: bigint,
): HeadroomState => {
  const left = {
    ...s,
    supply: s.supply - q.shares,
    queuedCollateral: s.queuedCollateral + collateral,
  }
  const owed = q.need - q.cash
  const unwindSlice = (slice: bigint) => ({
    loopShares: left.loopShares - slice,
    sourceShares: s.sourceShares - slice,
    sourceEquity:
      q.slice === 0n
        ? s.sourceEquity
        : s.sourceEquity - (q.value * slice) / q.slice / BASE_TO_WAD,
  })
  if (!q.headroom)
    return {
      ...left,
      ...unwindSlice(q.slice),
      activeDebt: s.activeDebt - q.need,
      activeCash: s.activeCash - q.cash,
      queuedDebt: s.queuedDebt + owed,
    }
  if (owed > q.value) {
    // only the shortfall's share of debt and cash leaves with the exit
    const shortfall = owed - q.value
    return {
      ...left,
      activeDebt: s.activeDebt - (q.need * shortfall) / owed,
      activeCash: s.activeCash - (q.cash * shortfall) / owed,
      queuedDebt: s.queuedDebt + shortfall,
    }
  }
  return {
    ...left,
    ...unwindSlice(q.slice - (q.slice * owed + q.value - 1n) / q.value),
  }
}

/**
 * HOLLAR the keeper borrows deploying the vault's credit, in all: up to the
 * band's target LTV and the credit's own borrowing room. The shared admission
 * budget refills, so it paces the slices rather than capping the total.
 */
const deployableHollar = (s: HeadroomState, d: DeploymentState) => {
  const synth = s.syntheticSupplied / BASE_TO_WAD
  const value = s.collateralBase > synth ? s.collateralBase - synth : 0n
  const cap = s.reserveConfig & LTV_MASK
  const gap = BigInt(d.bandGapBps)
  const target = cap > gap ? cap - gap : 0n
  const targetDebt = (value * target) / BPS
  if (d.credit === 0n || s.supplied === 0n || s.debtBase >= targetDebt)
    return 0n
  const credited =
    (value * (d.credit < s.supplied ? d.credit : s.supplied)) / s.supplied
  const add8 = targetDebt - s.debtBase
  const room8 = (credited * target) / BPS
  return (add8 < room8 ? add8 : room8) * BASE_TO_WAD
}

/** The vault after the keeper borrows `hollar` and deposits it into the loop. */
const deploy = (s: HeadroomState, hollar: bigint): HeadroomState => {
  const base = hollar / BASE_TO_WAD
  const minted =
    s.sourceEquity > 0n ? (base * s.sourceShares) / s.sourceEquity : 0n
  return {
    ...s,
    debtBase: s.debtBase + base,
    activeDebt: s.activeDebt + hollar,
    sourceEquity: s.sourceEquity + base,
    sourceShares: s.sourceShares + minted,
    loopShares: s.loopShares + minted,
  }
}

export type PendingExit = {
  collateral: bigint
  /** seconds from the state's block until the keeper starts it */
  startsIn: number
}

export type ProjectedExit = {
  /** settles from headroom at its start; otherwise it waits for the unwind */
  viaHeadroom: boolean
  /**
   * HOLLAR the loop's unwind must free before the exit settles: its slice's
   * equity, up to the debt it owes; its cash share and a reserve-covered
   * shortfall settle on the first keeper turn, and headroom frees nothing
   */
  unwind: bigint
  /** HOLLAR the keeper has deployed into the loop by its start */
  deployed: bigint
  /** HOLLAR it still deploys after the start, toward the band target */
  deployLater: bigint
}

/**
 * Which waiting exits will settle from headroom, in queue order: each starts
 * only after the keeper has deployed the credit it reaches by then, and on what
 * the exits ahead of it left of the room. An exit that unwinds still starts,
 * so the ones behind it are judged too; they settle after it all the same.
 */
export const projectHeadroomExits = (
  s: HeadroomState,
  exits: PendingExit[],
): ProjectedExit[] => {
  const d = s.deployment
  const total = d ? deployableHollar(s, d) : 0n
  let state = s
  let deployed = 0n
  return exits.map(({ collateral, startsIn }) => {
    if (d && total > deployed) {
      // an unmeasured keeper deploys at once: the earliest the headroom closes
      const paced =
        d.sliceSeconds > 0
          ? d.sliceHollar *
            BigInt(Math.ceil(Math.max(startsIn, 0) / d.sliceSeconds))
          : total
      const reached = paced < total ? paced : total
      if (reached > deployed) {
        state = deploy(state, reached - deployed)
        deployed = reached
      }
    }
    const q = quoteExit(state, collateral)
    if (!q)
      return {
        viaHeadroom: false,
        unwind: 0n,
        deployed,
        deployLater: total - deployed,
      }
    state = startExit(state, q, collateral)
    const owed = q.need > q.cash ? q.need - q.cash : 0n
    return {
      viaHeadroom: q.headroom,
      unwind: q.headroom ? 0n : q.value < owed ? q.value : owed,
      deployed,
      deployLater: total - deployed,
    }
  })
}
