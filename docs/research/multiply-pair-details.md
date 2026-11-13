# Multiply: what more to show per loop pair

**Question:** the Multiply pairs table (`/strategies/multiply`) shows six things per loop. What else could we show about each pair in an expanded row, a detail panel or a pair page, and where would that data come from?

**Where this note lives:** the looper research notes (`research/looper-lark3-deployment`, `research/multiply-lifecycle`, `research/multiply-projection-helpers` on the `emil` remote) all used `docs/research/<topic>.md`. `docs/` does not exist on `feat/looper-ui` (the spec `docs/specs/looper-ui.md` was deleted in `1c69c42ec`), so this note follows that convention.

**Sources and how they are marked.** Repo paths are relative to the repo root on `feat/looper-ui` at `9b295d610` plus the working tree. "Live" figures were read on 2026-11-11 from Hydration mainnet: `UiPoolDataProvider 0x112b087b…99db0`, `getReservesData(0xf3Ba4D1b…A691)` over `https://rpc.hydradx.cloud`, decoded with the repo's own ABI (`packages/money-market/src/core/abi/ui-pool-data-provider.ts`). Everything marked **derived** is my arithmetic on those figures, using the app's formulas. Everything marked **unverified** was not confirmed against a primary source.

---

## TL;DR: top recommendations

1. **The liquidation price in debt terms, and how far away it is.** The table shows a risk chip but no liquidation level. The form shows a USD liquidation price, and only once an amount is typed (`MultiplyOpenForm.tsx:326-335`). For a pair, "liquidates if 1 vDOT < X DOT (−9.1 %)" is the number that matters. It is pure arithmetic over figures already loaded. Effort: S.
2. **The correlated "Low risk" chip hides depeg and oracle risk.** No mainnet eMode category has a price source (live: `eModePriceSource = 0x0` for DOT, vDOT, GDOT), so vDOT and DOT are priced by **separate oracles**. A vDOT/DOT ratio drop of about 9 % liquidates a max-leverage loop. `usePairRiskLevels` returns `low` for correlated pairs before it looks at any history (`hooks/usePairRiskLevels.ts:50`). Show the 30-day largest fall for correlated pairs too: the candles are already fetched per reserve. Effort: S.
3. **The APY breakdown, including what is missing from it.** The `ApyRate.parts` already split base, staking feed, native yield and incentives (`modules/money-market/apy/effectiveApy.ts:17-27`), and the Multiply tooltip shows only the two totals (`MultiplyPositionPreview.tsx:226-305`). Borrow-side incentives are **not** in Multiply's net APY (`effectiveApy.ts:157-160`). Show them, and add a **break-even collateral yield** of `(L−1)/L × borrow APY`. Effort: S.
4. **Net APY and HF across leverage, as a small table or sparkline.** At 2×, 3× and max: net APY, HF, liquidation distance. `projectMultiplyPosition` already does this per leverage (`utils/projection.ts:47-71`). Effort: S.
5. **Capacity: how much more can be looped.** Supply-cap room, borrow-cap/facilitator room, and the isolation debt-ceiling room. `getMaxDeposit` already computes this for the form (`MultiplyOpenForm.tsx:155-171`). The table shows only the debt asset's liquidity. Effort: S.
6. **Rate sensitivity and history.** For utilisation-priced debt (DOT), show the rate-model kink and the 30-day borrow APR. The app already has `InterestRateModelChart` and `ReserveRatesChart` (`modules/money-market/reserve/`). HOLLAR's rate is flat (slopes 0), which is worth saying instead. Effort: M (reusing the components).
7. **The mechanics card.** Collateral → aToken, the eMode category, about how many build steps and how long, the fee budget (refunded), slippage, how closing unwinds, and the contract addresses. All of it is static config or the unused `estimateRampRungs` (`utils/projection.ts:77-93`). Effort: S.

---

## 1. What the surfaces show today

