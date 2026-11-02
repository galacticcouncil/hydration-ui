# Editable source companion

The download contains two sibling folders. Register only `hydration-3d-icons` as an OpenBot skill. Keep `hydration-3d-icon-sources` in the agent's workspace or a user-approved shared asset directory; it exceeds the local-skill size budget and is not registered as part of the skill.

For Blender production, locate that companion within the current workspace or the configured OpenBot Shared directory. Record its actual path for the task. Do not assume it is beside the installed skill: registration copies the skill into OpenBot's library. If it is missing, ask for the extracted companion location. Ideation can continue using the bundled images; do not claim editable source is available until found.

`sample-manifest.json` uses `file` for images inside this skill and `sourceFile` for files relative to the companion. `blenderProjectId` joins a sample to `blenderProjects`. Original repository paths are provenance only, not required file locations. `source-manifest.json` in the companion records all source checksums.

Copy a saved project to the task output before editing. Never mutate the companion master. Six Blender projects cover status/document/clock, slim lounger, royal-blue glasses, bank, selected pearl shell and silver citrus press. Exact scene names are in the sample manifest. The four original measured lighting/material profiles are retained; pearl and citrus need direct scene inspection.
