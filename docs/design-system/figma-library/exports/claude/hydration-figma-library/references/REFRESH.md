# Refreshing the library snapshot in Claude

The bundled catalog is a dated offline reference. Searching it needs only Python 3's standard library; no Figma connection, API key, network access, or other skill is required.

## Live inspection

For current source data, use an available Figma connector or MCP server and follow its documented tools and permissions. Do not assume a particular tool namespace or that a connector can execute JavaScript. If it offers a task-session API, create a session and reuse its returned ID as documented. Ordinary metadata/screenshot tools can verify selected nodes; they cannot necessarily run the bundled exporter.

## Full export with a compatible Plugin API bridge

`scripts/export-library.js` requires JavaScript execution **inside Figma's Plugin API context** with access to `figma`. Do not run it with Node.js, Python, a browser console on an unrelated page, or an ordinary read-only Figma connector. Without a compatible bridge, retain the snapshot and state what could not be refreshed.

When such a bridge is available, export Design Library `wN5pnsm2FPVoCrxFNEAlYl` read-only. Read the bridge's current guidance; do not assume any separately installed skill. Prepend this configuration to the exact exporter source for one page:

```js
const CONFIG = { mode: "page", pageId: "34:2", offset: 0 };
// Append scripts/export-library.js.
```

Use `{mode: "foundations", offset: 0}` for variables and styles. Each page call switches at most once using `setCurrentPageAsync`; page context resets between calls. Independent read-only page calls can be batched if supported by the bridge.

From the skill root, save every returned transport object intact under `references/raw/chunks/<page-id-with-dashes>/<offset>.json`; save foundations under `references/raw/chunks/foundations/`. Create `references/raw/manifest.json` with the source `fileKey` and every page `{id,name}` in source order. Follow `nextOffset` until null.

The 44,000-character base64 slices are parts of one LZW stream per page, not independent JSON files. Keep the exporter unchanged across chunks. If `totalLength` or `jsonLength` changes, export that page again. Use fresh page chunk directories to avoid stale trailing chunks. This portable package omits raw transport chunks: partial refreshes require the project's complete raw snapshots; otherwise export every page and foundations.

## Assemble locally

Run from the skill root only after obtaining the required raw snapshots:

```bash
python3 scripts/assemble_catalog.py --root references --date YYYY-MM-DD
python3 scripts/assemble_catalog.py --root references --check-only --date YYYY-MM-DD
python3 scripts/lookup.py summary
```

The assembler verifies transport continuity, UTF-16 length, page identity, counts, keys, variant owners, collections, modes and alias targets. Inspect `references/catalog/diagnostics.json`. Update curated routes, QUICK-LOOKUP and prior-note statuses from evidence; keep import and behavior confidence distinct from inventory. If regeneration rewrites command examples relative to a different directory, correct those paths before packaging again.

When the project docs are available, refresh them first and rebuild the Claude package with `docs/design-system/figma-library/scripts/package_claude.py`. Update the snapshot date in SKILL.md when the source is refreshed. Refreshing the index does not authorize editing or publishing the Figma library.
