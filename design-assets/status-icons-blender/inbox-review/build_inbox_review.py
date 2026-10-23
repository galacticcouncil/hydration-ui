"""Selected inbox review reference as editable geometry, native palette/studio.

Open canonical status-icons.blend READ ONLY, run this script. Saves candidate
in this folder; never overwrites canonical. The parent task appends the scene.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Quaternion, Vector

p = argparse.ArgumentParser()
p.add_argument('--resolution', type=int, default=1024)
p.add_argument('--samples', type=int, default=128)
p.add_argument('--no-render', action='store_true')
a = p.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
out = Path(__file__).resolve().parent
source = Path(bpy.data.filepath).resolve()
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
assert source.name == 'status-icons.blend'
reference = bpy.data.scenes['02 - Review Document']
scene = reference.copy()
# Assign the final scene name after removing old scenes (safe on rebuild).
bpy.context.window.scene = scene
for col in list(scene.collection.children):
    if col.name != 'STUDIO - Shared Softboxes':
        scene.collection.children.unlink(col)
scene.camera = None
scene.view_layers[0].name = 'Inbox Review'
for other in list(bpy.data.scenes):
    if other != scene:
        bpy.data.scenes.remove(other)
scene.name = '03 - Review Inbox'
for old_object in list(bpy.data.objects):
    if old_object.name not in scene.objects:
        bpy.data.objects.remove(old_object, do_unlink=True)
for old_collection in list(bpy.data.collections):
    if old_collection.users == 0:
        bpy.data.collections.remove(old_collection)
model = bpy.data.collections.new('ICON - Review Inbox')
scene.collection.children.link(model)
blue = bpy.data.materials['PALETTE - Native Royal Blue']
violet = bpy.data.materials['PALETTE - Native Orchid Violet']
ivory = bpy.data.materials['PALETTE - Pale Ivory Mint']

def add_mesh(name, verts, faces, mat):
    mesh = bpy.data.meshes.new(name + ' editable mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    model.objects.link(ob)
    ob.data.materials.append(mat)
    for f in mesh.polygons:
        f.use_smooth = True
    return ob

def move_model(ob, mat):
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    model.objects.link(ob)
    ob.data.materials.append(mat)
    return ob

def soft(ob, width):
    b = ob.modifiers.new('Soft satin edge rounding', 'BEVEL')
    b.width = width
    b.segments = 6
    b.harden_normals = True
    ob.modifiers.new('Weighted planar normals', 'WEIGHTED_NORMAL')
    for f in ob.data.polygons:
        f.use_smooth = True

# Counterclockwise continuous rounded rectangle boundary, same segmentation
# at every shell level. Arc corners are true geometry, not a four-box seam.
def outline(w, d, radius, segments=24):
    pts = []
    corners=[(w/2-radius, d/2-radius, 0),
             (-w/2+radius, d/2-radius, 90),
             (-w/2+radius, -d/2+radius, 180),
             (w/2-radius, -d/2+radius, 270)]
    for k,(cx,cy,start) in enumerate(corners):
        for j in range(segments + 1):
            angle = math.radians(start + j*90/segments)
            pts.append((cx + radius*math.cos(angle), cy + radius*math.sin(angle)))
        ncx,ncy,nstart=corners[(k+1)%4]
        angle=math.radians(nstart)
        next_pt=(ncx+radius*math.cos(angle),ncy+radius*math.sin(angle))
        current=pts[-1]
        for j in range(1,33):
            t=j/33
            pts.append((current[0]+t*(next_pt[0]-current[0]),current[1]+t*(next_pt[1]-current[1])))
    return pts

def smoothstep(lo, hi, v):
    t = max(0, min(1, (v-lo)/(hi-lo)))
    return t*t*(3-2*t)

def top_height(x, y):
    # Broad central U-shaped opening has a flat, smooth bottom and wide shoulders.
    in_front = 1 - smoothstep(-.55, -.28, y)
    notch = 1 - smoothstep(.48, .93, abs(x))
    return 1.46 - .32 * in_front * notch

# One closed, genuinely hollow, thick-walled mesh: lower outer fillet,
# vertical shell, rounded top rim with central notch, inner cavity and floor.
# All rings are continuous, watertight and editable without Boolean shading.
w, d, r = 3.18, 1.64, .46
rings = []
def ring(offset, z=None, near_top=None):
    pts = outline(w-2*offset, d-2*offset, max(.06, r-offset))
    rings.append([(x,y, z if z is not None else top_height(x,y) + near_top) for x,y in pts])
# Rounded bottom outer corner (quarter circle).
for i in range(7):
    t = i*math.pi/2/6
    ring(.22*(1-math.sin(t)), .12 + .22*(1-math.cos(t)))
# Outer side ending just below the rounded rim.
ring(0, near_top=-.125)
# Semicircular solid rim: wall thickness .25, no knife edges.
for i in range(1,13):
    t = i*math.pi/12
    ring(.125*(1-math.cos(t)), near_top=-.125+.125*math.sin(t))
# Inner side down to the cavity floor's softened junction.
ring(.25, .42)
for i in range(1,7):
    t = i*math.pi/2/6
    ring(.25+.13*(1-math.cos(t)), .42-.13*math.sin(t))
N=len(rings[0]); verts=[v for row in rings for v in row]; faces=[]
for k in range(len(rings)-1):
    for j in range(N):
        nj=(j+1)%N
        faces.append((k*N+j, k*N+nj, (k+1)*N+nj, (k+1)*N+j))
faces.append(tuple(reversed(range(N))))
faces.append(tuple((len(rings)-1)*N+j for j in range(N)))
tray=add_mesh('Tray - Continuous rounded hollow shell with U-notch', verts, faces, blue)
tray['Construction'] = 'Watertight 0.25 wall, true open cavity and thick floor; continuous rounded shell and notched rim.'
tray['Width'] = w
tray['Depth'] = d
tray['Wall thickness'] = .25
tray.modifiers.new('Gentle silhouette subdivision', 'SUBSURF').levels=1

# Rounded rectangle solid in the X-Z plane. Full arc topology keeps the
# document silhouette rounded independently of its thin edge bevel.
def plate(name, width, height, thickness, radius, loc, mat):
    coords=outline(width,height,radius,20)
    n=len(coords)
    vs=[(x,-thickness/2,z) for x,z in coords]+[(x,thickness/2,z) for x,z in coords]
    fs=[tuple(range(n)),tuple(reversed([n+i for i in range(n)]))]
    for j in range(n):
        nj=(j+1)%n
        fs.append((j,n+j,n+nj,nj))
    ob=add_mesh(name,vs,fs,mat)
    ob.location=loc
    soft(ob, min(thickness*.32,.045))
    return ob

root=bpy.data.objects.new('Document - Tilt control',None)
model.objects.link(root)
root.location=(0,.05,1.96)
root.rotation_euler=(math.radians(-9),0,math.radians(-1.5))
back=plate('Document - Lavender backing edge',2.29,2.28,.17,.27,(0,.12,.07),violet)
front=plate('Document - Warm ivory face',2.27,2.23,.16,.27,(0,-.045,0),ivory)
back.parent=root;front.parent=root

# Full capsule volume: revolved semicircular caps, no fake bevel-only corners.
def capsule(name, length, radius, depth_ratio, mat):
    vs=[];fs=[];profile=[]
    cap_segments=16;around=48;straight=length/2-radius
    for i in range(cap_segments+1):
        phi=-math.pi/2+i*math.pi/2/cap_segments
        profile.append((-straight+radius*math.sin(phi),radius*math.cos(phi)))
    profile.append((straight,radius))
    for i in range(1,cap_segments+1):
        phi=i*math.pi/2/cap_segments
        profile.append((straight+radius*math.sin(phi),radius*math.cos(phi)))
    for x,rad in profile:
        for j in range(around):
            t=2*math.pi*j/around
            vs.append((x,rad*math.cos(t)*depth_ratio,rad*math.sin(t)))
    for k in range(len(profile)-1):
        for j in range(around):
            nj=(j+1)%around
            fs.append((k*around+j,(k+1)*around+j,(k+1)*around+nj,k*around+nj))
    ob=add_mesh(name,vs,fs,mat)
    return ob
line=capsule('Document - Single royal-blue pill line',1.62,.12,.48,blue)
line.parent=root;line.location=(0,-.153,.40)

# A single lavender round, softly domed front dot as in selected reference.
bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,location=(0,-.867,.66))
dot=bpy.context.object;dot.name='Tray - Lavender circular status dot'
dot.scale=(.302,.088,.302)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
move_model(dot,violet)
for poly in dot.data.polygons:poly.use_smooth=True

# Packed reference stays out of all renders and survives moving the .blend.
image=bpy.data.images.load(str(out/'reference-selected.png'),check_existing=True)
image.pack()
refs=bpy.data.collections.new('REFERENCE - Selected Inbox Concept (hidden)')
scene.collection.children.link(refs);refs.hide_render=True
refobj=bpy.data.objects.new('REFERENCE - User-selected imagegen concept',None)
refobj.empty_display_type='IMAGE';refobj.data=image;refobj.empty_display_size=3.8
refobj.hide_render=True;refobj.hide_viewport=True;refs.objects.link(refobj)

cam_data=bpy.data.cameras.new('CAMERA - Review Inbox')
cam=bpy.data.objects.new('CAMERA - Review Inbox',cam_data)
scene.collection.objects.link(cam)
cam.location=(3.0,-9.5,4.2)
target=Vector((0,0,1.65))
cam.rotation_mode='QUATERNION'
cam.rotation_quaternion=(target-cam.location).to_track_quat('-Z','Y') @ Quaternion((0,0,1),math.radians(3.2))
cam_data.type='ORTHO';cam_data.ortho_scale=4.13
scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.device='CPU'
scene.cycles.samples=a.samples;scene.cycles.use_denoising=True;scene.cycles.max_bounces=8
scene.render.film_transparent=True
scene.render.resolution_x=scene.render.resolution_y=a.resolution
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.image_settings.color_depth='16'
scene.render.filepath=str(out/'review-inbox-1024.png')
scene.compositing_node_group=scene.compositing_node_group.copy()
scene.compositing_node_group.name='OUTPUT - Review Inbox Native Grade'
for n in scene.compositing_node_group.nodes:
    if n.type=='R_LAYERS':n.scene=scene;n.layer='Inbox Review'
for ob in list(bpy.data.objects):
    if ob.name not in scene.objects:bpy.data.objects.remove(ob,do_unlink=True)
for col in list(bpy.data.collections):
    if col.users==0:bpy.data.collections.remove(col)
text=bpy.data.texts.new('START HERE - Review Inbox')
text.write('User-selected inbox review illustration, Scene 03 - Review Inbox.\n'
           'Real continuous hollow rounded tray mesh with thick floor and U-notch.\n'
           'Editable ivory document, lavender back edge, full capsule blue line, violet status dot.\n'
           'Native palette, material roughness, shared softbox studio and compositor grade retained.\n'
           'Reference is packed in a hidden collection. Document Tilt control adjusts all its parts.\n'
           'Candidate file intended to append into canonical status-icons.blend; previous scenes retained by parent task.\n')
scene['Source studio SHA256']=source_hash
scene['Reference']='Packed user-selected imagegen inbox tray concept'
scene['Parts editable']=True
bpy.context.preferences.filepaths.save_version=0
blend=out/'review-inbox-candidate.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
if not a.no_render:bpy.ops.render.render(write_still=True)
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
manifest={'scene':scene.name,'blend':blend.name,'render':'review-inbox-1024.png',
 'sourceStudio':'../status-icons.blend','sourceStudioSha256':source_hash,'sourceUnchanged':True,
 'reference':'reference-selected.png','palette':[blue.name,violet.name,ivory.name],
 'resolution':a.resolution,'samples':a.samples,'geometry':'Real editable hollow tray, rounded ivory document, full capsule line and domed circular status dot',
 'runtimeReplacement':False,'canonicalAppendRequired':True}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('REVIEW_INBOX_READY',blend,scene.name,scene.render.filepath,flush=True)
