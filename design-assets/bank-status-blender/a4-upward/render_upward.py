"""Selected A4 with an upward viewing angle; original geometry is preserved."""
import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

out = Path(__file__).resolve().parent
source = Path(bpy.data.filepath)
source_sha = hashlib.sha256(source.read_bytes()).hexdigest()
scene = bpy.context.scene
camera = scene.camera
bpy.context.view_layer.update()


def geometry_signature():
    data = [(o.name, [tuple(v.co) for v in o.data.vertices],
             [tuple(p.vertices) for p in o.data.polygons],
             [tuple(row) for row in o.matrix_world], [m.name for m in o.data.materials])
            for o in sorted(scene.objects, key=lambda o: o.name) if o.type == 'MESH']
    return hashlib.sha256(json.dumps(data).encode()).hexdigest()


before = geometry_signature()
previous = {'location': list(camera.location), 'quaternion': list(camera.rotation_quaternion)}
target = Vector((0, 0, 1.45))
# Keep A4's side and azimuth. Match the hourglass's low eye / upward pitch.
camera.location.z = .45
camera.rotation_mode = 'QUATERNION'
camera.rotation_quaternion = (target - camera.location).to_track_quat('-Z', 'Y') @ Quaternion((0, 0, 1), math.radians(5.5))
camera.data.ortho_scale = 4.15
scene.name = 'Bank A4 - Upward Tilt'
scene.render.resolution_x = scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.film_transparent = True
scene.render.filepath = str(out / 'bank-a4-upward-1024.png')
bpy.context.view_layer.update()
assert geometry_signature() == before
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'bank-a4-upward.blend'))
bpy.ops.render.render(write_still=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_sha
(out / 'manifest.json').write_text(json.dumps({
    'source': str(source), 'sourceSha256': source_sha, 'sourceUnchanged': True,
    'geometrySha256': before, 'geometryPreserved': True,
    'previousCamera': previous,
    'camera': {'location': list(camera.location), 'quaternion': list(camera.rotation_quaternion),
               'target': list(target), 'rollDegrees': 5.5, 'orthoScale': camera.data.ortho_scale},
    'changes': 'A4 azimuth and 5.5 degree roll preserved; eye lowered for upward pitch matching hourglass. Geometry, materials and studio unchanged.',
    'blend': 'bank-a4-upward.blend', 'render': 'bank-a4-upward-1024.png',
    'resolution': 1024, 'samples': 128
}, indent=2) + '\n')
print('BANK_A4_UPWARD_DONE', scene.render.filepath, flush=True)
