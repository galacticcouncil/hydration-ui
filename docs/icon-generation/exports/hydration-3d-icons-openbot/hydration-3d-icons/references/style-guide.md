# Visual language and color choices

## Reference hierarchy

The user's current reference and requested treatment come first. For family matching, use the current Blender UI exports as geometry/material/render anchors. The document clock is now the In review UI illustration; the inbox remains a saved construction study. The pearl is selected in Figma; the citrus press is ready for future use. Earlier brand illustrations establish a broader color vocabulary.

The gallery includes every current image file in the source illustration folder, plus saved studies, the selected pearl shell and the future-use citrus press. Context-only banners and promotional product art are labeled; their photographic texture, dense branding and composition should not become the default for a small isolated icon. The two fiat SVGs in the original UI catalog are 2D and are not 3D references.

## Brand world: water, leisure, chill and subtle retro

Treat the theme as part of concept selection, not just a palette. Hydration's flamingo, sunbed/parasol, pool and glasses suggest a playful aquatic setting and the feeling of relaxing by the water. Favor approachable, unhurried objects and compositions over aggressive, technical or corporate finance imagery.

For open-ended briefs, explore poolside and beach objects, floats, towels, swimming or sun accessories, and rounded vintage leisure objects such as a cassette player or portable radio when they communicate the page's purpose. Use subtle retro cues in chunky forms, simple stripes, rounded hardware or familiar older product silhouettes. Keep this character compatible with clean contemporary 3D rendering; vintage does not require sepia, faded colors, distressed textures, film grain, logos or elaborate nostalgic scenes.

Semantic clarity comes first: a bank, document, warning or hourglass can retain its recognizable meaning while sharing the family through relaxed proportions, tactile materials and a restrained retro detail. Do not attach water drops, sunglasses, palm trees or a pool to every subject. The user's chosen concept/reference takes precedence over these ideation directions.

## Shape

- One immediately recognizable subject, or one subject with a useful supporting object: sunbed/parasol, document/magnifier, hourglass, glasses.
- Rounded, substantial, carefully joined geometry. Generous bevels and hemisphere/capsule ends where appropriate. Broad, soft highlights describe the form.
- Stylized proportions with enough physical logic to avoid a melted or inflated-everywhere appearance. Frame, legs and supports should read as one coherent structure.
- Small details support recognition at 96px. Avoid tiny engraving, busy textures, thin fragile elements, crowded props or unnecessary interface labels.
- Keep an object's distinctive aspect ratio. The lounger was deliberately narrowed; that correction is not a universal width multiplier for new subjects.

## Surface and lighting

Current Blender solids have a fine satin finish with no clearcoat, rather than mirror polish or oily plastic. The saved native materials use subtle procedural bump; copy those nodes when matching a material. Do not amplify them into visible grit at icon size.

Use large soft sources, gentle contact shading and dimensional separation without a heavy black halo. Orthographic or low-distortion views work well. Match the object: the bank's lower camera and the glasses' three-quarter camera are both valid. There is no mandatory universal isometric angle.

The default output is isolated on transparency. Preview backgrounds are a viewing aid, not a required part of the icon. Existing status files with circular backplates are a separate contextual treatment, not a requirement for every new icon.

## Color variety is part of the system

Pick a subject-led dominant color. A single strong hue can carry the icon; not every subject needs cream highlights, blue structure and violet accents.

| Direction | Actual reference | Useful interpretation |
| --- | --- | --- |
| Whole pink | `Flamingo.webp` | Pink rubber/plastic with tonal shading; no blue or ivory needed |
| Blue satin | `TrackedWalletGlasses.webp`, `Review3D.webp` | Rich royal blue, with glass or an accent only where the object calls for it |
| Violet and lavender | `NoPositions.png`, `ProjectedAPR.webp`, lounger | Purple can dominate; keep it rich rather than washed out |
| Yellow | `Caution3D.webp`, `Warning3D.webp` | Yellow can be the main body; semantic dark marks remain legible |
| Green | `SuccessStatusPlain.webp` | A focused green object with sculpted depth |
| Coral/red | `ErrorStatusPlain.webp` | Warm, dimensional error object without adding blue |
| Mint/cyan | `StakedBalance.webp` | A light cool pairing with sufficient surface contrast |
| Mixed playful accents | `NoFunds.png`, `ReferendaEmptyState.webp` | Limited purposeful accents rather than a rainbow on every object |

Color numbers below are **material inputs or UI tokens**, not target output pixel values. Rendering, color management and light change their appearance. Do not recolor a reference merely to force every visible pixel to match a swatch.

### Verified current Blender material inputs

Read directly from the saved files on 2026-10-24 in isolated Blender processes. The full node inputs are in `blender-profiles.json`; later saved user edits take precedence over this snapshot.

| Material | sRGB base | Roughness | Specular IOR level | Coat |
| --- | --- | ---: | ---: | ---: |
| Native royal blue | `#4966D4` | .58 | .24 | 0 |
| Native orchid violet | `#D17FEA` | .58 | .22 | 0 |
| Pale ivory mint | `#DCDDBA` | .80 | .17 | 0 |
| Lounger upholstery violet | `#9A60EF` | .65 | .22 | 0 |
| Lounger canopy violet | `#8B43EB` | .58 | .22 | 0 |
| Lounger canopy lilac | `#B076EB` | .58 | .22 | 0 |
| Lounger warm ivory pole | `#F9E2C2` | .80 | .17 | 0 |
| Lounger towel | `#F5DEBB` | .85 | .17 | 0 |

The cushion's second stripe is `#F2DFCD` in its procedural color ramp, rather than the Principled base-color socket. Preserve the node network when copying it.

Glass is a special material. The saved tracked-wallet lens uses `#EAF3FF`, transmission 1, IOR 1.40 and roughness .26. The current saved document optical lens uses `#D6E8FF`, transmission 1, IOR 1.40 and roughness about .16636. Older construction notes give .08/IOR 1.5 for that lens; those notes are superseded by the saved source. The smoky hourglass glass is another material, not a general solid-surface recipe.

### Wider brand tokens

The source UI's `colors.basePalette` supplies coral pink `#E53E76`, HOLLAR green `#B3CF92`, aubergine `#240E32`, lavender `#DFB1F3`, beige `#F6F6EC` and sky blue `#B3D7FA`. These are useful starting color choices when a new subject needs them. They are not a compulsory collection of colors within each icon. In particular, UI sky blue is not a substitute for the saved royal-blue Blender material when matching the glasses.

There is no saved local flamingo Blender material. Use its bundled raster to match the pink appearance; do not claim that the UI coral-pink token is its measured material value.

## Typical mismatches to correct

Desaturated/pastel-washed upholstery; glossy or wet-looking solid parts; a blue-and-white palette imposed on an inherently pink subject; duplicated frames; a widened silhouette; disconnected supports; hard polygonal corners; excessive details that vanish at native size; opaque glass pasted over the background; and stretched square exports.
