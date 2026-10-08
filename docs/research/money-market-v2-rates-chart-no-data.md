# Money market v2: why the rates chart is empty for some assets

Branch `feat/money-market-v2` at `8c5e9692f` plus uncommitted work, read on
2026-10-07 around 15:30 UTC. Mainnet backend and mainnet chain state. Paths are
relative to the repo root; `v2 app` = `apps/main/src/modules/money-market-v2`.
The chart was not opened in a running app: everything below comes from source,
from replaying the app's request against the backend, and from `eth_call`.

Each statement is marked **[verified]** (I ran it or read it at the cited
place) or **[inferred]**.

## 1. Short answer

**Why.** The chart in question is `ReserveRatesChart` (supply and borrow APR
history). It is empty for 16 reserves, and for all of them the cause is the
same: the pool has borrowing disabled on that reserve, so nobody pays interest
on it, so its supply rate has been exactly 0 in every event the pool ever
emitted. The backend has the events, the UI asks with the right key, and the
answer is a row of zeros. Three layers then turn "always 0" into "no data":
the chart drops the borrow series when borrowing is disabled, the client drops
every point whose rate is `<= 0`, and the SQL drops buckets where both rates
are 0.

**Can it be shown.** No, because there is nothing to show. The value is a true
zero, not a gap. Any other source (another indexer, `eth_getLogs`, the pool's
current state) returns the same zero. What a supplier of these assets earns
comes from the underlying asset (stableswap fees, GDOT, vault yield), which is a
different quantity from another backend and would be a new feature, not a fix
for this chart.

**Recommended action.** Do not mount the chart when the reserve cannot have a
supply rate. One condition in `v2 app/ReserveDetailPage.tsx:458`, derived from
the reserve itself, reusing the test v1 already uses for the same purpose. No
asset list. Details in section 5.

**Two separate problems found on the way, neither a reason to hide anything:**

- The production indexer behind this chart is stalled at block 14,879,116
  (2026-09-21 20:05:30 UTC), 16 days behind the chain. Every rate chart is
  missing its last 16 days. Section 4.4.
- Quiet reserves show "Not enough data" on short ranges because the query only
  returns 4-hour buckets in which an event happened. WBTC on the default 1M
  range is the live case. This is fixable in the query. Section 4.5.

## 2. Per-asset result

Method: the reserve list and flags were read from each pool with `eth_call` at
block 15,512,246 (section 4.3). For every reserve the app's SQL was evaluated
with the app's exact key (pool lowercased, reserve checksummed) over the three
ranges the chart offers, ending 2026-10-07T15:00Z. `s`/`b` are the number of
4-hour buckets with a supply / borrow rate above 0, which is what survives
`zipRates`. "Chart" is what `ChartState` would render given the series filter
in `ReserveRatesChart.tsx:86`.

All 31 on-chain (pool, reserve) pairs matched an indexed pair exactly, and the
index holds no pair that is not on chain **[verified]**.

### Hydration market, pool `0x1b02E051683b5cfaC5929C25E84adb26ECf87B38`

