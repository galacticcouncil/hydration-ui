# Tracked-wallet glasses

The selected app artwork is **angle D with translucent frosted glass**.
Its editable source is `angles-blue/d-frosted/adaptive/d-adaptive.blend`.
The scene is named **Tracked Wallets - Glasses**, with camera
**CAMERA D - Three-quarter right** active.

All frames and arms use the native royal-blue satin material. The temples have
straight main spans, short bent ends and hemispherical tips. Physical biconvex
lenses use IOR 1.40, 0.26 roughness and transparent glass transmission in the
alpha pass. The same RGBA image adapts to the app's dark and light surfaces.
All model parts remain editable curves or meshes; reference images are packed.

The palette, softbox rig, world and 1.04 saturation grade originate in
`../status-icons-blender/status-icons.blend`. That user-edited source was read
without saving or changing it. The glasses live in a separate Blender project.

From this directory, render the selected saved file after manual changes:

```sh
/Applications/Blender.app/Contents/MacOS/Blender \
  --background angles-blue/d-frosted/adaptive/d-adaptive.blend --threads 8 \
  --python-exit-code 1 --python render_saved_glasses.py
python3 export_app_icon.py
```

`d-adaptive-1024.png` exports to the shared transparent 512px WebP:
`packages/ui/src/assets/images/TrackedWalletGlasses.webp`.
The shared `TrackedWallets` component uses it on overview and the tracked-wallets
page in its existing 6rem artwork box. Portfolio and bank wallet illustrations
are unchanged. `manifest.json` records the selected source, hashes and consumer.

## Earlier studies

`tracked-glasses.blend` is the original violet-frame study. Its initial builder
is `build_glasses.py`; use saved-file rendering to preserve later manual edits.

`angles-blue/blue-glasses-angles.blend` stores the four blue-frame angle choices.
Cameras A–D provide front, three-quarter left, above and three-quarter right views.
`render_blue_angles.py` recreates that study from the initial glasses file.
`export_angle_preview.py` packages its comparison page. These studies and the
more opaque `angles-blue/d-frosted/d-frosted.blend` remain available for reference.
The app exporter uses the selected translucent D render explicitly.
