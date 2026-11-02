#!/usr/bin/env python3
"""Synchronize the portable skill from the validated project library index."""

import argparse
import json
import shutil
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    root = args.root.resolve()
    manifest = json.loads((root / "catalog/manifest.json").read_text())
    diagnostics = json.loads((root / "catalog/diagnostics.json").read_text())
    if diagnostics.get("errors"):
        raise SystemExit("Resolve catalog errors before packaging the skill")
    skill = root / "skill/hydration-figma-library"
    if not (skill / "SKILL.md").is_file():
        raise SystemExit("Missing skill entry point")
    refs = skill / "references"
    refs.mkdir(parents=True, exist_ok=True)
    for folder, suffix in (("catalog", ".json"), ("pages", ".md")):
        source, target = root / folder, refs / folder
        target.mkdir(parents=True, exist_ok=True)
        wanted = {item.name for item in source.glob("*" + suffix)}
        for item in target.glob("*" + suffix):
            if item.name not in wanted:
                item.unlink()
        for name in sorted(wanted):
            shutil.copy2(source / name, target / name)
    for name in ("QUICK-LOOKUP.md", "PAGES.md", "FAMILIES.md", "FOUNDATIONS.md", "CODE-MAP.md", "PRIOR-NOTES.md", "SCHEMA.md"):
        text = (root / name).read_text(encoding="utf-8")
        text = text.replace("python3 scripts/", "python3 ../scripts/").replace(
            "](scripts/", "](../scripts/")
        if name == "SCHEMA.md":
            text += "\nThe portable skill omits raw transport chunks; they remain in the project documentation. A fresh standalone refresh must export all pages and foundations.\n"
        (refs / name).write_text(text, encoding="utf-8")
    (refs / "raw").mkdir(exist_ok=True)
    shutil.copy2(root / "raw/prior-component-index.md", refs / "raw/prior-component-index.md")
    scripts = skill / "scripts"
    scripts.mkdir(exist_ok=True)
    for name in ("lookup.py", "assemble_catalog.py", "export-library.js"):
        shutil.copy2(root / "scripts" / name, scripts / name)
    (refs / "REFRESH.md").write_text(
        "# Refresh the bundled snapshot\n\n"
        "Use the installed figma-use skill and a fresh task session for Design Library "
        "`wN5pnsm2FPVoCrxFNEAlYl`. Refresh the complete page manifest and foundations, "
        "or the affected pages when doing a partial update. This is a read-only source audit.\n\n"
        "Run `../scripts/export-library.js` through use_figma, prepending "
        "`const CONFIG = {mode: 'page', pageId: '34:2', offset: 0};` "
        "or `{mode: 'foundations', offset: 0}`. Switch at most once per call; "
        "fan out independent read-only pages. Save each returned object intact in "
        "`references/raw/chunks/<page-id-with-dashes>/<offset>.json` "
        "and foundations under `references/raw/chunks/foundations/`. Save "
        "`references/raw/manifest.json` with `fileKey` and every page `{id,name}`. "
        "Follow `nextOffset` until null. The 44,000-character base64 slices belong "
        "to one LZW stream per page. Do not decode chunks separately. "
        "If totalLength or jsonLength changes between calls, re-export that page. "
        "Use fresh page chunk directories to avoid stale trailing chunks. "
        "The skill bundle omits raw chunks: a partial refresh requires the project's "
        "complete raw snapshots; otherwise export all pages and foundations.\n\n"
        "From the skill directory run:\n\n```bash\n"
        "python3 scripts/assemble_catalog.py --root references --date YYYY-MM-DD\n"
        "python3 scripts/assemble_catalog.py --root references --check-only --date YYYY-MM-DD\n"
        "python3 scripts/lookup.py summary\n```\n\n"
        "The assembler checks transport continuity, UTF-16 length, counts, IDs, "
        "keys, variant owners, modes and aliases. Inspect `catalog/diagnostics.json`. "
        "Update curated `catalog/routes.json`, QUICK-LOOKUP and prior-note statuses "
        "from evidence; do not infer tested import or resize behavior from metadata. "
        "Update the snapshot date in SKILL.md. When the project docs are available, "
        "refresh there first and run their `scripts/package_skill.py` so both copies agree.\n",
        encoding="utf-8",
    )
    count = sum(1 for item in skill.rglob("*") if item.is_file())
    print(json.dumps({"skill": str(skill), "files": count, "catalogDate": manifest.get("exportDate")}))


if __name__ == "__main__":
    main()