| Surface | Per-pair content | Source |
|---|---|---|
| Strategy card (`/strategies`) | Best max net APY and best max leverage across the **preset** pairs only | `components/MultiplyStrategyCard.tsx:14-48` (uses `useMultiplyPairsMetrics()` with the default `MULTIPLY_PAIRS`) |
| Header | Logo, "Multiply", Leverage badge. Nothing about the pair. | `components/MultiplyHeader.tsx:11-31` |
| Pairs table (`MultiplyDetailsCard`) | Collateral, Debt, Risk chip (tooltip: 30-day largest fall vs liquidation buffer at max leverage), Max APY, Max leverage, Liquidity available (debt units + USD), Deposit button / remove menu for custom loops. A `DataTable` at ≥ xl, otherwise a `CardTable` with two stat columns. | `components/MultiplyPairs.columns.tsx:62-199`; `components/MultiplyDetailsCard.tsx:52-70`; `components/RiskBadge.tsx:39-51` |
| Open form (sidebar and `MultiplyDepositModal`) | Supply/Borrow APYs, net APY with a tooltip `L×supply − (L−1)×borrow`, HF, eMode label, risk chip at the chosen leverage. Once amount > 0: liquidation price (USD), entry cost vs oracle, fee budget. Errors: unavailable reason, over-max deposit, can't fill, low fee budget. | `components/MultiplyOpenForm.tsx:193-372`; `components/MultiplyPositionPreview.tsx:40-116`; `components/MultiplyDepositModal.tsx:19-58` |
| Pair-select modal / custom-loop wizard | Max leverage, risk, APY, fill hint at a $100 probe | `components/CustomLoopWizard.tsx:85,169,254-296`; `hooks/useLoopFills.ts:87-114` |

`usePairMetricsResolver` computes every per-pair figure (`hooks/useMultiplyPairMetrics.ts:57-123`, `getPairMetrics` at `:234-307`). It returns `lt`, `ltv`, `minHf`, `maxLeverage`, `maxLeverageHf`, `supplyApy`, `borrowApy`, `maxNetApy`, `availableLiquidity` and `unavailableReason`, plus both full `ReserveSummary` objects (`collateralReserve`, `debtReserve`). **Most of the candidates below are already in memory on that row,** because the whole `ReserveSummary` is there.

Pair config is static: addresses, `eMode`, `minHf 1.10`, `stepHf 1.05`, `slippageBps 100`, fee asset HDX, `feeReserve 5 HDX`, `feeBudget 100 HDX`. The fee values are marked as placeholders (`config/pairs.ts:39-49`). There are two presets, PRIME/HOLLAR (eMode 0) and vDOT/DOT (eMode 2) (`config/pairs.ts:51-76`), plus custom loops built from any two reserves (`config/pairs.ts:105-120`, `hooks/useMultiplyPairMetrics.ts:170-232`).

---

## 2. Data that is available per pair

### 2.1 What a `ReserveSummary` carries

`ReserveSummary` (`packages/money-market/src/types/index.ts:267-329`) has, per reserve:

- rates: `supplyApr/Apy`, `variableBorrowApr/Apy`, `supplyUsageRatio`, `borrowUsageRatio`;
- the rate model: `baseVariableBorrowRate`, `variableRateSlope1/2`, `optimalUsageRatio`;
- totals: `totalLiquidity(Usd)`, `availableLiquidity(Usd)`, `totalDebt(Usd)`, `unbacked`;
- price: `priceInUsd`;
- risk: `ltv`, `liquidationThreshold`, `liquidationBonus`, `reserveFactor`;
- caps: `supplyCap(Usd)`, `borrowCap(Usd)`, `debtCeiling(Usd)`, `isolationModeTotalDebtUsd`, `availableDebtCeilingUsd`;
- flags: `isActive/isFrozen/isPaused/isIsolated/borrowableInIsolation/isSiloedBorrowing/flashLoanEnabled`;
- eMode: `eModeCategoryId/Label/Ltv/LiquidationThreshold/LiquidationBonus`;
- incentives: `supplyIncentives[]`, `borrowIncentives[]` (`IncentiveApr`, `:244-250`).

**Read on chain but dropped by the app:** the ABI decodes `priceOracle` (`core/abi/ui-pool-data-provider.ts:146`) and `eModePriceSource` (`:234`). The zod schema does not keep them (`core/chain/schema.ts:46-105`), and neither does `Reserve` (`types/index.ts:55-105`). Showing an oracle address needs a small change in `packages/money-market`.

**Not available from UiPoolDataProvider here:** the liquidation protocol fee. It is not in the ABI (grep of `core/abi/` finds no `liquidationProtocolFee`).

### 2.2 Live mainnet figures (2026-11-11) for the two presets

