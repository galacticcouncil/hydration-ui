"""Selected beach kiosk and sling chair; new scenes in a copied Hydration studio."""
import bpy, math, os, json
from mathutils import Vector, Matrix
ROOT=os.path.dirname(os.path.abspath(__file__))
base=bpy.data.scenes['05 - Empty Deposits - Poolside Lounger']

def material(source,name):
 m=bpy.data.materials[source].copy();m.name=name;return m
blue=material('LOUNGER V6 - Native Glasses Royal Blue','ACCOUNT V2 - Royal blue satin')
violet=material('LOUNGER V6 - Rich Lilac Parasol','ACCOUNT V2 - Lilac canvas')
ivory=material('LOUNGER V6 - Plush Ivory Towel','ACCOUNT - Ivory canvas')
cream=material('LOUNGER V6 - Warm Ivory Pole','ACCOUNT - Ivory counter')
for m in [violet,ivory]:
 m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.72

models=[]
def scene(name):
 # Copy studio settings/compositor, but use independent objects and collections.
 s=base.copy();s.name=name;s.use_fake_user=True
 tree=base.compositing_node_group.copy();s.compositing_node_group=tree
 for node in tree.nodes:
  if node.type=='R_LAYERS':node.scene=s
 for c in list(s.collection.children):s.collection.children.unlink(c)
 for o in list(s.collection.objects):s.collection.objects.unlink(o)
 s.world=base.world.copy()
 for o in base.objects:
  if o.type in ['LIGHT','CAMERA']:
   n=o.copy();n.data=o.data.copy();n.name=name+' / '+o.name;s.collection.objects.link(n)
   if o.type=='CAMERA':s.camera=n
 bpy.context.window.scene=s
 s.render.resolution_x=1024;s.render.resolution_y=1024;s.render.resolution_percentage=50
 s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.color_depth='16'
 s.cycles.samples=48;s.cycles.use_denoising=True
 s.render.engine='CYCLES';s.cycles.device='CPU'
 s.camera.location=(-4.7,-8,3.0)
 target=Vector((0,0,1.3));s.camera.rotation_euler=(target-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.type='ORTHO';s.camera.data.ortho_scale=3.65
 c=bpy.data.collections.new(name+' / Editable model');s.collection.children.link(c)
 models.append((s,c));return s,c

def move(o,c):
 for oc in list(o.users_collection):oc.objects.unlink(o)
 c.objects.link(o)

def smooth(o):
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True

def cube(name,loc,dims,mat,c,bevel=.045):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dims
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat);move(o,c)
 mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=4
 o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL');return o

def tube(name,a,b,r,mat,c):
 a,b=Vector(a),Vector(b);d=b-a
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=d.length,location=(a+b)/2)
 o=bpy.context.object;o.name=name;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();o.data.materials.append(mat);move(o,c);smooth(o)
 mod=o.modifiers.new('Rounded end edges','BEVEL');mod.width=r*.45;mod.segments=4;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o

def surface(name,verts,faces,mat,c,thick=.025):
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);c.objects.link(o);o.data.materials.append(mat);smooth(o)
 sol=o.modifiers.new('Fabric thickness','SOLIDIFY');sol.thickness=thick
 bev=o.modifiers.new('Soft fabric edges','BEVEL');bev.width=.012;bev.segments=3;return o

def beam(name,a,b,width,depth,mat,c):
 a,b=Vector(a),Vector(b);d=b-a
 o=cube(name,(a+b)/2,(depth,width,d.length+width),mat,c,min(width/2-.001,depth/2-.001))
 z=d.normalized();x=Vector((1,0,0));y=z.cross(x)
 o.rotation_euler=Matrix((x,y,z)).transposed().to_euler()
 return o

