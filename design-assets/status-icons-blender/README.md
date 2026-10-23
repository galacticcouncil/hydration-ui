# Hydration status icons

**Latest:** **03 - Review Inbox** now has a second blue capsule line, and
**04 - Review Document Clock** uses the existing curved blue paper and ivory
text with a lavender clock resting across the bottom-right edge. All four
scenes remain in this same file. See `clock-review/README.md` for editable
parts, source preservation and final transparent renders. The original
document/magnifier scene remains intact.

**2026-10-22:** The canonical file now also contains **03 - Review Inbox**, an
editable Blender interpretation of the selected inbox-and-document concept. It
shares the existing palette, world and softbox studio, and has its own camera
and compositor. See `inbox-review/README.md` for its named parts and controls.
The live Blender state, including unsaved changes, was captured in
`revisions/before-review-inbox-2026-10-22/status-icons.blend` before appending.
The original on-disk source is separately backed up there as
`saved-before-inbox.blend`. The reopened combined file passed the old-scene
preservation check recorded in `inbox-review/append-verification.json`.
The new transparent render is `inbox-review/review-inbox-1024.png` (128 samples).
This artwork study does not replace the current UI export automatically.

The **user-edited saved `status-icons.blend` is now the authoritative source**
for the document icon. The current document UI export uses the file saved on 2026-10-21 at
21:40 local time (source SHA-256 is recorded in `user-saved-render.json`).
Manual Blender edits are preserved exactly; the render process does not save or
modify this `.blend` file. The saved 600-sample quality is retained.

Use `render_saved_document.py` with an immutable copy of the saved file for
future document exports. It renders the document scene as saved, without running
construction or refinement code. `user-saved-render.json` records source hash,
actual render settings and completion time.

**Historical construction scripts:** `build_status_icons.py` and
`refine_magnifier.py` describe the earlier procedural study and are not a full
representation of later manual edits. Running them can replace the user's
changes. The construction notes and parameter descriptions below are historical;
the saved Blender source takes precedence.

Open **status-icons.blend**. It contains all four editable icons, all procedural
materials, shared studio lights/world, cameras, compositors and packed native
artwork references. It requires no linked Blender library or external image.

Use Blender's Scene menu to switch between **01 - Hourglass**,
**02 - Review Document**, **03 - Review Inbox** and **04 - Review Document Clock**.
Each scene has its own named model collection, view
layer and camera. All scenes link the same **STUDIO - Shared Softboxes**
collection and **PALETTE** material datablocks, so palette edits update the family.

For the paper curl, select **Document - Continuous Bent Page**. The live modifier
stack is **Simple Deform / Bend → Solidify → Bevel**. Its diagonal crease is
anchored by **CONTROL - Main Page Corner Crease**. Adjust the Bend angle to edit the
curl on the main sheet; a vertex group limits the larger corner region. The page
is one connected mesh with uniform thickness and no separate flap. Both sides
use the same blue material. The modifier is not applied.

The hourglass keeps the shorter frame, thick caps/supports and physical smoky
glass. The palette is matched to Casette, ChartError and NoPositions, with a
gentle 1.04 compositor saturation grade to match the slightly richer native
colours. Exposure, lighting, roughness and the shared base palette stay fixed.

Render the active scene with F12, or use the read-only CLI helper on a frozen
copy. Substitute that saved file's SHA-256 in the command:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background /path/to/immutable-copy.blend --threads 8 \
  --python-exit-code 1 --python render_saved_document.py -- \
  --output document-1024.png --metadata user-saved-render.json \
  --canonical-source status-icons.blend \
  --expected-source-sha256 SHA256_OF_SAVED_FILE
