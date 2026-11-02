"""Add an editable aquatic empty-deposit illustration to a copy of the icon studio."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--resolution', type=int, default=768)
parser.add_argument('--samples', type=int, default=64)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
out = Path(__file__).resolve().parent
source = Path(bpy.data.filepath)
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
scene = bpy.data.scenes['02 - Review Document'].copy()
scene.name = '05 - Empty Deposits - Poolside Lounger'
bpy.context.window.scene = scene
for collection in list(scene.collection.children):
    if collection.name != 'STUDIO - Shared Softboxes':
        scene.collection.children.unlink(collection)
scene.view_layers[0].name = 'Poolside Lounger'
model = bpy.data.collections.new('ICON - Empty Deposits - Editable Poolside Parts')
scene.collection.children.link(model)

def color(hex_value):
    channels = [int(hex_value[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055)**2.4 for v in channels) + (1,)

def material(name, hex_value, roughness=.57):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = color(hex_value)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Specular IOR Level'].default_value = .24
    return mat

blue = material('LOUNGER - Vibrant Royal Blue Frame', '4166E7')
lavender = material('LOUNGER - Soft Lavender Upholstery', 'AF87EA')
ivory = material('LOUNGER - Warm Ivory Towel and Stripes', 'F3E6CC', .76)
pink = material('LOUNGER - Poolside Blush Pink', 'ED8EC7')
orchid = material('LOUNGER - Parasol Orchid', 'BB86EC')

def add(obj, name, mat):
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    model.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

def smooth(obj):
    if obj.type == 'MESH':
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj

def box(name, location, dimensions, mat, bevel=.08, rotation=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = add(bpy.context.object, name, mat)
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = obj.modifiers.new('Soft rounded cushion edges', 'BEVEL')
    mod.width, mod.segments = bevel, 6
    mod.harden_normals = True
    obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    obj.rotation_euler.x = rotation
    return smooth(obj)

def tube(name, points, radius, mat):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 24
    data.bevel_depth, data.bevel_resolution = radius, 5
    data.use_fill_caps = True
    spline = data.splines.new('BEZIER')
    spline.bezier_points.add(len(points)-1)
    for point, co in zip(spline.bezier_points, points):
        point.co = co
        point.handle_left_type = point.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, data)
    model.objects.link(obj)
    data.materials.append(mat)
    return obj

def sphere(name, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    obj = add(bpy.context.object, name, mat)
    obj.scale = scale
    return smooth(obj)

# Chair runs from its front foot at negative Y to the reclining back at positive Y.
seat_angle = math.radians(4)
back_angle = math.radians(57)
# One continuous shell replaces the overlapping seat/back boxes and extra rails.
from mathutils.geometry import interpolate_bezier
corner = interpolate_bezier(Vector((0,.10,.76)),Vector((0,.28,.77)),
                            Vector((0,.32,.91)),Vector((0,.41,1.06)),12)
profile = [(-1.68,.64)] + [(v.y,v.z) for v in corner] + [
    (1.07,2.075),(1.24,1.965),(.57,.94),(.44,.72),(.21,.57),(-1.68,.43)]
vertices = [(x,y,z) for x in (-.83,.83) for y,z in profile]
n = len(profile)
faces = [tuple(reversed(range(n))),tuple(range(n,2*n))]
faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh = bpy.data.meshes.new('Chair - Continuous Seat to Back Shell')
mesh.from_pydata(vertices,[],faces)
mesh.update()
shell = bpy.data.objects.new('Chair - Single Rounded Royal Blue Frame',mesh)
model.objects.link(shell)
mesh.materials.append(blue)
bevel = shell.modifiers.new('Soft continuous frame corners','BEVEL')
bevel.width,bevel.segments = .085,6
bevel.harden_normals = True
shell.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
smooth(shell)
for i in range(5):
    x = (i-2)*.292
    mat = lavender if i % 2 == 0 else ivory
    box(f'Seat Cushion - Editable Stripe {i+1}', (x, -.58, .735), (.302, 2.12, .19), mat, .075, seat_angle)
    # Front-facing normal of the inclined back is (0,-sin(angle),cos(angle)).
    box(f'Back Cushion - Editable Stripe {i+1}', (x, .565, 1.33), (.302, 1.46, .19), mat, .075, back_angle)

for side, x in [('Left', -.66), ('Right', .66)]:
    tube(f'Chair Legs - {side} Rounded Support', [(x,-1.54,.15),(x,-1.42,.39),(x,-1.21,.52),(x,.34,.56),(x,.58,.35),(x,.71,.15)], .105, blue)
    for label,y in [('Front',-1.54),('Rear',.71)]:
        sphere(f'Chair Legs - {side} {label} Round Foot',(x,y,.15),(.105,.105,.105),blue)

# Real, gently folded towel surface draped over the top of the backrest.
towel_path = [(.59,1.31),(.66,1.47),(.77,1.65),(.88,1.81),(.99,1.96),(1.08,2.025),(1.18,2.02),(1.27,1.94),(1.32,1.77),(1.37,1.60)]
verts, faces = [], []
across = 32
for row, (y,z) in enumerate(towel_path):
    for j in range(across+1):
        u = j/across
        x = -.50 + u*.70
        wave = .017*math.cos(u*math.pi*6)
        edge = .018*math.sin(u*math.pi*4) if row in (0,len(towel_path)-1) else 0
        verts.append((x,y-.19-wave,z+wave+edge))
for row in range(len(towel_path)-1):
    for j in range(across):
        a = row*(across+1)+j
        faces.append((a,a+1,a+across+2,a+across+1))
mesh = bpy.data.meshes.new('Towel - Editable Folded Cloth Surface')
mesh.from_pydata(verts,[],faces)
mesh.update()
towel = bpy.data.objects.new('Towel - Ivory Drape over Backrest',mesh)
model.objects.link(towel)
mesh.materials.append(ivory)
sub = towel.modifiers.new('Soft cloth folds','SUBSURF')
sub.levels = sub.render_levels = 2
solid = towel.modifiers.new('Towel fabric thickness','SOLIDIFY')
solid.thickness = .038
bevel = towel.modifiers.new('Rounded towel hem','BEVEL')
bevel.width, bevel.segments = .015, 3
smooth(towel)

# Segmented parasol: each curved fabric panel and rib is editable separately.
cx, cy, apex, radius = 1.01, .93, 3.38, 1.10
tube('Parasol - Ivory Pole', [(cx,cy,.13),(cx,cy,1.70),(cx,cy,apex)], .042, ivory)
box('Parasol - Small Rounded Foot', (cx,cy,.075), (.53,.44,.15), lavender, .10)
panels, radial_steps, angular_steps = 8, 16, 12
for panel in range(panels):
    vertices, polygons = [], []
    for ri in range(radial_steps+1):
        t = ri/radial_steps
        r = max(t,.001)*radius
        for ai in range(angular_steps+1):
            u = ai/angular_steps
            theta = (panel+u)*2*math.pi/panels
            z = apex - .49*t**1.55 - .085*math.sin(u*math.pi)*t**4
            vertices.append((cx+r*math.cos(theta),cy+r*math.sin(theta),z))
    for ri in range(radial_steps):
        for ai in range(angular_steps):
            a=ri*(angular_steps+1)+ai
            polygons.append((a,a+angular_steps+1,a+angular_steps+2,a+1))
    data=bpy.data.meshes.new(f'Parasol Panel {panel+1} - Sculpted Canopy')
    data.from_pydata(vertices,[],polygons)
    data.update()
    obj=bpy.data.objects.new(f'Parasol - Editable Fabric Panel {panel+1}',data)
    model.objects.link(obj)
    data.materials.append(pink if panel%2 == 0 else orchid)
    solid=obj.modifiers.new('Soft fabric thickness','SOLIDIFY')
    solid.thickness=.035
    bevel=obj.modifiers.new('Rounded fabric edge','BEVEL')
    bevel.width,bevel.segments=.018,3
    smooth(obj)
    theta=panel*2*math.pi/panels
    points=[]
    for step in range(9):
        t=step/8
        points.append((cx+radius*t*math.cos(theta),cy+radius*t*math.sin(theta),apex-.49*t**1.55-.025))
    tube(f'Parasol - Underside Rib {panel+1}',points,.012,ivory)
sphere('Parasol - Rounded Ivory Finial',(cx,cy,apex+.045),(.085,.085,.09),ivory)

camera_data=bpy.data.cameras.new('CAMERA - Poolside Empty Deposits')
camera=bpy.data.objects.new('CAMERA - Poolside Empty Deposits',camera_data)
scene.collection.objects.link(camera)
target=Vector((.30,.10,1.72))
camera.location=(-6.2,-9.0,5.4)
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.type='ORTHO'
camera_data.ortho_scale=4.85
scene.camera=camera
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=args.samples
scene.cycles.use_denoising=True
scene.cycles.max_bounces=8
scene.render.film_transparent=True
scene.render.resolution_x=scene.render.resolution_y=args.resolution
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.image_settings.color_depth='16'
scene.render.filepath=str(out/f'deposit-lounger-v2-{args.resolution}.png')
scene.compositing_node_group=scene.compositing_node_group.copy()
scene.compositing_node_group.name='OUTPUT - Poolside Lounger Native Grade'
scene.view_settings.exposure=.15
for node in scene.compositing_node_group.nodes:
    if node.type=='R_LAYERS':
        node.scene=scene
        node.layer='Poolside Lounger'
    elif node.type=='HUE_SAT':
        node.name='Empty Deposits - Vibrancy'
        node.label='Vibrancy 1.16 - preserves transparent alpha'
        node.inputs['Saturation'].default_value=1.16
        node.inputs['Value'].default_value=1.015

reference=Path('/Users/samborek/.codex/generated_images/01a153a9-3ade-7be0-8c3f-c4e6609d3c4a/exec-4ef5b4c5-ec8f-4087-8fa0-b5351534fc74.png')
if reference.exists():
    image=bpy.data.images.load(str(reference),check_existing=True)
    image.name='REFERENCE - Aquatic Empty Deposits Sheet - Selected 3'
    image.use_fake_user=True
    image.pack()
notes=bpy.data.texts.new('START HERE - Empty Deposits Lounger')
notes.write('User selected concept 3 from the aquatic empty-deposit sheet.\n'
            'Editable blue lounge chair, alternating ivory/lavender cushion stripes, draped ivory towel, pink/orchid parasol.\n'
            'All four earlier icon scenes remain available; original input project is not overwritten.\n'
            'New scene shares the original studio lights and world. Transparent PNG output.\n'
            'Reference sheet is packed in Images. Builder is build_lounger.py next to this project.\n')
scene['Purpose']='Portfolio Deposits - No deposits yet - selected aquatic concept 3'
scene['Original studio SHA256']=source_hash
scene['Reference concept']=3
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.context.preferences.filepaths.save_version=0
blend=out/'status-icons-with-deposit-lounger.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
bpy.ops.render.render(write_still=True,scene=scene.name)
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
(out/'manifest.json').write_text(json.dumps({'blend':str(blend),'render':scene.render.filepath,'scene':scene.name,'resolution':args.resolution,'samples':args.samples,'sourceUnchanged':True,'sourceStudioSha256':source_hash,'selectedConcept':3,'parts':len(model.objects),'allScenes':[s.name for s in bpy.data.scenes]},indent=2)+'\n')
print('LOUNGER_RENDERED',scene.render.filepath,flush=True)
