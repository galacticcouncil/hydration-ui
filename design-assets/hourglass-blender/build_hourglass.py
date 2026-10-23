"""Editable Hydration hourglass study. Run with Blender --background --python."""
import argparse
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector, Quaternion

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
p = argparse.ArgumentParser()
p.add_argument('--output', required=True)
p.add_argument('--resolution', type=int, default=384)
p.add_argument('--samples', type=int, default=64)
p.add_argument('--cpu', action='store_true')
opts = p.parse_args(args)
out = Path(opts.output)
out.mkdir(parents=True, exist_ok=True)

# This builder runs in its own factory-startup background process.
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
scene = bpy.context.scene
scene.name = 'Hydration Hourglass - Soft Studio'
model = bpy.data.collections.new('Hourglass - Editable Parts')
scene.collection.children.link(model)
studio = bpy.data.collections.new('Studio - Camera and Softboxes')
scene.collection.children.link(studio)

def rgba(hexcolor):
    v = [int(hexcolor[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v) + (1,)

def material(name, color, roughness=.55, specular=.25, micro=False):
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

blue = material('Royal Blue - Rough Satin', '4168C4', .58, .24, True)
lavender = material('Cool Lavender - Rough Satin', 'A58DC9', .58, .22, True)
sand_mat = material('Pale Ivory Mint Sand', 'DCDDBA', .85, .16, True)
glass = material('Smoky Blue Glass - Physical Transmission', 'FAFCFF', .085, .22)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value = 1
absorb = glass.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
absorb.inputs['Color'].default_value = rgba('718CA2')
absorb.inputs['Density'].default_value = .12
glass.node_tree.links.new(absorb.outputs['Volume'], glass.node_tree.nodes.get('Material Output').inputs['Volume'])

def move_to(obj, collection):
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)

parts = []
def cylinder(name, radius, depth, location, mat, bevel):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    move_to(obj, model)
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    if bevel:
        mod = obj.modifiers.new('Soft machined bevel', 'BEVEL')
        mod.width, mod.segments = bevel, 5
        mod.affect = 'EDGES'
    normal = obj.modifiers.new('Weighted face normals', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    parts.append(obj)
    return obj

# Compress only the open section, keeping the circular caps and posts chunky.
open_height_scale = .76
saturation_factor = 1.10
base_top_z = .38
def compact_z(z):
    return base_top_z + (z-base_top_z)*open_height_scale
top_center_z = compact_z(2.72) + .18
center_offset_z = 1.55 - (.20+top_center_z)/2

cylinder('Base - Circular Blue Disc', 1.02, .36, (0, 0, .20), blue, .07)
cylinder('Top - Circular Blue Disc', 1.02, .36, (0, 0, top_center_z), blue, .07)
# Relative to camera, two supports frame the front and one sits behind the glass.
for i, angle in enumerate([0, 120, 240], 1):
    a = math.radians(62 + (i-1)*120)
    x, y = .83 * math.cos(a), .83 * math.sin(a)
    cylinder(f'Support {i:02} - Lavender Post', .14, 2.32*open_height_scale, (x, y, compact_z(1.55)), lavender, .035)
    cylinder(f'Support {i:02} - Lower Collar', .18, .16, (x, y, compact_z(.42)), lavender, .035)
    cylinder(f'Support {i:02} - Upper Collar', .18, .16, (x, y, compact_z(2.68)), lavender, .035)

# Lathed glass: smooth curved outer vessel, with an editable physical shell.
control = [(.34,.46),(.40,.52),(.55,.60),(.75,.66),(.93,.62),(1.12,.50),
           (1.30,.30),(1.44,.13),(1.54,.075),(1.64,.13),(1.78,.30),(1.96,.50),
           (2.15,.62),(2.33,.66),(2.52,.60),(2.70,.52),(2.76,.46)]

def catmull_profile(points, steps=8):
    result=[]
    for i in range(len(points)-1):
        a,b,c,d = points[max(0,i-1)],points[i],points[i+1],points[min(len(points)-1,i+2)]
        for j in range(steps):
            t=j/steps
            values=[.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t) for k in (0,1)]
            result.append((values[0],max(.03,values[1])))
    return result+[points[-1]]

def lathe(name, profile, mat, segments=128, shell=False):
    verts=[]
    for z,r in profile:
        verts.extend([(r*math.cos(2*math.pi*j/segments),r*math.sin(2*math.pi*j/segments),z) for j in range(segments)])
    faces=[]
    for k in range(len(profile)-1):
        for j in range(segments):
            n=(j+1)%segments
            faces.append((k*segments+j,k*segments+n,(k+1)*segments+n,(k+1)*segments+j))
    mesh=bpy.data.meshes.new(name+' Mesh')
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    model.objects.link(obj)
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth=True
    if shell:
        solid=obj.modifiers.new('Glass wall - 0.028', 'SOLIDIFY')
        solid.thickness=.028
        solid.offset=-1
        solid.use_even_offset=True
    parts.append(obj)
    return obj

vessel=lathe('Vessel - Rotational Glass Bulbs',catmull_profile([(compact_z(z),r) for z,r in control]),glass,shell=True)
# Rounded sand mound with a closed, shallow bottom; separate editable mesh.
sand_profile=[(.355,.03),(.355,.43),(.39,.49),(.46,.48),(.49,.43),(.55,.34),(.63,.22),(.70,.10),(.725,.03)]
sand=lathe('Sand - Lower Ivory Mound',catmull_profile([(compact_z(z),r) for z,r in sand_profile],5),sand_mat)
# Keep the model centered under the existing studio lights and camera.
for part in parts:
    part.location.z += center_offset_z

world=bpy.data.worlds.new('Soft neutral studio environment')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.3,.35,.43,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.24
scene.world=world

camera_data=bpy.data.cameras.new('Orthographic Product Camera')
camera=bpy.data.objects.new('Camera - Three Quarter Soft Studio',camera_data)
studio.objects.link(camera)
camera.location=(-3.6,-8.0,.55)
target=Vector((0,0,1.55))
rot=(target-camera.location).to_track_quat('-Z','Y')
camera.rotation_mode='QUATERNION'
camera.rotation_quaternion=rot @ Quaternion((0,0,1),math.radians(5.5))
camera_data.type='ORTHO'
camera_data.ortho_scale=3.45
camera_data.lens=75
scene.camera=camera

def light(name,position,power,size,color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=power
    data.shape='DISK'
    data.size=size
    data.color=color
    obj=bpy.data.objects.new(name,data)
    studio.objects.link(obj)
    obj.location=position
    obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

light('Key - Large Softbox Upper Left',(-3.8,-4.5,6.3),600,5.0,(1,.97,.94))
light('Fill - Broad Cool Front',(4.5,-3.0,4.1),150,4.5,(.88,.93,1))
light('Rim - Subtle Rear',(1.0,4.0,4.7),75,3.5,(.88,.90,1))
scene.render.engine='CYCLES'
scene.cycles.samples=opts.samples
scene.cycles.use_denoising=True
scene.cycles.max_bounces=12
scene.cycles.transmission_bounces=10
scene.cycles.transparent_max_bounces=12
scene.cycles.film_transparent_glass=True
scene.cycles.film_transparent_roughness=.20
scene.render.film_transparent=True
scene.render.resolution_x=opts.resolution
scene.render.resolution_y=opts.resolution
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.image_settings.color_depth='16'
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.35
# Non-destructive colour grade after Render Layers; materials and lights stay
# editable independently. Blender 5 uses a compositing node group for output.
grade=bpy.data.node_groups.new('Hourglass - Render Layer Saturation','CompositorNodeTree')
grade.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
render_layers=grade.nodes.new('CompositorNodeRLayers')
render_layers.name='Hourglass Render Layers'
render_layers.label='Cycles beauty render'
render_layers.scene=scene
render_layers.location=(-360,0)
saturation=grade.nodes.new('CompositorNodeHueSat')
saturation.name='Hourglass Saturation'
saturation.label='Saturation 1.10 - match native artwork'
saturation.inputs['Hue'].default_value=.5
saturation.inputs['Saturation'].default_value=saturation_factor
saturation.inputs['Value'].default_value=1.0
saturation.location=(-100,0)
output=grade.nodes.new('NodeGroupOutput')
output.name='Graded Transparent Output'
output.location=(180,0)
grade.links.new(render_layers.outputs['Image'],saturation.inputs['Image'])
grade.links.new(saturation.outputs['Image'],output.inputs['Image'])
scene.compositing_node_group=grade
scene.render.use_compositing=True

# Prefer Metal if the local installation exposes a device; otherwise CPU.
device='CPU'
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    if opts.cpu:
        raise RuntimeError('CPU requested for predictable studio rendering')
    prefs.compute_device_type='METAL'
    prefs.get_devices()
    for item in prefs.devices:
        item.use=item.type=='METAL'
    if any(item.type=='METAL' for item in prefs.devices):
        scene.cycles.device='GPU'
        device='METAL'
except Exception:
    pass

scene['Design reference']='Hydration Casette.webp, ChartError.webp and circular Waiting3D.webp'
scene['Material intent']='Soft satin royal blue, muted lavender, physical smoky glass, broad low-ratio fill'
scene['Construction']='Circular discs, three radial posts, rotational glass shell, opaque sand mound'
scene['Isolated render']='Created in a new factory-startup background Blender process'
for area in bpy.context.screen.areas if bpy.context.screen else []:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
blend_path=out/'hourglass.blend'
scene.render.filepath=str(out/f'hourglass-{opts.resolution}.png')
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
bpy.ops.render.render(write_still=True)
manifest={'blender':bpy.app.version_string,'source':str(blend_path),'render':scene.render.filepath,
          'resolution':opts.resolution,'samples':opts.samples,'device':device,
          'objects':[{ 'name':o.name,'type':o.type} for o in scene.objects],
          'geometry':{'capRadius':1.02,'capDepth':.36,'capBevel':.07,'postRadius':.14,'postDepth':2.32*open_height_scale,'collarRadius':.18,'collarDepth':.16},
          'palette':{'frame':'#4168C4','supports':'#A58DC9','sand':'#DCDDBA'},
          'lighting':{'keyWatts':600,'fillWatts':150,'rimWatts':75,'keySize':5},
          'camera':{'type':'ORTHO','scale':camera_data.ortho_scale,'location':list(camera.location),'target':list(target),'rollDegrees':5.5},
          'proportions':{'openHeightScale':open_height_scale,'totalHeight':top_center_z+.18-.02},
          'compositor':{'node':'Hue Saturation Value','saturation':saturation_factor,'hue':.5,'value':1.0},
          'glass':{'ior':1.45,'roughness':.085,'wallThickness':.028}}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('HYDRATION_BLENDER_RENDER_COMPLETE',json.dumps(manifest),flush=True)
