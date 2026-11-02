# Hydration Figma library index

Agent entry point for the [Design Library](https://www.figma.com/design/wN5pnsm2FPVoCrxFNEAlYl/Design-Library?node-id=34-2). Snapshot: **2026-10-26**. The audit reads the source file; it does not modify the library.

Start with [QUICK-LOOKUP.md](QUICK-LOOKUP.md) for a UI pattern, or run the local lookup script from this directory:

```bash
python3 scripts/lookup.py search "receiving account"
python3 scripts/lookup.py show "accountTile" --json
python3 scripts/lookup.py variants "button/primary" "size=sm"
python3 scripts/lookup.py search "details/separators" --kind variable
python3 scripts/lookup.py pages
```

The script uses Python's standard library, needs no credentials, and returns bounded results by default. `show` accepts an exact name, node ID, or full key; `--json` exposes the complete matching records. Use a node ID when names are duplicated. Check the actual property names returned by `show` before filtering variants.

## Find the right reference

| Need | Read |
|---|---|
| Pick an existing control or composite | [QUICK-LOOKUP.md](QUICK-LOOKUP.md) |
| Navigate every page and section, including examples | [PAGES.md](PAGES.md), then the linked page guide |
| Browse every family and standalone definition | [FAMILIES.md](FAMILIES.md); use the CLI for the large icon inventory |
| Import keys, exact property suffixes, variant combinations, sizing, nested dependencies | `show <id> --json`, `variants <family>`, and [SCHEMA.md](SCHEMA.md) |
| Colors, borders, separators, typography, effects, spacing and modes | [FOUNDATIONS.md](FOUNDATIONS.md) |
| Reuse implemented components and Storybook examples | [CODE-MAP.md](CODE-MAP.md) |
| Earlier wallet-specific observations and local building blocks | [PRIOR-NOTES.md](PRIOR-NOTES.md) |
| Refresh the snapshot or inspect coverage | [REFRESH.md](REFRESH.md), `catalog/manifest.json`, `catalog/diagnostics.json` |
| Use this outside the repository | [Reusable skill](skill/hydration-figma-library/SKILL.md) |
| Upload the skill to Claude or use it in Claude Code | [Claude package and setup](exports/CLAUDE-INSTALL.md) |

## Coverage and confidence

All **27 pages** are accounted for: **194 component sets**, **1,636 standalone components**, and **1,017 variant definitions**. The catalog also contains **464 variables** in three collections, **55 text styles**, and **12 effect styles**. Empty separator/category pages remain in the page map. Frames containing examples are navigation locations, not additional component definitions.

Every definition has its source page, ancestor path, node link, full key when present, and a verification record. Sets include their property definitions and real variant tuples. Representative definitions include relevant owned layers, variable/style bindings and nested instance references. Traversal stops at nested instances; follow the dependency to its own definition. Each variant includes its root layout and direct-child sizing constraints. A component set's own layout describes the canvas arrangement of variants, not an instance's dimensions; inspect the selected variant for those. This is not an exhaustive audit of every variant's internal layers.

Keys and live source metadata are inventoried. Publication/import access, resize behavior, interactions and visual parity have **not** been tested across the entire library. Earlier behavioral notes are labeled separately. Inspect a selected instance in the destination file when those details matter. A hidden component remains searchable; its visibility is not a deprecation judgment.

Validation found **0 errors** and records 21 duplicate-name groups, 11 unresolved representative dependency edges, 53 variable references and 103 style references whose IDs are absent from the local foundations. Exact-key reconciliation identifies another 16 cached variable identities and one cached style identity. These are reference findings, not a claim that affected components are visually broken; no library nodes were repaired or replaced. See `catalog/diagnostics.json` and `catalog/dependencies.json` for the exact records.

## Reuse decisions

1. Find the complete pattern before assembling primitives. Check the page/path when several names match.
2. Inspect the selected family's exact properties and available tuples. Do not assume every combination in a property dropdown exists as a variant, or remove suffixes such as `#502:0` from text/boolean property names.
3. In Figma, import the set or component by the exported full key, then create an editable instance. Keep nested components, variable aliases and text/effect styles connected. A key identifies a definition; it does not prove that a destination file has permission to import it.
4. For dark Hydration screens, choose **Themes → Dark** explicitly. The source collection's default is **Light**. **Misc → Desktop/Mobile** is a separate responsive mode selection. Use `details/borders` for boundaries and `details/separators` for internal dividers, following the selected component's existing bindings.
5. In code, use [CODE-MAP.md](CODE-MAP.md) and the current component/story API. Figma property labels are not automatically React prop names or equivalent size values.

The JSON catalog is the source for exact IDs and properties; the pattern guide adds editorial recommendations. Preserve that distinction when refreshing. The original Claude attachment is retained in `raw/prior-component-index.md` for provenance.
