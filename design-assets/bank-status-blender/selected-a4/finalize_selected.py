"""Promote the selected A4 upward colonnade with a small rightward turn."""
import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

root = Path(__file__).resolve().parent.parent
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
turn = math.radians(6)
x, y, z = camera.location
camera.location = (x * math.cos(turn) - y * math.sin(turn),
                   x * math.sin(turn) + y * math.cos(turn), z)
target = Vector((0, 0, 1.45))
camera.rotation_mode = 'QUATERNION'
camera.rotation_quaternion = (target - camera.location).to_track_quat('-Z', 'Y') @ Quaternion((0, 0, 1), math.radians(5.5))
scene.name = 'Bank Status - At Your Bank'
scene.render.resolution_x = scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.film_transparent = True
scene.render.filepath = str(root / 'bank-status-1024.png')
scene['Selected option'] = 'A4 upward tilt; six degrees farther to the right'
bpy.context.view_layer.update()
assert geometry_signature() == before
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(root / 'bank-status.blend'))
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_sha
(root / 'manifest.json').write_text(json.dumps({
    'sourceBlend': 'a4-upward/bank-a4-upward.blend', 'sourceBlendSha256': source_sha,
    'sourceUnchanged': True, 'selectedOption': 'A4 upward, turned 6 degrees right',
    'previousVersion': 'revisions/before-selected-a4',
    'geometrySha256': before, 'geometryPreserved': True,
    'previousCamera': previous,
    'camera': {'location': list(camera.location), 'quaternion': list(camera.rotation_quaternion),
               'target': list(target), 'rollDegrees': 5.5, 'rightwardTurnDegrees': 6,
               'orthoScale': camera.data.ortho_scale},
    'blend': 'bank-status.blend', 'render': 'bank-status-1024.png', 'scene': scene.name,
    'resolution': 1024, 'samples': 128,
    'palette': ['PALETTE - Native Royal Blue', 'PALETTE - Native Orchid Violet', 'PALETTE - Pale Ivory Mint'],
    'usage': 'Bank withdrawal tracking: At your bank',
    'appExport': 'packages/ui/src/assets/images/Bank3D.webp'
}, indent=2) + '\n')
print('SELECTED_BANK_SOURCE_SAVED', flush=True)
