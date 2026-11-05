# Refreshing the library index

The local catalog is a dated snapshot, not a live Figma service. Refresh affected pages before relying on new or changed components. This procedure reads Figma and writes local documentation; it does not publish, instantiate, rename, detach or edit library nodes.

## Read-only source export

Use the installed `figma-use` skill and the current Figma connector. Create a new task session for file `wN5pnsm2FPVoCrxFNEAlYl`, then reuse its returned session ID. Check the source page manifest and local collection/style counts. Do not reuse an old session UUID from this snapshot.

For each page, prepend a configuration to [scripts/export-library.js](scripts/export-library.js) and execute the resulting JavaScript with `use_figma`:

```js
const CONFIG = { mode: "page", pageId: "34:2", offset: 0 };
// Append the exact contents of scripts/export-library.js here.
```

For foundations:

```js
const CONFIG = { mode: "foundations", offset: 0 };
// Append the same exporter.
```

Each call switches to at most one page using `setCurrentPageAsync`. Page context resets between calls. Independent read-only page calls may be batched in parallel. The exporter does not use plugin data, a document cache, or unsupported `loadAllPagesAsync`.

The returned object contains `codec`, `pageId`, `mode`, `offset`, `nextOffset`, `totalLength`, `jsonLength`, counts, and `data`. Save it intact under:

```text
raw/manifest.json
raw/chunks/34-2/0.json
raw/chunks/34-2/44000.json
raw/chunks/foundations/0.json
...
```

The raw manifest must declare `fileKey` and every page `{id,name}` in source order; retain collection and style counts as cross-checks. Page-directory names replace `:` with `-`. Foundations uses `foundations`.

Follow `nextOffset` until null. Responses are limited to 44,000 base64 characters to fit the connector's response limit. `data` is a slice of an LZW-encoded, unsigned 16-bit big-endian UTF-8 payload; **individual chunks are not independent JSON or independent compressed streams**. Keep the exporter unchanged across chunks. If `totalLength` or `jsonLength` changes, re-export that page completely to avoid mixing snapshots. Use a fresh chunk directory for each refreshed page so old trailing chunks cannot survive a shorter export. A partial refresh requires retaining complete raw chunks for all unchanged pages; otherwise export every page. Prefer refreshing without concurrent source-file edits.

## Assemble and validate

Run from this documentation directory:

```bash
python3 scripts/assemble_catalog.py --date YYYY-MM-DD
python3 scripts/assemble_catalog.py --check-only --date YYYY-MM-DD
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/lookup.py summary
```

The assembler verifies contiguous chunks, codec, UTF-16 JSON length, source identity, all declared pages, counts, variant owners, full key shape, collection/mode references, alias targets and dependency references. It records chunk hashes for provenance. The lookup helper guards against alias cycles when resolving values. The assembler generates the JSON catalog, per-page documents, foundation tables and schema reference. Inspect `catalog/diagnostics.json`: duplicate family names and references to external definitions are discovery findings, not proof that an import is broken. Resolve actual errors before reporting complete coverage.

Maintain the curated `catalog/routes.json` and regenerate its human-readable `QUICK-LOOKUP.md` when recommendations change. Update README counts/date and prior-note statuses from evidence. Do not overwrite observed behavior with a structural inference. Keep exact duplicate names, original typos, property suffixes and full keys in the catalog even when the editorial guide uses clearer language.

## Reusable skill copy

The packaged skill lives at `skill/hydration-figma-library/`. Its offline lookup and references are self-contained; it does not rely on the original checkout path. Synchronize its catalog, page guides and curated references after updating project docs. Retain its short `SKILL.md` entry point and run:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skill/hydration-figma-library
python3 skill/hydration-figma-library/scripts/lookup.py summary
```

Install the validated folder in the user's Codex skills directory when authorized. Replacing another installed skill requires checking its contents first; refreshing this catalog does not authorize changing other skills or global agent configuration.
