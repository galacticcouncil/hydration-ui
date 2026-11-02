# Shading follow-up

Source: the saved `../v2/account-icons-v2.blend`, not the geometry builder.

Audit found flat shading on six chair rails and nineteen kiosk parts. Their bevels therefore did not have consistent smooth shading. The sling's open surface also had its front/back normals reversed relative to the intended outer fabric face.

1. Rendered a normals-only pass: smooth faces with angle-based sharp edges, hardened bevel normals and weighted normals. Increased bevel segment count to avoid bands on curved ends.
2. Corrected the cloth face direction and Solidify offset together so the fabric remains on the same side of its support bars. The first diagnostic changed the direction alone and exposed overlap bands; this was corrected before final export.
3. Refined blue-frame edge radii from 0.022 to 0.042 for smoother highlight transitions, with eight bevel segments. Adjusted blue satin roughness 0.44 to 0.34 and specular IOR level 0.30 to 0.40. Canvas roughness is 0.64, sheen 0.12 and specular 0.28. No clearcoat or metallic coating was added.
4. Compared original concepts, previous render, normals pass and material pass; exported final 1024px RGBA PNGs with Cycles 256 samples and transparent 512px WebPs.

Camera, lighting, color values, grade and object placement remain unchanged. Flat manufactured faces remain flat; the corrections target their transitions and material response. This does not claim a pixel-identical match to the generated reference.

The source V2 file and original renders remain untouched. `account-icons-shading.blend` contains the editable revised version and all preserved source scenes. No UI/Figma integration or Git push was performed.
