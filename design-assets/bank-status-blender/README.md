# Bank withdrawal status icon

The current UI icon is the selected **A4 upward colonnade**, turned another **6 degrees to the right**. It has four freestanding ivory columns at the front and four at the back, an open interior, royal-blue roof and foundation, and an orchid accent.

- Current editable source: `bank-status.blend`, scene **Bank Status - At Your Bank**.
- Current render: `bank-status-1024.png`, transparent RGBA, Cycles CPU, 128 samples. Rendered after reopening the saved source.
- Runtime: `packages/ui/src/assets/images/Bank3D.webp`, 512px transparent WebP. All shared bank-status illustrations use this export.
- Gallery: `apps/main/public/static/previews/status-icons-blender/bank.webp` and `bank-1024.png` match the selected export/render.
- Previous source, render, export and manifest: `revisions/before-selected-a4/`.
- All earlier studies remain in `depth-options/`, `colonnade-options/`, `hourglass-angle-options/` and `a4-upward/`.
- `manifest.json` records source, geometry preservation, camera, render and runtime hashes.

To render manual edits, open the current saved source in background Blender and render its active scene, then run `python3 design-assets/bank-status-blender/export_app_icon.py`.

`selected-a4/finalize_selected.py` reproduces this selection from the preserved `a4-upward/bank-a4-upward.blend`. The older `build_bank.py` builds the original facade study and must not be run over the selected source when preserving its edits.