| | PRIME | HOLLAR | vDOT | DOT |
|---|---|---|---|---|
| LTV / LT / liq. bonus | 85 % / 88 % / 7 % | 0 / 0 / 0 | 60 % / 70 % / 8 % | 80 % / 85 % / 7 % |
| eMode (id, LTV/LT/bonus) | 0 | 0 | 2 "DOT" 85 % / 92 % / 4.5 % | 2 "DOT" 85 % / 92 % / 4.5 % |
| eMode price source | — | — | `0x0` (none) | `0x0` (none) |
| Supply APR (base) | 0.308 % | 0 | ~0.000007 % | 0.986 % |
| Variable borrow APR | 1.013 % | **4.402 %** (base 4.402 %, slopes 0) | 0.009 % | 1.882 % (base 0, s1 2.75 %, s2 46.75 %, optimal 85 %) |
| Supply cap / borrow cap | 15 M / 3 M | 0 / 0 (cap lives in the facilitator) | 2 222 222 / 111 111 | 25 M / 17 M |
| Isolation | **isolated**, ceiling 12 000 000.00 USD, used 5 412 913.50 | `borrowableInIsolation = true` | no | no |
| Oracle (`priceOracle`) | `0x0922…82Cd` | `0x6096…34F8` | `0x2fFa…ad6C` | `0xFBCa…6702` |
| Oracle price (USD) | 1.0695 | 1.00 | 1.4401 | 0.8625 |

**Derived from the figures above, with the app's formulas:**

- PRIME/HOLLAR: max leverage = min(1.10/(1.10−0.88), 1/(1−0.85)) = **5.0×**, and HF at max = 1.10 (`utils/projection.ts:5-16,23-27`). The liquidation buffer is 1 − 1/1.10 = **9.1 %** (`utils/risk.ts:10`). The HOLLAR borrow APY is about 4.50 % (continuous compounding of 4.402 % APR). Break-even PRIME yield at 5× = 4/5 × 4.50 % ≈ **3.6 %**.
- vDOT/DOT in eMode 2: max leverage = min(1.10/0.18, 1/0.15) = 6.11 → slider **6.1×**, HF ≈ 1.10, buffer ≈ 9.1 %. The DOT borrow APY is about 1.90 %. Break-even vDOT yield at 6.1× ≈ 5.1/6.1 × 1.90 % ≈ **1.59 %**. vDOT's staking yield comes from DefiLlama; I did not fetch it.
- DOT utilisation from the rate model: 1.882 % = 2.75 % × u/0.85 → u ≈ **58 %**. The kink at 85 % takes the rate onto the 46.75 % slope.

---

## 3. Candidates

"Fetched?" means already in memory on the pair row (the `ReserveSummary` or metrics). "New query" means a request the page does not make today.

### 3.1 Risk

| Info | Why someone looping cares | Where it comes from | Fetched? | Effort |
|---|---|---|---|---|
| **Liquidation price as a collateral/debt ratio**, e.g. "1 vDOT = 1.52 DOT (−9.1 %)", at max and at the chosen leverage | A USD liquidation price with "debt price held fixed" (`utils/projection.ts:67-68`) is misleading for vDOT/DOT and PRIME/HOLLAR: what liquidates is the ratio. | `collateralReserve.priceInUsd / debtReserve.priceInUsd / hf`, with `hf` = `maxLeverageHf` (`useMultiplyPairMetrics.ts:299`) | yes | S |
| **Liquidation distance** (−% move to HF 1) | The one-number risk summary. It is already in the risk tooltip text, but only inside a tooltip (`RiskBadge.tsx:44-51`). | `getLiquidationBuffer(hf)` (`utils/risk.ts:10`) | yes | S |
| **30-day largest fall for correlated pairs too** | Correlated is hard-coded Low (`hooks/usePairRiskLevels.ts:50`, `utils/risk.ts:43`). On mainnet no eMode category has a price source (live, table 2.2), so vDOT and DOT are priced by different oracles. Aave uses the category price only when it is nonzero (aave-v3-core `GenericLogic.calculateUserAccountData`, https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/libraries/logic/GenericLogic.sol). A vDOT redemption-rate or oracle hiccup can liquidate. | candles are already fetched per reserve (`usePairRiskLevels.ts:30-42`); only the early return needs removing to compute it | data yes | S |
| **Oracle source per leg** (address, and type if known) | It tells the user what prices the position: the HOLLAR oracle prices at a flat 1.00, the vDOT oracle is separate from DOT's. | `priceOracle` in the ABI (`ui-pool-data-provider.ts:146`), dropped by the schema (`core/chain/schema.ts:46-105`) | **no**, needs a schema/type field | S–M. What each oracle *is* (EMA? redemption rate?) is **unverified**: no Hydration doc in the reference index covers oracles (https://raw.githubusercontent.com/galacticcouncil/hydration/main/general/hydration.md has no oracle section). |
| **Liquidation penalty** (bonus 7 % PRIME, 4.5 % in eMode DOT) and how much can be seized | It is what a liquidation costs the user. In upstream Aave v3, 50 % of debt is closable while HF > 0.95 and 100 % below it (`LiquidationLogic.sol`: `DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4`, `CLOSE_FACTOR_HF_THRESHOLD = 0.95e18`, https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/libraries/logic/LiquidationLogic.sol). | `liquidationBonus` / `eModeLiquidationBonus` on `ReserveSummary` (`types/index.ts:299,325`) | yes | S. Whether Hydration's fork keeps these close-factor constants is **unverified**. Hydration also runs "partial automated liquidations at the start of each block" (`general/hydration.md`). |
| **Time to liquidation from interest alone** (prices flat) | The copy says "Positions don't deleverage automatically" (`strategies.json:124`). If borrow > supply, HF decays. | **derived**: `HF(t) ≈ HF₀·e^{(s−b)t}` on the leveraged legs, so `t ≈ ln(HF₀)/(L/(L−1)·… )`. Needs a careful formula and a test; `getNetApy` is a starting point (`utils/projection.ts:41-45`). | yes | M. The formula is mine and **unverified**. |
| **HF sensitivity table**: HF and liquidation distance at 2×, 3×, max | It shows the user the leverage/risk trade-off before they touch the slider. | `getDeployHealthFactor` (`utils/projection.ts:23-27`) | yes | S |
| **Capacity left**: collateral supply-cap room, debt borrow-cap room (or the HOLLAR facilitator), isolation debt-ceiling room, and the resulting max deposit at the default leverage | The table shows only debt liquidity (`MultiplyPairs.columns.tsx:119-138`). For PRIME the binding limit can be the 12 M USD isolation ceiling (5.41 M used, live). | `getMaxDeposit` (`utils/projection.ts:189-218`) as called in `MultiplyOpenForm.tsx:155-171`; facilitator room at `useMultiplyPairMetrics.ts:79-87` | yes | S |
| **Exit liquidity**: loss to unwind $X now | Closing sells aToken → debt through intents. If the route is thin, a close stalls or loses. A `cantUnwind` copy key already exists (`strategies.json:118`). | `useLoopFillHints` probes ramp and unwind at $100 (`hooks/useLoopFills.ts:17-18,87-114`). It is used only in the wizard. | wizard only | S (more probe sizes: M, because the price API is rate-limited per `usePairRiskLevels.ts:22-26`) |
| **Reserve status flags** (frozen, paused, isolated, siloed) | Today they show only as an unavailable reason (`utils/availability.ts:53-79`). | `ReserveSummary` flags | yes | S |