def scallop(name,x0,x1,y,edge,mat,c,side=False):
 verts=[];faces=[]
 for j in range(33):
  u=j/32;ucoord=x0+(x1-x0)*u
  bottom=edge-.13-.095*math.sqrt(max(0,1-(2*u-1)**2))
  verts.extend([(y,ucoord,edge),(y,ucoord,bottom)] if side else [(ucoord,y,edge),(ucoord,y,bottom)])
 for j in range(32):faces.append((2*j,2*j+1,2*j+3,2*j+2))
 return surface(name,verts,faces,mat,c,.028)

# Independently tune copied materials while keeping the inherited studio and surface nodes.
def srgb(v):return ((v+.055)/1.055)**2.4 if v>.04045 else v/12.92
def color(m,h):
 p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*[srgb(int(h[i:i+2],16)/255) for i in (0,2,4)],1)
color(violet,'965BE4')
color(ivory,'F3E7CF')
color(cream,'F2DFC0')

s,c=scene('06 - Business - Beach Kiosk')
# Short framed cabinet, open serving bay, and enclosed side panels.
cube('Cabinet / recessed single front panel',(0,0,.44),(2.04,.86,.79),blue,c,.025)
for side in [-1,1]:
 cube('Cabinet / Front stile '+str(side),(side*.99,-.46,.43),(.14,.13,.83),blue,c,.025)
 cube('Cabinet / Side rear stile '+str(side),(side*.99,.41,.43),(.14,.13,.83),blue,c,.025)
 for z in [.1,.77]:cube('Cabinet / Side rail %s %s'%(side,z),(side*1.018,-.01,z),(.1,.78,.13),blue,c,.018)
 cube('Window / Blue side wall '+str(side),(side*1.00,.03,1.44),(.13,.87,1.06),blue,c,.025)
 cube('Window / Blue rear stile '+str(side),(side*.99,.45,1.44),(.16,.12,1.10),blue,c,.025)
 cube('Window / Cream front post '+str(side),(side*.99,-.47,1.44),(.13,.13,1.10),cream,c,.025)
for z in [.1,.77]:cube('Cabinet / Front rail '+str(z),(0,-.47,z),(1.85,.12,.13),blue,c,.02)
cube('Cabinet / Shallow front infill',(0,-.50,.435),(1.85,.035,.59),blue,c,.015)
cube('Counter / Cream serving ledge',(0,-.05,.91),(2.29,1.10,.13),cream,c,.035)
# True pitched canopy with a ridge, curved eave transition, and independent striped panels.
w=2.45;n=7;edge=2.04
def roofz(y):return 2.73-.69*(math.sqrt(y*y+.065*.065)-.065)/(math.sqrt(.72*.72+.065*.065)-.065)
for k in range(n):
 x0=-w/2+k*w/n;x1=x0+w/n;verts=[];faces=[]
 for j in range(65):
  y=-.72+1.44*j/64;z=roofz(y)
  verts.extend([(x0,y,z),(x1,y,z)])
 for j in range(64):faces.append((j*2,j*2+1,j*2+3,j*2+2))
 mat=violet if k%2==0 else ivory
 surface('Canopy / Pitched stripe %02d'%k,verts,faces,mat,c,.035)
 for sign in [-1,1]:scallop('Canopy / Valance %s %s'%(k,sign),x0,x1,sign*.72,edge,mat,c)
# Side fabric gables: no unintended hole or straight shed roof.
for side in [-1,1]:
 for j in range(5):
  y0=-.72+j*1.44/5;y1=y0+1.44/5;verts=[];faces=[]
  for t in range(17):
   y=y0+(y1-y0)*t/16;top=roofz(y)
   verts.extend([(side*w/2,y,edge),(side*w/2,y,top)])
  for t in range(16):faces.append((2*t,2*t+1,2*t+3,2*t+2))
  mat=violet if j%2==0 else ivory
  if side==1:faces=[tuple(reversed(f)) for f in faces]
  o=surface('Canopy / Side gable %s %s'%(side,j),verts,faces,mat,c,.028)
  o.modifiers.remove(o.modifiers.get('Soft fabric edges'))
  for poly in o.data.polygons:poly.use_smooth=False
  scallop('Canopy / Side valance %s %s'%(side,j),y0,y1,side*w/2,edge,mat,c,True)
