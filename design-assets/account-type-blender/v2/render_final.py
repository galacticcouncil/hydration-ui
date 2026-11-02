import bpy,os
from mathutils import Vector
root=os.path.dirname(os.path.abspath(__file__))
models=[('06 - Business - Beach Kiosk','kiosk'),('07 - Individual - Beach Chair','chair')]
for name,pos,target in [(models[0][0],(-6.4,-8,2.75),(0,0,1.36)),(models[1][0],(-6.8,-8,3.6),(0,0,1.2))]:
 s=bpy.data.scenes[name];s.camera.location=pos;s.camera.rotation_euler=(Vector(target)-s.camera.location).to_track_quat('-Z','Y').to_euler()
s=bpy.data.scenes[models[0][0]]
if not s.get('reference_width_fixed'):
 for o in s.objects:
  if o.type=='MESH':o.location.x*=.88;o.scale.x*=.88
 s['reference_width_fixed']=True
s=bpy.data.scenes[models[1][0]]
if not s.get('pivot_clearance_fixed'):
 for o in s.objects:
  if o.name.startswith('Hardware /'):o.location.x-=.025 if o.location.x>0 else -.025
 s['pivot_clearance_fixed']=True
for name,stem in models:
 s=bpy.data.scenes[name]
 s.render.resolution_percentage=100;s.cycles.samples=256
 s.render.filepath=os.path.join(root,stem+'-final.png')
 s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.color_depth='16'
 s.render.film_transparent=True
bpy.context.window.scene=bpy.data.scenes[models[0][0]]
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'account-icons-v2.blend'))
for name,stem in models:bpy.ops.render.render(write_still=True,scene=name)
exec(compile(open(os.path.join(root,'render_views.py')).read(),os.path.join(root,'render_views.py'),'exec'))
print('FINAL_AND_VIEWS_DONE')
