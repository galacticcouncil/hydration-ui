"""Build an independent editable tracked-wallet illustration using the saved status studio.

Read-only input: the user's status-icons.blend. Never writes to that source.
All spectacle parts, palette, lights and packed references remain editable.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector, Quaternion

argv = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--resolution', type=int, default=1024)
parser.add_argument('--samples', type=int, default=256)
args = parser.parse_args(argv)
out = Path(args.output).resolve()
out.mkdir(parents=True, exist_ok=True)
source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
reference = bpy.data.scenes['02 - Review Document']
scene = reference.copy()
scene.name = 'Tracked Wallets - Glasses'
bpy.context.window.scene = scene
for collection in list(scene.collection.children):
    if collection.name != 'STUDIO - Shared Softboxes':
        scene.collection.children.unlink(collection)
scene.camera = None
scene.view_layers[0].name = 'Glasses'
for old_scene in list(bpy.data.scenes):
    if old_scene != scene:
        bpy.data.scenes.remove(old_scene)

model = bpy.data.collections.new('ICON - Round Tracked Wallet Glasses')
scene.collection.children.link(model)
blue = bpy.data.materials['PALETTE - Native Royal Blue']
violet = bpy.data.materials['PALETTE - Native Orchid Violet']
glass = bpy.data.materials['PALETTE - Search Lens Optical Glass'].copy()
glass.name = 'GLASSES - Cool Translucent Lens'
shader = glass.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = (.40,.65,1.0,1.0)
shader.inputs['Roughness'].default_value = .08
shader.inputs['Transmission Weight'].default_value = 1.0
shader.inputs['IOR'].default_value = 1.40

# Smooth circular tubing, with continuous bridges and temples rather than boxes.
def tube(name, points, radius, material, cyclic=False):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 24
    data.bevel_depth = radius
    data.bevel_resolution = 8
    data.use_fill_caps = True
    path = data.splines.new('BEZIER')
    path.bezier_points.add(len(points)-1)
    for point, co in zip(path.bezier_points, points):
        point.co = co
        point.handle_left_type = point.handle_right_type = 'AUTO'
    path.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, data)
    model.objects.link(obj)
    obj.data.materials.append(material)
    return obj

# Large, round rims retain the same semantic silhouette as the navigation glyph.
radius = .565
for side, x in [('Left', -.79), ('Right', .79)]:
    ring = [(x + radius*math.cos(t), 0, 1.46 + radius*math.sin(t))
            for t in [2*math.pi*i/16 for i in range(16)]]
    tube('Frame - '+side+' Circular Satin Rim', ring, .095, violet, True)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, location=(x,.012,1.46))
    lens = bpy.context.object
    lens.name = 'Lens - '+side+' Shallow Convex Optical Glass'
    for collection in list(lens.users_collection):
        collection.objects.unlink(lens)
    model.objects.link(lens)
    lens.scale = (.525,.052,.525)
    lens.data.materials.append(glass)
    for polygon in lens.data.polygons:
        polygon.use_smooth = True

# The arch and rising arms echo the two-dimensional glasses glyph.
tube('Frame - Arched Nose Bridge', [(-.255,0,1.57),(-.16,-.012,1.72),(0,-.025,1.77),(.16,-.012,1.72),(.255,0,1.57)], .077, violet)
for sign, side in [(-1,'Left'),(1,'Right')]:
    tube('Temple - '+side+' Rounded Blue Arm', [(sign*1.31,.015,1.65),(sign*1.40,.25,1.91),(sign*1.32,.84,2.02),(sign*1.20,1.16,1.98),(sign*1.10,1.28,1.82)], .082, blue)
    tube('Hinge - '+side+' Violet Join', [(sign*1.29,-.005,1.64),(sign*1.34,.10,1.76)], .09, violet)

# Presentation is a shallow three-quarter view, with full round rims visible.
camera_data = bpy.data.cameras.new('CAMERA - Tracked Glasses')
camera = bpy.data.objects.new('CAMERA - Tracked Glasses', camera_data)
scene.collection.objects.link(camera)
camera.location = (-3.2,-8.4,3.55)
target = Vector((0,.32,1.52))
camera.rotation_mode = 'QUATERNION'
camera.rotation_quaternion = (target-camera.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.radians(-6))
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 3.60
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 12
scene.cycles.transmission_bounces = 10
scene.cycles.transparent_max_bounces = 12
scene.cycles.film_transparent_glass = True
scene.cycles.film_transparent_roughness = .20
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = args.resolution
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '16'
scene.render.filepath = str(out/'glasses-1024.png')

# Duplicate the source grade, retaining its exact palette/lighting/color management.
scene.compositing_node_group = scene.compositing_node_group.copy()
scene.compositing_node_group.name = 'OUTPUT - Tracked Glasses'
for node in scene.compositing_node_group.nodes:
    if node.type == 'R_LAYERS':
        node.scene = scene
        node.layer = 'Glasses'

references = bpy.data.collections.new('REFERENCES - Packed Source and Native Style')
scene.collection.children.link(references)
references.hide_render = True
for filename in [out/'reference-glasses.png',out.parent.parent/'packages/ui/src/assets/images/Casette.webp',out.parent.parent/'packages/ui/src/assets/images/NoPositions.png']:
    image = bpy.data.images.load(str(filename),check_existing=True)
    image.pack()
    ref = bpy.data.objects.new('REFERENCE - '+filename.name,None)
    ref.empty_display_type = 'IMAGE'
    ref.data = image
    ref.hide_render = True
    ref.location = (7,0,-3)
    references.objects.link(ref)

# Remove old model datablocks from this new file only; retain all live scene assets.
for obj in list(bpy.data.objects):
    if obj.name not in scene.objects:
        bpy.data.objects.remove(obj,do_unlink=True)
for collection in list(bpy.data.collections):
    if collection.users == 0:
        bpy.data.collections.remove(collection)
readme = bpy.data.texts.new('START HERE - Tracked Wallet Glasses')
readme.write('''Tracked-wallet empty-state illustration. All parts are editable.\nFrame/bridge/temples are smooth 3D Bezier curves with circular sections.\nThe two shallow convex lenses use physical transmission, IOR 1.40.\nNative satin palette and softboxes copied read-only from status-icons.blend.\nThe user-edited status project is never overwritten.\nPacked reference images are in the hidden REFERENCES collection.\n''')
scene['Source studio SHA256'] = source_hash
scene['Design'] = 'Round spectacles from tracked-wallet glyph, orchid satin rims, royal-blue temples, cool translucent lenses.'
scene['Usage'] = 'TrackedWallets EmptyState at 96 CSS px; transparent app export at 512 px.'
# A reproducible editable project separate from the existing status illustrations.
bpy.ops.wm.save_as_mainfile(filepath=str(out/'tracked-glasses.blend'))
bpy.ops.render.render(write_still=True)
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash, 'Original status project must be unchanged.'
(out/'manifest.json').write_text(json.dumps({'sourceStudio':str(source),'sourceStudioSha256':source_hash,'sourceUnchanged':True,'blend':'tracked-glasses.blend','render':'glasses-1024.png','scene':scene.name,'camera':list(camera.location),'cameraScale':camera_data.ortho_scale,'palette':['PALETTE - Native Orchid Violet','PALETTE - Native Royal Blue'],'resolution':args.resolution,'samples':args.samples,'usage':'apps/main/src/modules/portfolio/tracked/TrackedWallets.tsx'},indent=2)+'\n')
print('TRACKED_GLASSES_RENDERED',scene.render.filepath,flush=True)
