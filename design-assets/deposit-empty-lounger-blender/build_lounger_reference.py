"""Reference-led v6: native glasses blue and richer violet satin upholstery."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy
import bmesh
from mathutils import Vector
from mathutils.geometry import interpolate_bezier

parser=argparse.ArgumentParser()
parser.add_argument('--resolution',type=int,default=1024)
parser.add_argument('--samples',type=int,default=192)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(__file__).resolve().parent
source=Path(bpy.data.filepath)
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
scene=bpy.data.scenes['02 - Review Document'].copy()
scene.name='05 - Empty Deposits - Poolside Lounger'
bpy.context.window.scene=scene
for collection in list(scene.collection.children):
    scene.collection.children.unlink(collection)
scene.view_layers[0].name='Poolside Lounger'
model=bpy.data.collections.new('ICON - Empty Deposits - Editable Poolside Parts')
scene.collection.children.link(model)
studio=bpy.data.collections.new('STUDIO - Lounger Reference Lighting')
scene.collection.children.link(studio)

def rgba(hex_value):
    channels=[int(hex_value[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels)+(1,)

def material(name,hex_value,roughness=.58,base='PALETTE - Native Royal Blue'):
    # Copy the saved studio material, including its subtle Noise -> Bump finish.
    mat=bpy.data.materials[base].copy()
    mat.name=name
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=rgba(hex_value)
    shader.inputs['Roughness'].default_value=roughness
    shader.inputs['Coat Weight'].default_value=0
    return mat

blue=material('LOUNGER V6 - Native Glasses Royal Blue','4966D4')
violet=material('LOUNGER V6 - Vibrant Violet Parasol','8B43EB',.58,'PALETTE - Native Orchid Violet')
pale=material('LOUNGER V6 - Rich Lilac Parasol','B076EB',.58,'PALETTE - Native Orchid Violet')
ivory=material('LOUNGER V6 - Warm Ivory Pole','F9E2C2',.80,'PALETTE - Pale Ivory Mint')
towel_mat=material('LOUNGER V6 - Plush Ivory Towel','F5DEBB',.85,'PALETTE - Pale Ivory Mint')

# One material makes uninterrupted stripes across the complete curved cushion.
striped=material('LOUNGER V6 - Vibrant Violet Ivory Stripes','9A60EF',.65,'PALETTE - Native Orchid Violet')
nodes=striped.node_tree.nodes
links=striped.node_tree.links
coord=nodes.new('ShaderNodeTexCoord')
coord.name='Cushion local coordinates'
xyz=nodes.new('ShaderNodeSeparateXYZ')
links.new(coord.outputs['Object'],xyz.inputs[0])
add=nodes.new('ShaderNodeMath'); add.operation='ADD'; add.inputs[1].default_value=1.025
links.new(xyz.outputs['X'],add.inputs[0])
mult=nodes.new('ShaderNodeMath'); mult.operation='MULTIPLY'; mult.inputs[1].default_value=7/2.05
links.new(add.outputs[0],mult.inputs[0])
floor=nodes.new('ShaderNodeMath'); floor.operation='FLOOR'; links.new(mult.outputs[0],floor.inputs[0])
mod=nodes.new('ShaderNodeMath'); mod.operation='MODULO'; mod.inputs[1].default_value=2
links.new(floor.outputs[0],mod.inputs[0])
mix=nodes.new('ShaderNodeMixRGB'); mix.blend_type='MIX'
mix.inputs[1].default_value=rgba('9A60EF')
mix.inputs[2].default_value=rgba('F2DFCD')
links.new(mod.outputs[0],mix.inputs[0])
links.new(mix.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])

def link(obj,name,mat,collection=model):
    obj.name=name
    for c in list(obj.users_collection): c.objects.unlink(obj)
    collection.objects.link(obj)
    if mat: obj.data.materials.append(mat)
    return obj

def smooth(obj):
    for poly in obj.data.polygons: poly.use_smooth=True
    return obj

def mesh_object(name,verts,faces,mat):
    data=bpy.data.meshes.new(name+' - Geometry')
    data.from_pydata(verts,[],faces); data.update()
    bm=bmesh.new(); bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(data); bm.free()
    obj=bpy.data.objects.new(name,data); model.objects.link(obj)
    data.materials.append(mat)
    return smooth(obj)

def bevel(obj,width=.06,segments=6,clamp=True):
    m=obj.modifiers.new('Soft molded edges','BEVEL')
    m.width=width; m.segments=segments; m.harden_normals=True
    m.use_clamp_overlap=clamp
    obj.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return obj

def box(name,loc,dims,mat,rounding=.09,rotation=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    obj=link(bpy.context.object,name,mat); obj.dimensions=dims
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bevel(smooth(obj),rounding)
    obj.rotation_euler.x=rotation
    return obj

def tube(name,points,radius,mat):
    data=bpy.data.curves.new(name,'CURVE'); data.dimensions='3D'
    data.resolution_u=32; data.bevel_depth=radius; data.bevel_resolution=6
    data.use_fill_caps=True
    spline=data.splines.new('BEZIER'); spline.bezier_points.add(len(points)-1)
    for point,co in zip(spline.bezier_points,points):
        point.co=co; point.handle_left_type=point.handle_right_type='AUTO'
    obj=bpy.data.objects.new(name,data); model.objects.link(obj)
    data.materials.append(mat)
    return obj

def curve2(a,b,c,d,count=20):
    return [(p.y,p.z) for p in interpolate_bezier(Vector((0,*a)),Vector((0,*b)),Vector((0,*c)),Vector((0,*d)),count)]

def rounded_box_geometry(dimensions,radius,divisions):
    """Closed quad surface, rounded before bending: no intersecting edge bevels."""
    half=[v/2 for v in dimensions]
    verts=[]; faces=[]; indices={}
    def vertex(p):
        q=Vector(tuple(max(-half[i]+radius,min(half[i]-radius,p[i])) for i in range(3)))
        d=Vector(p)-q
        v=q+d.normalized()*radius if d.length>1e-8 else q
        key=tuple(round(c,7) for c in v)
        if key not in indices:
            indices[key]=len(verts); verts.append(tuple(v))
        return indices[key]
    for axis in range(3):
        a,b=[i for i in range(3) if i!=axis]
        for sign in (-1,1):
            grid=[]
            for i in range(divisions[a]+1):
                row=[]
                for j in range(divisions[b]+1):
                    p=[0.,0.,0.]; p[axis]=sign*half[axis]
                    p[a]=-half[a]+2*half[a]*i/divisions[a]
                    p[b]=-half[b]+2*half[b]*j/divisions[b]
                    row.append(vertex(p))
                grid.append(row)
            for i in range(divisions[a]):
                for j in range(divisions[b]):
                    faces.append((grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1]))
    return verts,faces

def thick_surface(name,path,width,mat,thickness,rounding,arch=.0,towel=False):
    import bisect
    length=[0.]
    for i in range(1,len(path)):
        length.append(length[-1]+(Vector(path[i])-Vector(path[i-1])).length)
    total=length[-1]
    verts,faces=rounded_box_geometry((width,total,thickness),min(rounding,thickness*.49),(40,140 if not towel else 80,10))
    bent=[]
    for x,s,zoffset in verts:
        distance=max(0,min(total,s+total/2))
        i=max(0,min(len(path)-2,bisect.bisect_right(length,distance)-1))
        t=(distance-length[i])/(length[i+1]-length[i])
        center=Vector(path[i]).lerp(Vector(path[i+1]),t)
        tangent=(Vector(path[min(i+2,len(path)-1)])-Vector(path[max(i-1,0)])).normalized()
        normal=Vector((-tangent.y,tangent.x))
        u=x/width+.5
        bulge=arch*(1-(2*u-1)**4)
        if towel: bulge+=.016*math.cos(u*math.pi*4)+.004*math.cos(u*math.pi*2)
        pos=center+normal*(zoffset-thickness/2+bulge)
        bent.append((x,pos.x,pos.y))
    return mesh_object(name,bent,faces,mat)

# Broad, low chair base: only one substantial side rail per side, bending into feet.
rail_path=curve2((-1.89,.13),(-1.86,.43),(-1.82,.62),(-1.49,.64),24)
rail_path += [(-1.49+(2.04*t/18),.64+.105*t/18) for t in range(1,19)]
rail_path += curve2((.55,.745),(.83,.76),(.91,.41),(1.00,.13),24)[1:]
section=[]
hx,hn,r=.125,.135,.075
for sx,sn,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
    for k in range(7):
        angle=math.radians(start+k*90/6)
        section.append((sx*(hx-r)+r*math.cos(angle),sn*(hn-r)+r*math.sin(angle)))
for label,cx in [('Left',-1.065),('Right',1.065)]:
    vertices=[]
    for i,(y,z) in enumerate(rail_path):
        tangent=(Vector(rail_path[min(i+1,len(rail_path)-1)])-Vector(rail_path[max(i-1,0)])).normalized()
        normal=Vector((-tangent.y,tangent.x))
        vertices += [(cx+x,y+normal.x*n,z+normal.y*n) for x,n in section]
    count=len(section)
    faces=[]
    for i in range(len(rail_path)-1):
        for j in range(count):
            a=i*count+j; b=i*count+(j+1)%count
            faces.append((a,b,b+count,a+count))
    faces += [tuple(reversed(range(count))),tuple((len(rail_path)-1)*count+j for j in range(count))]
    rail=mesh_object('Chair Frame - '+label+' Broad Rounded Rail and Legs',vertices,faces,blue)
    bevel(rail,.025,4)
box('Chair Frame - Single Rounded Front Crossbar',(0,-1.70,.55),(2.19,.24,.23),blue,.09)
box('Chair Frame - Rear Crossbar',(0,.61,.61),(2.13,.19,.19),blue,.08)
box('Chair Frame - Rounded Backrest Support',(0,.74,1.33),(2.20,1.39,.20),blue,.095,math.radians(55))

# Continuous bent cushion, with a smooth padded transition at the seat/back corner.
seat_path=[(-1.80+1.90*t/28,.83+.10*t/28) for t in range(29)]
hinge=curve2((.10,.93),(.23,.94),(.29,.97),(.39,1.12),18)
back=[(.39+.60*t/22,1.12+.83*t/22) for t in range(1,23)]
cushion=thick_surface('Cushion - One Continuous Curved Upholstery',seat_path+hinge[1:]+back,2.05,striped,.34,.16,.045)

# Thick towel, wider and softer than the initial cloth. Its lower edge hangs on the back.
towel_path=curve2((.44,1.26),(.52,1.38),(.71,1.65),(.83,1.84),16)
towel_path+=curve2((.83,1.84),(.94,2.055),(1.12,2.04),(1.20,1.78),18)[1:]
towel=thick_surface('Towel - Plush Rounded Ivory Drape',towel_path,.98,towel_mat,.16,.075,.025,True)
towel.location.x=-.23
towel.location.y=-.13
towel.location.z=.025

# Parasol is lower and to the right. Each canopy panel is a thick convex petal.
cx,cy,apex,radius=1.66,.55,2.94,1.17
tube('Parasol - Warm Ivory Stem',[(cx-.055,cy,.10),(cx-.025,cy,1.55),(cx,cy,apex)],.035,ivory)
box('Parasol - Discreet Rounded Foot',(cx-.055,cy,.055),(.30,.27,.11),pale,.05)
panels=8
for panel in range(panels):
    raw,faces=rounded_box_geometry((.86,radius,.105),.050,(28,32,8))
    verts=[]
    for x,y,offset in raw:
        u=max(0,min(1,x/.86+.5)); t=max(0,min(1,y/radius+.5))
        r=.045+(radius-.045)*t
        theta=(panel+u)*2*math.pi/panels
        bulge=.080*math.sin(u*math.pi)*math.sin(t*math.pi*.88)
        z=apex-.44*t**1.7+bulge-.045*math.sin(u*math.pi)*t**5+offset-.0525
        verts.append((cx+r*math.cos(theta),cy+r*math.sin(theta),z))
    petal=mesh_object(f'Parasol - Rounded Sculpted Petal {panel+1}',verts,faces,violet if panel%2==0 else pale)
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=(cx,cy,apex+.04))
finial=link(bpy.context.object,'Parasol - Ivory Round Finial',ivory)
finial.scale=(.085,.085,.085); smooth(finial)
for obj in model.objects:
    if obj.name.startswith(('Chair Frame','Cushion','Towel')):
        obj.scale.x*=.79
        obj.location.x*=.79

# Directional softboxes produce the sample's rounded highlights and deeper form.
def light(name,location,energy,size,color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy; data.shape='DISK'; data.size=size; data.color=color
    obj=bpy.data.objects.new(name,data); studio.objects.link(obj); obj.location=location
    obj.rotation_euler=(Vector((.30,-.10,1.15))-obj.location).to_track_quat('-Z','Y').to_euler()
light('LIGHT - Lounger Large Upper Left Key',(-3.8,-4.5,6.2),700,3.8,(1,.96,.91))
light('LIGHT - Lounger Soft Front Fill',(4,-3,4.3),140,4,(.91,.94,1))
light('LIGHT - Lounger Back Rim',(1,3.5,5),210,3,(.92,.92,1))
scene.world=scene.world.copy()
scene.world.name='WORLD - Lounger Soft Cool Studio'
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.17

camera_data=bpy.data.cameras.new('CAMERA - Lounger Sample Composition')
camera=bpy.data.objects.new('CAMERA - Lounger Sample Composition',camera_data)
scene.collection.objects.link(camera)
target=Vector((.40,-.05,1.43))
camera.location=(-7,-10,6)
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.type='ORTHO'; camera_data.ortho_scale=4.6
scene.camera=camera
scene.render.engine='CYCLES'; scene.cycles.device='CPU'
scene.cycles.samples=args.samples; scene.cycles.use_denoising=True; scene.cycles.max_bounces=8
scene.render.film_transparent=True
scene.render.resolution_x=args.resolution
scene.render.resolution_y=round(args.resolution*.91)
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.render.image_settings.color_depth='16'
scene.render.filepath=str(out/f'deposit-lounger-v6-{args.resolution}.png')
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.35
scene.compositing_node_group=scene.compositing_node_group.copy()
scene.compositing_node_group.name='OUTPUT - Lounger Reference Grade'
for node in scene.compositing_node_group.nodes:
    if node.type=='R_LAYERS': node.scene=scene; node.layer='Poolside Lounger'
    elif node.type=='HUE_SAT':
        node.name='Lounger - Native Glasses Grade'; node.label='Native grade: saturation 1.04 - retains alpha'
        node.inputs['Saturation'].default_value=1.04
        node.inputs['Value'].default_value=1.0

# Frame the actual edited object bounds without changing the reference camera angle.
bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get()
rotation=camera.rotation_euler.to_matrix()
inverse=rotation.transposed()
points=[]
for obj in model.objects:
    evaluated=obj.evaluated_get(deps)
    mesh=evaluated.to_mesh()
    points += [inverse@(evaluated.matrix_world@v.co-camera.location) for v in mesh.vertices]
    evaluated.to_mesh_clear()
low=Vector((min(p.x for p in points),min(p.y for p in points),0))
high=Vector((max(p.x for p in points),max(p.y for p in points),0))
camera.location+=rotation@((low+high)*.5)
aspect=scene.render.resolution_x/scene.render.resolution_y
camera_data.ortho_scale=max(high.x-low.x,(high.y-low.y)*aspect)*1.10

ref=Path('/Users/samborek/.codex/attachments/68ccf45f-17f1-4a14-b312-4123522be898/codex-clipboard-28abe261-0aec-4fa8-9944-e0af4506bbf4.png')
if ref.exists():
    image=bpy.data.images.load(str(ref),check_existing=True)
    image.name='REFERENCE - Selected Lounger Closeup'; image.use_fake_user=True; image.pack()
notes=bpy.data.texts.new('START HERE - Lounger Reference Match V6')
notes.write('Reference match: continuous striped cushion, broad molded blue legs, plush towel and lilac sculpted parasol.\n'
            'All objects and material nodes are editable. Earlier four icon scenes remain in the project.\n'
            'V6: unchanged slim proportions; exact tracked-glasses native blue #4966D4 and grade, richer violet fabric.\n'
            'Native satin material nodes, no clearcoat, original roughness preserved.\n'
            'New lounger-specific lighting and compositor preserve original scenes.\n'
            'Packed user reference is REFERENCE - Selected Lounger Closeup.\n')
scene['Purpose']='No deposits yet - Aquatic leisure illustration - native blue and vibrant violet V6'
scene['Original studio SHA256']=source_hash
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D': area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.context.preferences.filepaths.save_version=0
blend=out/'status-icons-with-deposit-lounger.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
bpy.ops.render.render(write_still=True,scene=scene.name)
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
(out/'manifest.json').write_text(json.dumps({'blend':str(blend),'render':scene.render.filepath,'builder':Path(__file__).name,'scene':scene.name,'resolution':[scene.render.resolution_x,scene.render.resolution_y],'samples':args.samples,'sourceUnchanged':True,'sourceStudioSha256':source_hash,'selectedConcept':3,'revision':6,'blue':'#4966D4','violet':'#9A60EF','gradeSaturation':1.04,'exposure':.35,'parts':len(model.objects),'allScenes':[s.name for s in bpy.data.scenes]},indent=2)+'\n')
print('LOUNGER_REFERENCE_RENDERED',scene.render.filepath,flush=True)
