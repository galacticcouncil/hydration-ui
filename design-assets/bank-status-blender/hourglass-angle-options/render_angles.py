"""Camera-only studies from the selected A colonnade; no geometry rebuild."""
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
reference = json.loads((out / 'hourglass-camera-reference.json').read_text())


def geometry_signature():
    payload = [(o.name, [tuple(v.co) for v in o.data.vertices],
                [tuple(p.vertices) for p in o.data.polygons],
                [tuple(row) for row in o.matrix_world],
                [m.name for m in o.data.materials])
               for o in sorted(scene.objects, key=lambda o: o.name) if o.type == 'MESH']
    return hashlib.sha256(json.dumps(payload).encode()).hexdigest()


original_geometry = geometry_signature()
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.film_transparent = True
camera.rotation_mode = 'QUATERNION'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.15
bpy.context.preferences.filepaths.save_version = 0
options = [
    ('A1-hourglass-left', (-3.6, -8.0, .45), 5.5, True),
    ('A2-hourglass-right', (3.6, -8.0, .45), -5.5, False),
    ('A3-soft-left', (-4.8, -8.0, 1.65), 5.5, False),
    ('A4-soft-right', (3.8, -8.0, 2.65), 5.5, False),
]
manifest = {'source': str(source), 'sourceSha256': source_sha,
            'geometrySha256': original_geometry, 'hourglassCameraReference': reference,
            'changes': 'Camera position, roll, framing and output quality only. Selected A geometry, palette and studio preserved.',
            'options': []}
for label, position, roll, exact in options:
    scene.name = label
    camera.location = position
    camera.rotation_quaternion = Quaternion(reference['cameraQuaternion']) if exact else (
        (Vector((0, 0, 1.45)) - camera.location).to_track_quat('-Z', 'Y')
        @ Quaternion((0, 0, 1), math.radians(roll)))
    bpy.context.view_layer.update()
    assert geometry_signature() == original_geometry, 'Selected A model changed'
    scene.render.filepath = str(out / (label + '.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(out / (label + '.blend')))
    bpy.ops.render.render(write_still=True)
    manifest['options'].append({'label': label, 'cameraLocation': list(camera.location),
                                'cameraQuaternion': list(camera.rotation_quaternion),
                                'rollDegrees': roll, 'geometryPreserved': True,
                                'render': label + '.png', 'blend': label + '.blend'})
    print('BANK_ANGLE_DONE', label, flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_sha
manifest['sourceUnchanged'] = True
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
