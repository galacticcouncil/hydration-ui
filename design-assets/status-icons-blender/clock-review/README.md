# Inbox text and document clock

Open the parent **status-icons.blend** for both updated scenes:

- **03 - Review Inbox** has two equal-length blue capsule lines on the ivory document.
- **04 - Review Document Clock** reuses the exact curved blue page, three ivory capsule lines, live bend, camera, native materials, studio and grade from **02 - Review Document**. A rounded lavender clock with a recessed ivory face and blue hands replaces the magnifier in this independent scene.

The clock overlaps the bottom-right paper edge. Its **Clock - Position and orientation control** moves the casing, face and hands together. The placement is 0.65 units lower than the original magnifier center. Casing, face, both fully rounded hands and center pin remain separate, editable meshes.

The original magnifier and hourglass scenes are preserved. The entire pre-edit project is in `../revisions/before-inbox-lines-and-clock-2026-10-22/status-icons.blend`. `verification.json` records matching before/reopened digests for prior scene settings, object geometry, transforms, modifiers, materials and lighting. The new inbox line is the only addition to its existing model collection.

Both supplied visual references are packed in a hidden collection. No linked external library is required. New scene bend controls and text drivers point to their copied document, so page edits are independent of the magnifier scene. Shared native material and lighting changes affect the whole family; copy materials for variant-only changes.

`build_clock_review.py` runs against the frozen pre-edit source and writes an explicitly requested output. It retains the original geometry rather than reconstructing the page. Its optional canonical hash guard stops if the destination changed during work. `render_saved_variants.py` reads the saved project and renders both variants without saving it. `render-provenance.json` records the exact source and output hashes.

Outputs are transparent 1024px PNGs at 128 Cycles samples:

- `../inbox-review/review-inbox-1024.png`
- `document-clock-1024.png`

These remain artwork previews; existing runtime icon exports are preserved for review.
