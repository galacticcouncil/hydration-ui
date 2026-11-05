# Hydration account type icons

Selected beach/leisure concepts modeled as editable Blender geometry:

- Business: blue beach kiosk with a lilac/ivory scalloped awning.
- Individual: blue folding chair with a lilac/ivory fabric sling.

`account-type-icons.blend` preserves the five original scenes from the skill's `lounger-v6.blend` and adds independent scenes `06 - Business - Beach Kiosk` and `07 - Individual - Beach Chair`. Materials, lights, world and compositor were copied from that studio. Objects have descriptive names and editable bevel/solidify modifiers.

Final exports: transparent 1024px, 16-bit RGBA PNG masters, Cycles 256 samples with denoising; transparent 512px WebP UI exports. `review.png` shows both icons on dark and light surfaces and at 96px/48px.

To re-render the saved models with Blender 5.2:

```sh
blender -b account-type-icons.blend --python render_final.py
```

`build_account_icons.py` records geometry construction against the pristine skill studio. Use the saved `.blend` for subsequent edits and exports. Rendering does not wire the icons into the product or Figma.
