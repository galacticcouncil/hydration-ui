# Raster concepts and art direction

Use this for image generation, not as a claim that a `.blend` has been created. Use an available image generator that accepts reference images, following its tool guidance; Imagen is suitable when connected. Supply the actual closest bundled reference images, not only a textual style description. Start with the style anchors plus the subject's nearest material/color reference.

## First-round concept sheet

For each new icon, generate five visually distinct ideas and present a numbered comparison sheet before final artwork or Blender production. Use a single sheet generation or assemble five concept previews into a sheet, depending on the available image workflow. Keep consistent icon size, camera treatment and neutral viewing conditions so the concepts are easy to compare. Label them 1–5 with short names outside the art; comparison labels and backgrounds never belong in runtime exports.

> Explore five different Hydration 3D icon concepts for [PAGE / STATE / PURPOSE]. Match the attached samples' rounded forms, tactile matte/satin materials, rich subject-led colors and soft lighting. Draw on water, leisure and a relaxed poolside mood with subtle vintage/retro character where it supports the meaning. Vary the actual object metaphor or composition, not only its color. Keep each concept simple and readable at 96 pixels, with generous separation and edge clearance. Present five options at a consistent scale on one comparison sheet, numbered 1–5 with short names outside each artwork. Avoid defaulting every idea to blue and white. These are exploratory concepts rather than finished production assets.

Show the sheet, ask which number to develop, and wait for the user's explicit selection. Suggesting a favorite does not authorize proceeding. After selection, use the base prompt below for the chosen icon, or recreate it in Blender when that is the requested output. Follow the entrypoint's exceptions for an already selected concept or a focused refinement.

## Base prompt

> Create a Hydration UI 3D icon of [SUBJECT / SIMPLE METAPHOR], matching the attached reference family in rounded silhouette, tactile matte/satin finish, soft studio highlights and controlled detail. Preserve the selected concept's relaxed aquatic/leisure mood and subtle retro cues where appropriate to the subject. [DESCRIBE THE PARTICULAR SHAPE AND DISTINCTIVE PROPORTIONS.] Use [SUBJECT-APPROPRIATE DOMINANT COLOR AND OPTIONAL ACCENT]; preserve rich color without washing it into pale blue or white. [MATERIAL-SPECIFIC DIRECTION.] A clear three-quarter or low-distortion view, one focused isolated composition, readable at 96 pixels. Transparent background, generous edge clearance, no backdrop, text labels, watermark or decorative UI. Keep form coherent and avoid duplicate overlapping structural parts. Color consistency comes from the family, not from including blue in every icon.

Replace the color and material instructions for each subject. Do not include all palette examples in a single prompt. Avoid long contradictory negative-prompt lists.

## Examples of valid variation

- **Pink leisure object:** an inflatable life ring, mostly coral pink with tonal pink shading, smooth rubber-like volume and a subdued satin highlight. Use `Flamingo.webp`; blue/ivory components are unnecessary.
- **Yellow semantic object:** a small caution cone or folding sign, yellow body with a single legible dark mark, rounded substantial edges, restrained surface texture. Use `Caution3D.webp` and `Warning3D.webp`.
- **Violet leisure object:** a compact pool ladder or float, saturated violet/lilac as the dominant family, soft rounded construction and only a useful contrasting accent. Use the lounger, `NoPositions.png` and `ProjectedAPR.webp`.
- **Green/mint value object:** two or three substantial stacked shapes, green or mint dominant with gentle shading; preserve a clear layered silhouette at small size. Use `SuccessStatusPlain.webp` and `StakedBalance.webp`.
- **Blue optical object:** rich royal-blue satin frame with physically plausible lightly frosted/translucent glass only in its lenses. Use `TrackedWalletGlasses.webp`; do not turn the frame into polished chrome or bake a solid navy lens fill.

For variant requests, vary the object metaphor or composition purposefully; do not deliver the same object with arbitrary hue swaps unless recoloring is what the user requested. Number options outside the final icon image, or on a separate comparison sheet.
