# Reference matching record

The selected targets are Business kiosk 1 and Individual chair 5 in `references/selected-concepts.png`. `references/modeling-turnaround.png` is an image-generated construction study from that exact sheet. Its hidden geometry is inferred; the original selected view remains authoritative.

## Iterations

1. Rebuilt the kiosk with an open window, framed cabinet and pitched canopy. Rebuilt the chair with three folding members, two ground bars and wrapped fabric. Comparison exposed sharp roof seams, incorrect flat-rail orientation and detached-looking fabric joins.
2. Corrected rail orientation and thickness, attached the sling around its top bar, adjusted the kiosk camera, reduced cabinet recess depth, and enriched the violet. Comparison exposed bad normals on the gable and mismatched proportions.
3. Fixed gable normals, matched the seven front canopy stripes, thickened the flat chair rails and removed a duplicate fabric join. Comparison still showed roof-panel gaps and an overextended rear chair leg.
4. Replaced separated canopy surfaces with one manifold roof, shortened the rear chair leg, moved the front foot, and adjusted the folding intersections. Color tuning overshot toward cyan; the striped sling still looked segmented.
5. Restored a more violet royal blue, reduced roof height, lengthened the scalloped valance, and unified all stripes into one continuous cloth surface. Compare `comparisons/comparison-final.png` to the original concept. Additional real Blender front, side and rear renders are retained for construction inspection.

6. Replaced rounded beam primitives with genuine extruded capsule rails, retaining broad flat faces. Inspected the saved models from front, side and rear.
7. Matched the lower camera elevation indicated by the original roof and crossbar slopes; narrowed the kiosk to match the reference silhouette. Embedded pivot caps into their rails. Final high-quality rendering followed the same comparison.

The native editable model interprets generated artwork; this is not a pixel-identical reconstruction. Camera, proportions, negative spaces, color blocks and attachment points were directly compared. Earlier v1 deliverables remain in the parent directory for reversibility.

## Artifacts

- `account-icons-v2.blend`: five preserved source scenes plus independent kiosk/chair scenes.
- `kiosk-final.png`, `chair-final.png`: transparent 1024px, 16-bit PNG masters.
- `kiosk.webp`, `chair.webp`: transparent 512px UI exports.
- `comparisons/`: original concept beside each rendered pass.
- `construction-views.png`: actual saved-model front/side/rear inspection.
- `build.py`: editable-geometry construction against the skill's pristine lounger studio.
- `render_final.py`: repeatable final export from the saved model.

No UI or Figma assets were replaced.

## Reference generation prompt

Using the original selected concept sheet as an image reference, produce four consistent views (original three-quarter, front, side, rear) of only Business kiosk 1 and Individual chair 5. Preserve proportions, striped lavender/ivory fabric, royal-blue satin construction, open serving window, framed cabinet, flat folding rails, pivots, ground bars and wrapped sling. No new concepts, props or decor. Unseen construction is a conservative interpretation. Generated through the built-in image-generation tool; all final icon geometry and renders are native Blender.
