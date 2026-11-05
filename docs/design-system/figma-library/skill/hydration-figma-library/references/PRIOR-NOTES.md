# Earlier observations and related files

Source: the user's `hydration-figma-component-index.md`, retained in `raw/prior-component-index.md`. That document reports observations from 2026-10-26. It is useful context, but its claims are not automatically current behavioral verification.

## Structural lookup versus behavioral claims

| Earlier observation | How to use it now |
|---|---|
| `accountTile`: hiding balance may leave Account Details centered; set its alignment to MIN | Candidate workaround. Inspect the chosen variant and actual instance before applying; the whole family's resize/alignment behavior was not tested in this audit. |
| `contentStates`: exposed text properties did not drive visible text layers | Historical behavior, not permission to detach instances. Check current property references in `show contentStates --json`, then test the selected instance's text overrides. |
| New `icons/3d` artwork uses MIN/MIN constraints and did not scale inside a size slot | Catalog direct-child constraints describe source structure. Test the target size. Preserve aspect ratio and use an editable wrapper when appropriate; do not infer scaling behavior solely from the key. |
| Lounger, pearl shell, citrus press and bank were published | Definition presence and full keys can be checked in this snapshot. Publication status and cross-file import success were not retested. |
| Positive button emphasis was only usable with `sm` | Query actual tuples with `variants button/primary`; do not infer a Cartesian product from dropdown options. |
| `chips/emphasis` with joined styling was unsuitable for wallets | Earlier composition preference. Prefer a dedicated account/wallet pattern, then check the current intended state. |

This audit does not apply those workarounds to library components. Selected fixes require a concrete affected instance and verification.

## Wallet Redesign local building blocks

These IDs come from the attachment and were **not refreshed in this Design Library audit**. They refer to another file, `wIqkDdWO0X27AdfLIAduxR`; they are local node IDs, not import keys. Re-read the destination file before reuse.

| Location / block | Node ID |
|---|---|
| Wallet page | `1677:60176` |
| Components section | `11214:80211` |
| Building blocks | `10976:58555` |
| Option row | `11226:80242` |
| Option list | `11230:124398` |
| Transfer source block | `10985:59771` |
| Transfer receiving block | `10985:59845` |
| Portfolio base | `10981:58961` |
| `illustration / 3d 100` wrapper | `11245:74090` |
| Updated deposit flows | `10964:59454` |
| Bank deposit flows | `11227:153665` |
| Dashboard local block | `11065:2961` |

[Open Wallet Redesign building blocks](https://www.figma.com/design/wIqkDdWO0X27AdfLIAduxR/Wallet-Redesign?node-id=10976-58555).

The [Nova Assets Library](https://www.figma.com/design/jeE2jT6ovWedKDAMDBXCvT/Nova-Assets-Library?node-id=1298-660) is a related external asset source. It is not part of the 27-page coverage claim for Design Library.
