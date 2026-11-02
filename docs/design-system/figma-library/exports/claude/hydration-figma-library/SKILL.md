---
name: hydration-figma-library
description: Find Hydration Figma components, exact variants, tokens, styles and code counterparts. Use for Hydration UI design, implementation, or library lookup.
---

# Hydration library lookup

Use the bundled catalog to locate existing Hydration patterns before building a new element. It covers the Design Library file `wN5pnsm2FPVoCrxFNEAlYl`, with a **2026-10-26** source snapshot. It is an offline reference, not a live connection or proof of cross-file import access.

The project counterpart is `docs/design-system/figma-library/README.md` in the active Hydration checkout. If its `catalog/manifest.json` has a newer export date, point the helper's `--catalog-root` at that catalog. Keep IDs and properties from one consistent snapshot.

## Find a pattern

Read [QUICK-LOOKUP.md](references/QUICK-LOOKUP.md) for the task's pattern. Use [PAGES.md](references/PAGES.md) for the whole file structure or its linked page guide for a particular domain. Avoid loading the entire icon inventory into context.

In Claude's code execution environment or Claude Code, locate this skill's actual directory and run the helper there, or use its absolute script path. Do not assume the project checkout is the skill directory:

```bash
python3 scripts/lookup.py search "receiving account"
python3 scripts/lookup.py show accountTile --json
python3 scripts/lookup.py variants "button/primary" "size=sm"
python3 scripts/lookup.py search "details/separators" --kind variable
```

`show` accepts an exact name, ID or full key. Disambiguate duplicate names by ID/path. `--json` returns the complete matching records. The helper needs Python's standard library only; it performs no network calls or writes.

## Use the result

- Read the selected definition's exact property names, available variant tuples, representative layers, bindings and dependencies. Preserve property suffixes such as `#502:0`. Query real variants rather than assuming all dropdown combinations exist. A set's layout is its canvas arrangement; use the actual variant layout for instance dimensions.
- A component-set key, a component key, a variable key and a local node ID have different uses. The record's `importMethod` field specifies the correct API. Variable import is on `figma.variables`; component and style imports are on `figma`. A key in this snapshot does not establish publication status or destination-file access.
- For live Figma work, use an available connector or MCP server and follow its documented tools and permissions. If it provides a session API, follow that API; do not assume tool names or a separately installed skill. Live export needs a compatible Figma Plugin API bridge, as explained in [REFRESH.md](references/REFRESH.md). Offline lookup needs no connector. Import editable instances and preserve nested components, variables and styles. Recheck selected nodes if the source has changed since the snapshot.
- For dark screens, explicitly choose **Themes → Dark**; the source collection defaults to **Light**. **Misc → Desktop/Mobile** controls a separate responsive mode. Preserve the distinction between `details/borders` and `details/separators`. See [FOUNDATIONS.md](references/FOUNDATIONS.md).
- For code, read [CODE-MAP.md](references/CODE-MAP.md) and the relevant current source/story. Prefer the shared component's API. Figma labels are not automatically React prop names or matching size values. Generated code token JSON comes from upstream `hydration-styles`.

## Confidence and maintenance

Coverage includes every source page, component/variant definition, local variable and local text/effect style. Layer/dependency inspection uses representative family definitions and stops at nested instances. Variant roots and direct-child sizing are inventoried; all variant internals, resize behavior, interactions, imports and visual parity were not tested. Follow dependency IDs for deeper structure.

Prior behavioral notes and Wallet Redesign local blocks are explicitly separated in [PRIOR-NOTES.md](references/PRIOR-NOTES.md). Do not treat those local IDs as Design Library import keys or apply an old workaround without inspecting the affected instance.

For a requested refresh, use [REFRESH.md](references/REFRESH.md). It explains the read-only exporter and validated local assembler. Catalog schemas and provenance are in [SCHEMA.md](references/SCHEMA.md) and `references/catalog/manifest.json`; `diagnostics.json` records duplicate names and unresolved external references. Refreshing the index does not authorize editing or publishing the Figma library.
