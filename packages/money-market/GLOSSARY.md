# Money market

Terminology shared by the lending package and the app's money-market pages.

## Markets and assets

**Market**:
One lending pool with its own reserves, positions and risk settings. Hydration, BIL and GIGAHDX are separate markets on the same chain.
_Avoid_: Network or chain as a synonym for market

**Reserve**:
One underlying asset within one market, together with its liquidity, debt, rates and risk settings. The same asset can belong to reserves in several markets.

**Underlying asset**:
The asset supplied to or borrowed from a reserve, such as PRIME. It is distinct from the aToken issued for a supply.

**aToken**:
The interest-bearing receipt token representing a supply to a reserve, such as aPRIME for PRIME. It is distinct from the borrowed asset and its debt token.

**Variable debt token**:
The token recording a user's outstanding variable-rate debt in a reserve.

**Pool-share reserve**:
A reserve whose underlying asset is a stableswap pool share. Supported main-market pool-share reserves are displayed by their aToken names, such as GDOT rather than 2-Pool-GDOT.

**Hollar facilitator bucket**:
A market's Hollar minting allowance: its capacity is the maximum amount it may mint, and its level is the amount already minted. The remaining capacity limits Hollar borrowing because Hollar is minted rather than supplied by lenders.
_Avoid_: Hollar liquidity as a synonym for remaining minting capacity

## Accounts and actions

**Position**:
One user's supplied balance, variable debt and collateral status in one reserve.

**Account**:
A user's standing across all positions in one market, including total supplies, collateral, debt, borrowing power and health factor.
_Avoid_: Wallet balance as a synonym for a supplied position

**Reserve summary**:
A reserve's accrued balances, rates, prices and limits evaluated at one point in time.

**Position summary**:
A position's accrued supply and debt, their values and its collateral status evaluated at one point in time.

**Supply**:
Lending an underlying asset to a reserve in exchange for aTokens. A supplied asset contributes to borrowing power only when enabled as collateral.

**Withdrawal**:
Taking an underlying asset out of a supplied position by redeeming its aTokens. GIGAHDX stHDX positions are managed through staking.

**Assessment**:
An evaluation of a proposed action: its maximum amount, projected account standing and findings.

**Finding**:
An assessment result that prevents an action (blocker), requires acceptance of a risk (acknowledgement), or provides information (notice).

**Projection**:
The account standing expected after a proposed action, including any accompanying collateral changes.

**Action plan**:
The ordered calls needed to carry out an action, including collateral changes when required.

## Collateral and limits

**Collateral**:
A supplied asset enabled to back borrowing. Reserve eligibility and a user's collateral setting are distinct: an eligible asset can be supplied without being enabled for that user.

**Isolation mode**:
An account state in which one isolated reserve is its only collateral. Borrowing is restricted to assets allowed in isolation and subject to that reserve's debt ceiling.

**Isolation join**:
A supply that explicitly enables an isolated asset as the account's only collateral, disabling other collateral when necessary.

**Efficiency mode (e-mode)**:
A market category with specific collateral parameters for related assets. An account selecting a category can borrow only assets permitted by that category.

**Health factor**:
Collateral value weighted by liquidation thresholds, divided by debt value. A value below 1 indicates liquidation risk; an account with no debt has an unbounded health factor.

**Supply cap**:
The maximum total amount of an underlying asset that may be supplied to its reserve.

**Borrow cap**:
The maximum total amount of an underlying asset that may be borrowed from its reserve.

**Debt ceiling**:
The limit on debt incurred against an isolated reserve. It limits borrowing, rather than the amount supplied.

## Yield and rewards

**Base APY**:
A reserve's annualized supply yield or variable borrowing cost from lending interest alone.

**Effective APY**:
The rate displayed after composing the applicable base rate, underlying yields, liquidity fees, supply incentives or vault yield. Borrow rates include the base cost and applicable underlying yields; borrow rewards are counted separately.

**Net APY**:
The account's annualized supply earnings and borrow rewards, less borrowing costs, divided by its net worth.

**Claimable reward**:
An incentive-token amount accrued to a user and available to claim from its incentive controller. It is separate from interest included in supplied balances.
