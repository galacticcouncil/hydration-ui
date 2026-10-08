# v2 mounts the liquidity page's modals for swap-in supply and withdraw

The v2 money market reads only from `@galacticcouncil/money-market-v2`, and
ADR-0004 carves it away from v1. Three flows break that on purpose. For a
pool-share reserve, Supply opens `AddStablepoolLiquidityWrapper` and Withdraw
opens `RemoveMoneyMarketLiquidity`; for an isolated reserve, Supply opens
`SupplyIsolatedLiquidity`. All three are the liquidity page's own components,
mounted unchanged, exactly as the legacy money market mounts them.

These reserves are supplied from any asset in one step: the SDK router treats
Aave as a pool, so a swap into the aToken is the supply and a swap out of it is
the withdraw. v2's own forms cannot do that. A plain v2 supply needs the user to
already hold the pool share, and a plain v2 withdraw hands the raw pool share
back, to be redeemed on the liquidity page in a second step.

A v2-native swap-in form was rejected. It would re-implement roughly 1,500
lines of working flow — multi-asset add, slippage, supply-cap and debt-ceiling
checks, the intermediate health-factor consent on withdraw — for no change the
user would see. Editing the modals to take v2's data was rejected too: the
liquidity page's behaviour must not change, and none of what follows needed an
edit.

The modals need no v1 React context, only app-wide providers, which is why they
mount under `/money-market` as they are. What they do pull in is the cost:

- **v1 stays in the bundle.** They import queries, helpers and presentational
  components from `@galacticcouncil/money-market` and `@/api/borrow`. Deleting
  v1 is blocked on these three flows for as long as v2 mounts them.
- **A second health-factor engine.** The modals compute health factor in the
  SDK (`sdk.api.aave.getHealthFactor*`), not through v2's assessments
  (ADR-0011). The two can differ slightly, and no v2 finding is shown inside
  them. This is accepted and is not a porting bug.
- **One market only.** The modals are hard-wired to the main Hydration market's
  pool. v2 therefore opens them only while `hydration_v3` is selected: a reserve
  is pool-share only there, and an isolated reserve on any other market gets
  v2's `SupplyForm`, whose assessment already handles isolation.
- **v2 must refresh itself.** The modals invalidate no v2 read. v2 invalidates
  its market's queries from their `onSubmitted`, on the same delays as its own
  actions.
- **Liquidity-page copy.** Their toasts read as liquidity actions. Only the
  title is set from v2.

Revisit when v1 is being deleted, since these flows are then what keeps it
alive, or if the SDK's health factor and v2's are found to disagree by enough to
mislead. The fix in either case is the v2-native form built on the router, not
an edit to the liquidity page.
