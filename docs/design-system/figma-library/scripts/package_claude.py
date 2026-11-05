#!/usr/bin/env python3
"""Build a self-contained Claude skill folder and upload ZIP from this index."""

import argparse
import json
import shutil
import tempfile
import zipfile
from pathlib import Path


DESCRIPTION = (
    "Find Hydration Figma components, exact variants, tokens, styles and code counterparts. "
    "Use for Hydration UI design, implementation, or library lookup."
)

REFRESH = """# Refreshing the library snapshot in Claude

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
"""


def build(source, output):
    if source.name != "hydration-figma-library" or not (source / "SKILL.md").is_file():
        raise ValueError("Source must be the existing hydration-figma-library skill folder")
    output.mkdir(parents=True, exist_ok=True)
    # Build in a fresh sibling staging folder; only replace this generated target.
    with tempfile.TemporaryDirectory(prefix=".claude-package-", dir=output) as tmp:
        stage = Path(tmp) / source.name
        shutil.copytree(source, stage, ignore=shutil.ignore_patterns(
            "agents", "__pycache__", "*.pyc", ".DS_Store"))
        skill_text = (stage / "SKILL.md").read_text(encoding="utf-8")
        header, body = skill_text.split("---", 2)[1:]
        skill_text = "---\nname: hydration-figma-library\ndescription: " + DESCRIPTION + "\n---" + body
        old = "- For Figma work, use the installed `figma-use` guidance and a fresh task session before live API calls. Import editable instances and preserve nested components, variables and styles. Recheck selected nodes if the source has changed since the snapshot."
        new = "- For live Figma work, use an available connector or MCP server and follow its documented tools and permissions. If it provides a session API, follow that API; do not assume tool names or a separately installed skill. Live export needs a compatible Figma Plugin API bridge, as explained in [REFRESH.md](references/REFRESH.md). Offline lookup needs no connector. Import editable instances and preserve nested components, variables and styles. Recheck selected nodes if the source has changed since the snapshot."
        if old not in skill_text:
            raise ValueError("Source live-Figma instructions changed; review the Claude adaptation")
        skill_text = skill_text.replace(old, new)
        skill_text = skill_text.replace(
            "Run the helper with this skill's actual directory as the working directory, or use its absolute script path:",
            "In Claude's code execution environment or Claude Code, locate this skill's actual directory and run the helper there, or use its absolute script path. Do not assume the project checkout is the skill directory:")
        (stage / "SKILL.md").write_text(skill_text, encoding="utf-8")
        (stage / "references/REFRESH.md").write_text(REFRESH, encoding="utf-8")
        schema_path = stage / "references/SCHEMA.md"
        schema = schema_path.read_text(encoding="utf-8").replace(
            "python3 ../scripts/assemble_catalog.py --check-only",
            "python3 ../scripts/assemble_catalog.py --root . --check-only")
        schema = schema.replace("## Commands\n", "## Commands\n\nRun from this references directory. The assembly check requires refreshed raw snapshots first; they are not included in this portable package.\n")
        schema_path.write_text(schema, encoding="utf-8")
        target = output / source.name
        if target.exists():
            shutil.rmtree(target)
        shutil.move(str(stage), str(target))
    archive = output / "hydration-figma-library-claude.zip"
    files = sorted(p for p in target.rglob("*") if p.is_file())
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for path in files:
            bundle.write(path, (Path(target.name) / path.relative_to(target)).as_posix())
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise ValueError("ZIP integrity check failed")
        assert "hydration-figma-library/SKILL.md" in bundle.namelist()
        assert all(name.startswith("hydration-figma-library/") for name in bundle.namelist())
        assert not any("/agents/" in name or "__pycache__" in name for name in bundle.namelist())
    return {"archive": str(archive), "folder": str(target), "files": len(files),
            "zipBytes": archive.stat().st_size, "uncompressedBytes": sum(p.stat().st_size for p in files)}


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=root / "skill/hydration-figma-library")
    parser.add_argument("--output", type=Path, default=root / "exports/claude")
    args = parser.parse_args()
    print(json.dumps(build(args.source.resolve(), args.output.resolve())))


if __name__ == "__main__":
    main()
