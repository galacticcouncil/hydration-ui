# Money market types are split by data origin, not by processing stage

Aave's libraries name types after how far they have been processed —
`ReservesDataHumanized` becomes `FormattedReserve` becomes `ComputedReserveData`
becomes `ExtendedFormattedUser`. Four adjectives, none of which say what the
thing is, and a ladder that exists because of how `@aave/contract-helpers` and
`@aave/math-utils` are layered rather than because the domain has four stages.

`money-market-v2` uses one boundary instead: **Reserve** and **Position** are
decoded, validated chain state, and **Reserve summary** and **Position summary**
are values computed from it. **Account** sits only on the derived side, because
a health factor has no on-chain counterpart.

The boundary is drawn here because it is also the test seam — everything on the
derived side is a pure function of the chain side, so the ported Aave math can
be tested with no transport at all.
