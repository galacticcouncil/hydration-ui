# Refresh the bundled snapshot

Use the installed figma-use skill and a fresh task session for Design Library `wN5pnsm2FPVoCrxFNEAlYl`. Refresh the complete page manifest and foundations, or the affected pages when doing a partial update. This is a read-only source audit.

Run `../scripts/export-library.js` through use_figma, prepending `const CONFIG = {mode: 'page', pageId: '34:2', offset: 0};` or `{mode: 'foundations', offset: 0}`. Switch at most once per call; fan out independent read-only pages. Save each returned object intact in `references/raw/chunks/<page-id-with-dashes>/<offset>.json` and foundations under `references/raw/chunks/foundations/`. Save `references/raw/manifest.json` with `fileKey` and every page `{id,name}`. Follow `nextOffset` until null. The 44,000-character base64 slices belong to one LZW stream per page. Do not decode chunks separately. If totalLength or jsonLength changes between calls, re-export that page. Use fresh page chunk directories to avoid stale trailing chunks. The skill bundle omits raw chunks: a partial refresh requires the project's complete raw snapshots; otherwise export all pages and foundations.

From the skill directory run:

```bash
python3 scripts/assemble_catalog.py --root references --date YYYY-MM-DD
python3 scripts/assemble_catalog.py --root references --check-only --date YYYY-MM-DD
python3 scripts/lookup.py summary
```

The assembler checks transport continuity, UTF-16 length, counts, IDs, keys, variant owners, modes and aliases. Inspect `catalog/diagnostics.json`. Update curated `catalog/routes.json`, QUICK-LOOKUP and prior-note statuses from evidence; do not infer tested import or resize behavior from metadata. Update the snapshot date in SKILL.md. When the project docs are available, refresh there first and run their `scripts/package_skill.py` so both copies agree.
