"""Render the canonical inbox scene read-only in an isolated Blender process."""
import hashlib
import json
from pathlib import Path
import bpy

source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
scene = bpy.data.scenes["03 - Review Inbox"]
bpy.context.window.scene = scene
scene.render.resolution_x = scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.cycles.samples = 128
scene.render.filepath = str(Path(__file__).resolve().parent / "review-inbox-1024.png")
bpy.ops.render.render(write_still=True, scene=scene.name)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
record = {"source": str(source), "sourceSha256": source_hash,
          "scene": scene.name, "sourceUnchanged": True,
          "render": scene.render.filepath, "resolution": [1024, 1024],
          "samples": 128, "engine": scene.render.engine,
          "renderSha256": hashlib.sha256(Path(scene.render.filepath).read_bytes()).hexdigest()}
(Path(__file__).resolve().parent / "canonical-render.json").write_text(json.dumps(record, indent=2) + "\n")
print("CANONICAL_INBOX_RENDERED", json.dumps(record), flush=True)