### 3.2 Yield

| Info | Why someone looping cares | Where it comes from | Fetched? | Effort |
|---|---|---|---|---|
| **Supply APY breakdown**: base + staking feed (vDOT, DefiLlama) / native yield (PRIME, Kamino) + incentives | Nearly all of a loop's yield is the collateral's *external* yield (PRIME base supply APR is only 0.31 % live). Users should see what they depend on. | `ApyRate.parts` (`apy/effectiveApy.ts:17-27,89-130`); feeds mapped in `api/external/defillama.ts:35-41` and `api/external/kamino.ts:20-22`; the existing `ApyTooltip` (`apy/ApyTooltip.tsx:148`) | yes | S |
| **Borrow incentives** | They are excluded from the borrow rate by design (`effectiveApy.ts:157-160`, `:178-197`), so `maxNetApy` (`useMultiplyPairMetrics.ts:279-291`) leaves them out. A borrow-incentivised debt would be undersold. | `debtReserve.borrowIncentives` (`types/index.ts:328`) | yes | S |
| **Break-even collateral yield** = `(L−1)/L × borrowApy` | It reframes the bet: "the loop pays while PRIME yields above 3.6 %" (derived, §2.2). | arithmetic | yes | S |
| **Net APY by leverage** (curve or 3–4 points) | Net APY is linear in L and can turn negative. The table shows only the max. | `getNetApy` (`utils/projection.ts:41-45`) | yes | S |
| **Borrow-rate model and current utilisation** (kink) | A DOT loop's cost jumps past 85 % utilisation (s2 = 46.75 %, live). HOLLAR is flat at 4.40 % (slopes 0, live), so its rate is a governance setting, not market-driven. | `InterestRateModelChart` (`modules/money-market/reserve/InterestRateModelChart.tsx:19-35`), fields on `ReserveSummary` | yes | M (embed) |
| **Historical supply/borrow APR (1M/6M/1Y)** | Is today's spread typical? | `reserveRatesQuery` (Grafana, `api/grafana/reserveRates.ts:35-73`), `ReserveRatesChart` (`modules/money-market/reserve/ReserveRatesChart.tsx:70-85`) | **new query** per reserve | M |
| **Historical external yield** (vDOT staking, PRIME Kamino) | The external feed dominates the yield, so its stability matters. | DefiLlama chart history (`api/external/defillama.ts:21-60`), Kamino history (`api/external/kamino.ts:24-…`). The app reads only the latest value (`defillamaLatestApyQuery`, `:88`). | **new query** | M |
| **Historical net APY at a given leverage** | The honest version of "Max APY". | combine the two above | new | L |

