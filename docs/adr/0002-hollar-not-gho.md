# The stablecoin is called Hollar, not GHO

Hydration's over-collateralised stablecoin is a fork of Aave's GHO, and the
inherited code says GHO throughout — `GhoService`, `getGhoReserveData`,
`formatGhoReserveData`, `ghoSlice`. But no Hydration user ever sees that word:
`ghoUtilities.ts` sets `GHO_SYMBOL = "HOLLAR"`, and the app already routes on
`/stats/hollar` and `/strategies/hollar-bonds`.

`money-market-v2` says **Hollar** everywhere above the decode boundary. Aave's
spelling survives only where it names something external we do not control —
contract names, ABI function names, and blueprint source we are reading from.

The alternative was keeping GHO to reduce friction when reading Aave source
alongside v2. It was rejected because the friction is one-directional and
small — a reader translates GHO to Hollar once — whereas leaking GHO into the
domain means every consumer of v2 has to know the synonym forever.
