"""Editable Hydration document study; same soft studio as the hourglass."""
import argparse
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector, Quaternion

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--resolution', type=int, default=384)
parser.add_argument('--samples', type=int, default=64)
opts = parser.parse_args(args)
out = Path(opts.output)
out.mkdir(parents=True, exist_ok=True)

# Run in a separate factory-startup process; never edit the live user scene.
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
scene = bpy.context.scene
scene.name = 'Hydration Document - Soft Studio'
model = bpy.data.collections.new('Document - Editable Parts')
scene.collection.children.link(model)
studio = bpy.data.collections.new('Studio - Camera and Softboxes')
scene.collection.children.link(studio)

def rgba(color):
    values = [int(color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values) + (1,)

def material(name, color, roughness=.58, specular=.24, micro=True):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = rgba(color)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['IOR'].default_value = 1.45
    bsdf.inputs['Specular IOR Level'].default_value = specular
    bsdf.inputs['Coat Weight'].default_value = 0
    if micro:
        noise = mat.node_tree.nodes.new('ShaderNodeTexNoise')
        noise.name = 'Very fine molded surface roughness'
        noise.inputs['Scale'].default_value = 180
        noise.inputs['Detail'].default_value = 2
        bump = mat.node_tree.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .065
        bump.inputs['Distance'].default_value = .008
        mat.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

blue = material('Royal Blue - Rough Satin', '4168C4')
lavender = material('Cool Lavender - Rough Satin', 'A58DC9', specular=.22)
ivory = material('Pale Ivory Mint - Document Strokes', 'DCDDBA', .75, .18)
lens_mat = material('Smoky Blue Lens - Physical Transmission', 'E3EAF4', .12, .28, False)
lens_bsdf = lens_mat.node_tree.nodes.get('Principled BSDF')
lens_bsdf.inputs['Transmission Weight'].default_value = 1
lens_bsdf.inputs['IOR'].default_value = 1.4
absorb = lens_mat.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
absorb.inputs['Color'].default_value = rgba('647F9A')
absorb.inputs['Density'].default_value = .45
lens_mat.node_tree.links.new(absorb.outputs['Volume'], lens_mat.node_tree.nodes.get('Material Output').inputs['Volume'])

parts = []

def move_to(obj, collection):
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)

