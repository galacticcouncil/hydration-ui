---
name: hydration-figma-component-index
description: "Lookup table for Hydration Figma work — Design Library component/variable keys and props, Wallet Redesign local building blocks (node ids), and which library piece replaces which pattern"
metadata:
  node_type: memory
  type: reference
  originSessionId: fd4531f3-b6db-4778-9833-397fc71ed36a
  modified: 2026-10-26T16:58:21.773Z
---

Index for 📚 Design Library (`wN5pnsm2FPVoCrxFNEAlYl`) → 💰 Wallet Redesign (`wIqkDdWO0X27AdfLIAduxR`). Keys verified 2026-10-26. Import with `importComponentSetByKeyAsync` / `importVariableByKeyAsync`. Rules live in [[figma-use-library-styles-and-variables]] and [[figma-componentize-what-you-design]].

## Pattern → library component (use these instead of building)
| Pattern | Library set (key) | Notes |
|---|---|---|
| Modal header (title, back, close) | `header` a506f7e2f853f6722d7829e062f25b1d55a11a47 | option=centered; Headline#502:0, description#502:2, back#2696:0, close#1404:39 |
| Stepper | `progress` e24bd24f285ae9ce7e9668186c8581f5416c7701 | desktop 469w; step-3#3314:1, step-4#3314:0; nested circles `state`=active/finished/unfinished/failed, labels `steps/N` status + Text#1509:0 |
| Connected wallet / account tile | `accountTile` c80fe2862f42aaff189bf74e8e83c733bb2a8104 | variants=default; change/balance/edit/actions/address booleans. With balance off set nested "Account Details" align MIN (else name centres) |
| Inline asset / currency picker | `input/assetSelector` dda3212e7c5201c11bbb4beb7cb857503daf8691 | asset#501:0 swap; nested `asset/label` Symbol/Full-name/full-name/dropdown |
| Empty state | `contentStates` 880260c7d6a162bf3ae50c4be199b33cf157acb0 | variant=general; set texts directly on text layers (props don't drive them); Instance#4791:0 = icon size slot (`3diconsSizes` 551ab7fa1f05bc609053fcbe9e6d3d3fc453778d) |
| Asset logo | `assetIcon/default` 864896d39659d53e0654fd28ea2309fe251238a3 | state=default; inner `iconSize` l34/m27/ms20/s16/xs10; nested `icon` Asset (141 options) |
| Asset symbol + name | `asset/label` 8b73d6fe5465f5f53dc697f4972f1fbb0e4235ae | label=large; Symbol#67:19, Full-name#67:22 |
| Wallet logo | `icons/walletExtension` 29a6c28ccada9b506fa80f73772a4423fd2d52f0 | name=talisman/subwallet/metamask/… |
| 3D illustration | `icons/3d` 02f611f19318ec8a26d53c8ea6fb89a39c627a3f | depositEmpty (lounger), pearlShell, citrusPress, bank are published (2026-10-26). Their Artwork layers are MIN/MIN in the library, so they don't scale when nested; use local wrapper `illustration / 3d 100` (11245:74090) or a top-level rescale |
| UI icons | `classic/*` on Icons page 34:2 (~1550) | x 152e6db1…, info 2ca98772…, check 4bbafbdd…, copy 50ef0de1…, pencil f3fa76f2…, clock 1b86818a…, triangle-alert 79b1f66a…, rotate-ccw 4e52e938…, circle-dollar-sign c19ef014… |
| Wallet provider rows | `chainList` 6afd2ebdf09c88268362a29cf2aed1618e7611be | already used in Connect wallet screens; chain icons inside = `chainSelect` 89086c376d143985ed25c031061832a2b83f7634 |
| Chains strip | `chains` 375d6b4b8c87d5487bd35f6a432ea09f737ec02d | variants multiple/single |
| Buttons | `button/primary` 7640bb6e2a1aa11410bb3470794dcf24a3fa983d; `buttons/xxs` 54d7b3615695db225cb39cd22f1a9152a81a265f; `textLink/small` e67d3a60a2f1bd676f20a1f34beb88949660141c | positive emphasis only in sm |
| Chips | `chipBase` ec022a0e6b2310a17f60d9a6a698e3bb72f813a2 | variant=green works; don't use `chips/emphasis` "joined" for wallets |
| Stats / values | `value/stats` 4338be9e5273122846efba1dba3fe49c958ff5eb; `sectionHeader` 99a98ba5598557daf187f7fb96ed15b6315acc72 | |
| Identity | `icons/identicon` 7bdd72c45adde82f320b12d0da8d5c8d1ff0810f; `address/variants` 686bcd9c488430f1c146d023a8f79b961444e401; `fromSelection` 3284aa2e78daf798c1ff39bda44355657d0f9aed | |
| Other candidates | `addressSelector` bf9b0b05…c9c4, `walletSelector` 03444c3c…e2d7, `modals/assetSelector` 4af36324…554e, `asset-selector/desktop` 2ed8778a…65a2, `modals/list-variants` c427c0ef…ca79, `statusIcons/regular` 45f73a48…dc2a, `transactionDetails` bc620c8f…4fba, `table/sorting` 8694016b…8ccf, `progress-bar/base` 0ffa8fe6…f03f0e7 | not yet used in flows |

## Variables (Design Library keys)
Themes (set Dark explicitly): surfaceHigh 6b0315bd7b713f4a730613856323efc251cc7748 · background 0f27852f1feb72433fd48befe8a927cbf9f14281 · containers/mid/primary ce68e94f27e0bba39d7ff26a0c6d39d3f7267ca4 · details/borders 02683687e8c1e6b84cf66b6f5a9adaf5464f0975 · details/separators d9d5e3536e27d8251eb40104fc8d8b08b8059a82 · details/transparent fae37752dd43da87e5ff4757a4572daec4dccc61 · details/overlayHigh 5b27191b99e7295235c4ba5fcbe11e49ce007613 · text/high ca7bea324fec67b42e370641365922c5af63f3db · text/medium fc13d6fa9a4646b6e1de04ede22ed246fb1d5601 · text/low 80586e5e184c9f423526478f97938862f9a919ab · text/tint/primary 9eebb8f0026305f87d68f8e1f305201981758e32 · text/tint/tertiary 6ca7885c9ea92dea4f189623d74039c11089b945 · text/tint/quart 759977a09bd419b83b86bb1473e5d6b7a3c4fbe6 · accents/success/emphasis 37079245c5bb8790fd7acbe1268f1eaedc33d8cf · accents/success/dim dee7c217dd93cdd2baed6f801a62eb8078b016b8 · icons/onContainer fe8490a55bfadcd114158277f41841e3ec09638a

Misc: containers/paddings primary(20) a83eb90abc6c7df34d38d1c78ee2b048cae00113 · secondary(16) 437774b4058d793b828c6a7a1b9724cb8b91c877 · tertiary(12) 4560a697aaef19be9226f56bf833500e9bbb6870 · quart(8) c9c5badd5abc31971f5946e82cb19dbbf7065f1f · cornerRadius/containersPrimary 7b0ff22d0a49d6a11d1b8487fe594430b99466b9 · cornerRadius/buttonsPrimary e08551496df1b9de47a62e1e9f873cc83292edcf

Base: scales/paddings xxxl(32) 491a3cfaef73890d8e0d78ad658dd186a4ce23c7 · xxl(28) f1005f4b48514f7fd82dc145d856fff780f68f54 · xl(20) ca333e0b6b8c50d4ac498a23039c901e808bf367 · l(16) 0a81c8140dbad628c6d3db5d41a636280cc1c38b · m(12) c56da6c837b710e74550d9d0ce39056bd74bf235 · base(8) 72627c90aa8c63a39fc7116cd1002b42ba5705e0 · s(4) 92cc4567ddc71fdcd3be4ecaf8ca96c62571d104 · xs(2) 058da337cd4dd9000c962b0890872094964553df · cornerRadius/l ba1705acf4ac99ea54b9353ac6d7c4de97676d77 · border/base 8fab506e8a936bc90f46cd4735493373c4731865

Text styles: headlines/{2xl…3xs} (Gazpacho), headlinesSecondary/*, regular/*, medium/*, medium/caps/*, semibold/*, semibold/caps/*, bold/* (Geist).

## Wallet Redesign — local building blocks (page "Wallet")
Section "components" 11214:80211 → board "Building blocks" 10976:58555 (only building blocks; modals are plain frames):
- `option/row` 11226:80242 — Title, Subtitle, Show subtitle, Icon swap (fixed 26px Icon slot)
- `option/list` 11230:124398 — content = assets | assets with networks | networks
- `Transfer / Source account card` 10985:59771, `Transfer / Receiving account card` 10985:59845 — wrap library accountTile
- `Portfolio / Deposits / Base` 10981:58961 — page backdrop under every flow screen (55 instances); its empty state = library contentStates
- Logos the library lacks: `logo / AAVE|apyUSD|ASTR|CFG|AssetHub Kusama|Hydration|USD`
- `illustration / 3d 100` 11245:74090: library icons/3d depositEmpty rescaled to 100px, used in the contentStates icon slot (the local lounger copies are deleted)
Flows (source of truth for modals): "Updated deposits" 10964:59454, "Bank Depo" 11227:153665.
Dashboard work: "🧩 Dashboard components (local)" 11065:2961 (wallet/row, wallet/pill, assetTable/row, capital/footer, position/card, stat/tile, journey/step, balance/card…).

## Pending
- (done 2026-10-26) Dashboard 3D icons: D2/D2b/8-wallet → pearlShell, D3 → citrusPress. They're top-level instances, so switch variant → resize(344) → rescale(target) to scale the MIN/MIN artwork.
- Library fix (needs the user, since library edits are blocked for me): set the Artwork layers in the new icons/3d variants to SCALE constraints, then republish; after that the wrapper can go.

## API gotchas
- `getInstancesAsync()` also returns instances inside deleted components (no PAGE ancestor). Filter by PAGE ancestry before editing.
- Nested instances can't be resized or rescaled inside an instance; use a size slot or a local wrapper.
- `loadAllPagesAsync` is unsupported in use_figma; call `page.loadAsync()` per page.
- Keep use_figma return payloads small: large componentPropertyDefinitions break the transport.
