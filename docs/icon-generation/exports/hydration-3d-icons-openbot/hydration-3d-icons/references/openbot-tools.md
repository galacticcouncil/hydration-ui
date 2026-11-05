# OpenBot capability routing

This skill supplies style knowledge and reference assets. It does not install or configure image generation, Blender, or Figma connections.

- For ideation, discover a connected image-generation tool with reference-image input. Prefer Imagen when available; another reference-aware generator can be used when appropriate. Load that tool's own guidance. Show five numbered ideas and wait for selection as specified in SKILL.md. If no image tool is connected, state the missing capability and prepare the five concept briefs; do not substitute text for a claimed rendered sheet.
- For editable production, use an available Blender connector or local Blender CLI in an isolated process. Resolve the executable at runtime; no fixed OS path is assumed. Use the companion sources and preserve the active interactive project. If unavailable, explain what is needed rather than presenting an AI image as a Blender render.
- Use image/file tools to inspect references and completed renders. For image resizing, alpha checks and WebP export, use an available local image utility or Pillow. Preserve proportions.
- Add art to an app, Figma or an icon catalog only when the user requests integration. Reuse its existing components/variables where relevant.

Do not assume Codex-specific tools, `nodeRepl`, a particular MCP namespace, or another installed skill. The included prompts and measured profiles remain usable with different image and Blender tools.
