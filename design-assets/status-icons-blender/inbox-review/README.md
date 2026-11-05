# Review inbox illustration

Editable Blender interpretation of the user-selected imagegen inbox tray concept.
The current canonical scene has **two** blue capsule lines. This update and the
matching curved-document clock variant are documented in `../clock-review/README.md`.

The canonical project is **`../status-icons.blend`**. It includes **03 - Review Inbox** alongside **01 - Hourglass**, **02 - Review Document** and **04 - Review Document Clock**. Open that canonical file for ongoing artwork edits.

Before combining the scenes, the parent task captured the live Blender project, including its unsaved user edits, in **`../revisions/before-review-inbox-2026-10-22/status-icons.blend`**. This preserved live source is the base of the combined file; the previous icons were not procedurally rebuilt.

## Files

- Scene: **03 - Review Inbox**
- Candidate geometry: `review-inbox-candidate.blend`
- Render: `review-inbox-1024.png` — transparent RGBA, Cycles CPU, 128 samples
- Reference: `reference-selected.png` — also packed into the blend in a hidden reference collection
- Builder: `build_inbox_review.py` — writes the separate candidate package, never the canonical project
- Combine/preservation check: `append_inbox_scene.py`
- Geometry check: `geometry-check.json`

The candidate was originally built read-only from the earlier on-disk studio snapshot. Its source hash remains recorded in the candidate manifest for provenance. During the final append, the new scene reuses the preserved live project's actual palette, world and shared softbox collection, and receives an independent copy of its current compositor grade.

## Editing the icon

All model pieces are in **ICON - Review Inbox**.

- **Tray - Continuous rounded hollow shell with U-notch** is one closed, continuous hollow mesh with a thick floor, rounded rectangular corners, fully rounded wall rim, and broad central U-shaped opening. Edit its mesh for local changes; its subdivision modifier softens the silhouette. The modeled wall thickness is 0.25 Blender units. Width/depth/thickness custom properties describe the built shape rather than acting as live drivers.
- **Document - Tilt control** parents the ivory face, lavender backing edge and blue line. Move or rotate this empty to adjust the whole document together.
- **Document - Warm ivory face** and **Document - Lavender backing edge** retain their own edge-rounding and weighted-normal modifiers.
- **Document - Single royal-blue pill line** uses complete capsule geometry with hemispherical end caps. Edit its mesh or scale it for line length and thickness.
- **Tray - Lavender circular status dot** is a separate softly domed ellipsoid.
- **CAMERA - Review Inbox** controls the shallow three-quarter presentation independently of the other icon cameras.
- **REFERENCE - Selected Inbox Concept (hidden)** contains the packed reference and is excluded from renders.

Hidden/back geometry is inferred from the single reference; the visible silhouette and color blocks follow the selected concept. Shared palette materials and studio lights also serve the older scenes, so changing them affects the icon family. For inbox-only material experimentation, duplicate the relevant material first.

## Safe combining workflow

`append_inbox_scene.py` opens the preserved two-scene live source, records the prior scenes' settings, geometry, transforms, modifiers, materials, lights, world and compositor data, then appends only the accepted candidate scene. It reuses the original studio/world/palette in the new scene without globally remapping or modifying old scene data. The new scene has its own compositor with its Render Layers node targeting **Inbox Review**.

The script writes a **staged combined file**, reopens it, and verifies that the prior scenes still match their recorded data. It also checks that the preserved input file's bytes remain unchanged. The caller publishes the combined file to the canonical path only after those checks pass. The script itself does not overwrite the canonical file automatically.

To rebuild only the separate candidate from the preserved live snapshot, run from this folder:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b ../revisions/before-review-inbox-2026-10-22/status-icons.blend --python build_inbox_review.py -- --resolution 1024 --samples 128
```

The builder saves only into this folder and verifies that its input file remains unchanged. Do not run the historical status-icons builder to update the user-edited canonical project. This package does not replace a UI asset automatically.
