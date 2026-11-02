# Hydration status icons

Open **status-icons.blend**. It contains both editable icons, all procedural
materials, shared studio lights/world, cameras, compositors and packed native
artwork references. It requires no linked Blender library or external image.

Use Blender's Scene menu to switch between **01 - Hourglass** and
**02 - Review Document**. Each scene has its own named model collection, view
layer and camera. Both scenes link the same **STUDIO - Shared Softboxes**
collection and **PALETTE** material datablocks, so palette edits update both.

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

Render the active scene with F12, or render both saved scenes without rebuilding:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background status-icons.blend --threads 8 \
  --python render_icons.py -- --resolution 1024 --samples 192
```

The render helper saves output paths and render settings back into this file.
Pass `--icon hourglass` or `--icon document` to render one. PNGs are transparent
RGBA at 1024px; browser previews use optimized 512px WebP copies.

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
It uses a slim circular tube rim, a gently tapered round grip with a hemispherical
end, and a shallower inset lens. A dedicated smoky navy material (`#122643`,
30% transmission, 0.20 roughness) keeps the lens softly translucent without a
hard paper-edge refraction split; the hourglass glass is unchanged.
The document, broad sheet bend, rounded text,
lighting, camera, shared palette and saturation grade are unchanged.

`references/Design-Library-Search-3D.png` holds the source reference; it is also
packed off camera inside the Blender file. `refine_magnifier.py` reproducibly
replaces only the three magnifier meshes and is called by the clean builder.
The earlier geometry and review asset are preserved in
`revisions/before-library-search-shape/`.

To refine and render the document in a separate background process:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background status-icons.blend --threads 8 \
  --python-exit-code 1 --python refine_magnifier.py -- \
  --save status-icons.blend --render document-1024.png \
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
