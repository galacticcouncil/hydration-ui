---
name: hydration-3d-icons
description: Create or edit Hydration 3D icons and empty-state illustrations using saved Blender projects and bundled brand samples. Use for icon concepts, Blender modeling and rendering, material or color matching, and transparent UI artwork exports.
---

# Hydration 3D Icons

Create objects that belong beside Hydration's flamingo, tracked-wallet glasses, sunbed, hourglass, document and bank. The pearl shell and silver citrus press extend this family. The brand draws on water, leisure and a relaxed poolside mood, with subtle vintage/retro character. The family is defined by this subject language, silhouette, rounded construction, tactile surfaces and soft lighting; it allows varied, subject-led colors.

## Start with the references

- Read [style-guide.md](references/style-guide.md), then view [style-anchors.png](assets/style-anchors.png) and the closest individual samples. The pink flamingo is an equally valid color anchor.
- [sample-manifest.json](references/sample-manifest.json) indexes every bundled image, its role, UI usage and provenance. [all-samples.png](assets/all-samples.png) shows the complete collection. Current UI renders, saved studies and wider brand context are labeled separately.
- For Blender work, read [blender-workflow.md](references/blender-workflow.md). Six editable projects and full-resolution masters are in the optional companion folder `hydration-3d-icon-sources`. Read [source-companion.md](references/source-companion.md) to locate them. Measured settings for the four original anchors are in [blender-profiles.json](references/blender-profiles.json); inspect the saved pearl/citrus scenes directly for their settings.

## Ideate first, then wait for selection

For a new icon, start with **five visual ideas through image generation** before producing the final asset. Use an available image generator with reference-image input (Imagen when available) and the actual bundled style references. Read [openbot-tools.md](references/openbot-tools.md) for capability routing. Read [prompt-patterns.md](references/prompt-patterns.md) for the concept-sheet approach.

- Explore five distinct object metaphors or compositions that fit the page's purpose and Hydration's water, leisure, chill and subtle retro character. Color variety is welcome; five recolors of one object are not five ideas.
- Show one comparison sheet with options **1–5**, consistent scale and viewing conditions, and a brief name for each. Keep numbers and names outside the artwork. These are concept previews, not final Blender renders or runtime assets.
- **Stop after presenting the sheet and ask the user which option to develop. Wait for an explicit selection.** Do not select a favorite on the user's behalf, start production modeling/rendering, refine a single candidate into the final asset, or insert a candidate into Figma/the app before selection. A recommendation is fine, but does not replace the user's choice.
- After selection, develop only the chosen concept in the requested medium. If the user wants another round, generate revised ideas and wait again.

Use a different count or skip ideation only when the user explicitly requests it or supplies an already chosen concept/reference for production. A page brief, subject name or color preference alone is not a selection. Refinements to an already selected icon continue directly within the requested scope; do not restart the five-option phase unless a new direction is requested.

## Make the subject fit the family

Choose a clear object metaphor and a readable silhouette before adding detail. Use the relaxed aquatic/leisure theme to guide ideation and subtle retro cues to shape the object; keep functional and status meanings clear rather than forcing a pool prop into every icon. Use substantial rounded edges, continuous curves, coherent thickness and a small number of recognizable parts. Keep proportions intentional: do not widen a narrow object to fill the square. The final sunbed is the slim V6, with one frame rather than overlapping duplicate frames.

Use saturated but controlled color. A whole-pink inflatable, a yellow warning sign, green success token, violet pool or mint stack can each be correct. Monochrome and two-color objects are welcome. Add blue, ivory or another accent only when it helps the object. Avoid imposing a fixed palette quota, universal blue/white treatment or unrelated rainbow accents.

Default solid surfaces to the current matte/satin family. Glass, cloth, inflatable rubber and metal need their own behavior; do not apply glossy glass or clearcoat to everything. Preserve soft broad highlights and visible volume. Match the nearest sample instead of applying identical roughness to every material.

## Choose the requested output

- **Concepts or raster artwork:** use an available reference-aware image generator; follow its own tool guidance. Attach the closest bundled samples and state the subject's intended colors. [prompt-patterns.md](references/prompt-patterns.md) provides a concise base prompt and color-diverse examples. For new icons, follow the five-concept selection gate above; after selection, use this workflow for the chosen raster artwork.
- **Blender or editable 3D:** after the concept is selected, use Blender and deliver a real editable `.blend` and rendered image. A generated bitmap is only a concept reference. Start from a copy of the closest companion project; preserve its studio and grade, then create a separate scene and independent materials for the new subject.
- **Refinement:** preserve the selected silhouette, camera and unrelated parts; change the requested properties. Prefer the saved Blender source over old procedural builders, which do not reproduce later manual edits.

Do not replace app assets, publish a gallery or change a running Blender project unless that is part of the user's request. Creating an icon does not itself authorize UI integration.

## Review and deliver

Inspect a quick preview early, then the final at its intended UI size—usually 96 CSS pixels. Check the silhouette, material finish, saturation, disconnected or intersecting parts, and generous edge clearance. For lenses and transparency, inspect both navy and light surfaces; retain physical translucent behavior without a baked opaque patch.

For UI artwork, deliver a transparent master PNG, usually about 1024 pixels on its long edge. Export a 512 × 512 transparent WebP when needed, preserving aspect ratio and padding instead of stretching or clipping the object. Do not bake a navy background, comparison labels or checkerboard into the runtime asset. Keep them in separate review images. Show the image inline and link the editable source when applicable.
