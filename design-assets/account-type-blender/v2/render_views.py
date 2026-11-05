import bpy, os
from mathutils import Vector
root=os.path.dirname(os.path.abspath(__file__))
for name,stem,z in [('06 - Business - Beach Kiosk','kiosk',1.3),('07 - Individual - Beach Chair','chair',1.2)]:
 s=bpy.data.scenes[name];s.render.resolution_percentage=40;s.cycles.samples=32
 for label,pos in [('front',(0,-10,z+.3)),('side',(-10,0,z+.3)),('rear',(6,8,z+3))]:
  s.camera.location=pos;s.camera.rotation_euler=(Vector((0,0,z))-s.camera.location).to_track_quat('-Z','Y').to_euler()
  s.camera.data.ortho_scale=3.2
  s.render.filepath=os.path.join(root,stem+'-'+label+'.png')
  bpy.ops.render.render(write_still=True,scene=s.name)
print('VIEWS_DONE')
