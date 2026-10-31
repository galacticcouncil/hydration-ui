"""Non-destructive open-colonnade exploration; run against bank-status.blend."""
import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent
source = Path(bpy.data.filepath)
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
scene = bpy.context.scene
blue = bpy.data.materials['PALETTE - Native Royal Blue']
ivory = bpy.data.materials['PALETTE - Pale Ivory Mint']
violet = bpy.data.materials['PALETTE - Native Orchid Violet']
for obj in list(scene.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)


def finish(obj, name, material, bevel=.045):
    obj.name = name
    obj.data.materials.append(material)
    mod = obj.modifiers.new('Rounded architectural edges', 'BEVEL')
    mod.width, mod.segments = bevel, 4
    obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def box(name, pos, size, material=blue, bevel=.045):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, material, bevel)


def cylinder(name, pos, radius, depth, material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=pos)
    return finish(bpy.context.object, name, material, .045)


def roof(front, back):
    verts = [(-1.42, front, 2.25), (1.42, front, 2.25), (0, front, 3.02),
             (-1.42, back, 2.25), (1.42, back, 2.25), (0, back, 3.02)]
    mesh = bpy.data.meshes.new('Full-length pitched roof geometry')
    mesh.from_pydata(verts, [], [(0, 2, 1), (3, 4, 5), (0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)])
    mesh.update()
    obj = bpy.data.objects.new('Full pitched roof - solid building depth', mesh)
    scene.collection.objects.link(obj)
    finish(obj, obj.name, blue, .075)


def build(with_side_columns):
    for obj in list(scene.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    box('Rounded blue foundation', (0, 0, .16), (2.85, 2.45, .27), bevel=.1)
    box('Orchid platform reveal', (0, 0, .33), (2.62, 2.22, .11), violet, .04)
    box('Royal blue open interior floor', (0, 0, .41), (2.47, 2.07, .10), blue, .04)
    positions = [(x, y) for y in (-.80, .80) for x in (-1.0, -.34, .34, 1.0)]
    if with_side_columns:
        positions += [(-1.0, 0), (1.0, 0)]
    for index, (x, y) in enumerate(positions):
        side = 'Front' if y < 0 else ('Rear' if y > 0 else 'Side')
        cylinder(f'{side} ivory shaft {index}', (x, y, 1.29), .155, 1.67, ivory)
        cylinder(f'{side} royal blue foot {index}', (x, y, .52), .215, .15, blue)
        cylinder(f'{side} royal blue capital {index}', (x, y, 2.06), .215, .15, blue)
    box('Roof cornice above open columns', (0, 0, 2.19), (2.70, 2.12, .24), blue, .07)
    roof(-1.12, 1.12)
    box('Lower front step', (0, -1.35, .11), (1.55, .45, .18), blue, .06)
    box('Upper front step', (0, -1.18, .23), (1.43, .36, .16), blue, .055)


scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
bpy.context.preferences.filepaths.save_version = 0
camera = scene.camera
camera.rotation_mode = 'QUATERNION'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.25
manifest = []
for label, deep, camera_pos in [
    ('A-front-back-right', False, (5.0, -8.6, 3.9)),
    ('B-front-back-left', False, (-6.4, -8.5, 4.5)),
    ('C-perimeter-right', True, (5.0, -8.6, 3.9)),
    ('D-perimeter-left', True, (-6.4, -8.5, 4.5)),
]:
    build(deep)
    scene.name = label
    camera.location = camera_pos
    camera.rotation_quaternion = (Vector((0, .05, 1.45)) - camera.location).to_track_quat('-Z', 'Y')
    scene.render.filepath = str(out / (label + '.png'))
    scene['Exploration'] = 'Open colonnade only: front and rear columns, optional side columns, roof and plinth. No walls, windows or doors. Preview only.'
    bpy.ops.wm.save_as_mainfile(filepath=str(out / (label + '.blend')))
    bpy.ops.render.render(write_still=True)
    manifest.append({'option': label, 'blend': label + '.blend', 'render': label + '.png'})
    print('BANK_OPTION_DONE', label, flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
(out / 'manifest.json').write_text(json.dumps({'source': str(source), 'sourceSha256': source_hash, 'sourceUnchanged': True, 'options': manifest}, indent=2) + '\n')
