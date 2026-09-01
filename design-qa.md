# Dashboard user-state design QA

- Source visual truth: `docs/dashboard-user-states/evidence/01-disconnected-dashboard.jpg`
- Product brief: `docs/dashboard-user-states/dashboard-user-state-map.md`
- Implementation screenshots:
  - `/private/tmp/dashboard-live-viewport.jpg`
  - `/private/tmp/dashboard-state-hydration.png`
  - `/private/tmp/dashboard-state-external.png`
  - `/private/tmp/dashboard-state-empty.png`
  - `/private/tmp/dashboard-state-earner.png`
- Side-by-side comparison: `/private/tmp/dashboard-live-comparison.jpg`
- Desktop comparison viewport: 1253 x 705 CSS px, device scale factor 1
- State coverage viewport: 1447 x 989 CSS px, device scale factor 1
- Mobile check: 390 x 844 CSS px, device scale factor 1
- Source pixels: 1253 x 705
- Live implementation pixels: 1253 x 705
- Density normalization: none required for the live-state comparison

## Full-view comparison evidence

The source and implementation were combined in `/private/tmp/dashboard-live-comparison.jpg` and reviewed together. The coded live state preserves the existing 1300px composition, Gazpacho display typography, dark surface hierarchy, compact opportunity tiles, semantic chips, and discovery-card rhythm. The only intentional above-the-fold addition is the fixed bottom user-state switcher.

The four preview fixtures were then reviewed at the same desktop viewport. Each keeps the existing two-column portfolio/earn composition while changing the priority and primary action:

- On Hydration: portfolio, assets and activity left; idle-capital recommendations and earning catalogue right.
- On another chain: external balance and chain context left; cross-chain funding action and post-move earning preview right.
- New wallet: a single wallet-style illustrated empty state left; useful market and earning data remains visible right and below.
- Active earner: net worth and active positions left; earning performance, APR and claimable rewards right.

## Focused region comparison evidence

Focused checks covered the bottom state switcher, portfolio summary, wallet empty state, idle-capital rows, earning tiles and the external-funding CTA. The switcher uses the same pill/button tokens as existing dashboard filters and changes to a compact Select at the mobile breakpoint. The empty state reuses the existing `NoFunds` image and `EmptyState` component rather than introducing a parallel illustration style.

## Required fidelity surfaces

- Fonts and typography: passed. Display headings use the existing primary Gazpacho token; supporting copy and controls use the established UI type scale.
- Spacing and layout rhythm: passed. The 5/7 desktop split, card gaps, row density, separators, radii and fixed bottom control match the current dashboard system. No dashboard-content overflow was present at the 1447px review viewport.
- Colors and visual tokens: passed. All new UI uses existing theme tokens and semantic chip/button variants; no new palette values were introduced.
- Image quality and asset fidelity: passed. Existing `AssetLogo` assets and the wallet empty-state illustration are reused at native component sizes.
- Copy and content: passed. Each fixture has a distinct task-oriented headline and CTA, with realistic balances, yields, rewards and chain context.

## Interaction checks

- All five state controls changed the rendered dashboard successfully.
- The desktop control remained fixed at the bottom center.
- The mobile control collapsed to a Select and remained accessible above the mobile navigation.
- The external-funds CTA resolves to Hydration's cross-chain route with Ethereum and USDC preselected.
- Opportunity filters and existing opportunity-card interactions remained rendered and enabled.

## Console check

No new React render or interaction errors were observed. The preview continues to log pre-existing wallet-storage migration and live contract/RPC errors from the local environment; these are unrelated to the dashboard state implementation.

## Comparison history

- Initial mobile capture showed an incomplete portfolio ring because it was taken during the configured 750ms chart animation.
- The state was recaptured after the animation settled; the complete chart rendered without layout clipping.
- No actionable P0, P1 or P2 visual mismatch remained after the final desktop and mobile checks.

## Follow-up polish

- P3: production wiring can replace the stable external/new-wallet/earner fixtures with automatic state classification once cross-chain portfolio confidence and wallet-state rules are finalized.

final result: passed