| Asset | Id | Borrowing | 1M s/b | 6M s/b | 1Y s/b | Chart | Reason |
|---|---|---|---|---|---|---|---|
| USDC | 22 | on | 85/85 | 1002/1002 | 2095/2095 | data | |
| USDT | 10 | on | 86/86 | 1004/1004 | 2095/2095 | data | |
| DOT | 5 | on | 85/85 | 1003/1003 | 2096/2096 | data | |
| vDOT | 15 | on | 53/53 | 395/395 | 1166/1166 | data | |
| tBTC | 1000765 | on | 85/85 | 1003/1003 | 2001/2001 | data | |
| ETH | 34 | on | 84/84 | 986/986 | 2067/2067 | data | |
| PAXG | 39 | on | 71/71 | 762/762 | 1393/1393 | data | |
| PRIME | 43 | on | 20/20 | 367/367 | 626/626 | data | |
| SOL | 1000752 | on | 69/69 | 839/839 | 1072/1072 | data | |
| EURC | 44 | on | 58/58 | 603/603 | 637/637 | data | |
| apyUSD | 46 | on | 26/26 | 264/264 | 264/264 | data | |
| WBTC | 19 | on (frozen) | 0/0 | 68/68 | 366/366 | **empty on 1M only** | Quiet reserve plus stalled indexer, section 4.5. Not a hide case. |
| 2-Pool-GDOT | 690 | off | 0/0 | 0/0 | 0/0 | **always empty** | Supply rate always 0 |
| 2-Pool-GETH | 4200 | off | 0/0 | 0/0 | 0/0 | **always empty** | Supply rate always 0 |
| 2-Pool-GSOL | 90001 | off | 0/0 | 0/0 | 0/0 | **always empty** | Supply rate always 0 |
| 3-Pool | 103 | off | 0/2 | 0/31 | 0/343 | **always empty** | Supply rate always 0; borrow series not drawn |
| 2-Pool-HUSDC | 110 | off | 0/57 | 0/874 | 0/1798 | **always empty** | same |
| 2-Pool-HUSDT | 111 | off | 0/85 | 0/966 | 0/1793 | **always empty** | same |
| 2-Pool-HUSDS | 112 | off | 0/11 | 0/151 | 0/923 | **always empty** | same |
| 2-Pool-HUSDe | 113 | off | 0/5 | 0/86 | 0/745 | **always empty** | same |
| 2-Pool-HEURC | 10044 | off | 0/68 | 0/958 | 0/1001 | **always empty** | same |
| SIGIL | 816 | off | 0/0 | 0/2 | 0/2 | **always empty** | same |
| 2-Pool-PRIME | 143 | off | 0/1 | 0/1 | 0/1 | **always empty** | same |
| 2-Pool-apyUSD | 146 | off | 0/1 | 0/1 | 0/1 | **always empty** | same |
| 2-Pool-BIL | 10055 | off | 0/1 | 0/1 | 0/1 | **always empty** | same |
| 3-Pool-MRL | 105 | off | 0/1 | 0/1 | 0/1 | **always empty** | same |
| HOLLAR | `0x531a…f99a` | on | 0/78 | 0/903 | 0/1851 | not mounted | The Hollar page renders `HollarBorrowInfo` instead of `InterestRates` (`ReserveDetailPage.tsx:196-203`) |

### BIL market, pool `0x69310FdA58c819aD82df7d2Cb61841C853337a53`

| Asset | Id | Borrowing | 1M s/b | 6M s/b | 1Y s/b | Chart | Reason |
|---|---|---|---|---|---|---|---|
| uBIL | 550 | off | 0/9 | 0/103 | 0/103 | **always empty** | Supply rate always 0 |
| HOLLAR | `0x531a…f99a` | on | 0/0 | 0/2 | 0/2 | not mounted | Hollar page |

### GIGAHDX market, pool `0x2Ce2CfFF743CdB6637F4B5D351937A541B8c8923`

| Asset | Id | Borrowing | 1M s/b | 6M s/b | 1Y s/b | Chart | Reason |
|---|---|---|---|---|---|---|---|
| stHDX | 670 | off | 0/0 | 0/0 | 0/0 | **always empty** | Supply rate always 0 |
| HOLLAR | `0x531a…f99a` | on | 0/8 | 0/148 | 0/148 | not mounted | Hollar page |

### The pattern

The split is exact **[verified]**: the chart is always empty for a reserve if
and only if `borrowingEnabled` is false. All 16 such reserves have variable
debt total supply 0 and `currentLiquidityRate` 0 on chain today, and a maximum
indexed `liquidityRate` of 0 across their whole history (query in 4.2). All 11
non-Hollar reserves with borrowing enabled have data.

None of the other candidate explanations holds:

- Recent listing: 2-Pool-GDOT has 196,948 indexed events since 2025-05-03 and
  is empty; apyUSD was listed 2026-05-31 and has data.
- Different market: all three pools are indexed (4.2).
- Frozen or paused: no reserve is paused; the one frozen reserve (WBTC) has
  data on 6M and 1Y.
- Key mismatch (casing, aToken vs underlying, id format): all 31 pairs match
  with the key the app builds. The two exact-shape replays in 4.2 return
  HTTP 200 with a well-formed frame.

## 3. What "no data" is, concretely

Three filters stack. Any one of the last two is enough to empty the chart.

1. `v2 app/ReserveRatesChart.tsx:86` keeps the borrow series only when
   `reserve.borrowingEnabled`. For the 16 reserves only supply is left.
