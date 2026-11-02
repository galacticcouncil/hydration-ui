# Hydration 3D Icons for OpenBot

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