def finish(obj, mat, bevel=.04, smooth=True):
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = smooth
    if bevel:
        modifier = obj.modifiers.new('Soft edge bevel', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 6
    normal = obj.modifiers.new('Weighted face normals', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    parts.append(obj)
    return obj

def slab(name, outline, front, back, mat, bevel):
    n = len(outline)
    vertices = [(x, front, z) for x,z in outline] + [(x, back, z) for x,z in outline]
    faces = [tuple(range(n)), tuple(reversed(range(n, 2*n)))]
    faces += [(i, n+i, n+(i+1)%n, (i+1)%n) for i in range(n)]
    mesh = bpy.data.meshes.new(name + ' Mesh')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    model.objects.link(obj)
    return finish(obj, mat, bevel)

# The missing triangular corner and the folded flap share the same blue material.
outline = [(-1.0,.25),(1.0,.25),(1.0,2.35),(.5,2.85),(-1.0,2.85)]
page = slab('Document - Blue Page with Clipped Corner', outline, -.12, .12, blue, .10)

# Real, gently curved dog-ear attached along the diagonal crease, rather than
# a differently coloured corner cap. Its free corner lifts toward the viewer.
A = Vector((.5,-.137,2.85))
B = Vector((1.0,-.137,2.35))
D = Vector((.5,-.137,2.35))
steps = 18
vertices = []
indices = {}
for i in range(steps+1):
    for j in range(steps+1-i):
        u, v = i/steps, j/steps
        point = (1-u-v)*A + u*B + v*D
        point.y -= .11 * math.sin(v*math.pi/2)
        indices[(i,j)] = len(vertices)
        vertices.append(tuple(point))
faces = []
for i in range(steps):
    for j in range(steps-i):
        faces.append((indices[i,j], indices[i+1,j], indices[i,j+1]))
        if i+j < steps-1:
            faces.append((indices[i+1,j], indices[i+1,j+1], indices[i,j+1]))
faces = [tuple(reversed(face)) for face in faces]
mesh = bpy.data.meshes.new('Folded Blue Corner Mesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
fold = bpy.data.objects.new('Document - Naturally Folded Blue Corner', mesh)
model.objects.link(fold)
solid = fold.modifiers.new('Thin continuous blue paper edge', 'SOLIDIFY')
solid.thickness = .035
solid.offset = 0
finish(fold, blue, .014)

def rounded_box(name, dimensions, location, mat, bevel):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    move_to(obj, model)
    return finish(obj, mat, bevel)

# Two broad readable marks; no tiny text or extra detail.
rounded_box('Document - Long Ivory Stroke', (1.27,.09,.18), (-.13,-.195,2.08), ivory, .085)
rounded_box('Document - Short Ivory Stroke', (.81,.09,.18), (-.36,-.195,1.68), ivory, .085)

# A closed chunky annulus: broad face with a small softened edge.
cx, cy, cz = .64, -.37, 1.13
outer, inner, depth, count = .69, .465, .25, 128
vertices = []
for radius, y in [(outer,cy-depth/2),(inner,cy-depth/2),(outer,cy+depth/2),(inner,cy+depth/2)]:
    vertices.extend([(cx+radius*math.cos(2*math.pi*k/count),y,cz+radius*math.sin(2*math.pi*k/count)) for k in range(count)])
faces = []
for k in range(count):
    n = (k+1)%count
    faces += [(k,n,count+n,count+k),
              (2*count+k,3*count+k,3*count+n,2*count+n),
              (k,2*count+k,2*count+n,n),
              (count+k,count+n,3*count+n,3*count+k)]
mesh = bpy.data.meshes.new('Magnifier Annulus Mesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
ring = bpy.data.objects.new('Magnifier - Chunky Lavender Ring', mesh)
model.objects.link(ring)
finish(ring, lavender, .052)

# A slightly convex lens, with physical glass contained inside the frame.
profile = [(-.067,.16),(-.057,.32),(-.040,.465),(.045,.465),(.058,.32),(.065,.16)]
# Single vertices at each pole keep the lens closed without collapsed faces.
vertices = [(cx,cy-.070,cz)]
segments = 128
for y, radius in profile:
    vertices.extend([(cx+radius*math.cos(2*math.pi*k/segments),cy+y,cz+radius*math.sin(2*math.pi*k/segments)) for k in range(segments)])
back_pole = len(vertices)
vertices.append((cx,cy+.067,cz))
faces = []
for k in range(segments):
    n=(k+1)%segments
    faces.append((0,1+k,1+n))
for i in range(len(profile)-1):
    for k in range(segments):
        n=(k+1)%segments
        faces.append((1+i*segments+k,1+(i+1)*segments+k,1+(i+1)*segments+n,1+i*segments+n))
last = 1+(len(profile)-1)*segments
for k in range(segments):
    n=(k+1)%segments
    faces.append((last+k,back_pole,last+n))
mesh = bpy.data.meshes.new('Magnifier Convex Glass Mesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
lens = bpy.data.objects.new('Magnifier - Smoky Inset Glass Lens', mesh)
model.objects.link(lens)
finish(lens, lens_mat, 0)
lens.modifiers.clear()

# Wide rounded handle joins the rim on its lower right.
reach = .93
handle = rounded_box('Magnifier - Rounded Lavender Handle', (.34,.27,.80),
                     (cx+reach/math.sqrt(2),cy,cz-reach/math.sqrt(2)),lavender,.10)
handle.rotation_euler[1] = -math.pi/4

root = bpy.data.objects.new('Document and Magnifier - Presentation Tilt', None)
model.objects.link(root)
root.location = (.10,0,1.55)
bpy.context.view_layer.update()
for obj in parts:
    matrix = obj.matrix_world.copy()
    obj.parent = root
    obj.matrix_world = matrix
root.rotation_euler[1] = 0  # Presentation tilt lives in the camera only.

world = bpy.data.worlds.new('Soft neutral studio environment')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.3,.35,.43,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .24
scene.world = world
target = Vector((.16,0,1.55))
camera_data = bpy.data.cameras.new('Orthographic Product Camera')
camera = bpy.data.objects.new('Camera - Three Quarter Soft Studio',camera_data)
studio.objects.link(camera)
camera.location = (-2.8,-8.4,.60)
camera.rotation_mode = 'QUATERNION'
camera.rotation_quaternion = (target-camera.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.radians(5.5))
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 3.65
scene.camera = camera

def light(name, position, power, size, color):
    data = bpy.data.lights.new(name,'AREA')
    data.energy, data.shape, data.size, data.color = power, 'DISK', size, color
    obj = bpy.data.objects.new(name,data)
    studio.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (Vector((0,0,1.55))-obj.location).to_track_quat('-Z','Y').to_euler()

# Identical light powers, sizes, positions and colours to the hourglass scene.
light('Key - Large Softbox Upper Left',(-3.8,-4.5,6.3),600,5.0,(1,.97,.94))
light('Fill - Broad Cool Front',(4.5,-3.0,4.1),150,4.5,(.88,.93,1))
light('Rim - Subtle Rear',(1.0,4.0,4.7),75,3.5,(.88,.90,1))
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = opts.samples
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 12
scene.cycles.transmission_bounces = 10
scene.cycles.transparent_max_bounces = 12
scene.cycles.film_transparent_glass = True
scene.cycles.film_transparent_roughness = .20
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = opts.resolution
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '16'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = .35
scene['Design reference'] = 'Hydration Review3D.webp, native Casette.webp, and matching hourglass-blender studio'
scene['Material intent'] = 'Royal blue and muted lavender rough satin; natural blue fold; two ivory strokes; smoky optical lens'
scene['Isolated render'] = 'Created in a separate factory-startup background process'
for area in bpy.context.screen.areas if bpy.context.screen else []:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_perspective = 'CAMERA'
scene.render.filepath = str(out / f'document-{opts.resolution}.png')
blend_path = out / 'document.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
bpy.ops.render.render(write_still=True)
manifest = {
    'blender':bpy.app.version_string, 'source':str(blend_path), 'render':scene.render.filepath,
    'resolution':opts.resolution, 'samples':opts.samples, 'device':'CPU',
    'reference':'references/imagegen-document.webp',
    'palette':{'page':'#4168C4','magnifier':'#A58DC9','strokes':'#DCDDBA'},
    'lighting':{'keyWatts':600,'fillWatts':150,'rimWatts':75,'keySize':5,'source':'hourglass-blender'},
    'construction':{'page':[2,.24,2.6],'pageBevel':.10,'foldMaterialSameAsPage':True,'foldThickness':.035,'foldLift':.11,'ringOuterRadius':.69,'ringInnerRadius':.465,'ringDepth':.25},
    'camera':{'type':'ORTHO','scale':camera_data.ortho_scale,'location':list(camera.location),'target':list(target),'rollDegrees':5.5},
    'objects':[{'name':o.name,'type':o.type} for o in scene.objects],
}
(out / 'manifest.json').write_text(json.dumps(manifest,indent=2))
print('HYDRATION_DOCUMENT_RENDER_COMPLETE',json.dumps(manifest),flush=True)
