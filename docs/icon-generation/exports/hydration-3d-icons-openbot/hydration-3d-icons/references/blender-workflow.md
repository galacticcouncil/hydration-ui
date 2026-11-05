# Blender source and rendering

## Portable saved sources

All paths in this table are relative to the companion directory `hydration-3d-icon-sources`, not the installed skill. Resolve it using [source-companion.md](source-companion.md).

| Bundled project | Use as an anchor for |
| --- | --- |
| `blender/status-icons.blend` | Saved shared palette/studio and the hourglass, review document, inbox and document-clock scenes |
| `blender/lounger-v6.blend` | Latest narrow sunbed, richer violet and matte fabric/plastic; includes preserved earlier icon scenes |
| `blender/tracked-glasses-adaptive.blend` | Selected angle D, royal-blue satin and translucent frosted lenses on both light/dark surfaces |
| `blender/bank-selected-a4.blend` | Selected upward colonnade, eight freestanding columns and a lower camera |
| `blender/pearl-shell.blend` | Selected warm studio, larger rough pearlescent pearl, rounded ribbed shell |
| `blender/citrus-press.blend` | Silver one-piece juicing top, deeper collecting tray and relaxed retro silhouette |

These are snapshots, not writable masters. Copy the chosen project into the new task's output directory before editing. See `sample-manifest.json` for original paths and SHA-256 values. If the user supplies a newer saved project, inspect and use it instead.

## Working without disturbing earlier work

Inspect the active Blender filepath before using an interactive connection; it may belong to another task. An isolated background process opening a copied project avoids changing that session. If background rendering is unavailable, use the connected Blender tool deliberately and preserve the current project before opening another file.

For a new icon in an existing family project, make a separate named scene and model collection with its own camera. Keep previous scenes intact. Copy material datablocks and studio/compositor data before changing them: linked materials or lights can otherwise recolor or relight older icons. Preserve semantic parts as editable meshes/curves with readable names and useful live modifiers.

The historical status builders and original bank builder are not authoritative reproductions of the saved manual edits. Do not run them over a saved source. For an unchanged icon re-export, render the saved scene from a frozen copy without reconstructing geometry.

## Measured studio and grade

The bundled profiles were inspected directly in Blender and include exact matrices, lights, world nodes, material nodes and scene names. Load only the relevant entry from `blender-profiles.json`: `profiles.status`, `profiles.lounger`, `profiles.glasses` or `profiles.bank`. `sourceModifiedByInspection: false` means the inspection did not save or alter the saved source file.

The four measured original anchor projects use Cycles, AgX, `AgX - Medium High Contrast`, exposure .35 and a compositor Hue/Saturation node with saturation 1.04 and value 1. These are a starting match, not an instruction to add another saturation pass on top. Copy the existing compositor rather than grading twice. Keep alpha intact.

The shared studio uses broad area lights. The lounger has a deliberately adapted rig: key 700W/3.8, fill 140W/4, rim 210W/3, with a cool world strength .17. Those numbers are meaningful at that scene's scale; reuse the saved rig or adjust in proportion to the new model, rather than applying fixed wattage to any object size.

For materials, prefer copies of the saved `PALETTE` nodes. The native satin surface includes fine Noise-to-Bump treatment; do not replace it with a highly glossy default Principled material. Blender socket colors are scene-linear: convert sRGB swatches before assigning numeric RGB, or copy the existing datablock to avoid a gamma error.

## Rendering and export

Use a low-cost preview while modeling; keep the selected scene's quality for its final re-export. Saved sample counts vary: document 600, hourglass 192, inbox/clock 128, glasses 256, lounger 256 and bank 128. Do not silently degrade the saved document to the preview preset.

Render transparent PNG RGBA, usually at 1024px on the long edge and 16-bit where appropriate. Do not force square geometry or camera framing: the current lounger master is 1024 × 932. Fit its full image proportionally onto a transparent 512 × 512 canvas for the UI WebP. The existing exports use Lanczos resizing and WebP quality around 92–94 with method 6.

Check the object at 96px, and inspect alpha edges/lenses on both `#0D1525` and a light background. Keep full-size master, small UI export and separate background-composited review image. Show an inline preview and provide the `.blend`. If UI wiring is requested, use the project's shared image/empty-state components and verify in the actual screen.

For pearl and citrus, inspect the saved scene rather than assuming the four measured profiles apply. Their exact scene names are recorded in `sample-manifest.json`.
