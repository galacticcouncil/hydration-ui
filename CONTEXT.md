# Hydration UI

The web app for the Hydration protocol. This glossary records the terms this
codebase commits to, and the terms it deliberately avoids.

## Money market

Hydration runs a fork of Aave v3. Much of the code is inherited from Aave, so
where Aave's vocabulary and Hydration's product vocabulary disagree, the entries
below say which one wins.

### Assets and markets

**Market**:
One deployed lending pool, identified by an opaque key such as `hydration_v3` or
`gigahdx_v3`. A chain id never identifies one: several markets share a chain,
and mainnet and testnet report the same chain id as each other. A market is only
fully determined by its key together with the connection it is read over.
_Avoid_: Network, pool, chain

**Reserve**:
A single asset within a market, together with the terms on which it can be
supplied and borrowed.
_Avoid_: Pool, asset (when the market-specific terms are what's meant)

**Hollar**:
Hydration's native over-collateralised stablecoin, minted by borrowing against
collateral. It is what Aave calls GHO, and Aave's spelling survives in contract
and function names only.
_Avoid_: GHO

**aToken**:
The interest-bearing receipt token a supplier holds against their supplied
balance.
_Avoid_: Share token, deposit token

**Pool-share reserve**:
A reserve whose underlying token is a stableswap pool's share and which the app
supplies to and withdraws from through that pool, and shows as its aToken —
name, symbol and logo. It
is a declared list, not every reserve that holds a pool share: 2-Pool-PRIME,
2-Pool-apyUSD, 2-Pool-BIL and 3-Pool-MRL hold pool shares and are ordinary
reserves.
_Avoid_: Strategy reserve, strategy asset, special reserve

**Isolated reserve**:
A reserve the chain marks isolated by giving it a debt ceiling — PRIME and
apyUSD today. Read from chain state, never listed.
_Avoid_: Isolated-mode asset, PRIME (as a stand-in for the kind)

### Positions

**Position**:
What one user has supplied to and borrowed from one reserve, including whether
that supply is enabled as collateral.
_Avoid_: User reserve, computed user reserve, holding

**Account**:
A user's standing across every position in a market — health factor, totals,
borrowing power and active e-mode. It has no direct on-chain counterpart; it is
always derived.
_Avoid_: User, user summary, portfolio

**Health factor**:
How far an account sits from liquidation. A property of an account, never of a
reserve or a position.

**LTV**, **Liquidation threshold**:
Ratios that exist in two distinct forms: configured per reserve, and the
collateral-weighted average across an account. Say which is meant.
_Avoid_: Collateral factor (for LTV)

**Liquidation bonus**:
The premium over par a liquidator receives on the collateral it seizes. The same
figure, seen from the borrower's side, is shown to users as the liquidation
penalty; it is one parameter, not two.
_Avoid_: Liquidation fee

**Borrowing against**:
A reserve can be borrowed against another when the second, supplied as
collateral, could back a new borrow of the first under the two reserves'
configuration alone. It is a relation between reserves, not an account's
standing: e-mode, isolation mode and health factor can each narrow it for a
particular account. The reserves one can borrow against are its supported
collateral.

### Constraints

These limit different things and are deliberately not grouped under one term.

**Supply cap**, **Borrow cap**:
Ceilings on a reserve's total supplied and borrowed amounts.

**Debt ceiling**:
The cap on total debt issued against an isolated reserve's collateral.

**Isolation mode**:
The state of an account whose only collateral is a reserve marked isolated,
restricting what it may borrow.

**E-mode**:
An account-level category that raises borrowing power among correlated assets.
_Avoid_: Efficiency mode, category

**Siloed borrowing**:
A reserve restriction: when borrowed, it must be the account's only borrow.

### Rates

**Utilization**:
The share of a reserve's supplied liquidity currently borrowed. It is the input
to the reserve's interest-rate model.
_Avoid_: Usage ratio (outside contract field names)

**Interest-rate model**:
The curve that sets a reserve's variable borrow rate from its utilization: a
base rate, rising by one slope up to the optimal utilization and by a second,
steeper slope beyond it.
_Avoid_: Rate strategy (outside contract names)

**Reserve factor**:
The share of borrowers' interest the protocol keeps rather than passing to
suppliers.
_Avoid_: Liquidity fee, protocol fee

**Base APY**:
What a reserve's interest-rate model says. The only APY the money-market package
reports.
_Avoid_: Bare APY, raw APY

**Effective APY**:
What a supplier actually earns, or a borrower actually pays, on a reserve. Base
APY plus incentives for most reserves; a composite for an adjusted reserve. The
only APY the app displays, and it is composed in the app.
_Avoid_: Full APY, total APY, net APY (for a reserve)

**Adjusted reserve**:
A reserve whose effective APY includes yield from outside its market: staking or
native yield, LP fees, underlying reserve rates, a vault. Its base APY is never
displayed on its own.
_Avoid_: Overridden reserve, external reserve, enhanced

**Feed**:
An off-chain source of an asset's own yield, read over HTTP — Kamino, DefiLlama.
One part of an adjusted reserve's effective APY, not the whole.
_Avoid_: External APY

**Net APY**, **Earned APY**, **Debt APY**:
An account's return on its net worth: earned APY on its supplies minus debt APY
on its borrows, each weighted by USD across its positions. Properties of an
account, never of a reserve.
_Avoid_: Net APY (for a reserve's base-plus-incentives sum), supply APY and
borrow APY (at account level)

**Unavailable**:
The state of an effective APY when any of its inputs cannot be read and no
recent value is held. Distinct from zero, and never replaced by the base APY.
_Avoid_: N/A, missing

### Incentives

**Incentives**:
Reward emissions paid to suppliers and borrowers of a reserve, accrued per user
and claimable. Hydration mainnet emits GDOT and PRIME; other markets emit
nothing, which is a normal state rather than an error.
_Avoid_: Rewards, emissions, farming

### Actions

**Assessment**:
What one action would do for one account, with one amount, at one instant, and
whether it may proceed: the most that could be moved, the account the action
would leave behind, and the findings. Evaluated with no amount, it says whether
the action can be started at all.
_Avoid_: Validation, action state

**Finding**:
One thing an assessment reports about an action, identified by a code. Every
finding is exactly one of a blocker, a risk acknowledgement or a notice. Where
it is shown is the form's concern, not the finding's.
_Avoid_: Error (reserved for thrown failures), alert (a UI component), issue

**Blocker**:
A finding that means the action cannot proceed — it would revert, breach a
limit, or cause liquidation.
_Avoid_: Blocking error

**Risk acknowledgement**:
A finding that lets the action proceed only once the user explicitly accepts the
risk it describes.
_Avoid_: Consent, confirmation

**Notice**:
A finding that informs without blocking, in a warning or an info tone.
_Avoid_: Warning (as the noun), alert

### Data origin

The boundary that matters is where a value came from, not how far it has been
processed. Aave's `humanized` / `formatted` / `computed` / `extended` ladder
describes its own layering and is not used here.

**Reserve**, **Position**:
Chain state, decoded and validated. What the contracts said.

**Reserve summary**, **Position summary**:
Values computed from chain state — APYs, USD amounts, incentive APRs.
_Avoid_: Formatted, humanized, computed, extended

### Deliberately absent

Concepts that exist in Aave and in the blueprint, but which no Hydration market
configures. They are not part of this domain, and should not be reintroduced by
following the blueprint:

Faucet · WETH gateway · Permission manager and permissioned markets ·
Collateral swap · Debt switch · Withdraw and switch · v3 migration ·
Legacy (pre-v3) lending pool · Stable-rate borrowing