s.camera.location=(-6.4,-8,4.0);target=Vector((0,0,1.36));s.camera.rotation_euler=(target-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=3.35

s,c=scene('07 - Individual - Beach Chair')
# Three-part deck-chair folding construction, with actual joined pivots and ground bars.
# Y positive is back, X is seat width.
for side in [-1,1]:
 x=side*.79
 beam('Frame / Long back-to-front-foot rail '+str(side),(x,.62,2.30),(x,-1.02,.12),.21,.19,blue,c)
 # rear support attaches to the long rail at z1.35
 py=.62+(1.35-2.30)*(-1.64)/(-2.18)
 beam('Frame / Rear hinged leg '+str(side),(side*.88,py,1.35),(side*.88,1.00,.12),.21,.19,blue,c)
 beam('Frame / Seat support '+str(side),(side*.70,.93,.24),(side*.70,-1.12,.89),.18,.16,blue,c)
 tube('Hardware / Upper pivot '+str(side),(side*.965,py,1.35),(side*.995,py,1.35),.045,cream,c)
 # True seat brace/main rail intersection.
 # long z=1.471+1.329*y; brace z=.535-.317*y => y=-.569 z=.715
 tube('Hardware / Lower pivot '+str(side),(side*.875,-.569,.715),(side*.910,-.569,.715),.04,cream,c)
tube('Frame / Top fabric bar',(-.79,.62,2.30),(.79,.62,2.30),.085,blue,c)
tube('Frame / Front ground crossbar',(-.79,-1.02,.12),(.79,-1.02,.12),.095,blue,c)
tube('Frame / Rear ground crossbar',(-.88,1.0,.12),(.88,1.0,.12),.085,blue,c)
tube('Frame / Seat crossbar',(-.81,-1.12,.89),(.81,-1.12,.89),.095,blue,c)
# Continuous canvas from upper bar to seat: curve then wrap around the front crossbar.
p0=Vector((0,.535,2.30));p1=Vector((0,.24,1.28));p2=Vector((0,-.45,.94));p3=Vector((0,-1.12,.985))
profile=[]
for j in range(25):
 a=math.pi-j/24*math.pi;profile.append((.62+.085*math.cos(a),2.30+.085*math.sin(a)))
profile.reverse()
for j in range(1,81):
 t=j/80;p=(1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3;profile.append((p.y,p.z))
for j in range(1,25):
 a=math.pi/2-j/24*math.pi;profile.append((-1.12-.095*math.cos(a),.89+.095*math.sin(a)))
w=1.48;n=7
for k in range(n):
 x0=-w/2+k*w/n;x1=x0+w/n;verts=[];faces=[]
 for y,z in profile:verts.extend([(x0,y,z),(x1,y,z)])
 for j in range(len(profile)-1):faces.append((2*j,2*j+1,2*j+3,2*j+2))
 o=surface('Canvas / Wrapped continuous stripe %02d'%k,verts,faces,violet if k%2==0 else ivory,c,.018)
 o.modifiers.remove(o.modifiers.get('Soft fabric edges'))
s.camera.location=(-6.8,-8,4.3);target=Vector((0,0,1.20));s.camera.rotation_euler=(target-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=3.35

for s,c in models:
 s['reference']='references/selected-concepts.png: Business 1 and Individual 5; other views inferred in modeling-turnaround.png'
 s.render.filepath=os.path.join(ROOT,'kiosk-pass3.png' if 'Business' in s.name else 'chair-pass3.png')
bpy.context.window.scene=models[0][0]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'account-icons-v2.blend'))
for s,c in models:bpy.ops.render.render(write_still=True,scene=s.name)
print('PASS3_DONE')