```

The helper changes only in-memory output settings; it never saves a Blender file.
PNGs are transparent RGBA at 1024px; app exports are 512px WebP files.

`build_status_icons.py` records construction from the two earlier source files
in the adjacent hourglass-blender and document-blender folders. Those files are
only needed to rebuild from scratch; editing/rendering status-icons.blend is
self-contained. The in-file **START HERE - Hydration Status Icons** text also
explains the scene organization and controls.

## App exports

Two icons were generated during this deposit work; both are now Blender scenes:

- `document-1024.png` → `packages/ui/src/assets/images/Review3D.webp`. The shared
  `BankProviderHandoff` uses it in Current flow and Version 2.
- `hourglass-1024.png` → `packages/ui/src/assets/images/Waiting3D.webp`. The shared
  `BankTransferStatusIllustration` uses it for deposit and withdrawal tracking in
  both flow versions.

Run `python3 export_app_icons.py` after rendering to update these shared assets.
They export as transparent 512px WebP files. The render helper also accepts
`--saturation 1.04` for the saved Blender compositor grade. `app-assets.json` records the exact
paths, file hashes and consumers. The wallet and other status illustrations are
existing project artwork.

The text marks are true rounded capsule meshes with semicircular ends, not
beveled boxes. The lowered diagonal corner crease has a broader 130-degree
bend and a thinner 0.05-unit sheet edge.

There are three raised capsule text lines, shifted slightly lower on the page.
The two long lines are centered horizontally with equal page margins. The short
line shares their left edge and ends clear of the magnifier. The upper lines have live Bend
modifiers driven by the main page angle, with matching curvature rather than
matching per-object angles. This keeps the text on the curved sheet as the
bend region becomes broader.

## Native search shape

The document magnifier follows the existing **Search 3D** illustration in the
[Hydration Design Library](https://www.figma.com/design/wN5pnsm2FPVoCrxFNEAlYl/Design-Library?node-id=442-28153).
It uses a circular tube rim and a gently tapered round grip with a hemispherical
end. The final optical variant has a slightly thicker .105-unit rim tube and
.15-unit grip end. The grip has .74-unit visible length (17% longer) and
attaches 51 degrees down-right, placing it a little lower on the rim. Its true
biconvex spherical lens has .22-unit central thickness,
IOR 1.50, full transmission and 0.08 roughness. A dedicated copied pale-blue glass
material (`#D6E8FF`) and mild blue volume absorption (.20 density) give physical
refraction rather than an opaque lens fill. Only the magnifier moves slightly up
and left so the lower text end is magnified through the lens and the glass stays
over the document silhouette. The hourglass glass is unchanged.
The document, broad sheet bend, rounded text geometry, lighting, camera, shared
palette and saturation grade are unchanged.

`references/Design-Library-Search-3D.png` holds the source reference; it is also
packed off camera inside the Blender file. `refine_magnifier.py` reproducibly
replaces only the three magnifier meshes and is called by the clean builder.
Its `--handle-only` mode updates only the grip and preserves the ring, optical
lens and every other model/material datablock. The prior handle is backed up in
`revisions/before-longer-lower-handle/`.
The earlier geometry and review asset are preserved in
`revisions/before-library-search-shape/`. The first rounded search study with a
shallow smoky lens is preserved separately in
`revisions/rounded-search-smoky-lens/`.

To refine and render the document in a separate background process:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background status-icons.blend --threads 8 \
  --python-exit-code 1 --python refine_magnifier.py -- \
  --handle-only --save status-icons.blend --render document-1024.png \
  --resolution 1024 --samples 192
python3 export_app_icons.py
```

## Bank flow coverage

Both Current flow and Version 2 use the shared app exports above. The bank flow
uses the following existing artwork for the remaining centered states:

| State | Asset | Shared location |
| --- | --- | --- |
| Wallet sign-in, account type and wallet linking | Native `NoFunds.png` | `BankDeposit` and `BankDepositV2` |
| Provider introduction, handoff and review | Blender `Review3D.webp` | `BankProviderHandoff` |
| Awaiting transfer, pending and processing | Blender `Waiting3D.webp` | `BankTransferStatusIllustration` in all four tracking views |
| Provider approved or transfer completed | Native `SuccessStatus.webp` | Shared handoff and transfer illustration components |
| More information, returned transfer or deposit limit | Native `WarningStatus.webp` | Shared handoff and transfer illustration components |
| Rejected or unavailable provider rail | Native `ErrorStatus.webp` | `BankProviderHandoff` |

Preparing bank details is a short active operation and keeps the native spinner.
Bank account headings, choices and form fields keep their compact line icons.
There is no uncovered centered bank state requiring another 3D illustration.

## New UI icon catalog

The public grid is `apps/main/public/static/previews/status-icons-blender/comparison.htm`.
It lists only new artwork created during this work and imported by the current
app, with human-readable usage locations under each image. Existing project
illustrations are excluded. Unused studies remain in the source folders and
are not shown in the catalog. The catalog includes the latest Deposits sunbed.

After changing an app image export, regenerate the grid from the worktree root:

```sh
python3 design-assets/status-icons-blender/export_icon_catalog.py
```

The exporter checks that every listed new asset has a UI consumer. It copies the exact runtime files and records
their hashes and consumer paths in the adjacent `catalog.json`. USD and EUR
come from the shared UI SVG icons. Page filters cover empty states, status and currencies.