### 3.3 Mechanics

| Info | Why someone looping cares | Where it comes from | Fetched? | Effort |
|---|---|---|---|---|
| **Legs**: deposit X → supplied as aX (asset id), borrow Y variable, eMode category label | It says what the user actually ends up holding. | `pair.aCollateralAssetId`, `pair.eMode`, `collateralReserve.eModeLabel` (`config/pairs.ts:18-36`) | yes | S |
| **How it builds**: about N steps, roughly T minutes | The position ramps through one intent per step (`i18n/content/multiply/en.mdx:7`). Step count depends on L and the 1 % intent floor (`utils/projection.ts:95-133`). | `estimateRampRungs` (`utils/projection.ts:77-93`, **unused** today). Timing per rung of 2–4 blocks is an *inference* in `emil/research/multiply-lifecycle:docs/research/multiply-lifecycle.md` §3. | yes | S. Timing is **unverified**: no mainnet run has been measured. |
| **Fees**: fee budget (HDX, refunded on close), fee reserve, slippage per swap, entry cost vs oracle | Total cost of entering. Budget and reserve are placeholders (`config/pairs.ts:45-48`). | pair config; `getEntryCost` (`utils/projection.ts:139-154`) is already in the form | yes | S |
| **Unwind / withdrawal path** | Withdraw keeps the leverage and repays debt pro rata (`utils/projection.ts:156-166`). Close unwinds everything and pays out the remainder, fee budget included (`en.mdx:7-11`). Paused positions can still withdraw or close (`multiply-lifecycle.md` §5). | static copy | n/a | S |
| **Contracts**: factory, collateral, aToken, debt, variable-debt token | Transparency, and a link to the explorer. | `LOOPER_FACTORY_ADDRESS` and the pair fields (`config/pairs.ts:14-36`) | yes | S |
| **Factory max leverage vs reserve max** | The form caps at the lower of the two (`MultiplyOpenForm.tsx:100-102`, `hooks/useLooperFactory.ts:15-33`). Showing both explains a lower slider. | `useFactoryMaxLeverage` | per pair, on demand | S |
| **Positions and TVL in Multiply for this pair** | Social proof and concentration. | Not cheap: the factory NFT is not enumerable, so the app scans `ownerOf` over every id (`hooks/useMultiplyPositions.ts:54-99`). A per-pair total would need `params()` and `nav()` on **every** position. | **no** | L. Better solved by an indexer or a contract view. |
| **Past liquidations on the reserves** | Has this collateral been liquidated in practice? | The Neckwork money-market events endpoint is per **account** (`packages/indexer/src/neckwork/money-market.ts:18-52`, path `/v1/accounts/{account}/money-market-events`), so per reserve it is not available. The MCP explorer exposes only chain-wide liquidation counts. | **no** | L. **Unverified** whether any per-reserve endpoint exists. |

---

## 4. Suggested layout

These are ordered by how much each item changes the decision to loop, and every item here uses data already loaded:

**Expanded row / detail panel**

1. **Risk strip:** liquidation ratio and distance at max leverage, liquidation penalty, oracle note ("vDOT and DOT priced separately"), 30-day largest fall (correlated pairs included).
2. **Yield strip:** supply APY parts, borrow APY (+ borrow incentives), break-even yield, net APY at 2× / 3× / max.
3. **Capacity:** max deposit now, plus which limit binds (supply cap, borrow cap or facilitator, isolation ceiling).
4. **How it works:** legs and eMode, about N steps, fee budget (refunded), slippage, unwind path, contract links.

**On a pair page only** (needs new queries): APR history, external-yield history, the rate-model chart, and exit-liquidity probes at several sizes.

## 5. Unverified or open

- The oracle *type* behind each `priceOracle` address (EMA, redemption-rate, fixed). No Hydration doc in the reference index covers it.
- Whether Hydration's Aave fork keeps the upstream close factor (50 % / 100 % at HF 0.95) and what its liquidation protocol fee is. I read only upstream `aave-v3-core`.
- The live vDOT (DefiLlama) and PRIME (Kamino) yields. Not fetched, so the net APY examples in §2.2 stop at break-even.
- Ramp timing and the real per-step fee on mainnet. The research notes are inference or lark3-only, and the pair config marks them as placeholders (ticket #101).
- The time-to-liquidation-from-interest formula in §3.1 is my derivation and needs a test before it ships.
