# Hydration UI

The Hydration web app: trading, liquidity, lending and yield strategies on the Hydration chain.

## Strategies

**Strategy**:
A packaged yield product shown as one card on the Strategies page with its own detail page (Propeller, BIL, Hollar Bonds).

**Propeller**:
The leveraged-staking strategy. One strategy spanning several Vaults that share a single leveraged loop (the SubLoop).
_Avoid_: Propeller ETH, Propeller tBTC (as strategy names)

**Vault**:
One Propeller deposit venue per collateral asset, with its own share token, cap, pause state, exchange rate and withdrawal queue. Labelled in the UI by its asset symbol.
_Avoid_: Propeller asset, sub-strategy

**Share token**:
The token a Vault mints on deposit (pETH, ptBTC); accrues value against the collateral asset.

**Position**:
A user's share balance in one Vault. A user has at most one Position per Vault.

**Withdrawal**:
A redemption request in one Vault's queue; pays out that Vault's collateral asset, possibly in several settlements.
_Avoid_: Redemption (in UI copy)
