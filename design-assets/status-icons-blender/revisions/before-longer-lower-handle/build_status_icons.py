"""One editable Blender project for Hydration's document and hourglass icons.

Imports the already modelled source parts as local datablocks, then unifies the
studio and palette and replaces the document fold with a real Bend modifier.
The resulting .blend is self-contained, including packed native references.
"""
import argparse
import json
import math
import runpy
from pathlib import Path
import sys
import bpy
from mathutils import Vector, Matrix, Quaternion

args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--resolution', type=int, default=1024)
parser.add_argument('--samples', type=int, default=192)
parser.add_argument('--icon', choices=['all','hourglass','document'], default='all')
parser.add_argument('--skip-render', action='store_true')
opts = parser.parse_args(args)
out = Path(opts.output).resolve()
out.mkdir(parents=True, exist_ok=True)
sources = out.parent

# Isolated background factory startup: preserve all live Blender windows.
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
initial = bpy.context.scene
for collection in list(bpy.data.collections):
    if collection.name in initial.collection.children:
        initial.collection.children.unlink(collection)

def rgba(color):
    channels = [int(color[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in channels)+(1,)

def material(name, color, roughness, specular):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = rgba(color)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Specular IOR Level'].default_value = specular
    shader.inputs['Coat Weight'].default_value = 0
    noise = mat.node_tree.nodes.new('ShaderNodeTexNoise')
    noise.name = 'Fine satin roughness'
    noise.inputs['Scale'].default_value = 180
    noise.inputs['Detail'].default_value = 2
    bump = mat.node_tree.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .065
    bump.inputs['Distance'].default_value = .008
    mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height'])
    mat.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    return mat

palette = {'blue':'#4966D4','violet':'#D17FEA','ivory':'#DCDDBA'}
blue = material('PALETTE - Native Royal Blue',palette['blue'][1:],.58,.24)
violet = material('PALETTE - Native Orchid Violet',palette['violet'][1:],.58,.22)
ivory = material('PALETTE - Pale Ivory Mint',palette['ivory'][1:],.80,.17)

def append_model(file, name, new_name):
    with bpy.data.libraries.load(str(file),link=False) as (available,requested):
        assert name in available.collections, name
        requested.collections = [name]
    collection = requested.collections[0]
    collection.name = new_name
    for obj in collection.all_objects:
        if obj.type != 'MESH':
            continue
        for index,mat in enumerate(obj.data.materials):
            if mat.name.startswith('Royal Blue'):
                obj.data.materials[index] = blue
            elif mat.name.startswith('Cool Lavender'):
                obj.data.materials[index] = violet
            elif mat.name.startswith('Pale Ivory Mint'):
                obj.data.materials[index] = ivory
    return collection

hourglass = append_model(sources/'hourglass-blender/hourglass.blend','Hourglass - Editable Parts','ICON - Hourglass')
document = append_model(sources/'document-blender/document.blend','Document - Editable Parts','ICON - Review Document')

# A single light rig and world datablock are linked into both icon scenes.
studio = bpy.data.collections.new('STUDIO - Shared Softboxes')
target = Vector((0,0,1.55))
def light(name, location, power, size, color):
    data = bpy.data.lights.new(name,'AREA')
    data.energy, data.shape, data.size, data.color = power,'DISK',size,color
    obj = bpy.data.objects.new(name,data)
    studio.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (target-obj.location).to_track_quat('-Z','Y').to_euler()
light('LIGHT - Key Softbox',(-3.8,-4.5,6.3),600,5,(1,.97,.94))
light('LIGHT - Front Fill',(4.5,-3,4.1),150,4.5,(.88,.93,1))
light('LIGHT - Rear Rim',(1,4,4.7),75,3.5,(.88,.90,1))
world = bpy.data.worlds.new('WORLD - Shared Cool Studio')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.3,.35,.43,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .24

def configure(scene, model, layer_name, camera_location, camera_target, camera_scale):
    scene.collection.children.link(model)
    scene.collection.children.link(studio)
    scene.world = world
    scene.view_layers[0].name = layer_name
    cameras = bpy.data.collections.new('CAMERA - '+layer_name)
    scene.collection.children.link(cameras)
    data = bpy.data.cameras.new('CAMERA - '+layer_name)
    camera = bpy.data.objects.new('CAMERA - '+layer_name,data)
    cameras.objects.link(camera)
    camera.location = camera_location
    camera.rotation_mode = 'QUATERNION'
    camera.rotation_quaternion = (Vector(camera_target)-camera.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.radians(5.5))
    data.type = 'ORTHO'
    data.ortho_scale = camera_scale
    scene.camera = camera
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
    grade = bpy.data.node_groups.new('OUTPUT - '+layer_name,'CompositorNodeTree')
    grade.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
    source = grade.nodes.new('CompositorNodeRLayers')
    source.scene = scene
    source.layer = layer_name
    source.label = layer_name+' beauty pass'
    source.location = (-360,0)
    hsv = grade.nodes.new('CompositorNodeHueSat')
    hsv.name = 'Optional Output Grade'
    hsv.label = 'Gentle vibrancy - saturation 1.04'
    hsv.inputs['Saturation'].default_value = 1.04
    hsv.location = (-100,0)
    output = grade.nodes.new('NodeGroupOutput')
    output.location = (180,0)
    grade.links.new(source.outputs['Image'],hsv.inputs['Image'])
    grade.links.new(hsv.outputs['Image'],output.inputs['Image'])
    scene.compositing_node_group = grade
    scene.render.use_compositing = True
    scene['Palette'] = json.dumps(palette)
    scene['Lighting'] = 'Shared STUDIO collection and WORLD datablock'
    return scene

initial.name = '01 - Hourglass'
hg_scene = configure(initial,hourglass,'Hourglass',(-3.6,-8,.55),(0,0,1.55),3.45)
doc_scene = configure(bpy.data.scenes.new('02 - Review Document'),document,'Review Document',(-2.8,-8.4,.60),(.16,0,1.55),3.65)
bpy.context.window.scene = doc_scene
bpy.context.view_layer.update()

# Raised document marks are actual capsule meshes with semicircular endpoints,
# not boxes whose corners depend on a bevel modifier.
for obj in list(document.all_objects):
    if obj.name.startswith(('Document - Long Ivory Stroke','Document - Short Ivory Stroke')):
        bpy.data.objects.remove(obj,do_unlink=True)

def text_capsule(name,width,location):
    radius=.09
    half_straight=width/2-radius
    cap_steps,around=16,48
    profile=[]
    for j in range(1,cap_steps+1):
        angle=-math.pi/2+j*math.pi/(2*cap_steps)
        profile.append((-half_straight+radius*math.sin(angle),radius*math.cos(angle)))
    # Longitudinal rings let the live page curl bend the straight capsule smoothly.
    straight_steps=20
    for j in range(1,straight_steps+1):
        profile.append((-half_straight+2*half_straight*j/straight_steps,radius))
    for j in range(1,cap_steps):
        angle=j*math.pi/(2*cap_steps)
        profile.append((half_straight+radius*math.sin(angle),radius*math.cos(angle)))
    vertices=[(-width/2,0,0)]
    for x,r in profile:
        vertices.extend((x,.5*r*math.cos(2*math.pi*k/around),r*math.sin(2*math.pi*k/around)) for k in range(around))
    right_tip=len(vertices)
    vertices.append((width/2,0,0))
    faces=[]
    for k in range(around):
        n=(k+1)%around
        faces.append((0,1+n,1+k))
    for j in range(len(profile)-1):
        for k in range(around):
            n=(k+1)%around
            a=1+j*around
            b=a+around
            faces.append((a+k,a+n,b+n,b+k))
    last=1+(len(profile)-1)*around
    for k in range(around):
        n=(k+1)%around
        faces.append((last+k,last+n,right_tip))
    mesh=bpy.data.meshes.new(name+' - Semicircular Cap Geometry')
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    document.objects.link(obj)
    obj.data.materials.append(ivory)
    for face in mesh.polygons:
        face.use_smooth=True
    obj.location=location
    bpy.context.view_layer.update()
    matrix=obj.matrix_world.copy()
    obj.parent=next(o for o in document.all_objects if o.name.startswith('Document and Magnifier'))
    obj.matrix_world=matrix
    obj['Shape']='Smooth elliptical capsule: semicircular ends in page plane, fully rounded cross-section, no bevel modifier.'
    return obj

text_capsule('Document - Top Rounded Capsule',1.27,(0,-.17,2.35))
text_capsule('Document - Long Rounded Capsule',1.27,(0,-.17,1.95))
text_capsule('Document - Short Rounded Capsule',.69,(-.29,-.17,1.55))
doc_scene['Text strokes']='True capsule geometry with semicircular ends; no bevel modifier'


# Rebuild the MAIN page as one connected, rounded rectangular sheet. The curl
# is a deformation of its upper-right area, not another object attached to it.
old_parts = [obj for obj in document.all_objects if obj.name.startswith((
    'Document - Blue Page', 'Document - Naturally Folded',
    'Document - Live Curled', 'CONTROL - Corner Bend'))]
for obj in old_parts:
    bpy.data.objects.remove(obj,do_unlink=True)

root = next(o for o in document.all_objects if o.name.startswith('Document and Magnifier'))
# Lower diagonal crease gives a broader, more natural sheet curl.
crease = Vector((.30,-.12,2.12))
crease_diagonal_degrees = 55
diagonal = math.radians(crease_diagonal_degrees)
basis = Matrix(((-math.cos(diagonal),0,math.sin(diagonal)),
                (0,-1,0),
                (math.sin(diagonal),0,math.cos(diagonal)))).transposed().to_4x4()
basis.translation = crease
inverse = basis.inverted()
nx,nz = 80,112
radius = .12
vertices,faces = [],[]
for j in range(nz+1):
    z = .25 + 2.60*j/nz
    distance_to_end = min(z-.25,2.85-z)
    extent = 1.0
    if distance_to_end < radius:
        extent = 1-radius+math.sqrt(max(0,radius*radius-(radius-distance_to_end)**2))
    for i in range(nx+1):
        x = -extent+2*extent*i/nx
        vertices.append(tuple(inverse@Vector((x,-.12,z))))
for j in range(nz):
    for i in range(nx):
        a = j*(nx+1)+i
        faces.append((a,a+1,a+nx+2,a+nx+1))
mesh = bpy.data.meshes.new('Document Main Sheet - One Continuous Quad Grid')
mesh.from_pydata(vertices,[],faces)
mesh.update()
page = bpy.data.objects.new('Document - Continuous Bent Page',mesh)
document.objects.link(page)
page.data.materials.append(blue)
for face in mesh.polygons:
    face.use_smooth = True
page.parent = root
page.matrix_world = basis

origin = bpy.data.objects.new('CONTROL - Main Page Corner Crease',None)
origin.empty_display_type = 'ARROWS'
origin.empty_display_size = .20
document.objects.link(origin)
origin.parent = root
origin.matrix_world = basis
group = page.vertex_groups.new(name='Corner Bend - Main Sheet')
corner = [v.index for v in mesh.vertices if v.co.z>0]
bulk = [v.index for v in mesh.vertices if v.co.z<=0]
group.add(corner,1,'REPLACE')
group.add(bulk,0,'REPLACE')
zmin = min(v.co.z for v in mesh.vertices)
zmax = max(v.co.z for v in mesh.vertices)
bend = page.modifiers.new('MAIN PAGE - Broad Corner Bend 130 degrees','SIMPLE_DEFORM')
bend.deform_method = 'BEND'
bend.deform_axis = 'X'
bend.angle = math.radians(130)
bend.origin = origin
bend.vertex_group = group.name
# For Bend/X, Blender measures progression along Z. Normalize the lower limit
# to put it exactly at the diagonal crease, leaving the main sheet stationary.
bend.limits = ((0-zmin)/(zmax-zmin),1)
solid = page.modifiers.new('MAIN PAGE - Continuous Thickness','SOLIDIFY')
solid.thickness = .05
solid.offset = -1
solid.use_even_offset = True
bevel = page.modifiers.new('MAIN PAGE - Soft Perimeter','BEVEL')
bevel.width = .015
bevel.segments = 4
bevel.limit_method = 'ANGLE'
bevel.angle_limit = math.radians(35)
page['Edit tip'] = 'The whole document is one connected sheet. Edit its first Bend modifier; the vertex group and diagonal origin limit the corner.'
page['Topology'] = 'One quad surface; no separate fold object, no internal boundary or diagonal seam.'
doc_scene['Corner'] = 'Main sheet with a larger gradual bend region; rounded text follows its curvature'


# Let the raised capsule marks follow the same curvature field as the sheet.
# Each object has different bounds, so its angle is driven by the PAGE angle
# multiplied by the ratio of its own active span to the page's active span.
page_bend_span=zmax
text_bend_info=[]
for mark in [o for o in document.all_objects if 'Rounded Capsule' in o.name]:
    positions=[mark.matrix_world@v.co for v in mark.data.vertices]
    for vertex,position in zip(mark.data.vertices,positions):
        vertex.co=inverse@position
    mark.data.update()
    mark.matrix_world=basis
    lo=min(v.co.z for v in mark.data.vertices)
    hi=max(v.co.z for v in mark.data.vertices)
    if hi<=0:
        mark['Page curvature']='Outside the curved region; remains on the flat page.'
        continue
    lower=max(0,lo)
    span=hi-lower
    follow=mark.modifiers.new('Follow Main Page Curvature','SIMPLE_DEFORM')
    follow.deform_method='BEND'
    follow.deform_axis='X'
    follow.origin=origin
    follow.limits=((lower-lo)/(hi-lo),1)
    weights=mark.vertex_groups.new(name='Follow Broad Page Curl')
    positive=[v.index for v in mark.data.vertices if v.co.z>0]
    negative=[v.index for v in mark.data.vertices if v.co.z<=0]
    if positive:weights.add(positive,1,'REPLACE')
    if negative:weights.add(negative,0,'REPLACE')
    follow.vertex_group=weights.name
    driver=follow.driver_add('angle').driver
    variable=driver.variables.new()
    variable.name='page_angle'
    variable.type='SINGLE_PROP'
    variable.targets[0].id=page
    variable.targets[0].data_path=bend.path_from_id('angle')
    ratio=span/page_bend_span
    driver.expression=f'page_angle * {ratio:.12f}'
    mark['Page curvature']='Live driver matches the main sheet curvature, including the raised front offset.'
    text_bend_info.append({'name':mark.name,'curvatureAngleRatio':ratio})
bpy.context.view_layer.update()
doc_scene['Text strokes']='Three rounded capsule lines; live deformation follows the main sheet where it curves.'


# Pack the actual native references, so the Blender file has no image dependency.
references = bpy.data.collections.new('REFERENCE - Packed Native Artwork')
for scene in (hg_scene,doc_scene):
    scene.collection.children.link(references)
refs = sources.parent/'packages/ui/src/assets/images'
for index,name in enumerate(['Casette.webp','ChartError.webp','NoPositions.png']):
    image = bpy.data.images.load(str(refs/name),check_existing=True)
    image.pack()
    obj = bpy.data.objects.new('REFERENCE - '+name,None)
    references.objects.link(obj)
    obj.empty_display_type = 'IMAGE'
    obj.data = image
    obj.empty_display_size = 1.2
    obj.location = (3.2+index*1.5,0,1.55)
    obj.rotation_euler = (math.pi/2,0,0)
    obj.hide_render = True

readme = bpy.data.texts.new('START HERE - Hydration Status Icons')
readme.write('''HYDRATION STATUS ICONS\n\nOne file; two scenes selected from Blender's Scene menu:\n01 - Hourglass: compact frame + smoky glass\n02 - Review Document: live curled blue corner + magnifier\n\nEach scene has a named view layer, model collection, camera and gentle vibrancy compositor.\nSTUDIO, WORLD and the PALETTE materials are shared between both scenes.\n\nFor the corner, select Document - Continuous Bent Page and edit its first\nSimple Deform / Bend modifier. CONTROL - Main Page Corner Crease anchors its axis.\nBend acts on the MAIN sheet before Solidify and edge bevel. It is one connected mesh.\n\nNative reference images are packed and placed outside the camera frame.\nAll geometry, procedural materials, references, studio lights and cameras\nare stored inside this .blend; no linked library is required.\n''')

# Reuse the native-library search geometry in every clean rebuild.
refinement = runpy.run_path(str(Path(__file__).with_name('refine_magnifier.py')))
magnifier_shape = refinement['refine_magnifier'](doc_scene)

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_perspective = 'CAMERA'
blend = out/'status-icons.blend'
for key,scene in [('hourglass',hg_scene),('document',doc_scene)]:
    scene.render.filepath = str(out/f'{key}-{opts.resolution}.png')
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
if not opts.skip_render:
    for key,scene in [('hourglass',hg_scene),('document',doc_scene)]:
        if opts.icon in ('all',key):
            bpy.context.window.scene = scene
            bpy.ops.render.render(write_still=True,scene=scene.name)
bpy.context.window.scene = doc_scene
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
manifest = {'source':str(blend),'blender':bpy.app.version_string,'resolution':opts.resolution,'samples':opts.samples,'palette':palette,'gradeSaturation':1.04,'scenes':[s.name for s in (hg_scene,doc_scene)],'sharedStudio':studio.name,'sharedWorld':world.name,'fold':{'type':'SIMPLE_DEFORM','method':'BEND','axis':'X','angleDegrees':130,'solidifyThickness':.05,'creaseOrigin':list(crease),'creaseDiagonalDegrees':crease_diagonal_degrees,'oneContinuousPage':True,'baseVertices':len(vertices)},'textStrokes':{'geometry':'capsules','count':3,'radius':.09,'bevelModifier':False,'followsPageCurvature':True},'packedReferences':['Casette.webp','ChartError.webp','NoPositions.png']}
manifest['magnifier'] = magnifier_shape
manifest['packedReferences'].append('Design-Library-Search-3D.png')
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('HYDRATION_STATUS_ICONS_COMPLETE',json.dumps(manifest),flush=True)
