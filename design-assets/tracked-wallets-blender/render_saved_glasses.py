"""Render the saved glasses model without rebuilding geometry or saving its source."""
import hashlib
from pathlib import Path
import bpy

source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
scene = bpy.data.scenes['Tracked Wallets - Glasses']
bpy.context.window.scene = scene
scene.render.filepath = str(source.parent/(source.stem+'-1024.png'))
bpy.ops.render.render(write_still=True,scene=scene.name)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
print('RENDERED_SAVED_GLASSES',scene.render.filepath,flush=True)