2. `v2 app/reserveRates.ts:22-26` (`zipRates`) discards every point with
   `rate <= 0`. Their supply rate is always 0, so the supply series is `[]`.
3. `v2 app/reserveRates.sql:12-13` (`HAVING ... > 0 OR ... > 0`) discards
   buckets where both rates are 0. This is why GDOT, GETH, GSOL and stHDX return
   no rows at all, while 3-Pool and the others return rows whose borrow rate is
   the model's flat 2 % base rate.

`ReserveRatesChart.tsx:208` then passes `isEmpty` and
`apps/main/src/components/ChartState/ChartState.tsx:57-71` renders
`chart.empty`, "Not enough data to display this chart."
(`apps/main/src/i18n/locales/en/common.json:195`). That message is misleading
here: the data is complete, it is just zero.

Why the supply rate is 0: in Aave v3 the liquidity rate starts at 0 and is only
computed from the borrow rate and utilisation when there is debt
([`DefaultReserveInterestRateStrategy.sol` lines 165-216](https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/pool/DefaultReserveInterestRateStrategy.sol#L165-L216)).
With borrowing disabled there is never debt. **[inferred]** that Hydration's
deployed strategy contracts follow this source; **[verified]** that the outcome
matches it for all 31 reserves.

## 4. Data-flow trace

### 4.1 In the repo

| Step | Where | What |
|---|---|---|
| Mount | `v2 app/ReserveDetailPage.tsx:196-203` | Non-Hollar reserves render `InterestRates` |
| Mount | `v2 app/ReserveDetailPage.tsx:444-461` | `InterestRates` renders `<ReserveRatesChart reserve={reserve} />` at line 458, unconditionally |
| Query | `v2 app/ReserveRatesChart.tsx:59-65` | `reserveRatesQuery(market.addresses.POOL, reserve.underlyingAsset, timeRange)`, default range `"1M"` (line 56) |
| Key | `v2 app/reserveRates.ts:46-51` | `$pool` = pool lowercased, `$reserve` = `getAddress(reserve)` (EIP-55), `$from`/`$to` from `getApyChartTimeRange` |
| Range | `apps/main/src/modules/borrow/reserve/components/ApyChart.utils.ts:6-26` | now rounded down to the hour, minus 1 month / 6 months / 1 year |
| SQL | `v2 app/reserveRates.sql` | last `liquidityRate` and `variableBorrowRate` of `ReserveDataUpdated` per 4-hour bucket, divided by 10^25 |
| HTTP | `apps/main/src/api/grafana/fetchGrafana.ts:8-34` | `POST ENV.VITE_GRAFANA_URL`, body `{queries:[{refId:"price", rawSql, format:"table", datasourceId}]}`, reads `results.price.frames[0].data.values` |
| Backend | `apps/main/.env.production:4-5` | `https://grafana.hydradx.cloud/api/ds/query`, datasource `10` (testnet: `apps/main/.env.development:4-5`) |
| Pools | `packages/money-market-v2/src/core/markets.ts:18,30,42` | the three pool addresses |

The chart does not go through `apps/main/src/api/` or `packages/indexer`; v2
keeps the query next to the component.

Difference from v1: `apps/main/src/api/grafana/reserveRate.sql` filters on the
reserve only, and `reserveRate.ts:49` builds the address from an asset id with
`getAddressFromAssetId`. v2 adds `AND address = '$pool'` because Hollar is a
reserve of all three pools. This divergence is correct and is not the cause.
v1 has two separate charts and already hides the supply one, see section 5.

A second chart on the page, `InterestRateModelChart`, is computed from the
reserve's model parameters with no backend call, and is already gated by
`borrowingEnabled && !hollar` (`ReserveDetailPage.tsx:208-210`).

### 4.2 The backend, as it answers

The app's request for 2-Pool-GDOT, range 1M **[verified]**:

```
POST https://grafana.hydradx.cloud/api/ds/query
{"queries":[{"refId":"price","format":"table","datasourceId":10,"rawSql":
 "<v2 app/reserveRates.sql with
   $pool    = 0x1b02e051683b5cfac5929c25e84adb26ecf87b38
   $reserve = 0x00000000000000000000000000000001000002b2
   $from    = 2026-09-07T15:00:00.000Z
   $to      = 2026-10-07T15:00:00.000Z>"}]}

200  results.price.frames[0].data = {"values": [[], [], []]}
```

The same for 3-Pool (`$reserve = 0x0000000000000000000000000000000100000067`):

```
200  {"values": [[1789257600000, 1789646400000], [0, 0], [2, 2]]}
```

Timestamps come back in milliseconds, supply 0, borrow 2.

All history per pool and reserve **[verified]**:

```sql
SELECT logs.address, args->>'reserve' AS reserve, count(*) AS n,
       min(block.timestamp), max(block.timestamp),
       max((args->>'liquidityRate')::numeric / 10^25)      AS max_supply,
       max((args->>'variableBorrowRate')::numeric / 10^25) AS max_borrow
FROM logs JOIN block ON block_number = block.height
WHERE event_name = 'ReserveDataUpdated' GROUP BY 1,2
```

Trimmed result (pool, reserve, events, first, last, max supply %, max borrow %):

```
0x1b02…7b38 | 0x…0100000016 (USDC)        | 291345 | 2024-11-26 | 2026-09-21 | 56.61 | 63.00
0x1b02…7b38 | 0x…01000002b2 (2-Pool-GDOT) | 196948 | 2025-05-03 | 2026-09-21 | 0     | 0
0x1b02…7b38 | 0x…0100001068 (2-Pool-GETH) | 164253 | 2025-07-01 | 2026-09-21 | 0     | 0
0x1b02…7b38 | 0x…010000006e (2-Pool-HUSDC)|  78306 | 2025-09-22 | 2026-09-21 | 0     | 2
0x1b02…7b38 | 0x…0100000067 (3-Pool)      |  16460 | 2025-07-21 | 2026-09-17 | 0     | 2
0x1b02…7b38 | 0x…0100000013 (WBTC)        |   7021 | 2024-11-26 | 2026-08-16 | 0.88  | 4.14
0x2ce2…8923 | 0x…010000029E (stHDX)       |   3948 | 2026-07-01 | 2026-09-21 | 0     | 0
0x6931…7a53 | 0x…0100000226 (uBIL)        |    205 | 2026-08-01 | 2026-09-21 | 0     | 2
```

Events per pool: `0x1b02…` 1,936,873, `0x2ce2…` 4,329, `0x6931…` 244. The
per-range bucket counts in section 2 come from the same SQL as the app's,
grouped by pool and reserve, with the range bounds as filters.

Upstream source of the `logs` table **[verified in source, inferred that this
is what is deployed]**:
[galacticcouncil/evm-decoder-service](https://github.com/galacticcouncil/evm-decoder-service)
at `5cddade`, `evm-decoder-service.js`. It decodes every `EVM.Log` event in the
archive database against a set of ABIs (query at lines 297-304), with no
per-contract allow-list, and stores `address` lowercased (line 415) and `args`
as ethers decodes them, hence checksummed addresses. That matches the comment
in `v2 app/reserveRates.ts:47` and explains why new pools need no indexer
config.

### 4.3 On chain

`Pool.getReservesList()` and `Pool.getReserveData(asset)` on each of the three
pools through `https://rpc.hydradx.cloud` at block 15,512,246; borrowing,
frozen, active and paused read from configuration bits 58, 57, 56, 60; debt from
`totalSupply()` of the variable debt token **[verified]**. Result for the 16
reserves with borrowing off: `currentLiquidityRate = 0` and debt `0` for every
one. `currentVariableBorrowRate` is `0` for GDOT, GETH, GSOL and stHDX and
`2 %` (the base rate) for the other twelve.

### 4.4 The indexer is stalled

```sql
SELECT max(height), max(timestamp), now() FROM block
-> 14879116 | 2026-09-21 20:05:30+00 | 2026-10-07 15:22:45+00
```

The same query seven minutes later returned the same height. The chain head at
that moment was 15,512,246, timestamp 2026-10-07 15:22:42 UTC
(`eth_getBlockByNumber latest`); block 14,879,124 on chain is stamped
2026-09-21 20:05:48, consistent with the indexer's last row **[verified]**.

Effect: the 1M range (2026-09-07 to 2026-10-07) holds 14 days of data instead
of 30, and nothing after 2026-09-21 is drawn on any range. This is an
operations issue on the database behind `grafana.hydradx.cloud` datasource 10.
**[inferred]** that it also affects the other consumers of `fetchGrafana`
(`apps/main/src/api/grafana/tradeChart.ts`, `dcaAmounts.ts`); not checked. Not
checked for the testnet datasource.

### 4.5 Quiet reserves on short ranges

WBTC is frozen and rarely touched. Its last indexed event is 2026-08-16, so the
1M range returns `[[], [], []]` and the chart shows "Not enough data", while 6M
and 1Y have 68 and 366 buckets **[verified]**. The pool did update WBTC on
2026-10-07 11:14 UTC (`lastUpdateTimestamp` on chain), which the stalled indexer
has not seen, so with a healthy indexer the 1M range would hold at least one
point **[inferred]**.

The underlying weakness remains with a healthy indexer: the SQL emits a bucket
only when an event falls in it, and a rate does not change between events. A
reserve with one event in the range draws a single point; with none, nothing.
The fix is in the query, not in hiding: seed the series with the last event
before `$from`, and carry the last value forward to `$to`. This is a separate
change from section 5 and applies to v1's query too.

## 5. Hiding the chart

### What the code knows at render time

`ReserveSummary` carries `borrowingEnabled` and `totalDebt`
(`packages/money-market-v2/src/types/index.ts:288,311`), both already loaded
when the detail page renders. No extra request is needed.

### Existing convention

v1 hides its supply APY chart with exactly this test:

```tsx
// apps/main/src/modules/borrow/reserve/components/SupplyInfo.tsx:121-123
{(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
  <SupplyApyChart assetId={assetId} />
)}
```

and uses the same expression to decide whether to render the borrow panel
(`apps/main/src/modules/borrow/reserve/ReserveConfiguration.tsx:30-31`). v2
already gates its neighbours on `borrowingEnabled`
(`ReserveDetailPage.tsx:208`, `:211`, `:454`).

### Recommendation

One line, in `v2 app/ReserveDetailPage.tsx:458`:

```tsx
{(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
  <ReserveRatesChart reserve={reserve} />
)}
```

The `totalDebt` half covers a reserve whose borrowing is switched off while
debt is still outstanding: it keeps a non-zero supply rate until the debt is
repaid, and its history stays worth showing. No reserve is in that state today,
so `reserve.borrowingEnabled` alone hides the same 16 charts; the longer form
is recommended because it is the rule v1 already ships.

Optional follow-ups, each independent:

- `v2 app/ReserveDetailPage.tsx:450`: the section description says "Current
  supply and borrow rates"; for these reserves only the supply stat remains. A
  wording decision, not required for the hide.
- `v2 app/ReserveRatesChart.tsx:86`: if the gate uses the longer form, a
  reserve with borrowing off and debt outstanding would show supply only, which
  matches v1. No change needed.

### Why not the alternatives

- **Hide when the response is empty.** It would also hide WBTC on 1M and every
  chart during an outage, and since the range selector lives inside the chart
  (`ReserveRatesChart.tsx:198-202`) the user could not switch to a range that
  has data. It also makes the section change height after the request settles.
- **Hardcoded asset list.** Not needed: the flag separates the two groups
  exactly, and a list would go stale on the next collateral-only listing (four
  have their first indexed event on 2026-09-16).
- **Draw a flat 0 % line.** Possible by removing the `rate <= 0` filter and the
  `HAVING` clause, but it presents a constant as a history and says nothing the
  "Supply APR" stat above it does not.

## 6. Open questions

- Who owns the stalled indexer, and is the stall known? Section 4.4. Until it
  is fixed, no change to this chart can show the last 16 days.
- Should the query carry rates forward for quiet reserves (section 4.5)? It
  changes v2's SQL and arguably v1's.
- Is a history of the effective supply yield for collateral-only assets
  (stableswap fees, GDOT, vault APR) wanted on this page? The current values
  come from `v2 app/ReserveApyProvider.tsx` and the feeds in
  `apps/main/src/api/external/`; whether those sources expose history was not
  investigated.
- Not verified: the deployed interest-rate strategy bytecode against the Aave
  source; that the deployed decoder matches the public repo; the testnet
  datasource; the rendered page in a running app.
