"""Editable bank status illustration. Read-only native status studio input.

Run Blender with status-icons.blend as the input, then this script. All writes
stay in this folder; no live Blender session or source studio is changed.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Quaternion, Vector

parser = argparse.ArgumentParser()
parser.add_argument('--output', default=str(Path(__file__).resolve().parent))
parser.add_argument('--resolution', type=int, default=1024)
parser.add_argument('--samples', type=int, default=128)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
output = Path(args.output).resolve()
output.mkdir(parents=True, exist_ok=True)
source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
reference = bpy.data.scenes['02 - Review Document']
scene = reference.copy()
scene.name = 'Bank Status - At Your Bank'
bpy.context.window.scene = scene
for collection in list(scene.collection.children):
    if collection.name != 'STUDIO - Shared Softboxes':
        scene.collection.children.unlink(collection)
scene.camera = None
scene.view_layers[0].name = 'Bank'
for old_scene in list(bpy.data.scenes):
    if old_scene != scene:
        bpy.data.scenes.remove(old_scene)

model = bpy.data.collections.new('ICON - Rounded Bank Temple')
scene.collection.children.link(model)
blue = bpy.data.materials['PALETTE - Native Royal Blue']
violet = bpy.data.materials['PALETTE - Native Orchid Violet']
ivory = bpy.data.materials['PALETTE - Pale Ivory Mint']


def move_to_model(obj, material):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    model.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def softened(obj, amount):
    bevel = obj.modifiers.new('Soft machined edges', 'BEVEL')
    bevel.width = amount
    bevel.segments = 6
    bevel.harden_normals = True
    obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def box(name, location, dimensions, material, rounding):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    move_to_model(obj, material)
    return softened(obj, rounding)


def column(name, x, z, radius, depth, material, rounding):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=radius, depth=depth, location=(x, 0, z))
    obj = bpy.context.object
    obj.name = name
    move_to_model(obj, material)
    return softened(obj, rounding)


# Three large masses and three stout columns remain legible at 96 CSS pixels.
# Simple classical temple silhouette deliberately avoids tiny financial symbols.
box('Plinth - Royal Blue Rounded Foundation', (0, 0, .31), (2.58, .94, .35), blue, .13)
box('Plinth - Subtle Orchid Inset', (0, .01, .48), (2.29, .77, .14), violet, .06)
box('Entablature - Rounded Royal Blue Lintel', (0, 0, 1.94), (2.40, .84, .26), blue, .10)
for label, x in [('Left', -.78), ('Middle', 0), ('Right', .78)]:
    column('Column - ' + label + ' Ivory Shaft', x, 1.22, .185, 1.38, ivory, .08)
    column('Column - ' + label + ' Royal Blue Foot', x, .61, .25, .17, blue, .065)
    column('Column - ' + label + ' Royal Blue Capital', x, 1.82, .25, .17, blue, .065)

# One solid triangular roof, softly rounded around its whole outline.
verts = [(-1.38, -.49, 2.02), (1.38, -.49, 2.02), (0, -.49, 2.83),
         (-1.38, .49, 2.02), (1.38, .49, 2.02), (0, .49, 2.83)]
faces = [(0, 1, 2), (3, 5, 4), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]
mesh = bpy.data.meshes.new('Roof - Single Softened Triangular Volume')
mesh.from_pydata(verts, [], faces)
mesh.update()
roof = bpy.data.objects.new('Roof - Royal Blue Pediment', mesh)
model.objects.link(roof)
roof.data.materials.append(blue)
softened(roof, .12)

# Native studio softboxes, materials and grade are inherited unchanged. A low,
# shallow three-quarter camera shares the status icons' slight upward angle.
camera_data = bpy.data.cameras.new('CAMERA - Bank Status')
camera = bpy.data.objects.new('CAMERA - Bank Status', camera_data)
scene.collection.objects.link(camera)
camera.location = (-3.0, -8.4, 1.15)
target = Vector((0, 0, 1.48))
camera.rotation_mode = 'QUATERNION'
camera.rotation_quaternion = (target - camera.location).to_track_quat('-Z', 'Y') @ Quaternion((0, 0, 1), math.radians(5.5))
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 3.48
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = args.resolution
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '16'
scene.render.filepath = str(output / 'bank-status-1024.png')
scene.compositing_node_group = scene.compositing_node_group.copy()
scene.compositing_node_group.name = 'OUTPUT - Bank Status Native Grade'
for node in scene.compositing_node_group.nodes:
    if node.type == 'R_LAYERS':
        node.scene = scene
        node.layer = 'Bank'

for obj in list(bpy.data.objects):
    if obj.name not in scene.objects:
        bpy.data.objects.remove(obj, do_unlink=True)
for collection in list(bpy.data.collections):
    if collection.users == 0:
        bpy.data.collections.remove(collection)
readme = bpy.data.texts.new('START HERE - Bank Status')
readme.write('Bank transfer final-status illustration. All model pieces are editable.\n'
             'Simple solid triangular pediment, three cylindrical ivory columns, rounded plinth.\n'
             'Native royal blue / orchid / pale ivory palette, softboxes and grade inherited read-only.\n'
             'Transparent RGBA render. Runtime export: packages/ui/src/assets/images/Bank3D.webp.\n')
scene['Source studio SHA256'] = source_hash
scene['Usage'] = 'Bank withdrawal tracking state: At your bank; 96 CSS px; 512 px transparent export.'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(output / 'bank-status.blend'))
bpy.ops.render.render(write_still=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
(output / 'manifest.json').write_text(json.dumps({
    'sourceStudio': 'design-assets/status-icons-blender/status-icons.blend',
    'sourceStudioSha256': source_hash,
    'sourceUnchanged': True,
    'blend': 'bank-status.blend',
    'render': 'bank-status-1024.png',
    'scene': scene.name,
    'palette': [blue.name, violet.name, ivory.name],
    'resolution': args.resolution,
    'samples': args.samples,
    'usage': 'Bank withdrawal tracking: At your bank',
    'appExport': 'packages/ui/src/assets/images/Bank3D.webp',
}, indent=2) + '\n')
print('BANK_STATUS_RENDERED', scene.render.filepath, flush=True)
