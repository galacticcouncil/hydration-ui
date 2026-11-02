"""Selected beach kiosk and sling chair; new scenes in a copied Hydration studio."""
import bpy, math, os, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__))
base=bpy.data.scenes['05 - Empty Deposits - Poolside Lounger']

def material(source,name):
 m=bpy.data.materials[source].copy();m.name=name;return m
blue=material('LOUNGER V6 - Native Glasses Royal Blue','ACCOUNT - Royal blue satin')
violet=material('LOUNGER V6 - Rich Lilac Parasol','ACCOUNT - Lilac canvas')
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
 s.camera.location=(-5,-8,4.6)
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

s,c=scene('06 - Business - Beach Kiosk')
# One cabinet with recessed panel construction and an open service bay.
cube('Kiosk / Cabinet core',(0,0,.59),(2.22,1.18,1.02),blue,c,.065)
for i in range(6):
 x=-.925+i*.37
 cube('Kiosk / Front panel %02d'%i,(x,-.605,.58),(.355,.045,.82),blue,c,.016)
for side in [-1,1]:
 for j in range(3):cube('Kiosk / Side cladding %s %s'%(side,j),(side*1.12,-.38+j*.38,.58),(.04,.36,.82),blue,c,.012)
 cube('Kiosk / Corner upright %s'%side,(side*1.075,.49,1.72),(.15,.17,1.6),blue,c,.035)
 cube('Kiosk / Front upright %s'%side,(side*1.075,-.49,1.65),(.15,.17,1.47),cream,c,.035)
cube('Kiosk / Rear wall',(0,.56,1.63),(2.12,.10,1.2),blue,c,.04)
cube('Kiosk / Deep serving counter',(0,-.18,1.12),(2.47,1.48,.14),cream,c,.07)
cube('Kiosk / Base plinth',(0,.015,.09),(2.30,1.25,.14),blue,c,.035)
cube('Kiosk / Rear canopy beam',(0,.54,2.60),(2.30,.17,.14),blue,c,.04)
# Individual editable awning stripes on a common curved profile.
width=2.66;count=7
for k in range(count):
 x0=-width/2+k*width/count;x1=x0+width/count
 verts=[];faces=[]
 for j in range(33):
  t=j/32;y=.72-1.70*t;z=2.78-.30*t-.19*t*t
  verts.extend([(x0,y,z),(x1,y,z)])
 for j in range(32):faces.append((j*2,j*2+1,j*2+3,j*2+2))
 mat=violet if k%2==0 else ivory
 surface('Awning / Curved stripe %02d'%k,verts,faces,mat,c,.035)
 # Scalloped skirt: straight upper edge and a shallow rounded lower edge.
 verts=[];faces=[]
 for j in range(25):
  u=j/24;x=x0+(x1-x0)*u;bottom=2.22-.13*math.sin(math.pi*u)**.5
  verts.extend([(x,-.98,2.30),(x,-.99,bottom)])
 for j in range(24):faces.append((j*2,j*2+1,j*2+3,j*2+2))
 surface('Awning / Scalloped valance %02d'%k,verts,faces,mat,c,.035)
s.camera.data.ortho_scale=3.75
s['purpose']='Business account option; selected blue beach kiosk with striped awning.'

s,c=scene('07 - Individual - Beach Chair')
# Foldable X structure. Both pairs meet at their real crossing, with connected crossbars.
for side in [-1,1]:
 x=side*.77
 tube('Chair / Long back rail %s'%side,(x,-1.00,.13),(x,.57,2.16),.073,blue,c)
 tube('Chair / Folding rear leg %s'%side,(x,.82,.13),(x,-.83,.97),.069,blue,c)
 # Pivot located at the intersection of the two struts.
 tube('Chair / Pivot cap %s'%side,(x-side*.025,-.455,.835),(x+side*.085,-.455,.835),.085,cream,c)
 # Small, integrated feet.
 tube('Chair / Front foot %s'%side,(x,-1.08,.10),(x,-.91,.10),.082,blue,c)
 tube('Chair / Rear foot %s'%side,(x,.73,.10),(x,.90,.10),.078,blue,c)
tube('Chair / Top sling crossbar',(-.79,.57,2.16),(.79,.57,2.16),.078,blue,c)
tube('Chair / Front sling crossbar',(-.80,-.83,.97),(.80,-.83,.97),.078,blue,c)
tube('Chair / Rear ground brace',(-.77,.79,.15),(.77,.79,.15),.059,blue,c)
# Cubic Bezier sling flowing naturally from back top into a gently sagging seat.
p0=Vector((0,.56,2.16));p1=Vector((0,.12,.70));p2=Vector((0,-.55,.55));p3=Vector((0,-.83,.99))
width=1.43;count=7
for k in range(count):
 x0=-width/2+k*width/count;x1=x0+width/count;verts=[];faces=[]
 for j in range(65):
  t=j/64;p=(1-t)**3*p0+3*(1-t)**2*t*p1+3*(1-t)*t*t*p2+t**3*p3
  verts.extend([(x0,p.y,p.z),(x1,p.y,p.z)])
 for j in range(64):faces.append((j*2,j*2+1,j*2+3,j*2+2))
 surface('Sling / Continuous canvas stripe %02d'%k,verts,faces,violet if k%2==0 else ivory,c,.027)
s.camera.location=(-5,-8,4.4);target=Vector((0,-.04,1.12));s.camera.rotation_euler=(target-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.ortho_scale=3.15
s['purpose']='Individual account option; selected blue frame beach sling chair.'
# Save studio inheritance, all original scenes, and both new independently editable scenes.
for s,c in models:
 s['source_studio']='Copied lounger-v6.blend; native lights, world, compositor and satin nodes.'
 s.render.filepath=os.path.join(ROOT,'kiosk-preview.png' if 'Business' in s.name else 'chair-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'account-type-icons.blend'))
for s,c in models:
 bpy.context.window.scene=s
 bpy.ops.render.render(write_still=True,scene=s.name)
print('ACCOUNT_ICONS_DONE')
