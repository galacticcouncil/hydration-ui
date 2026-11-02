# Hydration library skill for Claude

[Download the upload ZIP](claude/hydration-figma-library-claude.zip).

## Claude web or desktop

In **Customize → Skills**, choose **+ → Create skill → Upload a skill**, select the ZIP and enable it. Code execution and file creation must be enabled for the Python lookup helper. Ask, for example: “Use the Hydration library skill to find an account card with a Change action and compact fee rows.”

The ZIP contains one top-level `hydration-figma-library` folder, with `SKILL.md`, scripts, all catalog JSON and the page/pattern references. No external Python packages are needed.

## Claude Code

Extract the ZIP, then place the whole `hydration-figma-library` folder under `~/.claude/skills/` for personal use, or `.claude/skills/` at the project root for that project. Invoke `/hydration-figma-library` or describe the Hydration UI task normally. This packaging task has not installed or uploaded it into Claude.

## Scope

Catalog snapshot: **2026-10-26**, covering all 27 source pages. Offline lookup works without Figma access. Live inspection and refresh need appropriate Figma tools; running the exporter requires a Plugin API execution bridge, which an ordinary read-only connector may not provide. Source inventory does not establish import availability or tested visual behavior.

To rebuild from current project docs:

```bash
python3 docs/design-system/figma-library/scripts/package_skill.py
python3 docs/design-system/figma-library/scripts/package_claude.py
```

Official setup references: [uploading custom skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude), [Claude Code skill locations](https://code.claude.com/docs/en/skills).
