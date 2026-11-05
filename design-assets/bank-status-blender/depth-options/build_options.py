"""Non-destructive bank-building exploration; run against bank-status.blend."""
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
glass = blue.copy()
glass.name = 'OPTION - Blue recessed glazing'
bsdf = glass.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (.012, .038, .15, 1)
bsdf.inputs['Roughness'].default_value = .23
bsdf.inputs['Metallic'].default_value = .18
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


def build(deep):
    for obj in list(scene.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
    front = -1.18 if deep else -.85
    back = 1.35
    box('Broad bottom foundation', (0, .1, .16), (2.85, 2.95, .27), bevel=.1)
    box('Ivory upper platform', (0, .14, .33), (2.59, 2.65, .13), ivory)
    box('Orchid foundation reveal', (0, .16, .40), (2.47, 2.53, .08), violet, .025)
    box('Solid main building - visible side and rear walls', (0, .62, 1.28), (2.25, 1.42, 1.78), blue, .09)
    box('Recessed doorway ivory surround', (0, -.105, 1.04), (.79, .08, 1.29), ivory, .07)
    box('Dark blue glass double doors', (0, -.155, 1.03), (.63, .05, 1.12), glass, .045)
    box('Door central mullion', (0, -.19, 1.03), (.035, .035, 1.07), blue, .01)
    for side in (-1, 1):
        for i, y in enumerate((.28, .92)):
            box(f'Side {side} window {i} ivory reveal', (side * 1.135, y, 1.35), (.05, .43, .76), ivory, .035)
            box(f'Side {side} window {i} inset blue glass', (side * 1.166, y, 1.35), (.025, .31, .61), glass, .025)
    xs = (-1.0, -.36, .36, 1.0) if deep else (-.98, .98)
    for index, x in enumerate(xs):
        cylinder(f'Freestanding ivory column {index}', (x, front + .17, 1.29), .14 if deep else .18, 1.67, ivory)
        cylinder(f'Column {index} blue foot', (x, front + .17, .52), .19 if deep else .23, .15, blue)
        cylinder(f'Column {index} blue capital', (x, front + .17, 2.06), .20 if deep else .23, .15, blue)
    box('Full depth cornice and portico ceiling', (0, (front + back) / 2, 2.19), (2.70, back - front + .18, .24), blue, .07)
    roof(front - .14, back + .12)
    # Separate treads reinforce the building volume without tiny ornament.
    box('Front lower entrance step', (0, -1.43, .11), (1.45, .45, .18), blue, .06)
    box('Front upper entrance step', (0, -1.26, .23), (1.36, .36, .16), blue, .055)


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
camera.data.ortho_scale = 4.65
manifest = []
for label, deep, camera_pos in [
    ('A-compact-front-right', False, (5.5, -8.8, 4.7)),
    ('B-compact-high-left', False, (-6.8, -8.6, 6.4)),
    ('C-deep-portico-front-right', True, (5.8, -8.8, 4.5)),
    ('D-deep-portico-high-left', True, (-7.0, -8.8, 6.0)),
]:
    build(deep)
    scene.name = label
    camera.location = camera_pos
    camera.rotation_quaternion = (Vector((0, .05, 1.45)) - camera.location).to_track_quat('-Z', 'Y')
    scene.render.filepath = str(out / (label + '.png'))
    scene['Exploration'] = 'Full building with side walls, glazing, entrance and freestanding portico. Preview only.'
    bpy.ops.wm.save_as_mainfile(filepath=str(out / (label + '.blend')))
    bpy.ops.render.render(write_still=True)
    manifest.append({'option': label, 'blend': label + '.blend', 'render': label + '.png'})
    print('BANK_OPTION_DONE', label, flush=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
(out / 'manifest.json').write_text(json.dumps({'source': str(source), 'sourceSha256': source_hash, 'sourceUnchanged': True, 'options': manifest}, indent=2) + '\n')
