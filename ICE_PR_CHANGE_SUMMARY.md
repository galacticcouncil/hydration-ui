# ICE PR change summary

## Branch scope

- The local `codex/ice-updates` branch is based directly on the latest head of PR #3976 (`82d21ddee`).
- Dashboard work was kept outside this branch and is not mixed into these changes.

## Market and TWAP

- Kept the original amount-received presentation for both Single trade and TWAP.
- Saved the experimental fee-focused card implementation as a local backup patch for possible later use.
- Temporarily disabled the obsolete large-trade/slippage warning because the legacy execution limit no longer applies under ICE.
- Kept health-factor warnings independent and active.

## Limit-order copy

- Removed the redundant `Fills when…` line from the limit-price form.
- Replaced `price is above` and `price is below` with the inclusive symbols `≥` and `≤`.
- Applied the same inequality-symbol wording to the related TWAP/DCA limit-price labels.

## Documentation

- Added `TWAP_FEE_SAVINGS.md` explaining the ICE Sell/DCA execution model and the intended fee-savings calculation.

## Verification

- Verified the updated Market, TWAP, and Limit Order states in the running local preview.
- ESLint, JSON parsing, and `git diff --check` pass.
