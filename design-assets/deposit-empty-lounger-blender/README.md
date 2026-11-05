# Empty-deposit lounger

Current source: `status-icons-with-deposit-lounger.blend`, scene `05 - Empty Deposits - Poolside Lounger`.

Reference-matched builder: `build_lounger_reference.py`. The earlier `build_lounger.py` produces V2 and is retained for the revision history.

V6 has a single continuous cushion with procedural lavender/ivory stripes, rounded rectangular blue supports, a plush draped towel, and closed sculpted lilac canopy panels. The slim V5 geometry is preserved. The blue is now #4966D4, exactly matching the selected tracked-wallet glasses material. Upholstery uses a richer #9A60EF violet; parasol panels use #8B43EB and #B076EB. Exposure 0.35 and saturation 1.04 match the glasses grade. Materials copy the native icon palette's fine satin bump nodes and specular values, with no clearcoat: frame/canopy roughness 0.58, cushion 0.65, ivory pole 0.80, towel 0.85. All parts remain editable. The supplied close-up is packed into the Blender project. Its four earlier icon scenes are preserved, and the original studio input is unchanged.

`deposit-lounger-v6-1024.png` is the transparent 1024 × 932 render. `deposit-lounger-v6-navy-preview.png` places that same render on a flat navy background for comparison with the reference; it does not change the rendered geometry or lighting.

Rebuild from the worktree root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background design-assets/status-icons-blender/status-icons.blend --python design-assets/deposit-empty-lounger-blender/build_lounger_reference.py -- --resolution 1024 --samples 256
```

Older sources and renders are in `revisions/`. App export: `packages/ui/src/assets/images/DepositEmptyLounger.webp` is a transparent 512 × 512 WebP, padded to retain the render aspect ratio in the shared 96 px EmptyState image slot. It is used by the Portfolio deposits transfer-history empty state.
