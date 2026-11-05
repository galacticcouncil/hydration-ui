#!/usr/bin/env python3
"""Package the Hydration icon skill and its source companion for OpenBot.

Requires Pillow. Reads the original skill and UI catalog without modifying them.
The installable folder stays below OpenBot's 10 MiB expanded size limit.
"""

import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageFont


SOURCE_NAME = "hydration-3d-icon-sources"
SKILL_NAME = "hydration-3d-icons"
DATE = "2026-10-27"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def copy_file(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def sheet(items, path, root, columns=4):
    cell_w, cell_h = 256, 225
    canvas = Image.new("RGB", (columns * cell_w, math.ceil(len(items) / columns) * cell_h), "#0D1525")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=14)
    small = ImageFont.load_default(size=11)
    for index, item in enumerate(items):
        x, y = (index % columns) * cell_w, (index // columns) * cell_h
        with Image.open(root / item["file"]) as source:
            icon = source.convert("RGBA")
            icon.thumbnail((184, 166), Image.Resampling.LANCZOS)
            canvas.paste(icon, (x + (cell_w - icon.width) // 2, y + 10 + (166 - icon.height) // 2), icon)
        draw.text((x + cell_w // 2, y + 185), item["name"], font=font, fill="#FFFFFF", anchor="mm")
        draw.text((x + cell_w // 2, y + 208), item["tier"], font=small, fill="#B3BDCB", anchor="mm")
    canvas.save(path, optimize=True)


def build(args):
    original = args.skill.resolve()
    library = args.library.resolve()
    output = args.output.resolve()
    if output.exists():
        raise SystemExit(f"Output already exists; choose a new directory: {output}")
    skill = output / SKILL_NAME
    sources = output / SOURCE_NAME
    skill.mkdir(parents=True)
    sources.mkdir()
    shutil.copytree(original / "references", skill / "references")
    shutil.copytree(original / "assets" / "samples", skill / "assets" / "samples")
    shutil.copytree(original / "assets" / "blender", sources / "blender")
    shutil.copytree(original / "assets" / "masters", sources / "masters")

    manifest = json.loads((original / "references" / "sample-manifest.json").read_text())
    manifest["originalSnapshotDate"] = manifest["snapshotDate"]
    manifest["snapshotDate"] = DATE
    manifest["scope"] = "Original 29 raster references plus current review-clock, selected pearl shell and citrus press; full-resolution masters and six editable projects travel in a separate companion directory."
    manifest["sourceCompanion"] = SOURCE_NAME
    for name, project in manifest["blenderProjects"].items():
        project["sourceFile"] = project.pop("file").removeprefix("assets/")
        project["location"] = "source-companion"
    for sample in manifest["samples"]:
        if "blenderProject" in sample:
            old_path = sample.pop("blenderProject")
            sample["blenderProjectId"] = next(k for k, v in manifest["blenderProjects"].items() if v["sourceFile"] == old_path.removeprefix("assets/"))
        if "masterRender" in sample:
            sample["masterRender"]["sourceFile"] = sample["masterRender"].pop("file").removeprefix("assets/")
            sample["masterRender"]["location"] = "source-companion"
        if sample["file"].endswith("-1024.png"):
            old = skill / sample["file"]
            master_file = "masters/" + old.name
            copy_file(old, sources / master_file)
            new = old.with_suffix(".webp").with_name(old.stem.replace("-1024", "-reference") + ".webp")
            with Image.open(old) as image:
                image.thumbnail((512, 512), Image.Resampling.LANCZOS)
                image.save(new, "WEBP", quality=94, method=6)
            old.unlink()
            sample["originalMasterSha256"] = sample["sha256"]
            sample["masterRender"] = {"sourceFile": master_file, "location": "source-companion", "sha256": sha(sources / master_file)}
            sample["file"] = new.relative_to(skill).as_posix()
            sample["sha256"] = sha(new)
            sample["bytes"] = new.stat().st_size
            with Image.open(new) as image:
                sample["size"] = list(image.size)
            sample["authority"] = "Downscaled visual reference; unchanged full-resolution master in source companion"
        if sample["name"] == "Document Clock":
            sample.update(tier="current-blender-ui", usage="Bank deposit · Verification in review", blenderProjectId="status", scene="04 - Review Document Clock", profile="status")
    catalog = json.loads((library / "catalog.json").read_text())
    for icon_id, project_id in [("review-clock", "status"), ("pearl-shell", "pearl"), ("citrus-press", "citrus")]:
        entry = next(e for e in catalog["entries"] if e["id"] == icon_id)
        exported = library / entry["export"]
        if sha(exported) != entry["sha256"]:
            raise SystemExit(f"Catalog checksum mismatch: {exported}")
        dest = skill / "assets" / "samples" / exported.name
        copy_file(exported, dest)
        master = sources / entry["master"]
        copy_file(library / entry["master"], master)
        if icon_id != "review-clock":
            model = sources / entry["blender"]
            copy_file(library / entry["blender"], model)
            manifest["blenderProjects"][project_id] = {"sourceFile": entry["blender"], "location": "source-companion", "sha256": sha(model), "bytes": model.stat().st_size, "scene": entry["scene"], "measuredProfileIncluded": False}
        with Image.open(dest) as image:
            size = list(image.size)
        manifest["samples"].append({"name": entry["title"], "file": dest.relative_to(skill).as_posix(), "sha256": sha(dest), "bytes": dest.stat().st_size, "size": size, "mode": "RGBA", "tier": "current-blender-ui" if icon_id == "review-clock" else "selected-design" if icon_id == "pearl-shell" else "ready-to-use", "status": entry["status"], "usage": "; ".join(entry["usage"]), "blenderProjectId": project_id, "scene": entry["scene"], "authority": "Selected saved render and editable Blender source", "masterRender": {"sourceFile": entry["master"], "location": "source-companion", "sha256": sha(master)}})
    write_json(skill / "references" / "sample-manifest.json", manifest)

    text = (original / "SKILL.md").read_text()
    text = text.replace("using the bundled Blender scenes and brand samples", "using saved Blender projects and bundled brand samples")
    text = text.replace("The brand draws on", "The pearl shell and silver citrus press extend this family. The brand draws on")
    text = text.replace("Four saved projects are bundled in `assets/blender/`; their measured scene, material and studio settings are in [blender-profiles.json](references/blender-profiles.json).", "Six editable projects and full-resolution masters are in the optional companion folder `hydration-3d-icon-sources`. Read [source-companion.md](references/source-companion.md) to locate them. Measured settings for the four original anchors are in [blender-profiles.json](references/blender-profiles.json); inspect the saved pearl/citrus scenes directly for their settings.")
    text = text.replace("Load the available image-generation skill and use the actual bundled style references.", "Use an available image generator with reference-image input (Imagen when available) and the actual bundled style references. Read [openbot-tools.md](references/openbot-tools.md) for capability routing.")
    text = text.replace("use the available image-generation workflow, loading its relevant skill.", "use an available reference-aware image generator; follow its own tool guidance.")
    text = text.replace("Start from a copy of the closest bundled project;", "Start from a copy of the closest companion project;")
    (skill / "SKILL.md").write_text(text)
    guide = skill / "references" / "style-guide.md"
    guide.write_text(guide.read_text().replace("use the five current Blender UI exports", "use the current Blender UI exports").replace("plus the two saved Blender study renders", "plus saved studies, the selected pearl shell and the future-use citrus press").replace("The two additional saved Blender studies are useful construction references, but are not current UI selections.", "The document clock is now the In review UI illustration; the inbox remains a saved construction study. The pearl is selected in Figma; the citrus press is ready for future use."))
    workflow = skill / "references" / "blender-workflow.md"
    text = workflow.read_text()
    text = re.sub(r"`\.\./assets/blender/([^`]+)`", r"`blender/\1`", text)
    text = text.replace("## Portable saved sources", "## Portable saved sources\n\nAll paths in this table are relative to the companion directory `hydration-3d-icon-sources`, not the installed skill. Resolve it using [source-companion.md](source-companion.md).")
    text = text.replace("\n\nThese are snapshots,", "\n| `blender/pearl-shell.blend` | Selected warm studio, larger rough pearlescent pearl, rounded ribbed shell |\n| `blender/citrus-press.blend` | Silver one-piece juicing top, deeper collecting tray and relaxed retro silhouette |\n\nThese are snapshots,")
    text = text.replace("All four projects currently use", "The four measured original anchor projects use")
    text += "\nFor pearl and citrus, inspect the saved scene rather than assuming the four measured profiles apply. Their exact scene names are recorded in `sample-manifest.json`.\n"
    workflow.write_text(text)
    prompts = skill / "references" / "prompt-patterns.md"
    prompts.write_text(prompts.read_text().replace("Load the available image-generation skill when invoking its workflow.", "Use an available image generator that accepts reference images, following its tool guidance; Imagen is suitable when connected."))
    (skill / "references" / "source-companion.md").write_text(SOURCE_GUIDE)
    (skill / "references" / "openbot-tools.md").write_text(TOOL_GUIDE)

    anchors = ["Flamingo", "TrackedWalletGlasses", "DepositEmptyLounger", "In review", "Bank3D", "Pearl shell", "Citrus press", "Warning3D", "SuccessStatusPlain"]
    selected = [next(s for s in manifest["samples"] if s["name"] == name) for name in anchors]
    sheet(selected, skill / "assets" / "style-anchors.png", skill, 3)
    sheet(manifest["samples"], skill / "assets" / "all-samples.png", skill)
    with Image.open(skill / "assets" / "samples" / "pearl-shell.webp") as image:
        image.thumbnail((256, 256), Image.Resampling.LANCZOS)
        image.save(skill / "assets" / "icon.png", optimize=True)
    source_manifest = {"date": DATE, "skill": SKILL_NAME, "files": [{"file": f.relative_to(sources).as_posix(), "bytes": f.stat().st_size, "sha256": sha(f)} for f in sorted(sources.rglob("*")) if f.is_file()]}
    write_json(sources / "source-manifest.json", source_manifest)
    write_json(sources / "sample-manifest.json", copy.deepcopy(manifest))
    (output / "INSTALL.md").write_text(INSTALL)
    files = [f for f in skill.rglob("*") if f.is_file()]
    size = sum(f.stat().st_size for f in files)
    assert len(files) <= 200 and size <= 10 * 1024 * 1024, (len(files), size)
    assert (skill / "assets" / "icon.png").stat().st_size <= 512 * 1024
    checksums = "\n".join(f"{sha(f)}  {f.relative_to(output).as_posix()}" for f in sorted(output.rglob("*")) if f.is_file())
    (output / "SHA256SUMS.txt").write_text(checksums + "\n")
    archive = output.with_suffix(".zip")
    if archive.exists():
        raise SystemExit(f"Archive already exists: {archive}")
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
        for file in sorted(output.rglob("*")):
            if file.is_file():
                bundle.write(file, Path(output.name) / file.relative_to(output))
    print(json.dumps({"archive": str(archive), "zipBytes": archive.stat().st_size, "skillFiles": len(files), "skillExpandedBytes": size, "samples": len(manifest["samples"]), "blenderProjects": len(manifest["blenderProjects"]), "sha256": sha(archive)}, indent=2))


SOURCE_GUIDE = """# Editable source companion

The download contains two sibling folders. Register only `hydration-3d-icons` as an OpenBot skill. Keep `hydration-3d-icon-sources` in the agent's workspace or a user-approved shared asset directory; it exceeds the local-skill size budget and is not registered as part of the skill.

For Blender production, locate that companion within the current workspace or the configured OpenBot Shared directory. Record its actual path for the task. Do not assume it is beside the installed skill: registration copies the skill into OpenBot's library. If it is missing, ask for the extracted companion location. Ideation can continue using the bundled images; do not claim editable source is available until found.

`sample-manifest.json` uses `file` for images inside this skill and `sourceFile` for files relative to the companion. `blenderProjectId` joins a sample to `blenderProjects`. Original repository paths are provenance only, not required file locations. `source-manifest.json` in the companion records all source checksums.

Copy a saved project to the task output before editing. Never mutate the companion master. Six Blender projects cover status/document/clock, slim lounger, royal-blue glasses, bank, selected pearl shell and silver citrus press. Exact scene names are in the sample manifest. The four original measured lighting/material profiles are retained; pearl and citrus need direct scene inspection.
"""

TOOL_GUIDE = """# OpenBot capability routing

This skill supplies style knowledge and reference assets. It does not install or configure image generation, Blender, or Figma connections.

- For ideation, discover a connected image-generation tool with reference-image input. Prefer Imagen when available; another reference-aware generator can be used when appropriate. Load that tool's own guidance. Show five numbered ideas and wait for selection as specified in SKILL.md. If no image tool is connected, state the missing capability and prepare the five concept briefs; do not substitute text for a claimed rendered sheet.
- For editable production, use an available Blender connector or local Blender CLI in an isolated process. Resolve the executable at runtime; no fixed OS path is assumed. Use the companion sources and preserve the active interactive project. If unavailable, explain what is needed rather than presenting an AI image as a Blender render.
- Use image/file tools to inspect references and completed renders. For image resizing, alpha checks and WebP export, use an available local image utility or Pillow. Preserve proportions.
- Add art to an app, Figma or an icon catalog only when the user requests integration. Reuse its existing components/variables where relevant.

Do not assume Codex-specific tools, `nodeRepl`, a particular MCP namespace, or another installed skill. The included prompts and measured profiles remain usable with different image and Blender tools.
"""

INSTALL = """# Hydration 3D Icons for OpenBot

Prepared 2026-10-27 for nightly-labs/OpenBot (openbot.run). If your OpenBot is a different product, the portable SKILL.md and references can still be read, but its registration steps need checking.

## Install

1. Extract this entire ZIP into the workspace of the OpenBot agent that will use it. Keep both folders.
2. Ask that agent:

   > Read INSTALL.md in this package. Use your built-in openbot-skill-creator guide. Check the local skills library for hydration-3d-icons, then register the hydration-3d-icons folder using create_skill, or revise the existing matching skill using its current revision. Use a workspace-relative sourcePath. Keep hydration-3d-icon-sources as companion assets in my workspace and tell me its resolved path. Do not register the outer package or source folder as a skill.

3. Other agents can add the registered skill through Settings → Skills → Local skills. Confirm the returned skill ID/revision after registration.

The skill folder is under 10 MiB expanded and 200 files, without nested archives or symlinks. Blender files and full-size masters intentionally live outside it. OpenBot registration copies only the skill folder, so leave the companion accessible in the workspace or your configured Shared directory.

## Included

- Five visual concepts using reference-aware image generation → user selection → production.
- Water, leisure, chill and subtle retro brand direction; varied subject-led palettes including the all-pink flamingo.
- All original raster references, plus selected pearl shell, silver citrus press and current In review clock; contact sheets and preview logo.
- Six editable Blender projects, full-size masters and recorded original studio/material profiles.
- Source and package checksums. No credentials, provider setup, runnable install script or automatic UI changes.

Pearl is selected in Figma; citrus is ready for future use; the clock is used for bank-deposit verification In review. The sample manifest distinguishes current UI assets, design selections, studies and broader brand context.

## First request

> Use Hydration 3D Icons to explore five icon ideas for a portfolio earning dashboard. Show a numbered concept sheet and wait for my selection before Blender production. Keep water/leisure/retro character and varied colors.

## Requirements and verification

Image generation needs a connected reference-aware image tool; Imagen is preferred when available. Editable production needs Blender via CLI or connector. The package does not install either. Blender sources are supplied unchanged and have not been newly rendered as part of packaging. Registration in a running OpenBot instance is not performed by this download.

OpenBot format and limits were checked against these official sources on the package date:
- https://github.com/nightly-labs/openbot#local-skills
- https://github.com/nightly-labs/openbot/blob/main/resources/managed-skills/openbot-skill-creator/SKILL.md
- https://github.com/nightly-labs/openbot/blob/main/src/main/skill-package.ts

This is a local-skill handoff, not an agent-profile import or Marketplace publication. Source lookup paths and registration APIs may change in later OpenBot versions.
"""


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill", type=Path, required=True)
    parser.add_argument("--library", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    build(parser.parse_args())
