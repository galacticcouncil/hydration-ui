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

### Incentives

**Incentives**:
Reward emissions paid to suppliers and borrowers of a reserve, accrued per user
and claimable. Hydration mainnet emits GDOT and PRIME; other markets emit
nothing, which is a normal state rather than an error.
_Avoid_: Rewards, emissions, farming

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
