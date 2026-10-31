"""Add the second inbox line and a clock variant of the exact saved curved page.

Run on the frozen pre-edit source. Never reconstruct the user's existing paper.
The staged output is reopened and checked before it can replace the canonical.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

import bpy
import bmesh
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from icon_preservation import preservation_state, digest, differences

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--resolution', type=int, default=512)
parser.add_argument('--samples', type=int, default=64)
parser.add_argument('--no-render', action='store_true')
parser.add_argument('--only-clock', action='store_true')
parser.add_argument('--expected-output-sha256')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
output = Path(args.output).resolve()
assert set(bpy.data.scenes.keys()) == {'01 - Hourglass', '02 - Review Document', '03 - Review Inbox'}

# Protect every pre-existing object/material and both untouched icon scenes.
prior_scenes = ['01 - Hourglass', '02 - Review Document']
prior_objects = sorted(obj.name for obj in bpy.data.objects)
prior_materials = sorted(mat.name for mat in bpy.data.materials)
before = preservation_state(prior_scenes, prior_objects, prior_materials)

inbox = bpy.data.scenes['03 - Review Inbox']
first_line = bpy.data.objects['Document - Single royal-blue pill line']
second_line = first_line.copy()
second_line.data = first_line.data.copy()
second_line.name = 'Document - Second royal-blue pill line'
second_line.data.name = 'Document - Second full capsule geometry'
second_line.location.z -= .43
bpy.data.collections['ICON - Review Inbox'].objects.link(second_line)
inbox['Text lines'] = 2

original = bpy.data.scenes['02 - Review Document']
scene = original.copy()
scene.name = '04 - Review Document Clock'
bpy.context.window.scene = scene
for collection in list(scene.collection.children):
    if collection.name != 'STUDIO - Shared Softboxes':
        scene.collection.children.unlink(collection)
for obj in list(scene.collection.objects):
    scene.collection.objects.unlink(obj)
scene.view_layers[0].name = 'Document Clock'
model = bpy.data.collections.new('ICON - Review Document Clock')
scene.collection.children.link(model)

# Copy original unmodified mesh + live bend/solidify/bevel stack, text, drivers
# and controls into an independent collection. Repoint only copied references.
source_model = bpy.data.collections['ICON - Review Document']
mapping = {}
for obj in source_model.all_objects:
    if obj.name.startswith('Magnifier -'):
        continue
    copied = obj.copy()
    if obj.data is not None:
        copied.data = obj.data.copy()
        copied.data.name = 'Clock Variant - ' + obj.data.name
    copied.name = 'Clock Variant - ' + obj.name
    model.objects.link(copied)
    mapping[obj] = copied
for old, copied in mapping.items():
    if old.parent in mapping:
        copied.parent = mapping[old.parent]
    for modifier in copied.modifiers:
        for prop in modifier.bl_rna.properties:
            if prop.type == 'POINTER' and not prop.is_readonly:
                value = getattr(modifier, prop.identifier)
                if isinstance(value, bpy.types.Object) and value in mapping:
                    setattr(modifier, prop.identifier, mapping[value])
    if copied.animation_data:
        for curve in copied.animation_data.drivers:
            for variable in curve.driver.variables:
                for target in variable.targets:
                    if target.id in mapping:
                        target.id = mapping[target.id]

camera = original.camera.copy()
camera.data = original.camera.data.copy()
camera.name = 'CAMERA - Review Document Clock'
camera.data.name = camera.name
scene.collection.objects.link(camera)
scene.camera = camera
scene.compositing_node_group = original.compositing_node_group.copy()
scene.compositing_node_group.name = 'OUTPUT - Review Document Clock Native Grade'
for node in scene.compositing_node_group.nodes:
    if node.type == 'R_LAYERS':
        node.scene = scene
        node.layer = scene.view_layers[0].name

blue = bpy.data.materials['PALETTE - Native Royal Blue']
violet = bpy.data.materials['PALETTE - Native Orchid Violet']
ivory = bpy.data.materials['PALETTE - Pale Ivory Mint']

def mesh_object(name, vertices, faces, material):
    data = bpy.data.meshes.new(name + ' editable mesh')
    data.from_pydata(vertices, [], faces)
    data.update()
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.000001)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(data)
    bm.free()
    data.update()
    obj = bpy.data.objects.new(name, data)
    model.objects.link(obj)
    data.materials.append(material)
    for face in data.polygons:
        face.use_smooth = True
    return obj

# Native magnifier's exact physical center, in the existing paper composition.
bpy.context.window.scene = original
bpy.context.view_layer.update()
ring = bpy.data.objects['Magnifier - Tubular Lavender Ring']
local_center = sum((Vector(v) for v in ring.bound_box), Vector()) / 8
world_center = ring.matrix_world @ local_center
bpy.context.window.scene = scene
clock = bpy.data.objects.new('Clock - Position and orientation control', None)
model.objects.link(clock)
clock.location = world_center
clock.location.z -= .65
clock.rotation_mode = 'QUATERNION'
clock.rotation_quaternion = ring.matrix_world.to_quaternion()
clock['Outer radius'] = .69
clock['Face radius'] = .51
clock['Hand time'] = '12:20'

def lathe(name, profile, material):
    # Profile is ordered around the closed section as (radius, local Y depth).
    # Front is negative Y, identical to the native page/magnifier convention.
    vertices = []
    faces = []
    count = 160
    for radius, depth in profile:
        for j in range(count):
            angle = 2 * math.pi * j / count
            vertices.append((radius * math.cos(angle), depth, radius * math.sin(angle)))
    for row in range(len(profile) - 1):
        for j in range(count):
            nxt = (j + 1) % count
            faces.append((row*count+j, row*count+nxt, (row+1)*count+nxt, (row+1)*count+j))
    obj = mesh_object(name, vertices, faces, material)
    obj.parent = clock
    return obj

# Thick, continuously rounded lavender casing, rather than an optical lens rim.
body_profile = [(0, .12), (.59, .12)]
for i in range(1, 17):
    t = math.pi/2 * i/16
    body_profile.append((.59 + .10*math.sin(t), .02 + .10*math.cos(t)))
body_profile.append((.69, -.04))
for i in range(1, 17):
    t = math.pi/2 * i/16
    body_profile.append((.59 + .10*math.cos(t), -.04 - .10*math.sin(t)))
body_profile.append((.545, -.14))
for i in range(1, 13):
    t = math.pi/2 * i/12
    body_profile.append((.545 - .045*math.sin(t), -.095 - .045*math.cos(t)))
body_profile += [(.50, -.045), (0, -.045)]
body = lathe('Clock - Rounded lavender casing and bezel', body_profile, violet)

# Recessed ivory face with its own small, smooth transition at the edge.
face_profile = [(0, -.049), (.482, -.049), (.505, -.065), (.512, -.085)]
for i in range(1, 13):
    t = math.pi/2 * i/12
    face_profile.append((.487 + .025*math.cos(t), -.085 - .025*math.sin(t)))
face_profile += [(.40, -.112), (0, -.112)]
face = lathe('Clock - Recessed ivory face', face_profile, ivory)

def capsule_between(name, start, end, radius, depth_ratio=.62):
    start, end = Vector(start), Vector(end)
    delta = end - start
    length = delta.length + 2*radius
    straight = length/2 - radius
    profile = []
    for i in range(17):
        phi = -math.pi/2 + i*math.pi/32
        profile.append((-straight + radius*math.sin(phi), radius*math.cos(phi)))
    profile.append((straight, radius))
    for i in range(1, 17):
        phi = i*math.pi/32
        profile.append((straight + radius*math.sin(phi), radius*math.cos(phi)))
    vertices, faces = [], []
    count = 48
    for x, r in profile:
        for j in range(count):
            angle = j*2*math.pi/count
            vertices.append((x, r*math.cos(angle)*depth_ratio, r*math.sin(angle)))
    for row in range(len(profile)-1):
        for j in range(count):
            nxt=(j+1)%count
            faces.append((row*count+j,(row+1)*count+j,(row+1)*count+nxt,row*count+nxt))
    obj = mesh_object(name, vertices, faces, blue)
    obj.parent = clock
    obj.location = (start + end)/2
    obj.rotation_euler.y = -math.atan2(delta.z, delta.x)
    return obj

capsule_between('Clock - Rounded blue minute hand', (0,-.158,0), (0,-.158,.31), .060)
capsule_between('Clock - Rounded blue hour hand', (0,-.174,0), (.245,-.174,-.142), .069)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32)
hub = bpy.context.object
for collection in list(hub.users_collection):
    collection.objects.unlink(hub)
model.objects.link(hub)
hub.name = 'Clock - Soft blue center pin'
hub.data.name = hub.name + ' editable mesh'
hub.parent = clock
hub.location = (0, -.193, 0)
hub.scale = (.084, .047, .084)
hub.data.materials.append(blue)
for polygon in hub.data.polygons:
    polygon.use_smooth = True

# Pack both visual references into a hidden source collection.
refs = bpy.data.collections.new('REFERENCE - Document Clock (hidden)')
scene.collection.children.link(refs)
refs.hide_render = True
for file in ('reference-curved-document.png', 'reference-clock.png'):
    image = bpy.data.images.load(str(HERE/file), check_existing=True)
    image.pack()
    obj = bpy.data.objects.new('REFERENCE - ' + file, None)
    obj.empty_display_type = 'IMAGE'
    obj.data = image
    obj.hide_render = True
    obj.hide_viewport = True
    refs.objects.link(obj)

scene['Source document scene'] = original.name
scene['Exact page geometry and bend copied'] = True
scene['Source SHA256'] = source_hash
help_text = bpy.data.texts.new('START HERE - Document Clock and Inbox Lines')
help_text.write('04 - Review Document Clock copies the actual saved curved blue page, text, camera and bend controls.\n'
                'Original magnifier scene remains 02 - Review Document.\n'
                'Clock - Position and orientation control moves the lavender bezel, ivory face and blue hands together.\n'
                'The clock has been lowered 0.65 units to overlap the bottom-right paper edge.\n'
                '03 - Review Inbox now has two full blue capsule lines. Both are parented to Document - Tilt control.\n'
                'Native palette, studio and world are shared. Copy a material before making variant-only color changes.\n'
                'See clock-review/README.md and verification.json for preservation and render provenance.\n')
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '16'
scene.render.filepath = '//clock-review/document-clock-1024.png'

after = preservation_state(prior_scenes, prior_objects, prior_materials)
assert before == after, json.dumps(differences(before, after)[:10])
if args.expected_output_sha256:
    assert hashlib.sha256(output.read_bytes()).hexdigest() == args.expected_output_sha256, 'Canonical changed during build.'
bpy.context.window.scene = scene
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(output))
bpy.ops.wm.open_mainfile(filepath=str(output))
reopened = preservation_state(prior_scenes, prior_objects, prior_materials)
assert before == reopened, json.dumps(differences(before, reopened)[:10])
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
record = {'source':str(source),'sourceSha256':source_hash,'output':str(output),
          'preservedScenes':prior_scenes,'preservedObjects':len(prior_objects),
          'beforeDigest':digest(before),'reopenedDigest':digest(reopened),
          'priorDataUnchanged':True,'inboxBlueLines':2,
          'newScene':'04 - Review Document Clock','nativePaletteAndLighting':True}
(HERE/'verification.json').write_text(json.dumps(record,indent=2)+'\n')
print('CLOCK_STUDY_SAVED',json.dumps(record),flush=True)

if not args.no_render:
    renders = [('04 - Review Document Clock','document-clock-draft.png')]
    if not args.only_clock:
        renders.insert(0, ('03 - Review Inbox','inbox-two-lines-draft.png'))
    for name, file in renders:
        active = bpy.data.scenes[name]
        bpy.context.window.scene = active
        active.cycles.device='CPU'
        active.cycles.samples=args.samples
        active.render.resolution_x=active.render.resolution_y=args.resolution
        active.render.resolution_percentage=100
        active.render.filepath=str(HERE/file)
        bpy.ops.render.render(write_still=True,scene=active.name)
        print('CLOCK_STUDY_RENDERED',active.name,active.render.filepath,flush=True)
